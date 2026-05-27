#!/bin/bash
set -e

COMPOSE="docker compose -f /opt/vethaul/docker-compose.prod.yml --env-file /opt/vethaul/.env.production"
ENV_FILE=/opt/vethaul/.env.production
DB_USER=$(grep '^POSTGRES_USER=' "$ENV_FILE" | cut -d= -f2)
BACKUP_DIR=/opt/vethaul/backups
REMOTE="gdrive:vethaul-backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
FILENAME="vethaul-$TIMESTAMP.sql.gz"
RETAIN_DAYS=30

log() { echo "[backup] $1"; }

mkdir -p "$BACKUP_DIR"

log "Dumping database..."
$COMPOSE exec -T db pg_dump -U "$DB_USER" vethaul | gzip > "$BACKUP_DIR/$FILENAME"

log "Uploading $FILENAME to Google Drive..."
rclone copy "$BACKUP_DIR/$FILENAME" "$REMOTE"

log "Pruning local backup files older than $RETAIN_DAYS days..."
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETAIN_DAYS -delete

log "Pruning remote backup files older than $RETAIN_DAYS days..."
rclone delete "$REMOTE" --min-age "${RETAIN_DAYS}d"

log "Backup complete: $FILENAME"
