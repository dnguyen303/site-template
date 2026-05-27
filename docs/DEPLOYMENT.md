# VetHaul Deployment Guide

## Overview

VetHaul runs on a single DigitalOcean VPS using Docker Compose with three containers: the Next.js app, Postgres, and Caddy (reverse proxy + TLS). Deploys are automated via GitHub Actions — push to `main` and the site updates itself.

**Production URL:** https://vethauljunkremoval.com
**VPS IP:** 64.227.56.20
**OS:** Ubuntu 24.04, 2GB RAM
**GitHub repo:** dnguyen303/vethaul-site

---

## Architecture

```
Internet
   |
Caddy (80/443) — auto HTTPS via Let's Encrypt
   |
Next.js app (port 3000, internal)
   |
Postgres 16 (port 5432, internal only)
```

All three run in the same Docker Compose stack on one VPS. Caddy handles TLS automatically. Postgres is never exposed to the public internet.

---

## Deploy Workflow (Day-to-Day)

```bash
git add -A && git commit -m "your message"
git push origin main
```

That's it. GitHub Actions takes over:

1. SSHes into the VPS using stored secrets
2. Runs `git pull origin main` on the VPS (latest scripts loaded before anything runs)
3. Runs `scripts/update.sh` on the VPS:
   - Starts the DB container and waits until `pg_isready`
   - Runs DB migrations (applies any new `db/migrations/*.sql` files)
   - Builds the new Docker image (fails fast before touching running containers)
   - Swaps containers with `docker compose up -d`
   - Runs 3-attempt health check against `https://vethauljunkremoval.com/api/health` using `curl`
   - Exits non-zero and stops if health check fails
4. GitHub Actions runs a second health check from outside the VPS
5. GitHub marks the commit green or red — you get notified on failure

**If the build fails**, the running containers are never touched. Site stays up.
**If the health check fails**, the workflow exits with an error. GitHub notifies you. You SSH in to investigate.

> **Note:** `git pull` runs in the GitHub Actions step (not inside update.sh) to avoid bash script buffering — bash reads the whole script before git pull would update it on disk.

---

## GitHub Secrets Required

Set these in GitHub → Settings → Secrets and variables → Actions:

| Secret | Value |
|--------|-------|
| `VPS_HOST` | `64.227.56.20` |
| `VPS_SSH_KEY` | Private SSH key that can log into the VPS as root |

### How to set up the SSH key (one time)

On your local machine:

```bash
# Generate a dedicated deploy key
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/vethaul_deploy

# Copy the public key to the VPS
ssh-copy-id -i ~/.ssh/vethaul_deploy.pub root@64.227.56.20

# Print the private key — paste this into GitHub Secret VPS_SSH_KEY
cat ~/.ssh/vethaul_deploy
```

GitHub Actions will use this key to SSH into the VPS. The VPS uses its own git config (HTTPS or separate deploy key) to pull from GitHub.

---

## Environment Variables

Production env lives at `/opt/vethaul/.env.production` on the VPS. Never commit this file.

```env
DATABASE_URL=postgres://postgres:<PASSWORD>@db:5432/vethaul
NEXT_PUBLIC_SITE_URL=https://vethauljunkremoval.com
RESEND_API_KEY=re_...
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<PASSWORD>
```

**Email routing (Resend):**
- Sent from: `bookings@vethauljunkremoval.com`
- Sent to: `vethauljunkremoval@gmail.com`
- Triggered: every new booking form submission

---

## Key Files

