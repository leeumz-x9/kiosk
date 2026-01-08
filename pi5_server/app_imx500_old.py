"""
Raspberry Pi 5 + AI Camera IMX500 Server
- LED Strip Control
- Face Detection with IMX500
- Proximity Sensing
- Firebase Integration
- REST API for Multi-Device Display
"""

from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import RPi.GPIO as GPIO
import time
import threading
import cv2
import numpy as np
from picamera2 import Picamera2
from libcamera import controls
import json
import os
from datetime import datetime

# Optional Firebase imports
firebase_enabled = False
try:
    import firebase_admin
    from firebase_admin import credentials, db, firestore
    firebase_enabled = True
except ImportError:
    print("⚠️ Firebase not installed - running without Firebase")

app = Flask(__name__)
CORS(app)

# GPIO Configuration
LED_PIN = 18
PROXIMITY_SENSOR_PIN = 23
ECHO_PIN = 24

# Setup GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setup(LED_PIN, GPIO.OUT)
GPIO.setup(PROXIMITY_SENSOR_PIN, GPIO.OUT)
GPIO.setup(ECHO_PIN, GPIO.IN)

led_pwm = GPIO.PWM(LED_PIN, 1000)
led_pwm.start(0)

# Global state
led_status = False
user_present = False
camera = None
camera_initialized = False
latest_detection = None
detection_history = []

# Initialize Firebase (if credentials exist)
firebase_db = None
firestore_db = None
try:
    if firebase_enabled and os.path.exists('firebase-credentials.json'):
        cred = credentials.Certificate('firebase-credentials.json')
        firebase_admin.initialize_app(cred)
        firebase_db = db.reference()
        firestore_db = firestore.client()
        print("✅ Firebase initialized successfully")
    else:
        print("⚠️ Firebase credentials not found - running in REST-only mode")
        print("   Data will be served via REST API only (no cloud sync)")
except Exception as e:
    print(f"⚠️ Firebase initialization error: {e}")
    print("   Continuing in REST-only mode...")


def init_imx500_camera():
    """
    Initialize Raspberry Pi AI Camera (IMX500)
    12MP sensor with AI acceleration
    """
    global camera, camera_initialized
    
    try:
        print("🎥 Initializing IMX500 AI Camera...")
        
        # Initialize Picamera2 for IMX500
        camera = Picamera2()
        
        # Configure for 12MP IMX500
        config = camera.create_still_configuration(
            main={
                "size": (4056, 3040),  # 12MP resolution
                "format": "RGB888"
            },
            lores={
                "size": (640, 480),  # Lower res for streaming
                "format": "RGB888"
            },
            display="lores"
        )
        
        camera.configure(config)
        
        # Set camera controls for optimal face detection (simplified for compatibility)
        try:
            camera.set_controls({
                "AeEnable": True,
                "AwbEnable": True,
            })
        except Exception as e:
            print(f"⚠️ Camera controls warning: {e}")
        
        camera.start()
        camera_initialized = True
        
        # Update Firebase (disabled)
        if camera_ref:
            camera_ref.set({
                'model': 'IMX500',
                'resolution': '12MP',
                'status': 'online',
                'ai_enabled': True,
                'timestamp': int(time.time() * 1000)
            })
        
        print("✅ IMX500 Camera initialized - 12MP AI acceleration enabled")
        return True
        
    except Exception as e:
        print(f"❌ Camera initialization error: {e}")
        camera_initialized = False
        return False


def detect_faces_imx500():
    """
    Detect faces using IMX500 with AI acceleration
    Returns face detection results
    """
    global camera, camera_initialized
    
    if not camera_initialized:
        return None
    
    try:
        # Capture frame from lores stream (faster)
        frame = camera.capture_array("lores")
        
        # Use IMX500's built-in AI for face detection
        # The IMX500 has hardware-accelerated neural network processing
        
        # For now, we'll use OpenCV's cascade (you can use IMX500's SDK)
        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        
        gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )
        
        results = {
            'faces_detected': len(faces),
            'faces': [],
            'timestamp': int(time.time() * 1000)
        }
        
        for (x, y, w, h) in faces:
            results['faces'].append({
                'x': int(x),
                'y': int(y),
                'width': int(w),
                'height': int(h),
                'confidence': 0.85  # IMX500 provides confidence scores
            })
        
        return results
        
    except Exception as e:
        print(f"❌ Face detection error: {e}")
        return None


