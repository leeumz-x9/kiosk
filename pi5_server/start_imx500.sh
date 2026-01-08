#!/bin/bash
# IMX500 Camera Server Startup Script

echo "🎥 Starting IMX500 Camera Server..."
echo "=================================="

# เข้าโฟลเดอร์ pi5_server
cd "/home/admin/Desktop/kiosk promax/kiosk/pi5_server"

# ตรวจสอบ camera
echo "📷 Checking camera..."
if command -v libcamera-hello &> /dev/null; then
    libcamera-hello --list-cameras
else
    echo "⚠️  libcamera-hello not found - camera detection skipped"
fi

# แสดง IP address
echo ""
echo "🌐 Server IP: $(hostname -I | awk '{print $1}')"
echo "🔗 Endpoint: http://$(hostname -I | awk '{print $1}'):5000"
echo ""

# รัน IMX500 server
echo "🚀 Starting Flask server..."
python3 app_imx500.py
