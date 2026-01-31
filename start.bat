@echo off
REM Quick Start Script for CyberSec Arena with AI Backend

echo.
echo ============================================
echo CyberSec Arena - AI Backend Setup
echo ============================================
echo.
echo This will open 3 terminals for you:
echo 1. Ollama (AI Model)
echo 2. Backend Server
echo 3. Frontend Dev Server
echo.
pause

echo.
echo [1/3] Starting Ollama...
start cmd /k "ollama serve"
echo ✓ Ollama started in new terminal

timeout /t 3 /nobreak
echo.
echo [2/3] Starting Backend Server...
start cmd /k "cd server && npm start"
echo ✓ Backend server started in new terminal

timeout /t 3 /nobreak
echo.
echo [3/3] Starting Frontend...
npm run dev

echo.
echo ============================================
echo Setup complete!
echo ============================================
