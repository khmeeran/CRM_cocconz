@echo off
title CRM Cocoonz Launcher

echo Starting CRM Cocoonz Backend...
cd /d "%~dp0backend"

:: Check if .env exists, if not warn the user
if not exist .env (
    echo WARNING: .env file not found in backend directory.
    echo Using default development settings.
)

:: Start the backend in a new window
start "CRM Cocoonz Backend" cmd /k "python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo Waiting for backend to initialize...
timeout /t 3 /nobreak > nul

echo.
echo Opening CRM Cocoonz Frontend...
:: Open the login page in the default browser
start http://127.0.0.1:8000/

echo.
echo Launch Complete! 
echo Keep the backend window open to use the application.
pause
