#!/bin/bash

echo "╔═══════════════════════════════════════════════╗"
echo "║  🚀 Starting Kiosk System                    ║"
echo "╚═══════════════════════════════════════════════╝"

# Kill existing processes
echo ""
echo "🧹 Cleaning up old processes..."
pkill -9 -f "app_imx500.py" 2>/dev/null
pkill -9 -f "vite" 2>/dev/null
sleep 2

# Start Pi5 Server
echo ""
echo "📷 Starting Pi5 Camera Server..."
cd "/home/admin/Desktop/kiosk promax/kiosk/pi5_server"
python3 app_imx500.py > /tmp/pi5_server.log 2>&1 &
PI5_PID=$!
echo "   ✅ Pi5 Server started (PID: $PI5_PID)"
echo "   📝 Log: /tmp/pi5_server.log"

# Wait for Pi5 server to start
sleep 3

# Check if Pi5 server is running
if curl -s http://localhost:5000/api/status > /dev/null 2>&1; then
    echo "   ✅ Pi5 Server is responding"
else
    echo "   ⚠️  Warning: Pi5 Server may not be ready yet"
fi

# Start Vite Dev Server
echo ""
echo "🌐 Starting Web Server..."
cd "/home/admin/Desktop/kiosk promax/kiosk"
npm run dev > /tmp/vite_server.log 2>&1 &
VITE_PID=$!
echo "   ✅ Vite Server started (PID: $VITE_PID)"
echo "   📝 Log: /tmp/vite_server.log"

# Wait for Vite to start
sleep 5

echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║  ✅ System Ready!                            ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""
echo "📡 Services:"
echo "   • Pi5 Camera API:  http://localhost:5000"
echo "   • Web Application: http://localhost:3000"
echo "   • Network Access:  http://172.20.10.2:3000"
echo ""
echo "📋 Process IDs:"
echo "   • Pi5 Server: $PI5_PID"
echo "   • Vite Server: $VITE_PID"
echo ""
echo "📝 Logs:"
echo "   • tail -f /tmp/pi5_server.log"
echo "   • tail -f /tmp/vite_server.log"
echo ""
echo "🛑 To stop all services:"
echo "   • pkill -f app_imx500.py"
echo "   • pkill -f vite"
echo ""
