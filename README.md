# Complete OptiTrack PrimeX 22 Sales Website

> **Fast deployment:** begin with [`START_HERE.md`](START_HERE.md).


A deployable frontend and backend for marketing the complete 58-camera OptiTrack PrimeX 22 system at **$189,900 OBO**.

## Architecture

- **Frontend:** dependency-free HTML/CSS/JavaScript hosted by GitHub Pages.
- **Public domain:** `www.yourdomain.com` connected to GitHub Pages.
- **Backend:** Cloudflare Worker at `api.yourdomain.com`.
- **Lead storage:** Cloudflare D1.
- **Email notification:** Resend REST API.
- **Bot protection:** Cloudflare Turnstile, honeypot, submission-time check, origin validation, and D1-backed rate limiting.
- **Private lead review:** token-protected admin API endpoints.
- **Privacy scaffold:** a clearly marked draft notice that must be completed before launch.

GitHub Pages only serves static files, so the inquiry processor must run separately. This repository keeps both codebases together while deploying them to the appropriate services.

## Repository layout

```text
frontend/                  Public GitHub Pages website
backend/                   Cloudflare Worker inquiry API
.github/workflows/         GitHub Pages, CI, and optional Worker deployment
DEPLOYMENT.md              Complete setup sequence
SECURITY.md                Security and privacy notes
```

## Local preview

Frontend:

```bash
cd frontend
python3 -m http.server 8000
```

Backend tests:

```bash
cd backend
npm test
```

Backend development after Wrangler is installed and D1 is configured:

```bash
cd backend
npm install
npm run db:migrate:local
npm run dev
```

## Required configuration

### Frontend: `frontend/config.js`

Replace:

- `apiBaseUrl`
- `publicSiteUrl`
- `salesEmail`
- `turnstileSiteKey`
- Keep `turnstileRequired: true` for staging and production. The Worker fails closed if its Turnstile secret is missing.

Also update the structured-data URL in `frontend/index.html`, `frontend/sitemap.xml`, and the production robots file.

### Backend: `backend/wrangler.jsonc`

Replace:

- example domains in `ALLOWED_ORIGINS`
- notification and sender email addresses
- Turnstile expected hostname
- D1 `database_id`

Set secrets with Wrangler; never commit them:

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put ADMIN_TOKEN
npx wrangler secret put IP_HASH_SALT
```

## Photo workflow

Drop approved, metadata-stripped images into `frontend/assets/photos/` using the filenames documented there. The page automatically replaces each placeholder when its matching file exists.

## Launch safety

The site intentionally ships with `noindex,nofollow` and a blocking `robots.txt`. Remove those only after the owner approves the inventory, price, photos, email routing, legal terms, and public domain.

## GitHub Desktop and coding-agent handoff

For the fastest assisted deployment, start with `GITHUB_DESKTOP_QUICKSTART.md`. The repository includes:

- `AGENTS.md` for Codex repository guidance.
- `CLAUDE.md` for Claude Code guidance.
- `PROMPT_CODEX_DEPLOY.md` and `PROMPT_CLAUDE_DEPLOY.md` as ready-to-paste deployment tasks.
- Cross-platform Git bootstrap and preflight scripts under `scripts/`.
- A staging deployment issue template and pull-request checklist.

The coding agent and GitHub Desktop should use the same local repository. The agent does not need to control GitHub Desktop directly.
