# Hosting Decision

## Selected approach

**Frontend:** GitHub Pages with a custom `www` domain.  
**Backend:** Cloudflare Worker with an `api` subdomain.  
**Database:** Cloudflare D1.  
**Transactional email:** Resend.  
**Bot protection:** Cloudflare Turnstile.

## Why not put the backend on GitHub Pages?

GitHub Pages publishes static HTML, CSS, and JavaScript. Browser JavaScript cannot safely contain private API keys, send trusted email, or write directly to a private database. Those operations run in the Worker.

## Why keep the frontend on GitHub Pages?

- Simple Git-based updates and rollback
- Automatic deployment from `main`
- Custom-domain and HTTPS support
- No server maintenance
- The public website remains available independently of the inquiry backend

## Simpler alternative

Cloudflare Pages/Workers could host both layers under one provider. The selected split keeps the public site visibly tied to GitHub as requested while still providing a real backend.
