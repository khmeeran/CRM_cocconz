#!/bin/bash
set -e
if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <path_to_sql_file>"
    exit 1
fi
echo "Restoring database from $1..."
cat $1 | docker exec -i crm_cocoonz-db-1 psql -U school_user
echo "Restore complete."
