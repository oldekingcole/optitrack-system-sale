# GitHub Desktop + Codex / Claude Code Quickstart

## The key concept

Codex or Claude Code does not need to connect to or control GitHub Desktop. GitHub Desktop, the coding agent, and your editor all work on the same local Git repository. Changes made by the agent appear in GitHub Desktop automatically.

## 1. Initialize the repository

Unzip this project to a normal local folder, then run one of the bootstrap scripts from the project root.

### macOS or Linux

```bash
bash scripts/bootstrap-repo.sh
```

### Windows PowerShell

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap-repo.ps1
```

The script initializes Git on `main`, stages all safe project files, runs preflight checks, and creates an initial commit when a Git name/email is already configured. Otherwise, GitHub Desktop can create the first commit.

## 2. Add it to GitHub Desktop

- Open GitHub Desktop.
- Choose **File -> Add Local Repository** and select this project folder, or drag the project folder into the GitHub Desktop window.
- Review the initial files.
- Commit them if the bootstrap script left them staged.
- Choose **Publish repository**.
- Keep the repository **private** during staging.

Suggested repository name: `optitrack-system-sale`.

## 3. Run a local coding agent in the same folder

Open the repository in a terminal from GitHub Desktop, then choose one agent.

### Codex

```bash
codex
```

Paste the contents of `PROMPT_CODEX_DEPLOY.md`.

### Claude Code

```bash
claude
```

Paste the contents of `PROMPT_CLAUDE_DEPLOY.md`.

GitHub Desktop will show the branch, file changes, commits, and pushes performed in that repository.

## 4. Optional GitHub-native agent setup

After the repository is published:

- Codex cloud can be connected to the repository for PR review and issue/PR tasks. Keep `AGENTS.md` in the root.
- Claude Code can install its official GitHub integration by running `/install-github-app` in Claude Code, after you review and approve the requested permissions.

The local-agent workflow is preferable for first deployment because it can guide you through Wrangler, Cloudflare, and local tests while you retain direct control of authentication prompts.

## 5. Human-only checkpoints

Do these yourself when the agent reaches them:

- Sign into GitHub, Cloudflare, Wrangler, Resend, or a domain registrar.
- Approve repository/app permissions.
- Purchase or select the domain.
- Enter API keys and tokens directly into secret prompts or dashboards.
- Approve DNS and nameserver changes.
- Approve the final production launch and removal of `noindex`.
