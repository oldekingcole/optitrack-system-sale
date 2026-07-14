# Domain Cutover Inputs — Non-Secret

Never put passwords, API tokens, secret keys, private buyer data, or private email credentials in this file.

## Fixed values

- Registrar: `Namecheap`
- Registered domain: `optitrackforsale.com` (purchased 2026-07-14)
- Canonical public URL: `https://www.optitrackforsale.com/`
- Apex/root URL: `https://optitrackforsale.com/` (redirecting to `www`)
- API URL: `https://api.optitrackforsale.com/`
- Approved public contact email for the current release: `cole@teratech.biz`
- Reserved branded inquiry email: `inquiries@optitrackforsale.com` — do not publish until inbound and outbound delivery are tested
- Public asking price: `$189,900 OBO`
- Frontend: GitHub Pages; backend: Cloudflare Workers/D1; bot protection: Turnstile; transactional email: Resend
- Production indexing approved: **no**

## Still required

- GitHub Pages default/staging URL
- Public seller display name and legal entity for the privacy notice
- Private notification inbox (configure outside Git)
- Confirmed inbound and branded outbound delivery for the proposed public email
- Turnstile public site key and D1 database ID
- Cloudflare zone, GitHub domain verification, Pages HTTPS, Worker custom-domain, Resend verification, photo, brochure, privacy, and final-launch approvals
