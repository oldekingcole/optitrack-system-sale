# Deployment Guide

## Recommended production topology

```text
www.yourdomain.com  -> GitHub Pages frontend
api.yourdomain.com  -> Cloudflare Worker backend
                      -> Cloudflare D1 lead database
                      -> Resend email notification
```

This provides a custom public domain while preserving GitHub-based version control and automatic frontend deployment.

## Staging deployment (before production)

Use the `deploy/staging` branch for staging. Publish the repository privately when the account permits it, then run the `Deploy frontend to GitHub Pages` workflow manually with `deploy/staging` selected as the branch. The resulting project Pages URL is suitable for staging; do not add a custom domain, DNS record, or `frontend/CNAME` yet. Keep `frontend/index.html` set to `noindex,nofollow` and keep `frontend/robots.txt` set to `Disallow: /`.

Configure the staging Pages hostname as an allowed origin and as the Turnstile widget hostname before testing inquiries. `TURNSTILE_REQUIRED` is `true` in the Worker configuration; enter the secret directly with Wrangler before accepting real test inquiries.

## 1. Create the GitHub repository

1. Create a repository such as `optitrack-system-sale`.
2. Keep it private if your GitHub plan supports private-repository Pages; otherwise the repository can be public because no secrets belong in it.
3. Push this project to the `main` branch.
4. In **Settings -> Pages**, choose **GitHub Actions** as the source.
5. Run the `Deploy frontend to GitHub Pages` workflow.

## 2. Buy or select the domain

Use a short, neutral domain that does not disclose the former installation or client. GitHub recommends a `www` subdomain for stability.

In the GitHub repository:

1. Open **Settings -> Pages**.
2. Enter `www.yourdomain.com` under custom domain.
3. Verify the domain in GitHub account settings before publishing.
4. Enable **Enforce HTTPS** after DNS and certificate provisioning complete.

At the DNS provider:

- Create a `CNAME` record: `www` -> `<github-username>.github.io`
- Optionally configure the apex/root domain according to GitHub's current Pages documentation so it redirects to `www`.

After the final domain is known, add `frontend/CNAME` containing exactly:

```text
www.yourdomain.com
```

## 3. Set up Cloudflare for the backend

The domain's DNS can be managed by Cloudflare even though the `www` site is hosted by GitHub Pages.

```bash
cd backend
npm install
npx wrangler login
npx wrangler d1 create optitrack-inquiries
```

Copy the returned D1 database ID into `backend/wrangler.jsonc`, then apply the database migration:

```bash
npm run db:migrate:remote
```

Create a Turnstile widget for the final public hostname. Put the public site key into `frontend/config.js`, then store the secret:

```bash
npx wrangler secret put TURNSTILE_SECRET_KEY
```

Create the remaining secrets:

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put ADMIN_TOKEN
npx wrangler secret put IP_HASH_SALT
```

Update `ALLOWED_ORIGINS`, `NOTIFY_EMAIL`, `FROM_EMAIL`, and `TURNSTILE_EXPECTED_HOSTNAME` in `wrangler.jsonc`.

Deploy:

```bash
npm run deploy
```

The first deployment produces a `workers.dev` URL. Test it before adding the custom API domain.

## 4. Add `api.yourdomain.com`

In the Cloudflare dashboard, add a Worker custom domain for:

```text
api.yourdomain.com
```

Update `frontend/config.js`:

```js
apiBaseUrl: "https://api.yourdomain.com"
```

Commit and push. GitHub Actions redeploys the frontend.

## 5. Configure Resend

1. Verify a sending domain in Resend.
2. Use a sender such as `OptiTrack System Sale <inquiries@yourdomain.com>`.
3. Set `NOTIFY_EMAIL` to the internal sales inbox.
4. Leave buyer confirmation disabled initially, or set `SEND_BUYER_CONFIRMATION` to `true` after the sender domain is verified and the confirmation wording is approved.

## 6. Test the complete flow

- Load the production site over HTTPS.
- Submit a test inquiry.
- Confirm the browser receives a reference number.
- Confirm the row appears in D1.
- Confirm the notification email arrives and Reply-To targets the buyer.
- Confirm disallowed origins fail.
- Confirm the Turnstile token is validated server-side.
- Confirm no secrets are present in the repository or browser source.

Health check:

```bash
curl https://api.yourdomain.com/api/health
```

List leads through the private API:

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://api.yourdomain.com/api/admin/inquiries?limit=50&status=new"
```

Update a lead:

```bash
curl -X PATCH \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"qualified","notes":"Buyer packet sent."}' \
  https://api.yourdomain.com/api/admin/inquiries/INQUIRY_UUID
```

## 7. Launch indexing

Only after final approval:

1. Remove `<meta name="robots" content="noindex,nofollow">` from `frontend/index.html`.
2. Replace `frontend/robots.txt` with `frontend/robots.production.txt`.
3. Update all `example.com` references.
4. Add approved photographs.
5. Confirm the brochure is the final public version.
6. Commit and push the launch change.
