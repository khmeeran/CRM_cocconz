@echo off
title Cocoonz CRM - Service Orchestrator
echo ==========================================
echo    COCOONZ SCHOOL CRM - BETA LAUNCH
echo ==========================================
echo.

:: 1. Start Cloudflare Tunnel (Zero-Cost Quick Tunnel)
echo [1/3] Launching Cloudflare Quick Tunnel...
echo.
echo NOTE: Copy the "trycloudflare.com" URL from the window below 
echo and paste it into Vercel's NEXT_PUBLIC_API_URL.
echo.
start "Cloudflare Tunnel" /D "E:\CRM_Cocoonz" cloudflared tunnel --url http://localhost:8000

:: 2. Start FastAPI Backend
echo [2/3] Launching FastAPI Backend (Port 8000)...
cd backend
start "FastAPI Backend" /D "E:\CRM_Cocoonz\backend" uvicorn main:app --host 0.0.0.0 --port 8000 --log-level info

:: 3. Start Celery Worker
echo [3/3] Launching Celery Worker...
start "Celery Worker" /D "E:\CRM_Cocoonz\backend" celery -A celery_app worker --loglevel=info

echo.
echo ==========================================
echo    SYSTEMS DEPLOYED SUCCESSFULLY
echo ==========================================
echo.
echo Backend:   http://localhost:8000
echo Tunnel:    See the separate Cloudflare window for URL
echo Frontend:  Check your Vercel deployment URL
echo.
echo Keep this window open to monitor status.
pause
