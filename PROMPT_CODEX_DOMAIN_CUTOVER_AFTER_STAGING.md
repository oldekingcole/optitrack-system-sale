# Domain Cutover Prompt

Use this only after the staging frontend and Worker/D1 flow are verified.

Act as the production domain-cutover engineer. Read `AGENTS.md`, `README.md`, `DEPLOYMENT.md`, `SECURITY.md`, `HANDOFF_STATUS.md`, `DOMAIN_IMPLEMENTATION_LOG.md`, `DOMAIN_CUTOVER_INPUTS.md`, and `DEPLOYMENT_INPUTS.example.md` before changing anything.

Work on `deploy/domain-cutover`, not `main`. Preserve `$189,900 OBO`, verified quantities, discretion language, the independent-reseller notices, and all staging indexing protections. Use canonical `https://www.optitrackforsale.com/` and API `https://api.optitrackforsale.com/`, but do not publish `inquiries@optitrackforsale.com` until inbound and branded outbound mail are tested.

Guide, then pause, for every Cloudflare, Namecheap, GitHub Pages, Resend, Turnstile, DNS, billing, login, permission, and secret-entry action. Never request a secret in chat. Do not create a manual `api` DNS record. Test health, valid inquiry/D1 persistence, notification email, CORS rejection, Turnstile, invalid-admin-token rejection, HTTPS, and the apex redirect. Prepare a draft PR and do not remove `noindex` or replace the staging robots file without explicit final approval.
