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
  IP_HASH_SALT: "test"
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
