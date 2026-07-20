#!/bin/bash
set -e
echo "Deploying Cocoonz CRM..."

if [ ! -f .env ]; then
    echo "ERROR: .env file is missing! Please copy .env.production to .env and fill in the values."
    exit 1
fi

echo "Pulling latest code and building containers..."
docker compose pull
docker compose up -d --build

echo "Deployment finished. Checking health..."
./deploy_scripts/health_check.sh
