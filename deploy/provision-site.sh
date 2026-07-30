#!/usr/bin/env bash
set -e
#
# One-shot VPS provisioning for a site, run once from the cloned repo dir:
#     cd /opt/<site> && bash deploy/provision-site.sh
#
# Captures the manual steps we used to do by hand:
#   - stop git from tracking file-mode (so chmod +x never blocks git pull)
#   - provision DB + Caddy route via the (idempotent) infra add-site.sh
#   - write .env.production with the real DATABASE_URL and site URL
# Idempotent: safe to re-run.

HERE=$(cd "$(dirname "$0")" && pwd)
source "$HERE/site.env"

REPO_DIR=$(cd "$HERE/.." && pwd)
cd "$REPO_DIR"

log() { echo "[provision] $1"; }

log "Disabling git file-mode tracking (prevents chmod from blocking git pull)..."
git config core.fileMode false

read -rsp "DB password for ${DB_USER} (letters and numbers only): " DBPW; echo
if [ -z "$DBPW" ]; then echo "No password entered, aborting."; exit 1; fi

log "Provisioning DB + Caddy via ${INFRA_DIR}/scripts/add-site.sh..."
bash "${INFRA_DIR}/scripts/add-site.sh" "$CONTAINER_NAME" "$DB_NAME" "$DB_USER" "$DBPW" "$SITE_DOMAIN"

log "Writing .env.production..."
# Seed from the example (keeps app-specific keys like RESEND/AIRTABLE), then
# set the two values we know for certain.
if [ ! -f .env.production ]; then
  cp .env.production.example .env.production 2>/dev/null \
    || cp config/.env.example .env.production 2>/dev/null \
    || : > .env.production
fi
grep -vE '^(DATABASE_URL|NEXT_PUBLIC_SITE_URL)=' .env.production > .env.production.tmp || true
{
  echo "DATABASE_URL=postgresql://${DB_USER}:${DBPW}@${PG_CONTAINER}:5432/${DB_NAME}"
  echo "NEXT_PUBLIC_SITE_URL=https://${SITE_DOMAIN}"
  cat .env.production.tmp
} > .env.production
rm -f .env.production.tmp

log "Done."
echo
echo "Remaining app secrets to fill in ${REPO_DIR}/.env.production (any blank/xxxx values):"
grep -nE '=(|re_xxxxxxxxxxxx|CHANGE_ME|xxx.*)$' .env.production || echo "  (none detected)"
echo
echo "Next: set GitHub repo variables SITE_NAME + SITE_DOMAIN and secrets VPS_HOST + VPS_SSH_KEY,"
echo "point DNS at this VPS, then merge to main to deploy."
