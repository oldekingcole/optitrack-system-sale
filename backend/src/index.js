import { escapeHtml, normalizeInquiry, validateInquiry } from "./validation.js";

const JSON_HEADERS = {"Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store"};
const MAX_BODY_BYTES = 50_000;

export default {
  async fetch(request, env, ctx) {
    try {
      return await routeRequest(request, env, ctx);
    } catch (error) {
      console.error("Unhandled worker error", error);
      return json({ok: false, message: "The service is temporarily unavailable."}, 500, request, env);
    }
  }
};

async function routeRequest(request, env, ctx) {
  const url = new URL(request.url);
  if (request.method === "OPTIONS") return corsPreflight(request, env);
  if (url.pathname === "/api/health" && request.method === "GET") {
    return json({ok: true, service: "optitrack-sales-api", time: new Date().toISOString()}, 200, request, env);
  }
  if (url.pathname === "/api/inquiries" && request.method === "POST") return handleInquiry(request, env, ctx);
  if (url.pathname === "/api/admin/inquiries" && request.method === "GET") return listInquiries(request, env);
  if (url.pathname.startsWith("/api/admin/inquiries/") && request.method === "PATCH") return updateInquiry(request, env, url.pathname.split("/").pop());
  return json({ok: false, message: "Not found."}, 404, request, env);
}

