"""
Raspberry Pi 5 IoT Server for LED Strip Control
This server runs on Pi5 and controls LED strip based on user presence
Communicates with Firebase Realtime Database
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import RPi.GPIO as GPIO
import time
import threading
import firebase_admin
from firebase_admin import credentials, db
import json

app = Flask(__name__)
CORS(app)

# GPIO Configuration
LED_PIN = 18  # GPIO pin for LED strip (PWM capable)
PROXIMITY_SENSOR_PIN = 23  # GPIO pin for proximity sensor (HC-SR04 TRIG)
ECHO_PIN = 24  # GPIO pin for proximity sensor (HC-SR04 ECHO)

# Setup GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setup(LED_PIN, GPIO.OUT)
GPIO.setup(PROXIMITY_SENSOR_PIN, GPIO.OUT)
GPIO.setup(ECHO_PIN, GPIO.IN)

# PWM setup for LED brightness control
led_pwm = GPIO.PWM(LED_PIN, 1000)  # 1kHz frequency
led_pwm.start(0)  # Start with LED off

# Global state
led_status = False
user_present = False

# Initialize Firebase Admin
try:
    cred = credentials.Certificate('firebase-credentials.json')
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com'
    })
    print("✅ Firebase initialized successfully")
except Exception as e:
    print(f"⚠️ Firebase initialization failed: {e}")

# Reference to Firebase Realtime Database
presence_ref = db.reference('presence')
led_ref = db.reference('led_status')


def measure_distance():
    """Measure distance using HC-SR04 ultrasonic sensor"""
    # Send trigger pulse
    GPIO.output(PROXIMITY_SENSOR_PIN, True)
    time.sleep(0.00001)
    GPIO.output(PROXIMITY_SENSOR_PIN, False)
    
    # Measure echo time
    pulse_start = time.time()
    pulse_end = time.time()
    
    timeout = time.time() + 0.1  # 100ms timeout
    
    while GPIO.input(ECHO_PIN) == 0 and time.time() < timeout:
        pulse_start = time.time()
    
    while GPIO.input(ECHO_PIN) == 1 and time.time() < timeout:
        pulse_end = time.time()
    
    pulse_duration = pulse_end - pulse_start
    distance = pulse_duration * 17150  # Speed of sound = 34300 cm/s
    distance = round(distance, 2)
    
    return distance


def check_presence():
    """Continuously check for user presence"""
    global user_present, led_status
    
    while True:
        try:
            distance = measure_distance()
            
            # User is present if distance < 100cm
            if distance < 100:
                if not user_present:
                    user_present = True
                    led_status = True
                    led_pwm.ChangeDutyCycle(100)  # Full brightness
                    
                    # Update Firebase
                    presence_ref.set({
                        'userPresent': True,
                        'distance': distance,
                        'timestamp': int(time.time() * 1000)
                    })
                    
                    led_ref.set({
                        'enabled': True,
                        'timestamp': int(time.time() * 1000)
                    })
                    
                    print(f"👤 User detected at {distance}cm - LED ON")
            
            else:
                if user_present:
                    user_present = False
                    led_status = False
                    led_pwm.ChangeDutyCycle(0)  # LED off
                    
                    # Update Firebase
                    presence_ref.set({
                        'userPresent': False,
                        'distance': distance,
                        'timestamp': int(time.time() * 1000)
                    })
                    
                    led_ref.set({
                        'enabled': False,
                        'timestamp': int(time.time() * 1000)
                    })
                    
                    print(f"🚶 User left - LED OFF")
            
            time.sleep(0.5)  # Check every 0.5 seconds
            
        except Exception as e:
            print(f"❌ Error in presence check: {e}")
            time.sleep(1)


# API Endpoints
@app.route('/')
def index():
    return jsonify({
        'status': 'online',
        'device': 'Raspberry Pi 5 IoT Server',
        'version': '1.0.0'
    })


@app.route('/api/status')
def get_status():
    """Get current device status"""
    return jsonify({
        'led_status': led_status,
        'user_present': user_present,
        'timestamp': int(time.time() * 1000)
    })


@app.route('/api/led', methods=['POST'])
def control_led():
    """Manually control LED"""
    global led_status
    
    data = request.get_json()
    enabled = data.get('enabled', False)
    brightness = data.get('brightness', 100)
    
    led_status = enabled
    
    if enabled:
        led_pwm.ChangeDutyCycle(brightness)
    else:
        led_pwm.ChangeDutyCycle(0)
    
    # Update Firebase
    led_ref.set({
        'enabled': enabled,
        'brightness': brightness,
        'timestamp': int(time.time() * 1000)
    })
    
    return jsonify({
        'success': True,
        'led_status': led_status,
        'brightness': brightness
    })


@app.route('/api/distance')
def get_distance():
    """Get current distance measurement"""
    distance = measure_distance()
    return jsonify({
        'distance': distance,
        'unit': 'cm',
        'timestamp': int(time.time() * 1000)
    })


def cleanup():
    """Cleanup GPIO on exit"""
    led_pwm.stop()
    GPIO.cleanup()
    print("🧹 GPIO cleanup completed")


if __name__ == '__main__':
    try:
        # Start presence detection thread
        presence_thread = threading.Thread(target=check_presence, daemon=True)
        presence_thread.start()
        print("🚀 Presence detection started")
        
        # Start Flask server
        print("🌐 Starting Flask server on port 5000...")
        app.run(host='0.0.0.0', port=5000, debug=False)
        
    except KeyboardInterrupt:
        print("\n⏹️ Server stopped by user")
        cleanup()
    except Exception as e:
        print(f"❌ Server error: {e}")
        cleanup()
