#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v git >/dev/null 2>&1; then
  echo "Git is not installed. Install Git or GitHub Desktop, then rerun this script."
  exit 1
fi

if [[ ! -d .git ]]; then
  git init -b main
else
  echo "Existing Git repository detected."
fi

bash scripts/preflight.sh

git add .

if git diff --cached --quiet; then
  echo "No uncommitted files to stage."
elif git config user.name >/dev/null && git config user.email >/dev/null; then
  git commit -m "Initial OptiTrack sales site scaffold"
  echo "Initial commit created."
else
  echo "Files are staged, but Git user.name/user.email is not configured."
  echo "Open this folder in GitHub Desktop and create the initial commit there."
fi

echo
echo "Next: open this folder in GitHub Desktop with File -> Add Local Repository, then Publish repository as private."
