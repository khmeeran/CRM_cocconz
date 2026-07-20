@echo off
setlocal enabledelayedexpansion
title Cocoonz CRM - Local Environment Launcher

echo ==========================================
echo    COCOONZ SCHOOL CRM - LOCAL LAUNCHER
echo ==========================================
echo.

:: 1. Verify Prerequisites
echo [1/4] Verifying Prerequisites...

:: Check Docker
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Docker Desktop is not running. Please start Docker and try again.
    pause
    exit /b 1
)
echo - Docker is running.

:: Check Node.js
node -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    pause
    exit /b 1
)
echo - Node.js is installed.

:: 2. Start Backend (Docker Compose)
echo.
echo [2/4] Starting Backend Services (PostgreSQL, Redis, Celery, FastAPI)...
docker-compose up -d --build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to start Docker containers. Check docker-compose.yml and ports.
    pause
    exit /b 1
)

:: Wait for API health
echo - Waiting for API to become healthy (http://localhost:8000/api/health/liveness)...
:healthcheck
curl -s http://localhost:8000/api/health/liveness >nul 2>&1
if %ERRORLEVEL% neq 0 (
    timeout /t 2 >nul
    goto healthcheck
)
echo - Backend API is healthy!

:: Apply Alembic Migrations automatically (if pending)
echo - Checking/Applying database migrations...
docker exec crm_cocoonz-backend-1 alembic upgrade head
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to apply database migrations. Please check database logs.
    pause
    exit /b 1
)
echo - Database migrations are up to date.

:: 3. Start Frontend
echo.
echo [3/4] Starting Next.js Frontend...
cd frontend

:: Install dependencies if node_modules is missing
if not exist "node_modules" (
    echo - node_modules not found. Installing dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo ERROR: npm install failed.
        cd ..
        pause
        exit /b 1
    )
)

start "Next.js Frontend" cmd /c "npm run dev"
cd ..

:: Wait for frontend to become healthy
echo - Waiting for frontend to become healthy (http://localhost:3000)...
:frontendcheck
curl -s http://localhost:3000 >nul 2>&1
if %ERRORLEVEL% neq 0 (
    timeout /t 2 >nul
    goto frontendcheck
)
echo - Frontend is healthy!

:: 4. Helpful Output & Done
echo.
echo ==========================================
echo    SYSTEMS DEPLOYED SUCCESSFULLY
echo ==========================================
echo.
echo Backend API:  http://localhost:8000
echo Frontend UI:  http://localhost:3000
echo.
echo Admin Login: Use seeded admin credentials
echo.
echo Local Setup Ready.
echo Opening browser...
start http://localhost:3000

echo.
echo Press any key to stop all services...
pause >nul

echo Stopping Docker services...
docker-compose down
echo Done.
