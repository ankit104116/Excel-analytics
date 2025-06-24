#!/bin/bash
echo "🚀 Starting Unified Excel Analytics Platform..."

# Start backend server
echo "📊 Starting backend server..."
cd "$(dirname "$0")"
node unified-server.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
cd "Authentication User Admin/client"
npm start &
FRONTEND_PID=$!

echo "✅ Both servers started!"
echo "📊 Backend: http://localhost:5000"
echo "🎨 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for interrupt
trap "echo '\n🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
