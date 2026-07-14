# AGENTS.md

## Mission

Prepare, stage, review, and deploy the OptiTrack PrimeX 22 sales website safely. The repository contains a static GitHub Pages frontend and a Cloudflare Worker/D1 backend.

## Non-negotiable sales facts

- Public asking price: **$189,900 OBO**.
- Package includes 58 OptiTrack PrimeX 22 cameras, 58 mounts, 4 calibration wands, 2 calibration squares, 3 USB hardware/security license keys, 4 active base stations, sufficient PoE+ switching and Ethernet cabling for all cameras, and Pelican cases.
- Public operating-history language may say the system was proven in sustained, operationally demanding professional use and was fully operational when decommissioned.
- Do **not** disclose or infer the former client, property, venue, project, installation name, location, architecture, guests, operators, or use case.
- Do not promise that software licenses are transferable, current, or under maintenance until OptiTrack confirms the exact status in writing.

## Architecture

- `frontend/`: dependency-free HTML/CSS/JavaScript deployed to GitHub Pages.
- `backend/`: Cloudflare Worker using D1, Resend, and Turnstile.
- `.github/workflows/`: CI, Pages deployment, and manually triggered Worker deployment.

## Working rules

1. Read `README.md`, `DEPLOYMENT.md`, `SECURITY.md`, and `DEPLOYMENT_INPUTS.example.md` before editing.
2. Work on a branch named `deploy/staging` unless the user explicitly selects another branch.
3. Run `scripts/preflight.sh` on macOS/Linux or `scripts/preflight.ps1` on Windows before and after material changes.
4. Keep the site blocked from indexing while staging. Do not remove `noindex,nofollow` or replace the staging `robots.txt` until the user explicitly approves production launch.
5. Never place credentials, API keys, tokens, private buyer data, or secret values in tracked files, issues, pull requests, logs, prompts, or screenshots.
6. Have the user enter secrets directly into GitHub Secrets, Wrangler prompts, Cloudflare, or Resend. Never ask the user to paste secret values into chat.
7. Use least-privilege permissions. Do not weaken CORS, Turnstile, rate limiting, validation, admin authentication, or HTML escaping merely to make deployment easier.
8. Prefer a pull request and a reviewable deployment checklist over direct commits to `main`.
9. Do not purchase a domain, alter nameservers, enable billing, or publish to production without an explicit human confirmation at that step.
10. Do not change the asking price, quantities, discretion language, or legal/transaction language unless directed.

## Staging objective

A successful staging deployment means:

- The repository is published to GitHub, preferably private during setup.
- CI passes.
- The GitHub Pages frontend loads over HTTPS and remains `noindex,nofollow`.
- All public placeholders are replaced with approved staging values.
- The Cloudflare Worker health endpoint returns success.
- D1 is created and the migration is applied.
- Turnstile verifies server-side.
- A test inquiry is saved in D1 and sends the internal Resend notification.
- No secrets appear in repository history or browser-delivered files.
- A pull request documents every manual action still required for production.

## Production gate

Do not launch indexing until all of the following are explicitly approved: domain, sales email, public contact identity, photos, verified inventory, license wording, brochure, privacy notice, freight policy, asking price, and inquiry routing.

## Review guidelines

Treat these as high-priority defects:

- Any exposure of secrets, buyer PII, admin tokens, raw IP addresses, or license-key identifiers.
- A public reference to the former installation/client/location.
- A bypass of Turnstile, origin checks, validation, rate limiting, or admin authentication.
- Buyer-submitted content inserted into HTML without escaping.
- Production indexing enabled before explicit approval.
- A workflow with unnecessarily broad GitHub permissions.
- A deployment that silently fails to store or notify on inquiries.
