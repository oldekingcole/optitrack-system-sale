# Deployment Handoff Status

## Repository readiness

- Status: staging branch prepared; the authoritative repository has a GitHub remote.
- Frontend: static GitHub Pages site.
- Backend: Cloudflare Worker with D1, Turnstile, and Resend.
- CI workflows: included.
- GitHub Pages workflow: included.
- Manual Worker deployment workflow: included.
- Codex instructions: `AGENTS.md` and `PROMPT_CODEX_DEPLOY.md`.
- Claude Code instructions: `CLAUDE.md` and `PROMPT_CLAUDE_DEPLOY.md`.
- GitHub Desktop guide: `GITHUB_DESKTOP_QUICKSTART.md`.

## Last local verification

- `npm ci --ignore-scripts`: passed.
- `npm test`: 9/9 passed.
- `node --check` on frontend and backend JavaScript: passed.
- Obvious secret-pattern scan: passed.
- Staging indexing protections: passed.
- Deployment placeholders: intentionally still present and identified by preflight.
- Purchased-domain cutover documentation is present; production DNS and indexing remain blocked.

## Manual decisions still required

- GitHub account/organization and repository name.
- Repository visibility based on the account's GitHub Pages entitlement.
- Domain selection and ownership.
- Public seller name and sales email.
- Cloudflare account and DNS management.
- Resend sender domain and notification inbox.
- Owner-approved production launch.
- Namecheap-to-Cloudflare delegation, GitHub domain verification, branded email, and all production DNS actions.

## Safety state

- No credentials are included.
- No former client, installation, venue, or location is identified.
- Production crawling remains disabled.
- The license keys are described without promising transferability or software entitlement.
