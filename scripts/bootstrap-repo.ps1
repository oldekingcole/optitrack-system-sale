$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "Git is not installed. Install Git or GitHub Desktop, then rerun this script."
}

if (-not (Test-Path .git)) {
  git init -b main
} else {
  Write-Host "Existing Git repository detected."
}

& "$PSScriptRoot\preflight.ps1"
git add .

$Staged = git diff --cached --name-only
if (-not $Staged) {
  Write-Host "No uncommitted files to stage."
} else {
  $Name = git config user.name
  $Email = git config user.email
  if ($Name -and $Email) {
    git commit -m "Initial OptiTrack sales site scaffold"
    Write-Host "Initial commit created."
  } else {
    Write-Host "Files are staged, but Git user.name/user.email is not configured."
    Write-Host "Open this folder in GitHub Desktop and create the initial commit there."
  }
}

Write-Host "`nNext: add this folder in GitHub Desktop and publish the repository as private."
