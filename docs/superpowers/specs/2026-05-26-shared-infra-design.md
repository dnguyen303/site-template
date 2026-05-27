# Shared VPS Infrastructure Design
**Date:** 2026-05-26
**Status:** Approved for implementation

---

## Overview

Three small business websites will run on a single DigitalOcean VPS (2GB RAM, Ubuntu 24.04, IP 64.227.56.20):

| Site | Repo | Domain |
|---|---|---|
| VetHaul (junk removal) | `vethaul-site` | vethauljunkremoval.com |
| Spa site (body sculpting) | `spa-site` | TBD |
| Reptile Rhapsody (reptile breeder) | `reptile-site` | TBD |

A fourth repo, `vethaul-infra`, owns all shared infrastructure: Caddy (reverse proxy/SSL), Postgres (database), backup scripts, and the Docker network. Each site repo owns only its own app container.

---

## Goals

- Deploy new sites in under 1 hour from clone to live
- Keep VPS memory usage well under 2GB
- Full data isolation between sites at the database level
- No single site can take down the others (resource limits + infra rollback)
- Nightly encrypted backups per site to Google Drive
- Uptime alerts for all 3 sites

---

## Repo Structure

### `vethaul-infra`

```
vethaul-infra/
├── docker-compose.yml          # Caddy + Postgres services
├── config/
│   └── Caddyfile               # All domain routing (4 lines per site)
├── db/
│   └── init/
│       └── 00_create_dbs.sh    # Creates per-site DBs + users on first Postgres boot
├── scripts/
│   ├── bootstrap.sh            # One-time VPS setup: create vethaul-net, start infra
│   ├── update.sh               # Pull latest + safe Caddyfile reload with auto-revert
│   ├── backup.sh               # Per-site pg_dump → gzip → Google Drive
│   └── add-site.sh             # Helper: create DB/user + add Caddy entry for new site
├── .env                        # Postgres superuser credentials (VPS only, never committed)
├── .env.example                # Template showing required vars
└── README.md                   # Setup guide + how to add a new site
```

### Site repos (`vethaul-site`, `spa-site`, `reptile-site`)

```
<site-repo>/
├── app/                        # Next.js App Router pages + API routes
│   └── api/
│       ├── health/route.ts     # Health check endpoint
│       └── contact/route.ts    # Inquiry/booking form → Resend email
├── components/                 # SiteHeader, SiteFooter, ContactForm
├── lib/db.ts                   # postgres.js singleton
├── db/migrations/              # Versioned SQL migration files
├── scripts/
│   ├── update.sh               # App deploy: pull → migrate → build → health check → rollback
│   └── migrate.sh              # Migration runner
├── .github/workflows/
│   └── deploy.yml              # Auto-deploy on push to main
├── Dockerfile                  # Multi-stage build, output: standalone
├── docker-compose.prod.yml     # App container only — joins vethaul-net as external
├── .env.example                # Required vars: DATABASE_URL, RESEND_API_KEY, etc.
├── next.config.js
├── tsconfig.json
└── SETUP.md                    # 10-step checklist to go from clone to live
```

### `site-template`

A GitHub template repo (cloneable) identical in structure to a site repo but with placeholder content and generic naming. Used for all future sites beyond these three.

---

## Docker Networking

All containers share a single external Docker network: `vethaul-net`.

```
Internet
    │
    ▼
[ Caddy :80/:443 ]  ← infra repo, only container with public ports
    │
    ├──► vethaul-app:3000   ← vethaul-site repo
    ├──► spa-app:3000        ← spa-site repo
    └──► reptile-app:3000   ← reptile-site repo

[ Postgres :5432 ]  ← infra repo, internal only (no public port)
    ├──► vethaul_db  (vethaul_user)
    ├──► spa_db      (spa_user)
    └──► reptile_db  (reptile_user)
```

- Postgres is never exposed on a public port
- Each app container connects to Postgres by service name (`postgres:5432`) using its own credentials
- Caddy resolves app containers by name (`vethaul-app:3000`, etc.)
- Each site deploys its app container independently without restarting infra

**Network creation:** `bootstrap.sh` runs once on the VPS:
```bash
docker network create vethaul-net
```
All subsequent `docker compose up` commands join this pre-existing network.

---

## Postgres Isolation

Each site gets its own database and a dedicated Postgres user with minimal privileges. Enforced in `db/init/00_create_dbs.sh`, which Postgres runs automatically on first boot.

| Site | Database | User | Privileges |
|---|---|---|---|
| VetHaul | `vethaul_db` | `vethaul_user` | CONNECT, CRUD on `vethaul_db` only |
| Spa | `spa_db` | `spa_user` | CONNECT, CRUD on `spa_db` only |
| Reptile Rhapsody | `reptile_db` | `reptile_user` | CONNECT, CRUD on `reptile_db` only |

No user has cross-database access. No user has superuser privileges. The Postgres superuser credentials live only in `vethaul-infra/.env` on the VPS (chmod 600, never committed).

---

## Caddy Routing

One shared `Caddyfile` routes all domains. Adding a new site requires 4 lines and a Caddy reload (no restart, no downtime for other sites):

