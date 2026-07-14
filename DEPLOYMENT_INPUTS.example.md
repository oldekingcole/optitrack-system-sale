# Deployment Inputs — Complete Locally

Copy this file to `DEPLOYMENT_INPUTS.local.md` for your own notes. The `.local.md` file is ignored by Git. Do not record secret values here.

## Public values

- GitHub account or organization: `[REQUIRED]`
- Repository name: `optitrack-system-sale` or `[OTHER]`
- Repository visibility during staging: `private`
- Public domain: `optitrackforsale.com` — purchased 2026-07-14
- Website hostname: `www.optitrackforsale.com`
- API hostname: `api.optitrackforsale.com`
- Public sales email: `cole@teratech.biz` — approved for the current release
- Internal notification email: `[REQUIRED]`
- Public seller/company name: `[REQUIRED OR APPROVED NEUTRAL LABEL]`
- Optional public phone: `[OPTIONAL]`
- Resend sender address: `inquiries@optitrackforsale.com` — after domain verification
- Cloudflare account ID: `[ENTER ONLY IN GITHUB SECRET/DASHBOARD, NOT HERE IF TREATED AS SENSITIVE]`
- D1 database ID: `[SAFE TO PLACE IN wrangler.jsonc AFTER CREATION]`
- Turnstile site key: `[PUBLIC KEY; SAFE FOR frontend/config.js]`
- Custom domain purchased/controlled: `yes/no`

## Secrets — names only

Enter these directly through Wrangler or GitHub repository secrets. Never put their values in this file.

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `RESEND_API_KEY`
- `NOTIFY_EMAIL`
- `TURNSTILE_SECRET_KEY`
- `ADMIN_TOKEN`
- `IP_HASH_SALT`

## Launch approvals

- Asking price approved: `yes/no`
- Inventory wording approved: `yes/no`
- License wording approved: `yes/no`
- Photos approved: `yes/no`
- Brochure approved: `yes/no`
- Privacy notice approved: `yes/no`
- Freight/pickup policy approved: `yes/no`
- Production indexing approved: `yes/no`
