#!/bin/bash
echo "Running Health Checks..."
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}
" http://localhost:8000/api/health/liveness)
if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "Backend is HEALTHY."
else
    echo "Backend is UNHEALTHY (Status: $HTTP_STATUS)."
    exit 1
fi
