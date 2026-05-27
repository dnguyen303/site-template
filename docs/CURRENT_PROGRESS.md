# Current Progress

## Product decisions already made
- Brand name is VetHaul.
- Positioning is veteran-owned junk removal.
- Visual style chosen is modern / premium.
- Heavy patriotic styling was rejected.
- Before/after image should drive the hero.
- Working crew image should support how-it-works.
- Team + truck image should support trust/about.

## Architecture decisions already made
- Lean launch architecture preferred.
- Use Next.js for frontend and app shell.
- Use Postgres as the long-term lean data layer.
- Use Caddy for reverse proxy / TLS.
- Host on a single DigitalOcean VPS.
- Keep costs minimal.

## Infrastructure (Production)
- **Domain:** vethauljunkremoval.com
- **VPS:** DigitalOcean, IP 64.227.56.20, Ubuntu 24.04, 2GB RAM
- **DNS:** Managed via DigitalOcean, nameservers pointed from Squarespace
- **SSL:** Automatic via Caddy + Let's Encrypt
- **Deploy pipeline:** GitHub (dnguyen303/vethaul-site) → `bash /opt/vethaul/update.sh` on VPS
- **Email:** Resend, sending from bookings@vethauljunkremoval.com to vethauljunkremoval@gmail.com
- **Phone:** (720) 428-0405

## Assets confirmed for use
- Hero: `public/hero-before-after.png` (user-uploaded, 1371x686, 2:1 ratio)
- How it works: `public/crew-working.png`
- Trust/about: `public/owners-truck.png`

## What's complete (as of 2026-04-28)

### Foundation & Layout
- Next.js 15 App Router, TypeScript, Tailwind CSS v4
- Shared layout: `app/layout.tsx`, `components/SiteHeader.tsx`, `components/SiteFooter.tsx`
- `components/PageHero.tsx` reusable hero banner
- Phone number (720) 428-0405 in header (shows "Call" on mobile, full number on desktop) and footer
- Favicon: `app/icon.svg` (dark square, white V)
- Meta titles and descriptions on all pages

### Core Pages
- `app/page.tsx` — Full homepage
- `app/services/page.tsx` — 6 service categories
- `app/about/page.tsx` — Brand story, trust points, CTA
- `app/service-area/page.tsx` — 6 Denver metro cities
- `app/pricing/page.tsx` — 4 pricing sections (load, single item, cleanouts, fees)

### Booking Flow & Backend
- `components/QuoteForm.tsx` — 4-step compact click-through (load size > ZIP/stairs > contact > success)
- `app/api/quote/route.ts` — POST handler with Resend email notification on every booking
- `app/api/admin/bookings/route.ts` — GET handler, latest 50 bookings
- `app/admin/bookings/page.tsx` — Internal admin table (no auth yet)

### Data Layer
- `lib/db.ts` — postgres.js singleton
- `db/schema.sql` — customers, addresses, bookings tables (applied to production)
- `.env.production` on VPS with real DB credentials and RESEND_API_KEY

### Deployment
- `Dockerfile` — Multi-stage build, `output: standalone`
- `docker-compose.prod.yml` — app + db + caddy, Docker health check uses `node http.get` (not wget)
- `config/Caddyfile` — reverse proxy for vethauljunkremoval.com + www
- `.github/workflows/deploy.yml` — GitHub Actions auto-deploy on push to main; `git pull` runs in Actions step (not inside update.sh) to avoid bash script buffering
- `scripts/update.sh` — deploy script: start DB, wait for pg_isready, migrate, build, swap, poll health check (5s intervals, 2min max), auto-rollback to previous image on failure
- `scripts/migrate.sh` — DB migration runner, reads POSTGRES_USER from .env.production, tracks applied files in schema_migrations table
- `scripts/backup.sh` — nightly pg_dump → gzip → Google Drive via rclone, 30-day retention
- `db/migrations/001_initial.sql` — versioned initial schema
- `app/api/health/route.ts` — health check endpoint, returns { ok: true }
- Docker Compose plugin v5 installed on VPS
- rclone installed on VPS, configured with Google Drive token
- Cron job: daily 2am UTC pg_dump backup to Google Drive
- Backup log: `/opt/vethaul/backups/backup.log`

### GitHub Workflow
- Issues set up with labels: `bug`, `feature`, `chore`, `deferred`, `security`
- Historical issues #1-#5 created and closed documenting all work to date
- Open backlog: #6 rollback, #8 admin auth, #9 customer email, #10 SMS, #11 analytics
- PR-based workflow adopted — feature branches → PR → merge → auto-deploy
- Branch protection not enforced (requires paid plan for private repo) — discipline-based instead

### Pricing (current)
**Load pricing:** Minimum $80, 1/8 $120-150, 1/4 $180-250, 1/2 $300-450, 3/4 $450-600, Full $600-800+
**Single items:** Couch $80-120, Mattress $60-100, Fridge $80-140, Washer/Dryer $75-125, etc.
**Cleanouts:** Garage $300-800, Apartment $400-1200, Full House $800-2500+, Storage $150-600, Yard $100-500
**Additional fees:** Stairs +$20-50, Heavy items +$100-300, Disassembly +$20-80, Long carry +$20-75

### Copy & Content
- All em dashes removed from all source files
- No placeholder copy anywhere
- Real review from Melissa S. (Homeowner) live on homepage
- "Show up on time. Price it right. Leave it clean." in Why VetHaul section
- Cleanout pricing with SEO-optimized descriptions on homepage

### Legal
- Footer disclaimer covers: estimate language, hazmat exclusion, data consent, copyright
- Colorado Privacy Act covered by data consent language

### SEO
- Unique meta title + description on every page
- Keywords: Denver, veteran-owned, junk removal, garage cleanout, estate cleanout, foreclosure, same-day

### Mobile
- Hero h1 scales: text-3xl → text-5xl → text-7xl
- Hero grid is 50/50 at md+ (aligns with before/after image split)
- Stat bubbles hidden on mobile, visible on md+ within left "before" column
- Image sections: 240px min-height on mobile, 560px on desktop
- Section headings scale down on mobile
- Pricing numbers scale down on mobile
- Phone number shows as "Call" tap link on mobile

## What still needs to be built
- Admin page authentication — Issue #8 (ready to implement, needs env vars on VPS first)
- Automatic rollback on failed health check — Issue #6 (partial: image save + rollback logic added to update.sh, needs verification)
- Confirmation email back to customer — Issue #9, deferred
- SMS notifications (Twilio) — Issue #10, deferred
- Google Analytics / conversion tracking — Issue #11, deferred
- Review collection automation — deferred
- AI features (see `docs/AI_FEATURES.md`) — post-MVP

## Deploy workflow (automated)
```
git add -A && git commit -m "..."
git push origin main
```
GitHub Actions handles the rest. See `docs/DEPLOYMENT.md`.

## One-time VPS setup
All done as of 2026-04-28:
- GitHub Secrets `VPS_HOST` and `VPS_SSH_KEY` set
- Scripts executable on VPS
- VPS branch set to `main` with upstream tracking
- Full end-to-end deploy verified and passing

## Deployment documentation
Full deployment guide (setup, workflow, DB, testing, rollback, costs):
- `docs/DEPLOYMENT.md`
