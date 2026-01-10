#!/bin/bash
# Auto-restart camera server script

echo "🚀 Starting IMX500 Camera Server (Auto-restart enabled)"
echo "================================================"

while true; do
    echo ""
    echo "⏰ $(date '+%Y-%m-%d %H:%M:%S') - Starting server..."
    python3 app_imx500.py
    
    # If server exits, wait 3 seconds before restart
    echo "⚠️  Server stopped! Restarting in 3 seconds..."
    sleep 3
done
