# Shared VPS Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a shared VPS infrastructure (`vethaul-infra`) that hosts Caddy + Postgres for all sites, migrate VetHaul onto it, then create a `site-template` repo for rapid deployment of future sites.

**Architecture:** A dedicated `vethaul-infra` repo owns shared Caddy and Postgres containers on a Docker network (`vethaul-net`). Each site repo owns only its app container, which joins `vethaul-net`. VetHaul is migrated off its own Caddy/Postgres onto the shared infra. A `site-template` repo provides a cloneable Next.js 15 starter pre-wired for this architecture.

**Tech Stack:** Docker Compose, Caddy 2, Postgres 16, Next.js 15 (App Router), TypeScript, Tailwind CSS, Resend (email), rclone (Google Drive backups), GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-05-26-shared-infra-design.md`

---

## Phase 1: vethaul-infra Repo

### Task 1: Create repo and directory structure

**Files:**
- Create: `vethaul-infra/.env.example`
- Create: `vethaul-infra/config/.gitkeep`
- Create: `vethaul-infra/db/init/.gitkeep`
- Create: `vethaul-infra/scripts/.gitkeep`

- [ ] **Step 1: Create the GitHub repo**

On GitHub, create a new private repo named `vethaul-infra`. Do NOT initialize with README (we'll push from local).

- [ ] **Step 2: Initialize locally**

```bash
mkdir -p ~/Projects/vethaul-infra
cd ~/Projects/vethaul-infra
git init
git remote add origin git@github.com:dnguyen303/vethaul-infra.git
mkdir -p config db/init scripts
touch config/.gitkeep db/init/.gitkeep scripts/.gitkeep
```

- [ ] **Step 3: Create .gitignore**

Create `~/Projects/vethaul-infra/.gitignore`:

```
.env
*.env.production
```

- [ ] **Step 4: Create .env.example**

Create `~/Projects/vethaul-infra/.env.example`:

```bash
# Postgres superuser
POSTGRES_USER=postgres
POSTGRES_PASSWORD=changeme_strong_password

# Per-site DB passwords (used in db/init/00_create_dbs.sh on first Postgres boot)
VETHAUL_DB_PASSWORD=changeme_vethaul
SPA_DB_PASSWORD=changeme_spa
REPTILE_DB_PASSWORD=changeme_reptile
```

- [ ] **Step 5: Commit**

```bash
cd ~/Projects/vethaul-infra
git add .
git commit -m "chore: initialize vethaul-infra repo structure"
```

---

### Task 2: docker-compose.yml

**Files:**
- Create: `vethaul-infra/docker-compose.yml`

- [ ] **Step 1: Create docker-compose.yml**

Create `~/Projects/vethaul-infra/docker-compose.yml`:

```yaml
services:
  caddy:
    image: caddy:2-alpine
    container_name: infra-caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"
    volumes:
      - ./config/Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - vethaul-net

  postgres:
    image: postgres:16-alpine
    container_name: infra-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: postgres
      VETHAUL_DB_PASSWORD: ${VETHAUL_DB_PASSWORD}
      SPA_DB_PASSWORD: ${SPA_DB_PASSWORD}
      REPTILE_DB_PASSWORD: ${REPTILE_DB_PASSWORD}
    volumes:
      - pg_data:/var/lib/postgresql/data
      - ./db/init:/docker-entrypoint-initdb.d:ro
    networks:
      - vethaul-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  caddy_data:
  caddy_config:
  pg_data:

networks:
  vethaul-net:
    external: true
    name: vethaul-net
```

- [ ] **Step 2: Commit**

```bash
cd ~/Projects/vethaul-infra
git add docker-compose.yml
git commit -m "feat: add shared docker-compose for Caddy and Postgres"
```

---

### Task 3: Caddyfile

**Files:**
- Create: `vethaul-infra/config/Caddyfile`

- [ ] **Step 1: Create Caddyfile**

Create `~/Projects/vethaul-infra/config/Caddyfile`:

```
vethauljunkremoval.com, www.vethauljunkremoval.com {
    reverse_proxy vethaul-app:3000
}

# --- Add new sites below this line ---
```

- [ ] **Step 2: Remove .gitkeep from config**

```bash
cd ~/Projects/vethaul-infra
rm config/.gitkeep
```

- [ ] **Step 3: Commit**

```bash
git add config/Caddyfile
git commit -m "feat: add Caddyfile with VetHaul routing"
```

---

### Task 4: Postgres init script

**Files:**
- Create: `vethaul-infra/db/init/00_create_dbs.sh`

- [ ] **Step 1: Create 00_create_dbs.sh**

Create `~/Projects/vethaul-infra/db/init/00_create_dbs.sh`:

```bash
#!/bin/bash
set -e

# This script runs once on first Postgres container boot (when pg_data volume is empty).
# It creates a database and scoped user for each site.
# Passwords come from env vars set in docker-compose.yml.

