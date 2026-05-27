# Architecture

## Recommended launch architecture
- Next.js App Router frontend
- Route handlers or small server-side actions for quote / booking
- Postgres database
- Caddy reverse proxy with HTTPS
- Small VPS for production
- Email confirmations via provider such as Resend
- Optional SMS later via Twilio

## Why this architecture
- low monthly cost
- simple enough to launch quickly
- clean upgrade path
- avoids major rewrite later
- keeps app and data model real from the beginning

## Do not overbuild at launch
Defer until later:
- n8n
- Directus
- AI pricing workflows
- route optimization
- customer accounts
- complex CRM

## Request flow
Customer visits site
-> views homepage and pricing
-> submits booking request
-> server validates payload
-> server calculates estimate
-> server writes data to Postgres
-> server sends confirmation email
-> internal admin can view request

## Production hosting
### Preferred
- small VPS
- app + Postgres + Caddy on one machine initially

### Why not self-host on mini PC first
- home internet and power are weaker production dependencies
- more ops burden for public site
- VPS is cleaner for customer-facing reliability

## Why Next.js
- one framework for marketing pages and app behavior
- clean upgrade path from brochure site to booking app
- easy routing and shared layout

## Why Caddy
- simple HTTPS
- easy reverse proxy config
- lower ops friction than more manual setups

## Why Postgres
- structured business data
- good for customers, bookings, items, statuses
- easy to grow into admin and automation later
