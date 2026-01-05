from flask import Flask, jsonify, request
from flask_cors import CORS
import time
import threading
import random

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


if __name__ == '__main__':
    print("Starting simulated server on http://127.0.0.1:5000")
    app.run(host='0.0.0.0', port=5000)
