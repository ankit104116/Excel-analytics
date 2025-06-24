@echo off
echo 🚀 Starting Unified Excel Analytics Platform...

REM Start backend server
echo 📊 Starting backend server...
start "Backend Server" cmd /k "node unified-server.js"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend
echo 🎨 Starting frontend...
cd "Authentication User Admin\client"
start "Frontend Server" cmd /k "npm start"

echo ✅ Both servers started!
echo 📊 Backend: http://localhost:5000
echo 🎨 Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul
