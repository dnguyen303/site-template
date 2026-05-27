# New Site Setup Checklist

Follow these 10 steps to go from clone to live.

## Prerequisites
- vethaul-infra is running on the VPS (Caddy + Postgres up, vethaul-net exists)
- You have SSH access to the VPS at 64.227.56.20
- Domain DNS is pointed to 64.227.56.20 (A record for @ and www)

---

## Steps

### 1. Clone this template

On GitHub: Use this repo as a template to create a new repo (e.g. `spa-site`).

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
This MUST be unique across all sites — it is how Caddy routes traffic to you.

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
git clone https://github.com/dnguyen303/<your-repo>.git /opt/<site-name>
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

In your repo: Settings > Secrets and variables > Actions, add:
- `VPS_HOST`: `64.227.56.20`
- `VPS_SSH_KEY`: your private SSH key (the one that accesses the VPS)

### 9. Add domain to infra monitoring

On your local machine, in `vethaul-infra/scripts/update.sh`, add your domain to the `DOMAINS` array, then commit and push.

### 10. Set up UptimeRobot

1. Go to uptimerobot.com and add a new monitor
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
