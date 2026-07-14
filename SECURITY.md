# Security and Privacy Notes

## Secrets

Never place Cloudflare, Resend, Turnstile, database, or admin credentials in `frontend/`, GitHub Pages, commits, pull requests, screenshots, or browser JavaScript. Use Cloudflare Worker secrets and GitHub Actions secrets only.

## Inquiry data

The backend stores buyer contact and qualification information in D1. It does not intentionally store the visitor's raw IP address; it stores a salted SHA-256 hash used for rate limiting. Limit access to the D1 database and admin token.

## Bot and abuse controls

- Cloudflare Turnstile with mandatory server-side token verification
- Origin allowlist
- Hidden honeypot field
- Minimum form-completion time
- Maximum request size
- Per-IP-hash hourly submission cap
- Input length limits and HTML escaping in notification emails

## Admin API

Admin endpoints require an exact bearer token. Use a long random secret, rotate it if exposed, and do not call the admin API from public frontend code.

## Discretion

Public materials must not include the former client, property, project name, venue, staff, visitors, site layouts, IP addresses, project files, license-key identifiers, or proprietary technology visible in photographs or screenshots.

## Before launch

- Strip EXIF and location metadata from images.
- Redact serial/license identifiers from public photos.
- Verify the sender domain and Reply-To behavior.
- Confirm the privacy wording and record-retention policy.
- Confirm whether a formal privacy notice or cookie notice is required for any analytics later added.
