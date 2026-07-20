#!/bin/bash
set -e
BACKUP_DIR="/opt/cocoonz_backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p $BACKUP_DIR

echo "Dumping database..."
docker exec -t crm_cocoonz-db-1 pg_dumpall -c -U school_user > $BACKUP_DIR/db_dump_$TIMESTAMP.sql
echo "Backup saved to $BACKUP_DIR/db_dump_$TIMESTAMP.sql"
