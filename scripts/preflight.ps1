$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$Required = @(
  "frontend/index.html", "frontend/styles.css", "frontend/app.js", "frontend/config.js",
  "frontend/assets/OptiTrack_Buyer_Brochure_Draft_v2.pdf",
  "backend/package.json", "backend/wrangler.jsonc", "backend/src/index.js",
  "backend/migrations/0001_create_inquiries.sql",
  ".github/workflows/ci.yml", ".github/workflows/deploy-pages.yml",
  "AGENTS.md", "CLAUDE.md"
)

$Failed = $false
Write-Host "== Required files =="
foreach ($File in $Required) {
  if (Test-Path $File) { Write-Host "[ok] $File" }
  else { Write-Host "[missing] $File"; $Failed = $true }
}

Write-Host "`n== JavaScript syntax =="
node --check frontend/app.js
node --check frontend/config.js
node --check backend/src/index.js
node --check backend/src/validation.js

Write-Host "`n== Backend dependencies and tests =="
Push-Location backend
npm ci --ignore-scripts
npm test
Pop-Location

Write-Host "`n== Public placeholder scan =="
$ScanFiles = @("frontend", "backend/wrangler.jsonc", "CNAME.example", "README.md", "DEPLOYMENT.md")
$Matches = Get-ChildItem $ScanFiles -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch "node_modules" } |
  Select-String -Pattern 'https://(www\.)?example\.com|api\.example\.com|sales@example\.com|inquiries@example\.com|00000000-0000-0000-0000-000000000000'
if ($Matches) {
  $Matches | ForEach-Object { Write-Host "$($_.Path):$($_.LineNumber):$($_.Line.Trim())" }
  Write-Host "[attention] Deployment placeholders remain; production launch is blocked."
} else {
  Write-Host "[ok] No deployment placeholders found in scanned files."
}

Write-Host "`n== Secret-pattern scan =="
$SecretMatches = Get-ChildItem . -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch "node_modules|\\.git" -and $_.Name -notin @("package-lock.json", "preflight.ps1", "preflight.sh") } |
  Select-String -Pattern '(sk_live_|re_[A-Za-z0-9]{20,}|CLOUDFLARE_API_TOKEN\s*[:=]\s*[^$<{]|TURNSTILE_SECRET_KEY\s*[:=]\s*[^$<{]|ADMIN_TOKEN\s*[:=]\s*[^$<{])'
if ($SecretMatches) {
  $SecretMatches | ForEach-Object { Write-Host "$($_.Path):$($_.LineNumber):$($_.Line.Trim())" }
  Write-Host "[error] A possible committed secret was found."
  $Failed = $true
} else {
  Write-Host "[ok] No obvious committed secret patterns found."
}

Write-Host "`n== Staging indexing protection =="
$Index = Get-Content frontend/index.html -Raw
$Robots = Get-Content frontend/robots.txt -Raw
if ($Index -match "noindex" -and $Robots -match "Disallow:\s*/") {
  Write-Host "[ok] Staging indexing is blocked."
} else {
  Write-Host "[error] Staging indexing protection is missing."
  $Failed = $true
}

if ($Failed) { throw "Preflight FAILED." }
Write-Host "`nPreflight passed. Production is still blocked until placeholders and approvals are resolved."
