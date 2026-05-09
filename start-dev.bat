@echo off
title Cursor Clone Development Servers
color 0A

echo.
echo ========================================
echo   Cursor Clone Development Servers
echo ========================================
echo.

REM Check if backend node_modules exists
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    npm install
    cd ..
)

REM Check if frontend node_modules exists
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
)

echo.
echo Starting development servers...
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:5173
echo.
echo Press Ctrl+C to stop all servers
echo.

REM Start both servers concurrently
start "Backend Server" cmd /k "cd backend && npm run dev"
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Servers started in separate windows.
echo Close this window or press any key to exit...
pause > nul
