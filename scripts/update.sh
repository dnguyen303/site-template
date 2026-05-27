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
