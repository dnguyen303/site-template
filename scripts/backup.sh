#!/bin/bash
set -e

# Dumps this site's DB from the shared Postgres container using DATABASE_URL.
HERE=$(cd "$(dirname "$0")" && pwd)
source "$HERE/../deploy/site.env"

SITE_DIR="/opt/${SITE_NAME}"
ENV_FILE="${SITE_DIR}/.env.production"
DB_URL=$(grep '^DATABASE_URL=' "$ENV_FILE" | cut -d= -f2-)
BACKUP_DIR="${SITE_DIR}/backups"
REMOTE="gdrive:${SITE_NAME}-backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
FILENAME="${SITE_NAME}-$TIMESTAMP.sql.gz"
RETAIN_DAYS=30

log() { echo "[backup] $1"; }

mkdir -p "$BACKUP_DIR"

log "Dumping database..."
docker exec "$PG_CONTAINER" pg_dump "$DB_URL" | gzip > "$BACKUP_DIR/$FILENAME"

log "Uploading $FILENAME to Google Drive..."
rclone copy "$BACKUP_DIR/$FILENAME" "$REMOTE"

log "Pruning local backup files older than $RETAIN_DAYS days..."
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETAIN_DAYS -delete

log "Pruning remote backup files older than $RETAIN_DAYS days..."
rclone delete "$REMOTE" --min-age "${RETAIN_DAYS}d"

log "Backup complete: $FILENAME"
