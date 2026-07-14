import test from "node:test";
import assert from "node:assert/strict";
import { cleanText, normalizeInquiry, validateInquiry, escapeHtml } from "../src/validation.js";

const valid = (overrides = {}) => normalizeInquiry({
  name: "Taylor Buyer", organization: "Example Robotics", email: "taylor@example.com",
  interest: "Complete 58-camera package", application: "Robotics tracking validation for a new laboratory.",
  consent: true, startedAt: Date.now() - 5000, ...overrides
});

test("cleanText removes control characters and respects length", () => {
  assert.equal(cleanText(" A\u0000B ", 10), "AB");
  assert.equal(cleanText("abcdef", 3), "abc");
});

test("valid inquiry passes", () => {
  const result = validateInquiry(valid());
  assert.equal(result.valid, true);
});

test("required fields are enforced", () => {
  const result = validateInquiry(valid({email: "bad", application: "short", consent: false}));
  assert.equal(result.valid, false);
  assert.ok(result.errors.email);
  assert.ok(result.errors.application);
  assert.ok(result.errors.consent);
});

test("submission timing rejects instant bots", () => {
  const result = validateInquiry(valid({startedAt: Date.now()}));
  assert.ok(result.errors.timing);
});

test("escapeHtml protects notification markup", () => {
  assert.equal(escapeHtml('<script>"x"</script>'), "&lt;script&gt;&quot;x&quot;&lt;/script&gt;");
});