| File | Purpose |
|------|---------|
| `.github/workflows/deploy.yml` | GitHub Actions: push to main → auto deploy |
| `scripts/update.sh` | Deploy script run on VPS: pull, migrate, build, swap, health check |
| `scripts/migrate.sh` | DB migration runner: applies unapplied files from `db/migrations/` |
| `db/migrations/001_initial.sql` | Initial schema (customers, addresses, bookings) |
| `db/schema.sql` | Original schema reference (kept for documentation) |
| `Dockerfile` | Multi-stage build: deps → builder → runner (standalone output) |
| `docker-compose.prod.yml` | Production stack: app + db + caddy, with health checks |
| `config/Caddyfile` | Reverse proxy for vethauljunkremoval.com + www |
| `config/docker-compose.yml` | Local dev stack (no Caddy, plain ports) |
| `lib/db.ts` | postgres.js singleton — reads DATABASE_URL |
| `app/api/health/route.ts` | GET /api/health — returns { ok: true }, used by health checks |
| `app/api/quote/route.ts` | POST /api/quote — saves booking + sends Resend email |
| `app/api/admin/bookings/route.ts` | GET /api/admin/bookings — latest 50 bookings |
| `app/admin/bookings/page.tsx` | Internal admin table (no auth yet) |

---

## DB Migrations

Schema changes go in numbered files under `db/migrations/`:

```
db/migrations/
  001_initial.sql    <- applied
  002_add_column.sql <- new, will be applied on next deploy
```

The migration runner (`scripts/migrate.sh`) tracks applied files in a `schema_migrations` table in Postgres. On each deploy, it applies only files that haven't run yet, in order.

**To add a schema change:**

```bash
# Create the next migration file
echo "ALTER TABLE bookings ADD COLUMN cancelled_at timestamptz;" \
  > db/migrations/002_add_cancelled_at.sql

# Commit and push — it runs automatically on next deploy
git add db/migrations/002_add_cancelled_at.sql
git commit -m "add cancelled_at to bookings"
git push origin main
```

**To apply migrations manually on the VPS:**

```bash
ssh root@64.227.56.20
bash /opt/vethaul/scripts/migrate.sh
```

---

## Dockerfile Details

Three-stage build:

1. **deps** — `npm ci` only (cached layer)
2. **builder** — copies deps, runs `npm run build` with `output: standalone`
3. **runner** — minimal image, copies `public/`, `.next/standalone/`, `.next/static/`

The container starts with `node server.js` on port 3000.

`next.config.ts` must include:
```ts
output: 'standalone'
```

---

## DNS Setup

- Domain registered: Squarespace
- Nameservers pointed to DigitalOcean
- DNS managed in DigitalOcean control panel
- A record: `vethauljunkremoval.com` → `64.227.56.20`
- A record: `www.vethauljunkremoval.com` → `64.227.56.20`

Caddy handles TLS automatically once DNS propagates to the VPS IP.

---

## First-Time VPS Setup (Reference — Already Done)

Only needed once. Already completed for this VPS.

```bash
# Install Docker + Compose plugin
sudo apt update
sudo apt install -y docker.io docker-compose-plugin

# Clone repo
git clone https://github.com/dnguyen303/vethaul-site /opt/vethaul
cd /opt/vethaul

# Create env file
nano .env.production
# (fill in all vars from the Environment Variables section above)

# Make scripts executable
chmod +x scripts/update.sh scripts/migrate.sh

# Start DB first, apply initial schema
docker compose -f docker-compose.prod.yml --env-file .env.production up -d db
sleep 5
bash scripts/migrate.sh

# Start full stack
docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d
```

---

## Local Development

```bash
npm install
npm run dev
# Site at http://localhost:3000
```

**With local Postgres:**

```bash
docker compose -f config/docker-compose.yml up -d
# Set DATABASE_URL=postgres://postgres:postgres@localhost:5432/vethaul in .env.local
npm run dev
```

Apply schema locally (first time):

```bash
docker exec -i <db-container-name> psql -U postgres -d vethaul < db/migrations/001_initial.sql
```

---

## Testing the Booking Flow

### End-to-end

1. Visit https://vethauljunkremoval.com
2. Complete the 4-step booking form
3. Confirm success screen
4. Check `vethauljunkremoval@gmail.com` for email notification
5. Check admin table: https://vethauljunkremoval.com/admin/bookings

### API test (curl)

