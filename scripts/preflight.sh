#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

fail=0
say() { printf '%s\n' "$*"; }
check_file() {
  if [[ -f "$1" ]]; then say "[ok] $1"; else say "[missing] $1"; fail=1; fi
}

say "== Required files =="
for file in \
  frontend/index.html frontend/styles.css frontend/app.js frontend/config.js \
  frontend/assets/OptiTrack_Buyer_Brochure_Draft_v2.pdf \
  backend/package.json backend/wrangler.jsonc backend/src/index.js \
  backend/migrations/0001_create_inquiries.sql \
  .github/workflows/ci.yml .github/workflows/deploy-pages.yml \
  AGENTS.md CLAUDE.md DOMAIN_IMPLEMENTATION_LOG.md DOMAIN_CUTOVER_INPUTS.md \
  PROMPT_CODEX_DOMAIN_CUTOVER_AFTER_STAGING.md; do
  check_file "$file"
done

printf '\n== JavaScript syntax ==\n'
node --check frontend/app.js
node --check frontend/config.js
node --check backend/src/index.js
node --check backend/src/validation.js

printf '\n== Backend dependencies and tests ==\n'
(
  cd backend
  npm ci --ignore-scripts
  npm test
)

printf '\n== Public placeholder scan ==\n'
set +e
grep -RInE 'https://(www\.)?example\.com|api\.example\.com|sales@example\.com|inquiries@example\.com|00000000-0000-0000-0000-000000000000' \
  frontend backend/wrangler.jsonc CNAME.example README.md DEPLOYMENT.md \
  --exclude-dir=node_modules
placeholder_status=$?
set -e
if [[ $placeholder_status -eq 0 ]]; then
  say "[attention] Deployment placeholders remain. This is expected before domain/email/D1 selection and blocks production launch."
elif [[ $placeholder_status -eq 1 ]]; then
  say "[ok] No deployment placeholders found in scanned public/configuration files."
else
  say "[error] Placeholder scan failed."
  fail=1
fi

printf '\n== Secret-pattern scan ==\n'
set +e
grep -RInE '(sk_live_|re_[A-Za-z0-9]{20,}|CLOUDFLARE_API_TOKEN[[:space:]]*[:=][[:space:]]*[^$<{]|TURNSTILE_SECRET_KEY[[:space:]]*[:=][[:space:]]*[^$<{]|ADMIN_TOKEN[[:space:]]*[:=][[:space:]]*[^$<{])' \
  . --exclude-dir=node_modules --exclude-dir=.git --exclude='package-lock.json' --exclude='preflight.sh' --exclude='preflight.ps1'
secret_status=$?
set -e
if [[ $secret_status -eq 0 ]]; then
  say "[error] A possible committed secret was found. Review before pushing."
  fail=1
elif [[ $secret_status -eq 1 ]]; then
  say "[ok] No obvious committed secret patterns found."
else
  say "[error] Secret scan failed."
  fail=1
fi

printf '\n== Staging indexing protection ==\n'
if grep -qi 'noindex' frontend/index.html && grep -q 'Disallow: /' frontend/robots.txt; then
  say "[ok] Staging indexing is blocked."
else
  say "[error] Staging indexing protection is missing."
  fail=1
fi

if [[ $fail -ne 0 ]]; then
  printf '\nPreflight FAILED.\n'
  exit 1
fi
printf '\nPreflight passed. Production is still blocked until placeholders and launch approvals are resolved.\n'
