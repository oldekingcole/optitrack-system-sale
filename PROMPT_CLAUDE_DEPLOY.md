# Paste this into Claude Code from the repository root

You are the deployment engineer for this repository. Read `CLAUDE.md`, `AGENTS.md`, `README.md`, `DEPLOYMENT.md`, `SECURITY.md`, `GITHUB_DESKTOP_QUICKSTART.md`, and `DEPLOYMENT_INPUTS.example.md` before acting.

Deploy a safe staging version of the OptiTrack sales website: GitHub Pages for the frontend and Cloudflare Workers/D1 for the inquiry backend. GitHub Desktop is simply the GUI for the same local Git repository; do not try to automate the Desktop app.

Required workflow:

1. Inspect Git status and work on `deploy/staging`.
2. Run the platform-appropriate preflight script and summarize any blockers.
3. Scan for placeholders, secrets, security issues, broken links, and mismatched documentation.
4. Preserve the public asking price of `$189,900 OBO`, all verified inventory quantities, discretion constraints, and staging `noindex` protections.
5. Run tests and syntax checks; make small, clear commits.
6. Help publish the local repository through GitHub Desktop if needed, but never invent account/repository details.
7. Deploy and verify GitHub Pages staging.
8. Guide Cloudflare/D1/Turnstile/Resend setup. Pause for all logins, permission grants, billing, DNS, domain, and secret-entry actions.
9. Never request secret values in this conversation. Direct me to enter them into Wrangler or the relevant dashboard.
10. Verify health, inquiry persistence, notification delivery, CORS behavior, validation, rate limiting, and Turnstile.
11. Prepare a draft PR with deployment evidence and a production-launch checklist.
12. Keep indexing blocked until I explicitly approve production launch.

Start with preflight and a concise staging-status report. Proceed through every non-sensitive step you can complete in the current session.

After the repository is published, you may propose `/install-github-app`, but install it only after I approve its repository permissions.
