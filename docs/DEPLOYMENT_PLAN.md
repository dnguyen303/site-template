# VetHaul Deployment Plan (Local → Production)

Status: local app + Postgres working  
Goal: deploy a stable, low-cost production site on a single VPS

---

## Architecture (Production v1)

- Next.js (Node server)
- Postgres (same host, separate container)
- Caddy (HTTPS + reverse proxy)
- Docker Compose (orchestrates services)

All run on one VPS.

---

## Phase 1 — Prepare for Production

### 1. Environment variables
Create `.env.production` (do not commit secrets)

Required:
- DATABASE_URL=postgres://user:pass@db:5432/vethaul
- NEXT_PUBLIC_BASE_URL=https://yourdomain.com
- EMAIL_API_KEY=...
- TWILIO_ACCOUNT_SID=... (optional)
- TWILIO_AUTH_TOKEN=... (optional)

---

### 2. Build app for production

Ensure Next.js runs in production mode:
- `next build`
- `next start`

---

### 3. Database readiness

- Run schema.sql on production DB
- Enable backups (daily dump)
- Use strong password

---

## Phase 2 — VPS Setup

### 1. Provision VPS
Recommended:
- 2 GB RAM
- Ubuntu 22.04

---

### 2. Install dependencies

```bash
sudo apt update
sudo apt install docker.io docker-compose -y