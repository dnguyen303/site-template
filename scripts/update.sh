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
