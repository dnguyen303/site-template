# Implementation Plan

## Day 1
- settle UI direction
- settle image system
- decide brand style

## Day 2
- setup foundation
- create repo structure
- Next.js app shell
- shared layout
- navigation
- basic styles
- runnable app shell

## Day 3
- create core pages
- services
- pricing
- about
- service area
- basic routing

## Day 4
- add trust/review polish
- refine typography and spacing
- stabilize image placement

## Day 5
- build interactive booking card
- client-side form state
- validation basics

## Day 6
- create API route for quote / booking request
- define payload shape
- add success / error states

## Day 7
- add Postgres locally
- apply schema
- persist booking requests

## Day 8
- build simple internal booking list page
- show latest requests
- show basic statuses

## Day 9
- add confirmation email
- wire environment variables
- test end-to-end locally

## Day 10
- production deploy prep
- Docker / Caddy / env cleanup
- deploy to VPS

---

## Deployment: Local → Production (vethauljunkremoval.com)

**Stack:** Next.js + Postgres + Caddy, all on one DigitalOcean VPS via Docker Compose.

### Prerequisites
- Domain: vethauljunkremoval.com (DNS managed at registrar or DigitalOcean)
- VPS: DigitalOcean droplet, Ubuntu 22.04, 2GB RAM minimum
- SSH access already configured

---

### Step 1 — Point DNS to VPS

At your domain registrar or DigitalOcean DNS, add two A records:

| Type | Name | Value       |
|------|------|-------------|
| A    | @    | YOUR_VPS_IP |
| A    | www  | YOUR_VPS_IP |

Check propagation: `dig vethauljunkremoval.com`

---

### Step 2 — Install Docker on the VPS

SSH into the VPS, then:

```bash
sudo apt update && sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
newgrp docker
```

---

### Step 3 — Copy project files to VPS

Run from your local machine (not the VPS):

```bash
rsync -av --exclude='node_modules' --exclude='.next' --exclude='.env*' \
  /Users/duynguyen/Projects/vethaul-site/vethaul-claude-code-project-v2/ \
  root@YOUR_VPS_IP:/opt/vethaul/
```

---

### Step 4 — Create `.env.production` on the VPS

SSH in and create the file:

```bash
nano /opt/vethaul/.env.production
```

Paste and fill in a strong password (generate one with `openssl rand -base64 24`).
Both `POSTGRES_PASSWORD` and the password in `DATABASE_URL` must match:

```
DATABASE_URL=postgres://vethaul:CHANGE_ME@db:5432/vethaul
NEXT_PUBLIC_SITE_URL=https://vethauljunkremoval.com
POSTGRES_USER=vethaul
POSTGRES_PASSWORD=CHANGE_ME
```

---

### Step 5 — Start the containers

```bash
cd /opt/vethaul
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

First run takes 3–5 minutes to build the Next.js image. Check status:

```bash
docker-compose -f docker-compose.prod.yml ps
```

All three services (app, db, caddy) should show as `Up`.

---

### Step 6 — Run the database schema

```bash
docker-compose -f docker-compose.prod.yml exec db \
  psql -U vethaul -d vethaul -f /dev/stdin < db/schema.sql
```

---

### Step 7 — Verify

1. Visit `https://vethauljunkremoval.com` — green padlock, site loads
2. Submit a test quote through the form
3. Confirm it saved to the database:

```bash
docker-compose -f docker-compose.prod.yml exec db \
  psql -U vethaul -d vethaul -c "SELECT * FROM bookings;"
```

4. Visit `https://vethauljunkremoval.com/admin/bookings` to confirm booking appears in admin view

---

### Ongoing: restart / redeploy after code changes

```bash
# From local machine — sync new files
rsync -av --exclude='node_modules' --exclude='.next' --exclude='.env*' \
  /Users/duynguyen/Projects/vethaul-site/vethaul-claude-code-project-v2/ \
  root@YOUR_VPS_IP:/opt/vethaul/

# On the VPS — rebuild and restart
cd /opt/vethaul
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

### Ongoing: view logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# App only
docker-compose -f docker-compose.prod.yml logs -f app
```

## After launch
- add SMS alerts
- add photo upload
- add review automation
- add abandoned quote follow-up
