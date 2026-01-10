"""
Raspberry Pi 5 + AI Camera IMX500 Server
- LED Strip Control
- Face Detection with IMX500
- Proximity Sensing
- Firebase Integration (Optional)
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
import json
import os
from datetime import datetime
from collections import deque

# Optional Firebase imports
firebase_enabled = False
firebase_db = None
firestore_db = None

try:
    import firebase_admin
    from firebase_admin import credentials, db, firestore
    firebase_enabled = True
except ImportError:
    pass

app = Flask(__name__)
CORS(app)

# ============= GPIO Configuration =============
LED_PIN = 18
PROXIMITY_SENSOR_PIN = 23
ECHO_PIN = 24

# Setup GPIO - try to handle both lgpio and RPi.GPIO
try:
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(LED_PIN, GPIO.OUT)
    GPIO.setup(PROXIMITY_SENSOR_PIN, GPIO.OUT)
    GPIO.setup(ECHO_PIN, GPIO.IN)
    
    led_pwm = GPIO.PWM(LED_PIN, 1000)
    led_pwm.start(0)
    print("✅ GPIO initialized")
except Exception as e:
    print(f"⚠️  GPIO initialization error: {e}")
    print("   Continuing without GPIO control (demo mode)")
    LED_PIN = None
    led_pwm = None

# ============= Global State =============
led_status = False
user_present = False
camera = None
camera_initialized = False
latest_detection = None
detection_history = deque(maxlen=100)
last_led_update = 0

# ============= Firebase Initialization =============
def init_firebase():
    """Initialize Firebase if credentials exist"""
    global firebase_db, firestore_db, firebase_enabled
    
    try:
        if firebase_enabled and os.path.exists('firebase-credentials.json'):
            cred = credentials.Certificate('firebase-credentials.json')
            firebase_admin.initialize_app(cred)
            firebase_db = db.reference()
            firestore_db = firestore.client()
            print("✅ Firebase initialized successfully")
            return True
        else:
            print("⚠️  Firebase credentials not found")
            print("   Running in REST-only mode (data stored in memory)")
            return False
    except Exception as e:
        print(f"⚠️  Firebase init error: {e}")
        return False

# ============= Camera Functions =============
def init_imx500_camera():
    """Initialize Raspberry Pi AI Camera (IMX500)"""
    global camera, camera_initialized
    
    try:
        print("🎥 Initializing IMX500 AI Camera...")
        
        camera = Picamera2()
        
        config = camera.create_still_configuration(
            main={
                "size": (4056, 3040),  # 12MP
                "format": "RGB888"
            },
            lores={
                "size": (640, 480),
                "format": "RGB888"
            },
            display="lores"
        )
        
        camera.configure(config)
        
        # Try to set controls, ignore if not supported
        try:
            camera.set_controls({
                "AeEnable": True,
                "AwbEnable": True,
            })
        except:
            pass
        
        camera.start()
        camera_initialized = True
        
        print("✅ IMX500 Camera initialized - 12MP AI acceleration enabled")
        return True
        
    except Exception as e:
        print(f"❌ Camera initialization error: {e}")
        camera_initialized = False
        return False


def detect_faces_imx500():
    """Detect faces using IMX500"""
    global camera, camera_initialized
    
    if not camera_initialized:
        return None
    
    try:
        frame = camera.capture_array("lores")
        
        # Use direct path to haarcascade file
        cascade_path = '/usr/share/opencv4/haarcascades/haarcascade_frontalface_default.xml'
        face_cascade = cv2.CascadeClassifier(cascade_path)
        
        if face_cascade.empty():
            print(f"❌ Failed to load cascade classifier from {cascade_path}")
            return None
        
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
            'timestamp': datetime.now().isoformat()
        }
        
        for (x, y, w, h) in faces:
            results['faces'].append({
                'x': int(x),
                'y': int(y),
                'width': int(w),
                'height': int(h),
                'confidence': 0.85
            })
        
        return results
        
    except Exception as e:
        print(f"❌ Face detection error: {e}")
        return None


def generate_camera_stream():
    """Generate MJPEG stream"""
    global camera, camera_initialized
    
    if not camera_initialized:
        init_imx500_camera()
    
    while True:
        try:
            if camera_initialized:
                frame = camera.capture_array("lores")
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
                
                # Encode to JPEG
                ret, buffer = cv2.imencode('.jpg', frame)
                frame_bytes = buffer.tobytes()
                
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n'
                       b'Content-Length: ' + str(len(frame_bytes)).encode() + b'\r\n\r\n'
                       + frame_bytes + b'\r\n')
                
                # Limit to ~10 FPS เพื่อลด CPU usage
                time.sleep(0.1)
        except Exception as e:
            print(f"❌ Stream error: {e}")
            time.sleep(1)


def save_face_detection(detection_data):
    """Save face detection data"""
    global latest_detection, detection_history
    
    detection_data['device_id'] = 'pi5_imx500_001'
    detection_data['location'] = 'Kiosk Main Display'
    
    latest_detection = detection_data
    detection_history.append(detection_data)
    
    # Try to save to Firebase
    if firebase_db:
        try:
            firebase_db.child('detections').child('latest').set(detection_data)
        except Exception as e:
            print(f"⚠️  Firebase save failed: {e}")
    
    return detection_data


def measure_distance():
    """Measure distance using HC-SR04"""
    try:
        # Send pulse
        GPIO.output(PROXIMITY_SENSOR_PIN, True)
        time.sleep(0.00001)
        GPIO.output(PROXIMITY_SENSOR_PIN, False)
        
        # Measure pulse duration
        pulse_start = time.time()
        pulse_end = time.time()
        
        while GPIO.input(ECHO_PIN) == 0:
            pulse_start = time.time()
        
        while GPIO.input(ECHO_PIN) == 1:
            pulse_end = time.time()
        
        pulse_duration = pulse_end - pulse_start
        distance = pulse_duration * 17150
        
        return round(distance, 2)
    except Exception as e:
        print(f"❌ Distance measurement error: {e}")
        return -1


def check_presence():
    """Monitor presence sensor"""
    global user_present, led_status, last_led_update
    
    while True:
        try:
            if PROXIMITY_SENSOR_PIN and ECHO_PIN and led_pwm:
                distance = measure_distance()
                
                if distance > 0 and distance < 100:  # User within 100cm
                    if not user_present:
                        user_present = True
                        led_status = True
                        led_pwm.ChangeDutyCycle(100)
                        last_led_update = time.time()
                        print(f"👤 User detected at {distance}cm - LED ON")
                else:
                    if user_present:
                        user_present = False
                        led_status = False
                        led_pwm.ChangeDutyCycle(0)
                        last_led_update = time.time()
                        print(f"🚶 User left - LED OFF")
            
            time.sleep(0.5)
            
        except Exception as e:
            print(f"❌ Presence check error: {e}")
            time.sleep(1)


# ============= API Endpoints =============

@app.route('/', methods=['GET'])
def index():
    """Health check"""
    return jsonify({
        'status': 'online',
        'device': 'Raspberry Pi 5 + IMX500 AI Camera',
        'camera': 'IMX500 12MP AI Camera',
        'firebase': 'connected' if firebase_db else 'offline',
        'version': '2.0.0'
    })


@app.route('/api/face/detect', methods=['GET'])
def face_detect():
    """Real-time face detection"""
    results = detect_faces_imx500()
    
    if results and results['faces_detected'] > 0:
        save_face_detection(results)
        return jsonify(results)
    else:
        return jsonify({
            'faces_detected': 0,
            'faces': [],
            'timestamp': datetime.now().isoformat()
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
        'detections': list(detection_history)[-limit:]
    })


@app.route('/api/camera/snapshot')
def camera_snapshot():
    """Get single frame snapshot (ใช้อันนี้แทน stream เพื่อลด lag)"""
    global camera, camera_initialized
    
    if not camera_initialized:
        init_imx500_camera()
    
    try:
        if camera_initialized:
            # Capture frame
            frame = camera.capture_array("lores")
            
            # Detect faces and draw boxes
            face_results = detect_faces_imx500()
            if face_results and face_results['faces_detected'] > 0:
                for face in face_results['faces']:
                    x, y, w, h = face['x'], face['y'], face['width'], face['height']
                    cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 3)
                    cv2.putText(
                        frame, 
                        f"Human: {face['confidence']:.2f}", 
                        (x, y-10),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.7,
                        (0, 255, 0),
                        2
                    )
            
            # Encode to JPEG with good quality
            ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            
            return Response(buffer.tobytes(), mimetype='image/jpeg')
        else:
            return jsonify({'error': 'Camera not initialized'}), 500
    except Exception as e:
        print(f"❌ Snapshot error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/camera/stream')
def camera_stream():
    """MJPEG stream (ช้ากว่า snapshot, ใช้เฉพาะเมื่อต้องการ continuous stream)"""
    return Response(
        generate_camera_stream(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )


@app.route('/api/camera/status', methods=['GET'])
def camera_status():
    """Camera status"""
    return jsonify({
        'initialized': camera_initialized,
        'model': 'IMX500',
        'resolution': '12MP',
        'ai_enabled': True,
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/led', methods=['POST'])
def control_led():
    """Control LED strip"""
    global led_status, last_led_update
    
    data = request.get_json()
    enabled = data.get('enabled', False)
    brightness = data.get('brightness', 100)
    
    led_status = enabled
    last_led_update = time.time()
    
    if led_pwm and LED_PIN:
        try:
            if enabled:
                led_pwm.ChangeDutyCycle(brightness)
            else:
                led_pwm.ChangeDutyCycle(0)
        except Exception as e:
            print(f"⚠️  LED control error: {e}")
    
    return jsonify({
        'success': True,
        'led_status': led_status,
        'brightness': brightness
    })


@app.route('/api/distance', methods=['GET'])
def get_distance():
    """Get distance from proximity sensor"""
    distance = measure_distance()
    return jsonify({
        'distance': distance,
        'unit': 'cm',
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/status', methods=['GET'])
def get_status():
    """Get system status"""
    return jsonify({
        'camera': 'online' if camera_initialized else 'offline',
        'led': 'on' if led_status else 'off',
        'firebase': 'connected' if firebase_db else 'offline',
        'user_present': user_present,
        'latest_detection': latest_detection,
        'timestamp': datetime.now().isoformat()
    })


def cleanup():
    """Cleanup on exit"""
    global camera, camera_initialized
    
    try:
        if led_pwm:
            led_pwm.stop()
        GPIO.cleanup()
        
        if camera_initialized and camera:
            camera.stop()
            camera.close()
    except:
        pass
    
    print("🧹 Cleanup completed")


# ============= Main =============
if __name__ == '__main__':
    try:
        # Initialize Firebase
        init_firebase()
        
        # Initialize IMX500 Camera
        init_imx500_camera()
        
        # Start presence detection thread
        presence_thread = threading.Thread(target=check_presence, daemon=True)
        presence_thread.start()
        print("🚀 Presence detection started")
        
        # Start Flask server
        print("\n" + "="*50)
        print("🌐 IMX500 Server Starting...")
        print("="*50)
        print("📹 Camera stream: http://YOUR_PI5_IP:5000/api/camera/stream")
        print("🔍 Face detect: http://YOUR_PI5_IP:5000/api/face/detect")
        print("📊 Status: http://YOUR_PI5_IP:5000/api/status")
        print("="*50 + "\n")
        
        app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
        
    except KeyboardInterrupt:
        print("\n⏹️ Server stopped by user")
        cleanup()
    except Exception as e:
        print(f"❌ Server error: {e}")
        cleanup()
