---
name: Staging deployment
about: Track GitHub Pages and Cloudflare Worker staging deployment
labels: deployment
---

## Objective

Deploy the OptiTrack sales site to staging while preserving all indexing and privacy protections.

## Repository readiness

- [ ] `scripts/preflight.sh` or `scripts/preflight.ps1` passes
- [ ] No secrets are committed
- [ ] CI passes
- [ ] Work is on `deploy/staging`

## Public configuration

- [ ] GitHub repository selected
- [ ] Public sales email approved
- [ ] Neutral public seller identity approved
- [ ] Staging/public domain selected
- [ ] `frontend/config.js` updated
- [ ] Structured data, sitemap, robots, and CNAME values reviewed
- [ ] Price remains `$189,900 OBO`
- [ ] Former installation details remain undisclosed

## Backend configuration

- [ ] Cloudflare account selected
- [ ] D1 database created
- [ ] `database_id` updated
- [ ] Migration applied
- [ ] Turnstile site key configured
- [ ] Wrangler secrets entered directly
- [ ] Resend sending domain verified
- [ ] Worker deployed

## Verification

- [ ] Pages URL loads over HTTPS
- [ ] Site remains `noindex,nofollow`
- [ ] Worker health endpoint succeeds
- [ ] Valid inquiry returns a reference ID
- [ ] Inquiry persists in D1
- [ ] Notification email arrives with correct Reply-To
- [ ] Disallowed origin is rejected
- [ ] Turnstile is enforced server-side
- [ ] No secrets or buyer PII appear in browser source/logs

## Production gates still closed

- [ ] Approved photos added
- [ ] Inventory physically verified
- [ ] License wording confirmed
- [ ] Privacy notice approved
- [ ] Freight/pickup policy approved
- [ ] Owner explicitly approves public indexing
