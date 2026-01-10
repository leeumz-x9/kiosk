from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import time
import threading
import random
import io
from PIL import Image, ImageDraw, ImageFont

app = Flask(__name__)
CORS(app)

led_status = False
brightness = 0
user_present = False


def measure_distance():
    return round(random.uniform(20, 150), 2)


@app.route('/')
def index():
    return jsonify({'status': 'simulated', 'device': 'Simulated Pi Server'})


@app.route('/api/status')
def status():
    return jsonify({'led_status': led_status, 'user_present': user_present, 'timestamp': int(time.time() * 1000)})


@app.route('/api/led', methods=['POST'])
def led():
    global led_status, brightness
    data = request.get_json() or {}
    led_status = data.get('enabled', False)
    brightness = data.get('brightness', 100)
    return jsonify({'success': True, 'led_status': led_status, 'brightness': brightness})


@app.route('/api/distance')
def distance():
    return jsonify({'distance': measure_distance(), 'unit': 'cm', 'timestamp': int(time.time() * 1000)})


@app.route('/api/camera/detect')
def detect():
    faces = []
    n = random.randint(0, 2)
    for i in range(n):
        faces.append({'x': 100 + i * 30, 'y': 80, 'width': 60, 'height': 60, 'confidence': round(random.uniform(0.75, 0.98), 2)})
    return jsonify({'faces_detected': len(faces), 'faces': faces, 'timestamp': int(time.time() * 1000)})


@app.route('/api/camera/snapshot')
def snapshot():
    """Return a simulated camera snapshot with mock face detection"""
    try:
        # Create a mock image (640x480)
        img = Image.new('RGB', (640, 480), color=(73, 109, 137))
        draw = ImageDraw.Draw(img)
        
        # Draw simulated text
        draw.text((10, 10), "Simulated Camera (No Physical Camera)", fill=(255, 255, 0))
        draw.text((10, 40), f"Time: {time.strftime('%H:%M:%S')}", fill=(255, 255, 255))
        
        # Draw a simulated face box (always show for testing)
        draw.rectangle([(240, 180), (400, 340)], outline=(0, 255, 0), width=3)
        draw.text((245, 160), "Face Detected", fill=(0, 255, 0))
        
        # Convert to JPEG bytes
        img_io = io.BytesIO()
        img.save(img_io, 'JPEG', quality=85)
        img_io.seek(0)
        
        # Create response with no-cache headers
        response = Response(img_io.getvalue(), mimetype='image/jpeg')
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        return response
    except Exception as e:
        print(f"Error generating snapshot: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/face/detect')
def face_detect():
    """Pi5-style face detection endpoint"""
    # Always return 1 face for testing
    faces = [{
        'x': 240,
        'y': 180,
        'width': 160,
        'height': 160,
        'confidence': round(random.uniform(0.90, 0.98), 2),
        'detection': {
            'box': [240, 180, 160, 160],
            'confidence': round(random.uniform(0.90, 0.98), 2),
            'class': 'person'
        }
    }]
    
    result = {
        'success': True,
        'face_detected': len(faces) > 0,  # Frontend expects this singular boolean key
        'faces_detected': len(faces),
        'faces': faces,
        'timestamp': int(time.time() * 1000),
        'camera_ready': True,
        'processing_time': round(random.uniform(0.05, 0.15), 3)
    }
    
    return jsonify(result)


if __name__ == '__main__':
    print("Starting simulated server on http://127.0.0.1:5000")
    app.run(host='0.0.0.0', port=5000)