create_site_db() {
    local DB_NAME=$1
    local DB_USER=$2
    local DB_PASSWORD=$3

    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres <<-EOSQL
        CREATE DATABASE ${DB_NAME};
        CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
        GRANT CONNECT ON DATABASE ${DB_NAME} TO ${DB_USER};
EOSQL

    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "${DB_NAME}" <<-EOSQL
        GRANT USAGE ON SCHEMA public TO ${DB_USER};
        GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${DB_USER};
        ALTER DEFAULT PRIVILEGES IN SCHEMA public
            GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${DB_USER};
        ALTER DEFAULT PRIVILEGES IN SCHEMA public
            GRANT USAGE, SELECT ON SEQUENCES TO ${DB_USER};
EOSQL

    echo "Created database ${DB_NAME} with user ${DB_USER}."
}

create_site_db "vethaul_db"  "vethaul_user"  "${VETHAUL_DB_PASSWORD}"
create_site_db "spa_db"      "spa_user"      "${SPA_DB_PASSWORD}"
create_site_db "reptile_db"  "reptile_user"  "${REPTILE_DB_PASSWORD}"
```

- [ ] **Step 2: Make executable**

```bash
cd ~/Projects/vethaul-infra
chmod +x db/init/00_create_dbs.sh
rm db/init/.gitkeep
```

- [ ] **Step 3: Commit**

```bash
git add db/init/00_create_dbs.sh
git commit -m "feat: add Postgres init script creating per-site DBs and users"
```

---

### Task 5: bootstrap.sh

**Files:**
- Create: `vethaul-infra/scripts/bootstrap.sh`

- [ ] **Step 1: Create bootstrap.sh**

Create `~/Projects/vethaul-infra/scripts/bootstrap.sh`:

```bash
#!/bin/bash
set -e

# One-time VPS setup. Run this once after cloning vethaul-infra to the VPS.
# Creates the shared Docker network and starts Caddy + Postgres.

INFRA_DIR=/opt/vethaul-infra

log() { echo "[bootstrap] $1"; }

log "Creating Docker network vethaul-net..."
docker network create vethaul-net 2>/dev/null && log "Network created." || log "Network already exists, skipping."

log "Starting shared infra (Caddy + Postgres)..."
cd "$INFRA_DIR"
docker compose --env-file .env up -d

log "Waiting for Postgres to be ready..."
for i in $(seq 1 20); do
    if docker exec infra-postgres pg_isready -U "$(grep POSTGRES_USER "$INFRA_DIR/.env" | cut -d= -f2)" > /dev/null 2>&1; then
        log "Postgres is ready."
        break
    fi
    if [ "$i" = "20" ]; then
        log "ERROR: Postgres never became ready. Check: docker logs infra-postgres"
        exit 1
    fi
    sleep 3
done

log "Bootstrap complete. Caddy and Postgres are running."
log "Next: copy your site repos to /opt/<site-name>/ and run their deploy scripts."
```

- [ ] **Step 2: Make executable**

```bash
cd ~/Projects/vethaul-infra
chmod +x scripts/bootstrap.sh
rm scripts/.gitkeep
```

- [ ] **Step 3: Commit**

```bash
git add scripts/bootstrap.sh
git commit -m "feat: add bootstrap.sh for one-time VPS setup"
```

---

### Task 6: update.sh with Caddyfile rollback

**Files:**
- Create: `vethaul-infra/scripts/update.sh`

- [ ] **Step 1: Create update.sh**

Create `~/Projects/vethaul-infra/scripts/update.sh`:

```bash
#!/bin/bash
set -e

INFRA_DIR=/opt/vethaul-infra
CADDYFILE="$INFRA_DIR/config/Caddyfile"
BACKUP="${CADDYFILE}.bak"

# Add domains here as new sites go live. Used for post-reload health checks.
DOMAINS=(
    "vethauljunkremoval.com"
)

log() { echo "[infra-update] $1"; }

cd "$INFRA_DIR"

log "Snapshotting Caddyfile..."
cp "$CADDYFILE" "$BACKUP"

log "Pulling latest from git..."
git pull origin main

log "Reloading Caddy (zero downtime)..."
docker exec infra-caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile

log "Running health checks..."
FAILED=0
for domain in "${DOMAINS[@]}"; do
    if curl -sf --max-time 10 "https://${domain}/api/health" | grep -q '"ok":true'; then
        log "${domain}: OK"
    else
        log "${domain}: FAILED"
        FAILED=1
    fi
done

if [ "$FAILED" = "1" ]; then
    log "Health check failed — reverting Caddyfile..."
    cp "$BACKUP" "$CADDYFILE"
    docker exec infra-caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
    log "Reverted. Check config/Caddyfile for errors."
    exit 1
fi

log "All sites healthy. Update complete."
```

- [ ] **Step 2: Make executable**

```bash
cd ~/Projects/vethaul-infra
chmod +x scripts/update.sh
```

- [ ] **Step 3: Commit**

```bash
git add scripts/update.sh
git commit -m "feat: add update.sh with Caddyfile snapshot and auto-revert"
```

---

### Task 7: backup.sh

**Files:**
- Create: `vethaul-infra/scripts/backup.sh`

- [ ] **Step 1: Create backup.sh**

Create `~/Projects/vethaul-infra/scripts/backup.sh`:

```bash
#!/bin/bash
set -e

