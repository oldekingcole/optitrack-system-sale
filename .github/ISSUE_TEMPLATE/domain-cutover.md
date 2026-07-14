---
name: Production domain cutover
title: "Deploy optitrackforsale.com production domain"
about: Track GitHub Pages, Cloudflare Worker, email, DNS, and launch-gate work.
labels: deployment, domain
assignees: ""
---

## Fixed values

- Canonical site: `https://www.optitrackforsale.com/`
- Apex: `https://optitrackforsale.com/` → `www`
- API: `https://api.optitrackforsale.com/`
- Proposed public email: `inquiries@optitrackforsale.com` (after mail verification)
- Asking price: `$189,900 OBO`

## Checklist

- [ ] Branch `deploy/domain-cutover` created after staging passes
- [ ] Independent-reseller and trademark notices added
- [ ] Private `NOTIFY_EMAIL` removed from tracked configuration
- [ ] Cloudflare zone, Namecheap delegation, GitHub verification, Pages domain/DNS/HTTPS, Worker custom domain, Turnstile, Resend, and inbound mail completed by the owner
- [ ] HTTPS, redirect, API health, D1 persistence, notification Reply-To, Turnstile, CORS, and admin rejection verified
- [ ] Privacy, photos, brochure, license wording, freight policy, and owner indexing approval complete
- [ ] Separate final launch commit removes staging indexing protections
