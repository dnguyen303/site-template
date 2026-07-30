# Current Progress — site-template

This is a cloneable Next.js 15 starter wired for the shared VPS infra (vethaul-infra). It is not a finished site — it is a deploy-ready skeleton. The UI is intentionally generic and expected to be rebuilt per site.

## Template status (as of 2026-05-27)
Template is complete and usable. See `SETUP.md` for the clone-to-live checklist.

## What this template provides

### Infrastructure (copy-paste, no changes needed)
- `Dockerfile` — multi-stage Next.js standalone build, `output: standalone`
- `docker-compose.prod.yml` — app-only (no db/caddy); joins `vethaul-net`; `HOSTNAME: "0.0.0.0"` fix applied; `mem_limit: 400m`
- `.github/workflows/deploy.yml` — GitHub Actions auto-deploy on push to main
- `scripts/update.sh` — build, swap, health-check poll, auto-rollback
- `scripts/migrate.sh` — migration runner via `docker exec infra-postgres`
- `lib/db.ts` — postgres.js singleton
- `app/api/health/route.ts` — `{ ok: true }` endpoint
- `global.d.ts` — postgres.js type shim

### UI skeleton (structure only — all content/styles must be replaced)
- `app/layout.tsx` — root layout with SiteHeader + SiteFooter; update metadata
- `components/SiteHeader.tsx` — logo left, nav right, CTA button; replace business name, phone, nav links, colors
- `components/SiteFooter.tsx` — same; replace all content
- `app/page.tsx` — hero + services grid + contact form skeleton
- `app/about/page.tsx`, `app/services/page.tsx`, `app/contact/page.tsx`, `app/pricing/page.tsx`, `app/service-area/page.tsx` — placeholder pages
- `components/ContactForm.tsx` — basic name/email/phone/message form; may be usable as-is or adapted
- `components/PageHero.tsx` — reusable hero banner component
- `components/QuoteForm.tsx` — multi-step quote form (VetHaul-specific; likely delete for non-junk-removal sites)

### Backend stubs (review and adapt per site)
- `app/api/contact/route.ts` — saves to `contacts` table, sends email via Resend; update `from`/`to` addresses
- `app/api/admin/bookings/route.ts` — fetches from `bookings` table (VetHaul-specific schema; rewrite for new site)
- `app/admin/bookings/page.tsx` — admin table with VetHaul-specific columns; delete and rebuild per site
- `db/migrations/001_initial.sql` — VetHaul `contacts` + `bookings` schema; replace with site-specific schema

## What to delete/rebuild per new site
- `app/admin/` — VetHaul-specific columns
- `db/migrations/001_initial.sql` — replace with site schema
- All images in `public/` and `assets/`
- All copy and content in every page
- Color palette, typography (update `app/globals.css`)
- Any VetHaul-specific components (QuoteForm, etc.)

## Shared infra dependency
This template assumes `vethaul-infra` is running on the VPS:
- `vethaul-net` Docker network exists
- `infra-postgres` container is running
- DB and user for the new site have been provisioned via `scripts/add-site.sh`

## Deploy workflow for a new site
1. Clone this repo, rename, set up GitHub repo
2. Run `add-site.sh` on VPS to provision DB + Caddy
3. Set GitHub Secrets (`VPS_HOST`, `VPS_SSH_KEY`)
4. Set `.env.production` on VPS
5. Build UI from scratch
6. Push to main — GitHub Actions deploys automatically

Full checklist: `SETUP.md`
