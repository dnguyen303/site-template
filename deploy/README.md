# Deploying a site from this template

Every site built from this template deploys the same way: a shared VPS runs
[`vethaul-infra`](https://github.com/dnguyen303/vethaul-infra) (Caddy + Postgres
on a docker network), and each site is a container that joins it. All
environment-specific values live in `deploy/site.env`, so the scripts have no
placeholders to edit.

**Images are built in CI, not on the VPS.** The deploy workflow builds the Docker
image on GitHub's runners, pushes it to GHCR (`ghcr.io/<owner>/<repo>`), and the
VPS only pulls and runs it. This keeps build CPU/RAM off the shared box, which is
essential when several sites share a small (2 GB) VPS. It also gives atomic
deploys and easy rollback (each image is tagged with the commit SHA).

## One-time setup for a new site

1. **Create the repo** from this template and clone it locally.
2. **Fill in `deploy/site.env`** (copy from `deploy/site.env.example`). Set the
   container name to match `container_name` in `docker-compose.prod.yml`.
3. **Set GitHub repo variables + secrets** (Settings > Secrets and variables > Actions):
   - Variables: `SITE_NAME`, `SITE_DOMAIN`
   - Secrets: `VPS_HOST`, `VPS_SSH_KEY` (a passphrase-less key with root on the VPS)
4. **Add a deploy key so the VPS can clone the private repo.** On the VPS:
   ```
   ssh-keygen -t ed25519 -f ~/.ssh/<site>_deploy -N "" -C "<site>-deploy"
   printf '\nHost github-<site>\n  HostName github.com\n  User git\n  IdentityFile ~/.ssh/<site>_deploy\n  IdentitiesOnly yes\n' >> ~/.ssh/config
   chmod 600 ~/.ssh/config
   cat ~/.ssh/<site>_deploy.pub
   ```
   Register that public key: `gh repo deploy-key add <pubkey-file> --repo <owner>/<site>` (read-only is enough).
5. **Clone + provision on the VPS:**
   ```
   git clone git@github-<site>:<owner>/<site>.git /opt/<site>
   cd /opt/<site> && bash deploy/provision-site.sh
   ```
   `provision-site.sh` disables git file-mode tracking, provisions the DB + Caddy
   route (idempotent), and writes `.env.production` with the real `DATABASE_URL`.
   Fill in any remaining app secrets it lists (Resend, Airtable, etc.).
6. **Point DNS** at the VPS: `A @` and `A www` -> VPS IP, DNS-only.
7. **Merge to `main`.** The workflow builds + pushes the image, then the VPS
   pulls, migrates, and health-checks. (The VPS logs in to GHCR with a token
   passed by the Action, so no manual `docker login` is needed.)

## Running several sites on a small (2 GB) VPS

This stack is tuned to fit multiple Next.js sites plus Postgres and Caddy in ~2 GB:

- **Builds run in CI, not on the box** (see above). On-VPS builds are the main
  cause of OOM on a small box; moving them off is the biggest win.
- **Add swap** (one-time, per VPS). A 2 GB swap file is cheap insurance against
  OOM spikes:
  ```
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile && echo '/swapfile none swap sw 0 0' >> /etc/fstab
  sysctl -w vm.swappiness=10 && echo 'vm.swappiness=10' >> /etc/sysctl.conf
  ```
- **Bounded Node heap.** `NODE_OPTIONS=--max-old-space-size=256` in
  `docker-compose.prod.yml` stops Node from sizing its heap to host RAM.
- **Container memory + log limits.** `mem_limit: 400m` per app and rotated
  json-file logs (10m x 3) are set in the compose file.
- **Small DB pool.** `lib/db.ts` uses `max: 3` connections with a 20s idle
  timeout, so N sites don't exhaust the shared Postgres.
- **Deploys are serialized** (`concurrency` in the workflow) and recreate the
  container in place (no memory-doubling blue/green).
- **Reclaim disk periodically:** `docker image prune -f` on a weekly cron.
- Tune the shared Postgres for a small box in `vethaul-infra` (modest
  `shared_buffers` and `max_connections`).

## Deploying on a DIFFERENT VPS

The scripts reference the shared infra only through `deploy/site.env`
(`INFRA_DIR`, `PG_CONTAINER`, `CADDY_CONTAINER`, `DOCKER_NETWORK`). To run a site
on another box:

1. Stand up `vethaul-infra` on the new VPS (Caddy + Postgres + the docker network).
2. In `deploy/site.env`, set those infra values to match that box (usually the
   defaults are fine if you keep the same names).
3. Point `VPS_HOST` (and the deploy/SSH keys) at the new VPS.

Nothing else is VPS-specific, so the same template + scripts work on any host
running the infra.

## Files

- `deploy/site.env` — per-site + infra config (committed, non-secret)
- `deploy/provision-site.sh` — one-shot VPS provisioning (run once after clone)
- `scripts/update.sh` — pull image + migrate + swap + health-check + rollback (run by the Action)
- `scripts/migrate.sh` — idempotent SQL migrations
- `scripts/backup.sh` — DB dump to Google Drive via rclone
