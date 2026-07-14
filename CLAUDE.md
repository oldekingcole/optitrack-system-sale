# Claude Code Project Instructions

Follow `AGENTS.md` as the authoritative project policy. Also read `README.md`, `DEPLOYMENT.md`, `SECURITY.md`, and `DEPLOYMENT_INPUTS.example.md` before acting.

## Default workflow

- Use branch `deploy/staging`.
- Start by running the platform-appropriate preflight script.
- Explain any failing check before changing code.
- Make small, reviewable commits.
- Use GitHub Desktop only as a GUI over the same local repository; do not attempt to automate or remote-control the GitHub Desktop application.
- Stop for human action when authentication, domain purchase, DNS changes, billing, repository secrets, Wrangler secrets, or final production indexing are required.
- Never request secret values in the conversation. Tell the user exactly where to enter them directly.
- Keep all staging protections enabled.

## GitHub integration

After the local repository is published and the user approves the permissions, Claude Code may install the official GitHub integration with `/install-github-app`. Prefer issue/PR-driven work and a draft pull request. Do not grant broader permissions than required.

## Content constraints

Keep the public asking price at `$189,900 OBO`, preserve the verified quantities, and do not disclose former-client or installation details. Do not make unverified license-transfer claims.