```bash
curl -X POST https://vethauljunkremoval.com/api/quote \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "phone": "7201234567",
    "email": "test@example.com",
    "zip": "80210",
    "loadSize": "small",
    "stairs": false,
    "preferredDate": "2026-05-01",
    "preferredTimeWindow": "morning"
  }'
```

Expected: `{"ok":true,"bookingId":"<uuid>","estimatedPrice":180,"status":"new"}`

### Health check

```bash
curl https://vethauljunkremoval.com/api/health
# Expected: {"ok":true}
```

---

## Monitoring & Logs

```bash
ssh root@64.227.56.20

# All container logs live
docker compose -f /opt/vethaul/docker-compose.prod.yml logs -f

# App only
docker compose -f /opt/vethaul/docker-compose.prod.yml logs -f app

# Container health status
docker compose -f /opt/vethaul/docker-compose.prod.yml ps
```

---

## Rollback

```bash
ssh root@64.227.56.20
cd /opt/vethaul
git log --oneline -10          # find last good commit hash
git checkout <hash>
docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d
```

---

## Resend Email Setup

- Account: Resend (resend.com)
- Domain verified: `vethauljunkremoval.com`
- Sending domain DNS records added in DigitalOcean
- API key in `.env.production` as `RESEND_API_KEY`
- Email skipped gracefully if key is absent (safe for local dev with no key)

---

## Costs (Monthly Estimate)

| Service | Cost |
|---------|------|
| DigitalOcean VPS (2GB) | ~$18/mo |
| Domain (Squarespace) | ~$20/yr |
| Resend (free tier) | $0 (3k emails/mo free) |
| **Total** | ~$18/mo |

---

## Backups

Database is backed up nightly via `scripts/backup.sh`:

- **Tool:** rclone (installed on VPS at `/usr/bin/rclone`)
- **Destination:** Google Drive folder `vethaul-backups`
- **Schedule:** Daily at 2am UTC (cron on VPS)
- **Retention:** 30 days local + remote, auto-pruned
- **Log:** `/opt/vethaul/backups/backup.log`
- **Cost:** Free (Google Drive 15GB free tier)

### Run a manual backup
```bash
ssh root@64.227.56.20
bash /opt/vethaul/scripts/backup.sh
```

### Restore from backup
```bash
ssh root@64.227.56.20

# Download the backup from Google Drive
rclone copy gdrive:vethaul-backups/vethaul-YYYYMMDD-HHMMSS.sql.gz /tmp/

# Restore
gunzip -c /tmp/vethaul-YYYYMMDD-HHMMSS.sql.gz | \
  docker exec -i vethaul-db-1 psql -U postgres -d vethaul
```

---

## Rollback

### Automatic (on failed health check)
`update.sh` saves the previous image ID before building. If the health check fails after deploy, it automatically re-tags the old image and restarts the app container. Exit code is still 1 so GitHub Actions marks the deploy as failed.

### Manual
```bash
ssh root@64.227.56.20
cd /opt/vethaul
git log --oneline -10          # find last good commit
git checkout <hash>
docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d
```

---

## What Is NOT Yet Deployed

- Admin authentication — Issue #8 (middleware written, needs ADMIN_USERNAME + ADMIN_PASSWORD in .env.production first)
- Customer confirmation email — Issue #9
- SMS notifications (Twilio) — Issue #10
- Google Analytics — Issue #11

---

## Lessons Learned (Deploy Debugging)

- **Port 3000 is not exposed to the VPS host** — only Caddy can reach the app internally. Health checks must use the public URL (`https://vethauljunkremoval.com/api/health`) via `curl`, not `localhost:3000`.
- **Self-updating script problem** — bash buffers script content before `git pull` updates the file on disk. Always pull in the GitHub Actions step before calling update.sh, never inside the script itself.
- **VPS branch tracking** — the VPS was initially on `master` with no upstream set. Fixed with `git checkout main && git pull origin main`.
- **POSTGRES_USER** — migrate.sh reads `POSTGRES_USER` from `.env.production` rather than hardcoding `postgres`, in case the env var differs.
