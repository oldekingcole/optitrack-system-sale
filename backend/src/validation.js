const TEXT_LIMITS = Object.freeze({
  name: 100, organization: 140, role: 120, email: 180, phone: 40,
  interest: 100, destination: 160, timeline: 80, offer: 80, diligence: 100,
  application: 1500, message: 3000, referrer: 500, pageUrl: 500,
  utmSource: 120, utmMedium: 120, utmCampaign: 180, userTimezone: 80
});

export function cleanText(value, maxLength = 500) {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n?/g, "\n")
    .trim()
    .slice(0, maxLength);
}

export function normalizeInquiry(input = {}) {
  const result = {};
  for (const [key, max] of Object.entries(TEXT_LIMITS)) result[key] = cleanText(input[key], max);
  result.website = cleanText(input.website, 200);
  result.startedAt = Number(input.startedAt || 0);
  result.consent = input.consent === true || input.consent === "on" || input.consent === "true";
  result.turnstileToken = cleanText(input.turnstileToken, 2048);
  return result;
}

export function validateInquiry(data, now = Date.now()) {
  const errors = {};
  if (data.website) errors.website = "Invalid submission.";
  if (!data.name || data.name.length < 2) errors.name = "Please provide your name.";
  if (!data.organization || data.organization.length < 2) errors.organization = "Please provide your organization.";
  if (!/^\S+@\S+\.\S+$/.test(data.email)) errors.email = "Please provide a valid email address.";
  if (!data.interest) errors.interest = "Please select your interest.";
  if (!data.application || data.application.length < 10) errors.application = "Please describe the intended application.";
  if (!data.consent) errors.consent = "Consent is required.";

  const elapsed = now - data.startedAt;
  if (!Number.isFinite(data.startedAt) || data.startedAt <= 0 || elapsed < 2500 || elapsed > 86_400_000) {
    errors.timing = "Please reload the page and submit the form again.";
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[char]);
}