async function handleInquiry(request, env, ctx) {
  const originCheck = validateOrigin(request, env);
  if (!originCheck.ok) return json({ok: false, message: "Origin not allowed."}, 403, request, env);
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return json({ok: false, message: "JSON is required."}, 415, request, env);
  const declaredSize = Number(request.headers.get("content-length") || 0);
  if (declaredSize > MAX_BODY_BYTES) return json({ok: false, message: "Submission is too large."}, 413, request, env);

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json({ok: false, message: "Submission is too large."}, 413, request, env);
  let parsed;
  try { parsed = JSON.parse(raw); } catch { return json({ok: false, message: "Invalid JSON."}, 400, request, env); }

  const data = normalizeInquiry(parsed);
  // Honeypot submissions receive a generic success and are not persisted.
  if (data.website) return json({ok: true, reference: `PX-${new Date().getUTCFullYear()}-RECEIVED`}, 202, request, env);

  const validation = validateInquiry(data);
  if (!validation.valid) return json({ok: false, message: "Please correct the highlighted information.", errors: validation.errors}, 422, request, env);

  const ip = request.headers.get("CF-Connecting-IP") || "";
  const turnstileRequired = env.TURNSTILE_REQUIRED !== "false";
  if (turnstileRequired && !env.TURNSTILE_SECRET_KEY) {
    return json({ok: false, message: "Verification is not configured."}, 503, request, env);
  }
  if (turnstileRequired) {
    const verification = await verifyTurnstile(data.turnstileToken, ip, env);
    if (!verification.ok) return json({ok: false, message: "Verification failed. Please refresh and try again."}, 400, request, env);
  }

  const ipHash = await hashValue(ip, env.IP_HASH_SALT || "optitrack-sales");
  if (env.DB && ipHash) {
    const recent = await env.DB.prepare("SELECT COUNT(*) AS total FROM inquiries WHERE ip_hash = ? AND datetime(created_at) >= datetime('now', '-1 hour')").bind(ipHash).first();
    if (Number(recent?.total || 0) >= Number(env.MAX_SUBMISSIONS_PER_HOUR || 5)) {
      return json({ok: false, message: "Too many submissions. Please try again later."}, 429, request, env);
    }
  }

  const id = crypto.randomUUID();
  const reference = makeReference();
  const createdAt = new Date().toISOString();
  const userAgent = (request.headers.get("user-agent") || "").slice(0, 300);

  if (!env.DB) throw new Error("D1 binding DB is missing");
  await env.DB.prepare(`
    INSERT INTO inquiries (
      id, reference, created_at, status, name, organization, role, email, phone, interest,
      destination, timeline, offer, diligence, application, message, referrer, page_url,
      utm_source, utm_medium, utm_campaign, user_timezone, ip_hash, user_agent
    ) VALUES (?, ?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, reference, createdAt, data.name, data.organization, data.role, data.email, data.phone,
    data.interest, data.destination, data.timeline, data.offer, data.diligence, data.application,
    data.message, data.referrer, data.pageUrl, data.utmSource, data.utmMedium, data.utmCampaign,
    data.userTimezone, ipHash, userAgent
  ).run();

  if (env.RESEND_API_KEY && env.NOTIFY_EMAIL && env.FROM_EMAIL) {
    ctx.waitUntil(sendNotificationEmail(data, reference, env).catch((error) => console.error("Notification email failed", error)));
  }
  if (env.SEND_BUYER_CONFIRMATION === "true" && env.RESEND_API_KEY && env.CONFIRMATION_FROM_EMAIL) {
    ctx.waitUntil(sendBuyerConfirmation(data, reference, env).catch((error) => console.error("Buyer confirmation failed", error)));
  }

  return json({ok: true, reference}, 201, request, env);
}

async function listInquiries(request, env) {
  if (!isAdmin(request, env)) return json({ok: false, message: "Unauthorized."}, 401, request, env);
  if (!env.DB) throw new Error("D1 binding DB is missing");
  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 50), 1), 200);
  const status = String(url.searchParams.get("status") || "").trim();
  const statement = status
    ? env.DB.prepare("SELECT * FROM inquiries WHERE status = ? ORDER BY created_at DESC LIMIT ?").bind(status, limit)
    : env.DB.prepare("SELECT * FROM inquiries ORDER BY created_at DESC LIMIT ?").bind(limit);
  const result = await statement.all();
  return json({ok: true, inquiries: result.results || []}, 200, request, env);
}

async function updateInquiry(request, env, id) {
  if (!isAdmin(request, env)) return json({ok: false, message: "Unauthorized."}, 401, request, env);
  if (!env.DB) throw new Error("D1 binding DB is missing");
  const body = await request.json().catch(() => ({}));
  const allowedStatuses = new Set(["new", "qualified", "packet_sent", "inspection", "offer", "negotiating", "won", "lost", "dormant"]);
  const status = allowedStatuses.has(body.status) ? body.status : null;
  const notes = String(body.notes || "").trim().slice(0, 5000);
  if (!status) return json({ok: false, message: "A valid status is required."}, 422, request, env);
  await env.DB.prepare("UPDATE inquiries SET status = ?, admin_notes = ?, updated_at = ? WHERE id = ?").bind(status, notes, new Date().toISOString(), id).run();
  return json({ok: true}, 200, request, env);
}

function isAdmin(request, env) {
  const header = request.headers.get("authorization") || "";
  return Boolean(env.ADMIN_TOKEN) && header === `Bearer ${env.ADMIN_TOKEN}`;
}

function validateOrigin(request, env) {
  const origin = request.headers.get("origin");
  if (!origin) return {ok: true};
  const allowed = String(env.ALLOWED_ORIGINS || "").split(",").map((item) => item.trim()).filter(Boolean);
  return {ok: allowed.includes(origin)};
}

function corsPreflight(request, env) {
  const origin = request.headers.get("origin") || "";
  if (!validateOrigin(request, env).ok) return new Response(null, {status: 403});
  return new Response(null, {status: 204, headers: {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  }});
}

function json(payload, status, request, env) {
  const headers = new Headers(JSON_HEADERS);
  const origin = request?.headers.get("origin");
  if (origin && validateOrigin(request, env).ok) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "same-origin");
  return new Response(JSON.stringify(payload), {status, headers});
}

async function verifyTurnstile(token, ip, env) {
  if (!token) return {ok: false};
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip, idempotency_key: crypto.randomUUID()})
  });
  const result = await response.json();
  const expectedHost = String(env.TURNSTILE_EXPECTED_HOSTNAME || "").trim();
  const validHost = !expectedHost || result.hostname === expectedHost;
  const validAction = !result.action || result.action === "sales_inquiry";
  return {ok: Boolean(result.success && validHost && validAction), result};
}

async function sendNotificationEmail(data, reference, env) {
  const subject = `[${reference}] OptiTrack buyer inquiry — ${data.organization}`;
  const fields = [
    ["Reference", reference], ["Name", data.name], ["Organization", data.organization], ["Role", data.role],
    ["Email", data.email], ["Phone", data.phone], ["Interest", data.interest], ["Destination", data.destination],
    ["Timeline", data.timeline], ["Offer / budget", data.offer], ["Preferred diligence", data.diligence],
    ["Intended application", data.application], ["Message", data.message], ["Referrer", data.referrer],
    ["Campaign", [data.utmSource, data.utmMedium, data.utmCampaign].filter(Boolean).join(" / ")]
  ];
  const htmlRows = fields.filter(([, value]) => value).map(([label, value]) => `<tr><th style="text-align:left;padding:8px;background:#eef3f6">${escapeHtml(label)}</th><td style="padding:8px;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join("");
  const text = fields.filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`).join("\n\n");
  await sendResendEmail({
    from: env.FROM_EMAIL, to: [env.NOTIFY_EMAIL], reply_to: data.email, subject,
    html: `<h2>New OptiTrack system inquiry</h2><table style="border-collapse:collapse;width:100%" border="1">${htmlRows}</table>`,
    text
  }, env);
}

async function sendBuyerConfirmation(data, reference, env) {
  await sendResendEmail({
    from: env.CONFIRMATION_FROM_EMAIL, to: [data.email], subject: `OptiTrack inquiry received — ${reference}`,
    html: `<p>Hello ${escapeHtml(data.name)},</p><p>Thank you for your interest in the complete 58-camera OptiTrack system (55 PrimeX 22 cameras and 3 Slim 13 cameras). Your inquiry reference is <strong>${escapeHtml(reference)}</strong>.</p><p>A seller representative will review the information and respond using the contact details you provided.</p>`,
    text: `Hello ${data.name},\n\nThank you for your interest in the complete 58-camera OptiTrack system (55 PrimeX 22 cameras and 3 Slim 13 cameras). Your inquiry reference is ${reference}.\n\nA seller representative will review the information and respond.`
  }, env);
}

async function sendResendEmail(payload, env) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {"Authorization": `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json"},
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`Resend error ${response.status}: ${await response.text()}`);
  return response.json();
}

async function hashValue(value, salt) {
  if (!value) return "";
  const bytes = new TextEncoder().encode(`${salt}:${value}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function makeReference() {
  const year = new Date().getUTCFullYear();
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();
  return `PX-${year}-${suffix}`;
}
