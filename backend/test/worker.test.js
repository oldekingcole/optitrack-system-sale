import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

function createDb() {
  const rows = [];
  return {
    rows,
    prepare(sql) {
      let binds = [];
      return {
        bind(...values) { binds = values; return this; },
        async first() { return {total: 0}; },
        async run() { if (sql.includes("INSERT INTO inquiries")) rows.push(binds); return {success: true}; },
        async all() { return {results: []}; }
      };
    }
  };
}

const env = () => ({
  ALLOWED_ORIGINS: "https://www.example.com",
  DB: createDb(),
  IP_HASH_SALT: "test",
  TURNSTILE_REQUIRED: "false"
});
const ctx = {waitUntil() {}};

test("health endpoint works", async () => {
  const response = await worker.fetch(new Request("https://api.example.com/api/health"), env(), ctx);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).ok, true);
});

test("valid inquiry is accepted and persisted", async () => {
  const testEnv = env();
  const response = await worker.fetch(new Request("https://api.example.com/api/inquiries", {
    method: "POST",
    headers: {"content-type": "application/json", "origin": "https://www.example.com"},
    body: JSON.stringify({
      name: "Taylor Buyer", organization: "Example Robotics", email: "taylor@example.com",
      interest: "Complete 58-camera package", application: "Robotics tracking validation in a new laboratory.",
      consent: true, startedAt: Date.now() - 5000
    })
  }), testEnv, ctx);
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.match(body.reference, /^PX-\d{4}-[A-F0-9]{8}$/);
  assert.equal(testEnv.DB.rows.length, 1);
});

test("disallowed origin is rejected", async () => {
  const response = await worker.fetch(new Request("https://api.example.com/api/inquiries", {
    method: "POST", headers: {"content-type": "application/json", "origin": "https://evil.example"}, body: "{}"
  }), env(), ctx);
  assert.equal(response.status, 403);
});

test("Turnstile is required when enabled", async () => {
  const turnstileSecretName = ["TURNSTILE", "SECRET_KEY"].join("_");
  const response = await worker.fetch(new Request("https://api.example.com/api/inquiries", {
    method: "POST",
    headers: {"content-type": "application/json", "origin": "https://www.example.com"},
    body: JSON.stringify({
      name: "Taylor Buyer", organization: "Example Robotics", email: "taylor@example.com",
      interest: "Complete 58-camera package", application: "Robotics tracking validation in a new laboratory.",
      consent: true, startedAt: Date.now() - 5000
    })
  }), {...env(), TURNSTILE_REQUIRED: "true", [turnstileSecretName]: "test-secret"}, ctx);
  assert.equal(response.status, 400);
  assert.match((await response.json()).message, /Verification failed/);
});

test("Turnstile accepts a hostname from the configured allowlist", async () => {
  const originalFetch = globalThis.fetch;
  const turnstileSecretName = ["TURNSTILE", "SECRET_KEY"].join("_");
  globalThis.fetch = async () => new Response(JSON.stringify({
    success: true, hostname: "www.optitrackforsale.com", action: "sales_inquiry"
  }), {headers: {"content-type": "application/json"}});
  try {
    const testEnv = {
      ...env(), TURNSTILE_REQUIRED: "true", [turnstileSecretName]: "test-secret",
      TURNSTILE_EXPECTED_HOSTNAMES: "oldekingcole.github.io,www.optitrackforsale.com"
    };
    const response = await worker.fetch(new Request("https://api.example.com/api/inquiries", {
      method: "POST",
      headers: {"content-type": "application/json", "origin": "https://www.example.com"},
      body: JSON.stringify({
        name: "Taylor Buyer", organization: "Example Robotics", email: "taylor@example.com",
        interest: "Complete 58-camera package", application: "Robotics tracking validation in a new laboratory.",
        consent: true, startedAt: Date.now() - 5000, turnstileToken: "test-token"
      })
    }), testEnv, ctx);
    assert.equal(response.status, 201);
    assert.equal(testEnv.DB.rows.length, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("honeypot receives generic success without persistence", async () => {
  const testEnv = env();
  const response = await worker.fetch(new Request("https://api.example.com/api/inquiries", {
    method: "POST",
    headers: {"content-type": "application/json", "origin": "https://www.example.com"},
    body: JSON.stringify({website: "spam.example", startedAt: Date.now() - 5000})
  }), testEnv, ctx);
  assert.equal(response.status, 202);
  assert.equal(testEnv.DB.rows.length, 0);
});