BACKUP_DIR=/opt/vethaul-infra/backups
DATE=$(date +%Y-%m-%d)
ENV_FILE=/opt/vethaul-infra/.env
POSTGRES_USER=$(grep '^POSTGRES_USER=' "$ENV_FILE" | cut -d= -f2)
RETENTION_DAYS=30

# Databases to back up — add new site DBs here when added
DATABASES=(
    "vethaul_db"
    "spa_db"
    "reptile_db"
)

log() { echo "[backup] $1"; }

mkdir -p "$BACKUP_DIR"

for DB in "${DATABASES[@]}"; do
    FILENAME="${BACKUP_DIR}/${DB}_${DATE}.sql.gz"
    log "Dumping ${DB}..."
    docker exec infra-postgres pg_dump -U "$POSTGRES_USER" "$DB" | gzip > "$FILENAME"
    log "Uploading ${DB} to Google Drive..."
    rclone copy "$FILENAME" "gdrive:vethaul-backups/${DB}/" --log-level ERROR
    log "${DB} backed up to ${FILENAME} and uploaded."
done

log "Cleaning up backups older than ${RETENTION_DAYS} days..."
find "$BACKUP_DIR" -name "*.sql.gz" -mtime "+${RETENTION_DAYS}" -delete

log "Backup complete."
```

- [ ] **Step 2: Make executable**

```bash
cd ~/Projects/vethaul-infra
chmod +x scripts/backup.sh
```

- [ ] **Step 3: Add backups/ to .gitignore**

Append to `~/Projects/vethaul-infra/.gitignore`:

```
backups/
```

- [ ] **Step 4: Commit**

```bash
git add scripts/backup.sh .gitignore
git commit -m "feat: add backup.sh — per-DB nightly dumps to Google Drive"
```

---

### Task 8: add-site.sh

**Files:**
- Create: `vethaul-infra/scripts/add-site.sh`

- [ ] **Step 1: Create add-site.sh**

Create `~/Projects/vethaul-infra/scripts/add-site.sh`:

```bash
#!/bin/bash
set -e

# Usage: ./add-site.sh <container-name> <db-name> <db-user> <db-password> <domain>
# Example: ./add-site.sh spa-app spa_db spa_user s3cr3t myspa.com

CONTAINER_NAME=$1
DB_NAME=$2
DB_USER=$3
DB_PASSWORD=$4
DOMAIN=$5

