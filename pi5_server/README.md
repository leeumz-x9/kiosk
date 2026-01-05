# Raspberry Pi 5 IoT Server

## Hardware Setup

### Components Required:
- Raspberry Pi 5
- LED Strip (WS2812B or similar) connected to GPIO 18
- HC-SR04 Ultrasonic Proximity Sensor
  - VCC → 5V
  - GND → GND
  - TRIG → GPIO 23
  - ECHO → GPIO 24

### Wiring Diagram:
```
LED Strip:
- Data Pin → GPIO 18 (PWM)
- VCC → 5V
- GND → GND

HC-SR04 Sensor:
- VCC → 5V (Pin 2)
- TRIG → GPIO 23 (Pin 16)
- ECHO → GPIO 24 (Pin 18)
- GND → GND (Pin 6)
```

## Installation

### 1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

### 2. Setup Firebase:
- Download your Firebase Admin SDK credentials JSON
- Save it as `firebase-credentials.json` in this directory
- Update the `databaseURL` in `app.py` with your project URL

### 3. Enable GPIO:
```bash
sudo apt-get update
sudo apt-get install python3-rpi.gpio
```

### 4. Run the server:
```bash
sudo python3 app.py
```

## API Endpoints

### GET /
Health check endpoint

### GET /api/status
Get current LED and presence status

### POST /api/led
Manually control LED
```json
{
  "enabled": true,
  "brightness": 100
}
```

### GET /api/distance
Get current distance measurement from proximity sensor

## Auto-start on Boot

Create systemd service:
```bash
sudo nano /etc/systemd/system/kiosk-iot.service
```

Add:
```ini
[Unit]
Description=College Kiosk IoT Server
After=network.target

[Service]
ExecStart=/usr/bin/python3 /home/pi/kiosk-promax/pi5_server/app.py
WorkingDirectory=/home/pi/kiosk-promax/pi5_server
StandardOutput=inherit
StandardError=inherit
Restart=always
User=root

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable kiosk-iot.service
sudo systemctl start kiosk-iot.service
```

## Troubleshooting

### GPIO Permission Error:
Run with `sudo` or add user to gpio group:
```bash
sudo usermod -a -G gpio $USER
```

### Firebase Connection Error:
- Check internet connection
- Verify firebase-credentials.json is correct
- Ensure databaseURL is correct

### LED Not Working:
- Check wiring
- Verify GPIO pin number
- Test with: `gpio readall`

## Features

✅ Automatic user presence detection
✅ LED strip control based on proximity
✅ Real-time Firebase sync
✅ REST API for manual control
✅ Distance measurement endpoint