```
vethauljunkremoval.com, www.vethauljunkremoval.com {
    reverse_proxy vethaul-app:3000
}

spa-domain.com, www.spa-domain.com {
    reverse_proxy spa-app:3000
}

reptilerhapsody.com, www.reptilerhapsody.com {
    reverse_proxy reptile-app:3000
}
```

Caddy handles SSL automatically via Let's Encrypt. DNS for each domain must point to the VPS before Caddy can obtain a cert.

---

## Resource Limits

Each app container has a memory cap to prevent one site from starving the others. Set in each site's `docker-compose.prod.yml`:

```yaml
services:
  app:
    mem_limit: 400m
    memswap_limit: 400m
```

Memory profile:

| Component | Idle | Cap |
|---|---|---|
| OS + Docker daemon | ~350MB | — |
| Shared Caddy | ~30MB | — |
| Shared Postgres | ~150MB | — |
| VetHaul app | ~180MB | 400MB |
| Spa app | ~180MB | 400MB |
| Reptile app | ~180MB | 400MB |
| **Total** | **~1.07GB idle** | **~1.73GB max** |

Leaves ~270MB headroom at max load, ~1GB at idle. If any site grows significantly, upgrade the droplet to 4GB (~$6/month more).

---

## Infra Rollback

`vethaul-infra/scripts/update.sh` handles safe Caddyfile updates:

1. Snapshot current Caddyfile before applying changes
2. Pull latest from git
3. Reload Caddy (`caddy reload` — zero downtime)
4. Verify Caddy is healthy (HTTP check on each known domain)
5. If any check fails: restore snapshot, reload Caddy again, alert via log

A bad Caddyfile change cannot stay live for more than ~10 seconds.

---

## Uptime Monitoring

UptimeRobot (free tier) monitors the `/api/health` endpoint on each site. Setup is a required step in `SETUP.md` for every new site:

- Monitor type: HTTPS
- URL: `https://<domain>/api/health`
- Interval: 5 minutes
- Alert: email to site owner

No infra changes required — each site already has `/api/health` returning `{ ok: true }`.

---

## Backup Strategy

`vethaul-infra/scripts/backup.sh` runs nightly via cron (2am UTC). It dumps each database to a separate file so restoring one site never touches another's data.

```
/opt/vethaul/backups/
├── vethaul_db_2026-05-26.sql.gz
├── spa_db_2026-05-26.sql.gz
└── reptile_db_2026-05-26.sql.gz
```

Each file is uploaded to Google Drive via rclone. Retention: 30 days. Same rclone config already in place for VetHaul — extended to cover all DBs.

---

## Data Privacy Controls

| Control | Implementation |
|---|---|
| DB user isolation | Each site's user can only access its own DB |
| No credential sharing | Each site's `.env` contains only its own DB credentials |
| Postgres not public | Port 5432 never exposed outside `vethaul-net` |
| Separate backup files | Per-DB dumps — independent restore |
| `.env` file permissions | `chmod 600` on all `.env` files on VPS |
| Privacy policy | Built into each site's footer |
| Data consent | On all inquiry/booking forms |

All three sites are Colorado small businesses. The Colorado Privacy Act thresholds (100,000+ consumers/year) will not apply at launch. Standard privacy policy and consent language is sufficient.

---

## VetHaul Migration Plan

VetHaul currently runs its own Caddy and Postgres. Migration to shared infra:

1. Stand up `vethaul-infra` on VPS — run `bootstrap.sh`
2. Shared Postgres starts; `00_create_dbs.sh` creates `vethaul_db` + `vethaul_user`
3. `pg_dump` VetHaul's existing DB → restore into `vethaul_db` on shared Postgres
4. Update VetHaul's `DATABASE_URL` to point to shared Postgres
5. Remove Caddy + Postgres services from `vethaul-site/docker-compose.prod.yml`
6. Add `vethaul-net` as external network in `vethaul-site/docker-compose.prod.yml`
7. Move VetHaul's Caddyfile entry into `vethaul-infra/config/Caddyfile`
8. Deploy updated VetHaul — verify health check passes
9. Confirm site is live on vethauljunkremoval.com
10. Decommission old Caddy + Postgres containers

Target: zero downtime. DNS does not change. Rollback: restore old `docker-compose.prod.yml` and restart.

---

## Adding a New Site (Future)

After these three are live, adding site #4:

1. Clone `site-template` → new repo
2. Run `add-site.sh <site-name> <db-name> <domain>` on VPS
3. Follow `SETUP.md` 10-step checklist
4. Push to main → auto-deploys

Estimated time from clone to live: under 1 hour.

---

## Open Questions (Resolved)

- **Separate repos vs monorepo:** Separate repos — independent deploys, scoped secrets, matches template approach
- **Shared vs separate Postgres:** Shared instance, separate DBs — saves ~300MB RAM on 2GB VPS
- **Shared vs separate Caddy:** Shared — one cert manager, 4 lines to add a site
- **Data privacy:** Separate DB users + separate backup files is sufficient for Colorado small businesses at this scale
- **Resource limits:** 400MB cap per app container — prevents one site from starving others
