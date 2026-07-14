# Domain Implementation Log — optitrackforsale.com

**Status:** purchased and controlled by the seller; production launch and indexing are not authorized.

## Approved architecture

| Purpose | Hostname | Destination |
|---|---|---|
| Canonical site | `www.optitrackforsale.com` | GitHub Pages |
| Root entry | `optitrackforsale.com` | Redirect to `www` |
| Inquiry API | `api.optitrackforsale.com` | Cloudflare Worker |

Namecheap remains the registrar. Cloudflare becomes authoritative DNS only after the owner adds the zone and changes nameservers. Do not create wildcard records or a manual `api` CNAME: attach the Worker Custom Domain instead.

## Required independent-reseller notices

Near the top of the public page:

> Independent resale listing for pre-owned OptiTrack equipment. This site is not affiliated with, authorized by, sponsored by, or endorsed by NaturalPoint, Inc. or OptiTrack.

In the footer:

> OptiTrack is a trademark of NaturalPoint, Inc. Trademark references are used solely to identify the genuine pre-owned equipment offered. The seller is independent of NaturalPoint, Inc. and OptiTrack.

Do not use the official OptiTrack logo, imitate OptiTrack/NaturalPoint trade dress, claim affiliation or warranty, or disclose the former client, venue, location, project, installation, staff, or use case.

## Human-only checkpoints

1. Add the domain as a Cloudflare zone and change Namecheap to the assigned Cloudflare nameservers.
2. Verify the domain in GitHub Pages account/organization settings with GitHub's TXT record; keep that record.
3. In repository Pages settings, set `www.optitrackforsale.com` as the custom domain.
4. In Cloudflare DNS, create a DNS-only `www` CNAME to the confirmed `<owner>.github.io` hostname and the current official GitHub Pages apex records. Enable Pages HTTPS after certificate provisioning.
5. Attach `api.optitrackforsale.com` as a Worker Custom Domain; do not pre-create its record.
6. Configure Turnstile for the exact production hostname, verify the Resend sending domain, and test inbound/outbound `inquiries@optitrackforsale.com` before publishing that address.

## Change control and launch gate

Perform domain work on `deploy/domain-cutover` after staging is healthy. Keep `noindex,nofollow`, the blocking `robots.txt`, the GitHub Pages staging URL, and the Worker `workers.dev` fallback until end-to-end verification succeeds. Do not remove those protections, change DNS, or publish the email without direct owner confirmation.

Before indexing is enabled, verify HTTPS and apex redirect, API health, D1 persistence, notification email and Reply-To, Turnstile enforcement, rejected disallowed origins, invalid-admin-token rejection, privacy-reviewed photos, final brochure/privacy/legal wording, and explicit owner launch approval.
