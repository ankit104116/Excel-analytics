@echo off
echo 🚀 Starting Unified Excel Analytics Platform...

REM Kill any process using port 5001
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5001" ^| find "LISTENING"') do taskkill /F /PID %%a

REM Start backend server
echo 📊 Starting backend server...
set PORT=5001
start "Backend Server" cmd /k "set PORT=5001 && node unified-server.js"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend
echo 🎨 Starting frontend...
cd "files\\client"
start "Frontend Server" cmd /k "npm start"

echo Both servers started!
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul
