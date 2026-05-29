#!/bin/bash
# Backup Strategy script
set -e

BACKUP_DIR="/var/backups/cocoonz_os"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_CONTAINER="crm_cocoonz-db-1"
DB_USER="user"
DB_NAME="school_db"

mkdir -p "$BACKUP_DIR"

echo "Starting database backup at $TIMESTAMP..."
docker exec -t $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME | gzip > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"

echo "Starting uploads/exports backup..."
tar -czf "$BACKUP_DIR/files_backup_$TIMESTAMP.tar.gz" -C ./backend uploads exports

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -name "*.gz" -mtime +7 -delete

echo "Backup completed successfully."
