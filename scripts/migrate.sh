#!/bin/bash
set -e

ENV_FILE=/opt/vethaul/.env.production
DB_URL=$(grep '^DATABASE_URL=' "$ENV_FILE" | cut -d= -f2-)

log() { echo "[migrate] $1"; }

# Run psql against the shared Postgres container using the site's own credentials
run_psql() {
    docker exec infra-postgres psql "$DB_URL" "$@"
}

# Create migration tracking table if it doesn't exist
run_psql -c "
  CREATE TABLE IF NOT EXISTS schema_migrations (
    filename TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
" > /dev/null

for filepath in /opt/vethaul/db/migrations/*.sql; do
  filename=$(basename "$filepath")
  already_applied=$(run_psql -tAc "SELECT COUNT(*) FROM schema_migrations WHERE filename='$filename';")

  if [ "$already_applied" = "0" ]; then
    log "Applying $filename..."
    run_psql -f /dev/stdin < "$filepath"
    run_psql -c "INSERT INTO schema_migrations (filename) VALUES ('$filename');" > /dev/null
    log "$filename applied."
  else
    log "$filename already applied, skipping."
  fi
done

log "Done."