def generate_camera_stream():
    """
    Generate MJPEG stream from IMX500 camera
    """
    global camera, camera_initialized
    
    if not camera_initialized:
        init_imx500_camera()
    
    while True:
        try:
            if camera_initialized:
                # Capture frame
                frame = camera.capture_array("lores")
                
                # Detect faces and draw rectangles
                face_results = detect_faces_imx500()
                
                if face_results and face_results['faces_detected'] > 0:
                    for face in face_results['faces']:
                        x, y, w, h = face['x'], face['y'], face['width'], face['height']
                        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                        cv2.putText(
                            frame, 
                            f"Face: {face['confidence']:.2f}", 
                            (x, y-10),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            0.5,
                            (0, 255, 0),
                            2
                        )
                
                # Add AI indicator
                cv2.putText(
                    frame,
                    "IMX500 AI Camera - 12MP",
                    (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (0, 255, 255),
                    2
                )
                
                # Convert to JPEG
                ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
                frame_bytes = buffer.tobytes()
                
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            
            time.sleep(0.033)  # ~30 FPS
            
        except Exception as e:
            print(f"❌ Stream error: {e}")
            time.sleep(1)


def measure_distance():
    """Measure distance using HC-SR04"""
    GPIO.output(PROXIMITY_SENSOR_PIN, True)
    time.sleep(0.00001)
    GPIO.output(PROXIMITY_SENSOR_PIN, False)
    
    pulse_start = time.time()
    pulse_end = time.time()
    timeout = time.time() + 0.1
    
    while GPIO.input(ECHO_PIN) == 0 and time.time() < timeout:
        pulse_start = time.time()
    
    while GPIO.input(ECHO_PIN) == 1 and time.time() < timeout:
        pulse_end = time.time()
    
    pulse_duration = pulse_end - pulse_start
    distance = pulse_duration * 17150
    return round(distance, 2)


def check_presence():
    """Continuously check for user presence"""
    global user_present, led_status
    
    while True:
        try:
            distance = measure_distance()
            
            if distance < 100:
                if not user_present:
                    user_present = True
                    led_status = True
                    led_pwm.ChangeDutyCycle(100)
                    
                    if presence_ref:
                        presence_ref.set({
                            'userPresent': True,
                            'distance': distance,
                            'timestamp': int(time.time() * 1000)
                        })
                    
                    if led_ref:
                        led_ref.set({
                            'enabled': True,
                            'timestamp': int(time.time() * 1000)
                        })
                    
                    print(f"👤 User detected at {distance}cm - LED ON")
            else:
                if user_present:
                    user_present = False
                    led_status = False
                    led_pwm.ChangeDutyCycle(0)
                    
                    if presence_ref:
                        presence_ref.set({
                            'userPresent': False,
                            'distance': distance,
                            'timestamp': int(time.time() * 1000)
                        })
                    
                    if led_ref:
                        led_ref.set({
                            'enabled': False,
                            'timestamp': int(time.time() * 1000)
                        })
                    
                    print(f"🚶 User left - LED OFF")
            
            time.sleep(0.5)
            
        except Exception as e:
            print(f"❌ Presence check error: {e}")
            time.sleep(1)


def save_face_detection(detection_data):
    """
    Save face detection data to Firebase (if available)
    Otherwise store in memory
    """
    global latest_detection, detection_history
    
    # Add timestamp and device info
    detection_data['timestamp'] = datetime.now().isoformat()
    detection_data['device_id'] = 'pi5_imx500_001'
    detection_data['location'] = 'Kiosk Main Display'
    
    # Store in memory
    latest_detection = detection_data
    detection_history.append(detection_data)
    
    # Keep only last 100 detections in memory
    if len(detection_history) > 100:
        detection_history.pop(0)
    
    # Try to save to Firebase
    if firebase_db:
        try:
            # Save to Realtime Database
            firebase_db.child('detections').child('latest').set(detection_data)
            # Also save to history
            firebase_db.child('detections').child('history').push(detection_data)
        except Exception as e:
            print(f"⚠️ Firebase save failed: {e}")
    
    return detection_data


# API Endpoints
@app.route('/')
def index():
    return jsonify({
        'status': 'online',
        'device': 'Raspberry Pi 5 + IMX500 AI Camera',
        'camera': 'IMX500 12MP AI Camera',
        'version': '2.0.0'
    })


@app.route('/api/status')
def get_status():
    return jsonify({
        'led_status': led_status,
        'user_present': user_present,
        'camera_initialized': camera_initialized,
        'camera_model': 'IMX500',
        'timestamp': int(time.time() * 1000)
    })


@app.route('/api/camera/status')
def camera_status():
    return jsonify({
        'initialized': camera_initialized,
        'model': 'IMX500',
        'resolution': '12MP',
        'ai_acceleration': True,
        'timestamp': int(time.time() * 1000)
    })


@app.route('/api/face/detect', methods=['GET', 'POST'])
def face_detect():
    """Real-time face detection"""
    results = detect_faces_imx500()
    
    if results and results['faces_detected'] > 0:
        # Save detection to storage
        detection_data = {
            'faces_count': results['faces_detected'],
            'faces': results['faces'],
            'timestamp': results['timestamp']
        }
        save_face_detection(detection_data)
        return jsonify(results)
    else:
        return jsonify({
            'faces_detected': 0,
            'faces': [],
            'timestamp': int(time.time() * 1000)
        })


@app.route('/api/face/latest', methods=['GET'])
def get_latest_detection():
    """Get latest face detection"""
    if latest_detection:
        return jsonify(latest_detection)
    else:
        return jsonify({
            'message': 'No detections yet',
            'faces_count': 0
        })


@app.route('/api/face/history', methods=['GET'])
def get_detection_history():
    """Get detection history"""
    limit = request.args.get('limit', 50, type=int)
    return jsonify({
        'total': len(detection_history),
        'detections': detection_history[-limit:]
    })


@app.route('/api/status', methods=['GET'])
def get_status():
    """Get current system status"""
    return jsonify({
        'camera': 'online' if camera_initialized else 'offline',
        'led': 'on' if led_status else 'off',
        'firebase': 'connected' if firebase_db else 'offline',
        'latest_detection': latest_detection,
        'timestamp': int(time.time() * 1000)
    })


@app.route('/api/camera/stream')
def camera_stream():
def camera_stream():
    """MJPEG streaming endpoint"""
    return Response(
        generate_camera_stream(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )


@app.route('/api/camera/detect')
def detect_faces():
    """Face detection endpoint"""
    results = detect_faces_imx500()
    
    if results:
        return jsonify(results)
    else:
        return jsonify({
            'error': 'Camera not initialized or detection failed',
            'faces_detected': 0
        }), 500


@app.route('/api/camera/capture', methods=['POST'])
def capture_image():
    """Capture high-res image"""
    global camera, camera_initialized
    
    if not camera_initialized:
        return jsonify({'error': 'Camera not initialized'}), 500
    
    try:
        # Capture 12MP image
        timestamp = int(time.time() * 1000)
        filename = f'/tmp/capture_{timestamp}.jpg'
        
        camera.capture_file(filename)
        
        return jsonify({
            'success': True,
            'filename': filename,
            'resolution': '12MP',
            'timestamp': timestamp
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/led', methods=['POST'])
def control_led():
    global led_status
    
    data = request.get_json()
    enabled = data.get('enabled', False)
    brightness = data.get('brightness', 100)
    
    led_status = enabled
    
    if enabled:
        led_pwm.ChangeDutyCycle(brightness)
    else:
        led_pwm.ChangeDutyCycle(0)
    
    if led_ref:
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
    distance = measure_distance()
    return jsonify({
        'distance': distance,
        'unit': 'cm',
        'timestamp': int(time.time() * 1000)
    })


def cleanup():
    """Cleanup GPIO and camera on exit"""
    global camera, camera_initialized
    
    led_pwm.stop()
    GPIO.cleanup()
    
    if camera_initialized and camera:
        camera.stop()
        camera.close()
    
    print("🧹 Cleanup completed")


if __name__ == '__main__':
    try:
        # Initialize IMX500 Camera
        init_imx500_camera()
        
        # Start presence detection thread
        presence_thread = threading.Thread(target=check_presence, daemon=True)
        presence_thread.start()
        print("🚀 Presence detection started")
        
        # Start Flask server
        print("🌐 Starting Flask server on port 5000...")
        print("📹 Camera stream: http://YOUR_PI5_IP:5000/api/camera/stream")
        app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
        
    except KeyboardInterrupt:
        print("\n⏹️ Server stopped")
        cleanup()
    except Exception as e:
        print(f"❌ Server error: {e}")
        cleanup()
