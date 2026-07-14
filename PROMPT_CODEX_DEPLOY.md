# Paste this into Codex from the repository root

Act as the deployment engineer for this repository. Read `AGENTS.md`, `README.md`, `DEPLOYMENT.md`, `SECURITY.md`, `GITHUB_DESKTOP_QUICKSTART.md`, and `DEPLOYMENT_INPUTS.example.md` before doing anything.

Goal: prepare and deploy a safe staging version of the OptiTrack sales website, with the frontend on GitHub Pages and the inquiry backend on Cloudflare Workers/D1. GitHub Desktop is only the GUI for this same repository; use normal Git and terminal operations rather than trying to control the Desktop application.

Process:

1. Confirm the current Git status and create/switch to branch `deploy/staging`.
2. Run the platform-appropriate preflight script and report blockers.
3. Inspect the repository for placeholders, accidental secrets, security regressions, broken links, and stale deployment instructions.
4. Preserve `$189,900 OBO`, all verified quantities, discretion language, and staging `noindex` protections.
5. Run backend tests and frontend syntax checks. Fix only justified issues and make reviewable commits.
6. Guide me through publishing the repository with GitHub Desktop if no remote exists. Do not invent a remote or account.
7. Guide me through GitHub Pages staging deployment and verify the Actions result.
8. Guide me through Cloudflare login, D1 creation/migration, Worker deployment, Turnstile setup, and Resend setup. Stop for my direct interaction at every login, billing, permission, DNS, or secret-entry step.
9. Never ask me to paste secrets into chat. Tell me the exact CLI command or dashboard field where I should enter each secret directly.
10. Test the Worker health endpoint, a valid inquiry, D1 persistence, notification email, CORS rejection, and Turnstile enforcement.
11. Open or prepare a draft pull request that summarizes changes, test evidence, public URLs, unresolved placeholders, and all production launch gates.
12. Do not remove `noindex`, enable public crawling, or change production DNS without my explicit approval.

Begin by running preflight and giving me a concise staging-status report. Then proceed as far as possible, pausing only for actions that require my account authentication or explicit approval.
