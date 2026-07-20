#!/bin/bash
set -e
echo "Updating Cocoonz CRM..."
git pull origin main
docker compose up -d --build
echo "Update complete."
