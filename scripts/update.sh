#!/bin/bash
set -e

# All site/infra values come from deploy/site.env, no placeholders to edit.
# The image is built and pushed to GHCR by the deploy workflow; this script
# just pulls and runs it (no build load on the VPS).
HERE=$(cd "$(dirname "$0")" && pwd)
source "$HERE/../deploy/site.env"

SITE_DIR="/opt/${SITE_NAME}"
export IMAGE="ghcr.io/${REPO,,}:latest"   # GHCR requires a lowercase path
export CONTAINER_NAME DOCKER_NETWORK
COMPOSE="docker compose -f ${SITE_DIR}/docker-compose.prod.yml --env-file ${SITE_DIR}/.env.production"
APP_URL="https://${SITE_DOMAIN}/api/health"

log() { echo "[deploy] $1"; }

cd "$SITE_DIR"

log "Running DB migrations..."
bash "${SITE_DIR}/scripts/migrate.sh"

log "Saving current image for rollback..."
PREV_IMAGE=$(docker images "$IMAGE" --format "{{.ID}}" | head -1)

log "Pulling new image (${IMAGE})..."
$COMPOSE pull app

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
  log "Rolling back to previous image..."
  docker tag "$PREV_IMAGE" "$IMAGE"
  $COMPOSE up -d app
fi
exit 1