if [ -z "$CONTAINER_NAME" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DOMAIN" ]; then
    echo "Usage: ./add-site.sh <container-name> <db-name> <db-user> <db-password> <domain>"
    echo "Example: ./add-site.sh spa-app spa_db spa_user s3cr3t myspa.com"
    exit 1
fi

INFRA_DIR=/opt/vethaul-infra
POSTGRES_USER=$(grep '^POSTGRES_USER=' "$INFRA_DIR/.env" | cut -d= -f2)

log() { echo "[add-site] $1"; }

log "Creating database ${DB_NAME} and user ${DB_USER}..."
docker exec infra-postgres psql -U "$POSTGRES_USER" --dbname postgres <<-EOSQL
    CREATE DATABASE ${DB_NAME};
    CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
    GRANT CONNECT ON DATABASE ${DB_NAME} TO ${DB_USER};
EOSQL

docker exec infra-postgres psql -U "$POSTGRES_USER" --dbname "${DB_NAME}" <<-EOSQL
    GRANT USAGE ON SCHEMA public TO ${DB_USER};
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${DB_USER};
    ALTER DEFAULT PRIVILEGES IN SCHEMA public
        GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${DB_USER};
    ALTER DEFAULT PRIVILEGES IN SCHEMA public
        GRANT USAGE, SELECT ON SEQUENCES TO ${DB_USER};
EOSQL

log "Adding Caddy entry for ${DOMAIN}..."
cat >> "$INFRA_DIR/config/Caddyfile" <<-CADDY

${DOMAIN}, www.${DOMAIN} {
    reverse_proxy ${CONTAINER_NAME}:3000
}
CADDY

log "Reloading Caddy..."
docker exec infra-caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile

log ""
log "Done. Site ${DOMAIN} is configured. Three things left to do manually:"
log "  1. Add '${DOMAIN}' to the DOMAINS array in scripts/update.sh"
log "  2. Add '${DB_NAME}' to the DATABASES array in scripts/backup.sh"
log "  3. Set up UptimeRobot monitor for https://${DOMAIN}/api/health"
```

- [ ] **Step 2: Make executable**

```bash
cd ~/Projects/vethaul-infra
chmod +x scripts/add-site.sh
```

- [ ] **Step 3: Commit**

```bash
git add scripts/add-site.sh
git commit -m "feat: add add-site.sh helper for provisioning new sites"
```

---

### Task 9: README.md and push to GitHub

**Files:**
- Create: `vethaul-infra/README.md`

- [ ] **Step 1: Create README.md**

Create `~/Projects/vethaul-infra/README.md`:

```markdown
# vethaul-infra

Shared VPS infrastructure: Caddy (reverse proxy + SSL) and Postgres for all sites hosted on the VPS.

## What lives here
- Shared Caddy: routes all domains, handles SSL via Let's Encrypt
- Shared Postgres: one instance, separate DB per site
- Backup scripts: nightly per-DB dumps to Google Drive
- Helper scripts: bootstrap, update, add-site

## First-time VPS setup

SSH into the VPS, then:

```bash
git clone git@github.com:dnguyen303/vethaul-infra.git /opt/vethaul-infra
cd /opt/vethaul-infra
cp .env.example .env
# Edit .env with real passwords
nano .env
bash scripts/bootstrap.sh
```

## Adding a new site

1. Deploy the site's app container (it must join `vethaul-net` and have a unique `container_name`)
2. Run on VPS:
   ```bash
   cd /opt/vethaul-infra
   bash scripts/add-site.sh <container-name> <db-name> <db-user> <db-password> <domain>
   ```
3. Add the domain to `DOMAINS` in `scripts/update.sh`
4. Add the DB name to `DATABASES` in `scripts/backup.sh`
5. Commit and push the updated Caddyfile and scripts
6. Set up UptimeRobot for `https://<domain>/api/health`

## Updating Caddyfile

Edit `config/Caddyfile`, then:

```bash
cd /opt/vethaul-infra
bash scripts/update.sh
```

update.sh snapshots the current Caddyfile and auto-reverts if any site's health check fails after reload.

## Backups

Cron runs `scripts/backup.sh` nightly at 2am UTC. Each DB is dumped to a separate `.sql.gz` file and uploaded to Google Drive. Retention: 30 days.

To restore a site's DB from backup:
```bash
gunzip -c /opt/vethaul-infra/backups/<db>_<date>.sql.gz | \
  docker exec -i infra-postgres psql -U postgres -d <db-name>
```

## Containers

| Container | Role |
|---|---|
| `infra-caddy` | Reverse proxy, SSL |
| `infra-postgres` | Shared Postgres |
| `vethaul-app` | VetHaul site |
| `spa-app` | Spa site (TBD) |
| `reptile-app` | Reptile Rhapsody (TBD) |
```

- [ ] **Step 2: Push to GitHub**

```bash
cd ~/Projects/vethaul-infra
git add README.md
git commit -m "docs: add README with setup and operations guide"
git push -u origin main
```

Expected output: branch pushed, no errors.

---

### Task 10: Deploy infra to VPS

**No files changed** — this is VPS operations.

- [ ] **Step 1: SSH into VPS**

```bash
ssh root@64.227.56.20
```

- [ ] **Step 2: Clone infra repo**

```bash
git clone git@github.com:dnguyen303/vethaul-infra.git /opt/vethaul-infra
cd /opt/vethaul-infra
```

- [ ] **Step 3: Create .env with real passwords**

```bash
cp .env.example .env
chmod 600 .env
nano .env
```

Fill in real values for all five variables. Use strong unique passwords for each DB user.

- [ ] **Step 4: Run bootstrap.sh**

```bash
bash scripts/bootstrap.sh
```

Expected output:
```
[bootstrap] Creating Docker network vethaul-net...
[bootstrap] Network created.
[bootstrap] Starting shared infra (Caddy + Postgres)...
[bootstrap] Waiting for Postgres to be ready...
[bootstrap] Postgres is ready.
[bootstrap] Bootstrap complete.
```

- [ ] **Step 5: Verify containers are running**

```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

Expected:
```
NAMES              STATUS
infra-caddy        Up X seconds
infra-postgres     Up X seconds (healthy)
```

- [ ] **Step 6: Verify DBs were created**

```bash
docker exec infra-postgres psql -U postgres -c "\l"
```

Expected: `vethaul_db`, `spa_db`, `reptile_db` all listed.

---

## Phase 2: VetHaul Migration

### Task 11: Update vethaul-site docker-compose.prod.yml

**Files:**
- Modify: `vethaul-site/docker-compose.prod.yml`

- [ ] **Step 1: Replace docker-compose.prod.yml**

The current file has `app`, `db`, and `caddy` services. Replace it entirely with app-only:

```yaml
services:
  app:
    build: .
    container_name: vethaul-app
    restart: unless-stopped
    mem_limit: 400m
    memswap_limit: 400m
    environment:
      DATABASE_URL: ${DATABASE_URL}
      NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL}
      RESEND_API_KEY: ${RESEND_API_KEY}
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - vethaul-net

networks:
  vethaul-net:
    external: true
    name: vethaul-net
```

Note: `container_name: vethaul-app` is required — this is how Caddy finds the container across compose files.

- [ ] **Step 2: Commit**

```bash
cd ~/Projects/vethaul-site/vethaul-claude-code-project-v2
git add docker-compose.prod.yml
git commit -m "infra: remove own Caddy/Postgres, join shared vethaul-net"
```

---

### Task 12: Update deploy scripts for shared Postgres

**Files:**
- Modify: `vethaul-site/scripts/update.sh`
- Modify: `vethaul-site/scripts/migrate.sh`

- [ ] **Step 1: Update scripts/update.sh**

Replace the full file at `scripts/update.sh`:

```bash
#!/bin/bash
set -e

COMPOSE="docker compose -f /opt/vethaul/docker-compose.prod.yml --env-file /opt/vethaul/.env.production"
APP_URL="https://vethauljunkremoval.com/api/health"

log() { echo "[deploy] $1"; }

cd /opt/vethaul

log "Running DB migrations..."
bash /opt/vethaul/scripts/migrate.sh

log "Saving current image ID for rollback..."
PREV_IMAGE=$(docker images vethaul-vethaul-app --format "{{.ID}}" | head -1)

log "Building new image..."
$COMPOSE build app

log "Swapping containers..."
$COMPOSE up -d

log "Waiting for app to become healthy..."
for i in $(seq 1 24); do
  if curl -sf "$APP_URL" | grep -q '"ok":true'; then
    log "Health check passed."
    log "Deploy complete."
    exit 0
  fi
  log "Attempt $i/24 failed, retrying in 5s..."
  sleep 5
done

log "ERROR: Health check failed."
if [ -n "$PREV_IMAGE" ]; then
  log "Rolling back to previous image ($PREV_IMAGE)..."
  docker tag "$PREV_IMAGE" vethaul-vethaul-app:latest
  $COMPOSE up -d app
  log "Rollback complete. Check logs: $COMPOSE logs --tail=50 app"
else
  log "No previous image found, cannot roll back."
fi
exit 1
```

- [ ] **Step 2: Update scripts/migrate.sh**

Replace the full file at `scripts/migrate.sh`:

```bash
#!/bin/bash
set -e

ENV_FILE=/opt/vethaul/.env.production
DB_URL=$(grep '^DATABASE_URL=' "$ENV_FILE" | cut -d= -f2-)

log() { echo "[migrate] $1"; }

# Run psql against the shared Postgres container using the site's own credentials
run_psql() {
    docker exec infra-postgres psql "$DB_URL" "$@"
}

# Create migration tracking table if it doesn't exist
run_psql -c "
  CREATE TABLE IF NOT EXISTS schema_migrations (
    filename TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
" > /dev/null

for filepath in /opt/vethaul/db/migrations/*.sql; do
  filename=$(basename "$filepath")
  already_applied=$(run_psql -tAc "SELECT COUNT(*) FROM schema_migrations WHERE filename='$filename';")

  if [ "$already_applied" = "0" ]; then
    log "Applying $filename..."
    run_psql -f /dev/stdin < "$filepath"
    run_psql -c "INSERT INTO schema_migrations (filename) VALUES ('$filename');" > /dev/null
    log "$filename applied."
  else
    log "$filename already applied, skipping."
  fi
done

log "Done."
```

- [ ] **Step 3: Commit**

```bash
cd ~/Projects/vethaul-site/vethaul-claude-code-project-v2
git add scripts/update.sh scripts/migrate.sh
git commit -m "infra: update deploy scripts to use shared Postgres container"
```

---

### Task 13: Migrate data and cut over

**No files changed** — VPS operations only.

- [ ] **Step 1: SSH into VPS**

```bash
ssh root@64.227.56.20
```

- [ ] **Step 2: Dump existing VetHaul DB**

```bash
cd /opt/vethaul
COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.production"
DB_USER=$(grep POSTGRES_USER .env.production | cut -d= -f2)
$COMPOSE exec -T db pg_dump -U "$DB_USER" vethaul > /tmp/vethaul_dump.sql
echo "Dump complete: $(wc -l < /tmp/vethaul_dump.sql) lines"
```

- [ ] **Step 3: Restore dump into shared Postgres**

```bash
POSTGRES_USER=$(grep POSTGRES_USER /opt/vethaul-infra/.env | cut -d= -f2)
docker exec -i infra-postgres psql -U "$POSTGRES_USER" -d vethaul_db < /tmp/vethaul_dump.sql
echo "Restore complete."
```

- [ ] **Step 4: Update VetHaul .env.production DATABASE_URL**

```bash
nano /opt/vethaul/.env.production
```

Change `DATABASE_URL` to:
```
DATABASE_URL=postgresql://vethaul_user:<VETHAUL_DB_PASSWORD>@infra-postgres:5432/vethaul_db
```

Use the `VETHAUL_DB_PASSWORD` value from `/opt/vethaul-infra/.env`.

- [ ] **Step 5: Cut over (< 60 seconds downtime)**

```bash
# Stop old Caddy and Postgres
cd /opt/vethaul
docker compose -f docker-compose.prod.yml --env-file .env.production stop caddy db

# Pull and deploy new vethaul-site (no Caddy, no Postgres, joins vethaul-net)
git pull origin main
bash /opt/vethaul/scripts/update.sh
```

- [ ] **Step 6: Verify site is live**

```bash
curl -sf https://vethauljunkremoval.com/api/health
```

Expected: `{"ok":true}`

- [ ] **Step 7: Remove old volumes**

```bash
cd /opt/vethaul
docker compose -f docker-compose.prod.yml --env-file .env.production down --volumes
```

This removes the old `postgres_data`, `caddy_data`, `caddy_config` volumes. Only run after confirming the site is live and data is in the shared Postgres.

- [ ] **Step 8: Clean up dump**

```bash
rm /tmp/vethaul_dump.sql
```

---

### Task 14: Update GitHub Actions for new VPS layout

**Files:**
- No change needed — deploy.yml already SSHs in and runs `bash /opt/vethaul/scripts/update.sh`

- [ ] **Step 1: Verify deploy still works after migration**

Push any small change (e.g., add a comment) and confirm GitHub Actions deploys cleanly:

```bash
cd ~/Projects/vethaul-site/vethaul-claude-code-project-v2
git push origin main
```

Watch the Actions tab on GitHub. Expected: deploy job passes, post-deploy health check returns `"ok":true`.

- [ ] **Step 2: Confirm admin bookings still load**

Visit `https://vethauljunkremoval.com/admin/bookings` and verify existing bookings are present (confirms data migration was successful).

---

## Phase 3: site-template Repo

### Task 15: Create GitHub template repo

**Files:**
- Create: new repo `site-template` on GitHub

- [ ] **Step 1: Create GitHub repo as a template**

On GitHub, create a new public repo named `site-template`.  
Settings → check **"Template repository"**.

- [ ] **Step 2: Initialize locally from vethaul-site**

```bash
cp -r ~/Projects/vethaul-site/vethaul-claude-code-project-v2 ~/Projects/site-template
cd ~/Projects/site-template
rm -rf .git node_modules .next
git init
git remote add origin git@github.com:dnguyen303/site-template.git
```

- [ ] **Step 3: Update package.json**

In `package.json`, change `"name"` to `"site-template"`.

- [ ] **Step 4: Commit skeleton**

```bash
cd ~/Projects/site-template
git add .
git commit -m "chore: initialize site-template from vethaul-site"
git push -u origin main
```

---

### Task 16: Genericize layout and pages

**Files:**
- Modify: `site-template/app/layout.tsx`
- Modify: `site-template/app/page.tsx`
- Modify: `site-template/app/about/page.tsx`
- Modify: `site-template/app/services/page.tsx`
- Modify: `site-template/components/SiteHeader.tsx`
- Modify: `site-template/components/SiteFooter.tsx`

- [ ] **Step 1: Update app/layout.tsx**

Replace business-specific metadata with template placeholders. Replace the content of `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "Your Business Name",
  description: "Your business description.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Update components/SiteHeader.tsx**

Replace VetHaul-specific content with template placeholders:

```tsx
export default function SiteHeader() {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-xl font-bold text-gray-900">
          Your Business Name
        </a>
        <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="/services">Services</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a
            href="tel:+10000000000"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            <span className="hidden md:inline">(000) 000-0000</span>
            <span className="md:hidden">Call</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Update components/SiteFooter.tsx**

```tsx
export default function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 mt-16">
      <div className="max-w-6xl mx-auto px-6 text-sm text-center space-y-2">
        <p className="text-white font-semibold">Your Business Name</p>
        <p>(000) 000-0000 &middot; your@email.com</p>
        <p>&copy; {new Date().getFullYear()} Your Business Name. All rights reserved.</p>
        <p className="text-xs text-gray-500 max-w-xl mx-auto">
          All prices are estimates. Services subject to availability.
          By submitting a form you consent to being contacted regarding your inquiry.
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Update app/page.tsx**

Replace VetHaul homepage with a generic starter homepage:

```tsx
import ContactForm from "@/components/ContactForm";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Your Headline Here
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your subheadline. What you do, who you serve, why they should choose you.
          </p>
          <a
            href="/contact"
            className="inline-block bg-gray-900 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-700"
          >
            Get a Free Quote
          </a>
        </div>
      </section>

      {/* Services preview */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What We Do</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {["Service One", "Service Two", "Service Three"].map((s) => (
              <div key={s} className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{s}</h3>
                <p className="text-gray-600 text-sm">Short description of this service.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Get in Touch</h2>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 5: Stub out about and services pages**

Replace `app/about/page.tsx`:
```tsx
export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">About Us</h1>
      <p className="text-gray-600 text-lg">Tell your story here.</p>
    </div>
  );
}
```

Replace `app/services/page.tsx`:
```tsx
export default function Services() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Our Services</h1>
      <p className="text-gray-600 text-lg">List your services here.</p>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
cd ~/Projects/site-template
git add app/ components/
git commit -m "feat: genericize layout, pages, and components for template use"
```

---

### Task 17: Generic contact API route and DB migration

**Files:**
- Create: `site-template/app/contact/page.tsx`
- Modify: `site-template/app/api/contact/route.ts` (rename from quote/route.ts)
- Modify: `site-template/app/components/ContactForm.tsx`
- Modify: `site-template/db/migrations/001_initial.sql`

- [ ] **Step 1: Create app/contact/page.tsx**

```tsx
import ContactForm from "@/components/ContactForm";

export default function Contact() {
  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
      <p className="text-gray-600 mb-8">Fill out the form and we'll get back to you shortly.</p>
      <ContactForm />
    </div>
  );
}
```

- [ ] **Step 2: Create app/api/contact/route.ts**

Remove the old `app/api/quote/` directory and create `app/api/contact/route.ts`:

```bash
rm -rf ~/Projects/site-template/app/api/quote
mkdir -p ~/Projects/site-template/app/api/contact
```

Create `app/api/contact/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import sql from "@/lib/db";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { name, email, phone, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  await sql`
    INSERT INTO contacts (name, email, phone, message)
    VALUES (${name}, ${email}, ${phone ?? null}, ${message})
  `;

  await resend.emails.send({
    from: "inquiries@yourdomain.com",
    to: "owner@youremail.com",
    subject: `New inquiry from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone ?? "not provided"}\n\n${message}`,
  });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Create components/ContactForm.tsx**

Replace `components/ContactForm.tsx` (remove the multi-step QuoteForm):

```tsx
"use client";
import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setStatus(res.ok ? "done" : "error");
  }

  if (status === "done") {
    return (
      <div className="text-center py-8">
        <p className="text-2xl font-bold text-gray-900 mb-2">Message sent!</p>
        <p className="text-gray-600">We'll be in touch shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          name="name"
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input
          name="email"
          type="email"
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          name="phone"
          type="tel"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
        <textarea
          name="message"
          required
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>
      {status === "error" && (
        <p className="text-red-600 text-sm">Something went wrong. Please try again.</p>
      )}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50"
      >
        {status === "submitting" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Update db/migrations/001_initial.sql**

```sql
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

- [ ] **Step 5: Commit**

```bash
cd ~/Projects/site-template
git add app/contact/ app/api/contact/ components/ContactForm.tsx db/migrations/001_initial.sql
git rm -r app/api/quote/ 2>/dev/null || true
git commit -m "feat: add generic contact form, API route, and DB migration"
```

---

### Task 18: Docker, deploy scripts, and GitHub Actions

**Files:**
- Modify: `site-template/docker-compose.prod.yml`
- Modify: `site-template/scripts/update.sh`
- Modify: `site-template/scripts/migrate.sh`
- Modify: `site-template/.github/workflows/deploy.yml`
- Modify: `site-template/.env.example`

- [ ] **Step 1: Replace docker-compose.prod.yml**

```yaml
services:
  app:
    build: .
    container_name: SITE_CONTAINER_NAME   # replace with e.g. spa-app
    restart: unless-stopped
    mem_limit: 400m
    memswap_limit: 400m
    environment:
      DATABASE_URL: ${DATABASE_URL}
      NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL}
      RESEND_API_KEY: ${RESEND_API_KEY}
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - vethaul-net

networks:
  vethaul-net:
    external: true
    name: vethaul-net
```

- [ ] **Step 2: Replace scripts/update.sh**

```bash
#!/bin/bash
set -e

SITE_DIR=/opt/SITE_NAME   # replace with e.g. /opt/spa-site
COMPOSE="docker compose -f ${SITE_DIR}/docker-compose.prod.yml --env-file ${SITE_DIR}/.env.production"
APP_URL="https://SITE_DOMAIN/api/health"   # replace with real domain

log() { echo "[deploy] $1"; }

cd "$SITE_DIR"

log "Running DB migrations..."
bash "${SITE_DIR}/scripts/migrate.sh"

log "Saving current image ID for rollback..."
PREV_IMAGE=$(docker images "${SITE_DIR##*/}-app" --format "{{.ID}}" | head -1)

log "Building new image..."
$COMPOSE build app

log "Swapping containers..."
$COMPOSE up -d

log "Waiting for app to become healthy..."
for i in $(seq 1 24); do
  if curl -sf "$APP_URL" | grep -q '"ok":true'; then
    log "Health check passed. Deploy complete."
    exit 0
  fi
  log "Attempt $i/24 failed, retrying in 5s..."
  sleep 5
done

log "ERROR: Health check failed."
if [ -n "$PREV_IMAGE" ]; then
  log "Rolling back..."
  docker tag "$PREV_IMAGE" "${SITE_DIR##*/}-app:latest"
  $COMPOSE up -d app
fi
exit 1
```

- [ ] **Step 3: Replace scripts/migrate.sh**

```bash
#!/bin/bash
set -e

SITE_DIR=/opt/SITE_NAME   # replace with e.g. /opt/spa-site
ENV_FILE="${SITE_DIR}/.env.production"
DB_URL=$(grep '^DATABASE_URL=' "$ENV_FILE" | cut -d= -f2-)

log() { echo "[migrate] $1"; }

run_psql() {
    docker exec infra-postgres psql "$DB_URL" "$@"
}

run_psql -c "
  CREATE TABLE IF NOT EXISTS schema_migrations (
    filename TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
" > /dev/null

for filepath in "${SITE_DIR}/db/migrations/"*.sql; do
  filename=$(basename "$filepath")
  already_applied=$(run_psql -tAc "SELECT COUNT(*) FROM schema_migrations WHERE filename='$filename';")
  if [ "$already_applied" = "0" ]; then
    log "Applying $filename..."
    run_psql -f /dev/stdin < "$filepath"
    run_psql -c "INSERT INTO schema_migrations (filename) VALUES ('$filename');" > /dev/null
    log "$filename applied."
  else
    log "$filename already applied, skipping."
  fi
done

log "Done."
```

- [ ] **Step 4: Replace .github/workflows/deploy.yml**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    name: Deploy to VPS
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: root
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/SITE_NAME
            git pull origin main
            bash /opt/SITE_NAME/scripts/update.sh

      - name: Post-deploy health check
        run: |
          sleep 5
          curl --fail --silent https://SITE_DOMAIN/api/health | grep '"ok":true'
```

- [ ] **Step 5: Replace .env.example**

```bash
DATABASE_URL=postgresql://SITE_DB_USER:SITE_DB_PASSWORD@infra-postgres:5432/SITE_DB_NAME
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
RESEND_API_KEY=re_xxxxxxxxxxxx
```

- [ ] **Step 6: Commit**

```bash
cd ~/Projects/site-template
git add docker-compose.prod.yml scripts/ .github/ .env.example
git commit -m "feat: add deploy scripts and GitHub Actions wired for shared infra"
```

---

### Task 19: SETUP.md — 10-step clone-to-live checklist

**Files:**
- Create: `site-template/SETUP.md`

- [ ] **Step 1: Create SETUP.md**

Create `~/Projects/site-template/SETUP.md`:

```markdown
# New Site Setup Checklist

Follow these 10 steps to go from clone to live.

## Prerequisites
- vethaul-infra is running on the VPS (Caddy + Postgres up, vethaul-net exists)
- You have SSH access to the VPS at 64.227.56.20
- Domain DNS is pointed to 64.227.56.20 (A record for @ and www)

---

## Steps

### 1. Clone this template

On GitHub: Use this repo as a template → create new repo (e.g. `spa-site`).

Then locally:
```bash
git clone git@github.com:dnguyen303/<your-repo>.git ~/Projects/<your-repo>
cd ~/Projects/<your-repo>
npm install
```

### 2. Set your site name in package.json

Edit `package.json`, change `"name"` to your site name (e.g. `"spa-site"`).

### 3. Set your container name in docker-compose.prod.yml

Replace `SITE_CONTAINER_NAME` with a unique container name (e.g. `spa-app`).
This MUST be unique across all sites — it's how Caddy routes to you.

### 4. Update scripts with your site name and domain

In `scripts/update.sh` and `scripts/migrate.sh`:
- Replace `SITE_NAME` with your VPS directory name (e.g. `spa-site`)

In `scripts/update.sh` and `.github/workflows/deploy.yml`:
- Replace `SITE_DOMAIN` with your domain (e.g. `myspabusiness.com`)

### 5. Provision DB and Caddy entry on VPS

SSH into the VPS:
```bash
ssh root@64.227.56.20
cd /opt/vethaul-infra
bash scripts/add-site.sh <container-name> <db-name> <db-user> <db-password> <domain>
# Example:
bash scripts/add-site.sh spa-app spa_db spa_user s3cr3tp4ss myspabusiness.com
```

### 6. Deploy the repo to the VPS

```bash
git clone git@github.com:dnguyen303/<your-repo>.git /opt/<site-name>
chmod +x /opt/<site-name>/scripts/*.sh
```

### 7. Create .env.production on VPS

```bash
nano /opt/<site-name>/.env.production
```

Fill in:
```
DATABASE_URL=postgresql://<db-user>:<db-password>@infra-postgres:5432/<db-name>
NEXT_PUBLIC_SITE_URL=https://<your-domain>
RESEND_API_KEY=re_xxxxxxxxxxxx
```

### 8. Add GitHub Secrets

In your repo → Settings → Secrets and variables → Actions, add:
- `VPS_HOST`: `64.227.56.20`
- `VPS_SSH_KEY`: your private SSH key (the one that accesses the VPS)

### 9. Add domain to infra update.sh monitoring

On your local machine, in `vethaul-infra/scripts/update.sh`, add your domain to the `DOMAINS` array, then commit and push.

### 10. Set up UptimeRobot

1. Go to uptimerobot.com → Add New Monitor
2. Monitor Type: HTTPS
3. URL: `https://<your-domain>/api/health`
4. Interval: 5 minutes
5. Alert contact: your email

---

## First deploy

Push any commit to `main`:
```bash
git add -A && git commit -m "feat: initial site setup" && git push origin main
```

GitHub Actions will SSH into the VPS, build, deploy, and run a health check.
```

- [ ] **Step 2: Push site-template to GitHub**

```bash
cd ~/Projects/site-template
git add SETUP.md
git commit -m "docs: add SETUP.md — 10-step clone-to-live checklist"
git push origin main
```

- [ ] **Step 3: Verify template flag on GitHub**

On GitHub → `site-template` repo → Settings → confirm "Template repository" is checked.

---

## Self-Review Checklist

- [x] **Spec coverage:** All sections covered — infra repo, networking, Postgres isolation, Caddy routing, resource limits, infra rollback (update.sh), uptime monitoring (SETUP.md step 10), backup, data privacy (per-user DB, separate backup files), VetHaul migration, site template
- [x] **Placeholder scan:** `SITE_NAME`, `SITE_DOMAIN`, `SITE_CONTAINER_NAME` are intentional template markers documented in SETUP.md
- [x] **Type consistency:** `sql` imported from `@/lib/db` matches existing lib/db.ts pattern from vethaul-site; `ContactForm` used in both page.tsx and page.tsx matches the component filename
- [x] **Migration dependency:** Task 10 (VPS bootstrap) must complete before Task 13 (data cutover). Task 11-12 (code changes) can be done in parallel with Task 10.
