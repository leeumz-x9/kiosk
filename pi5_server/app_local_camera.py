from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2
import threading
import time

app = Flask(__name__)
CORS(app)

# OpenCV camera (device 0)
cap = cv2.VideoCapture(0)
if cap.isOpened():
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

camera_running = cap.isOpened()
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')


def generate_camera_stream():
    global cap
    if not cap or not cap.isOpened():
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            time.sleep(0.1)
            continue

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

        cv2.putText(frame, 'Local Camera (OpenCV)', (10, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)

        ret2, buffer = cv2.imencode('.jpg', frame)
        if not ret2:
            continue
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')


@app.route('/')
def index():
    return jsonify({'status': 'local-camera', 'camera_available': camera_running})


@app.route('/api/camera/stream')
def camera_stream():
    return Response(generate_camera_stream(), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/api/camera/detect')
def camera_detect():
    global cap
    if not cap or not cap.isOpened():
        return jsonify({'error': 'Camera not available', 'faces_detected': 0}), 500

    ret, frame = cap.read()
    if not ret:
        return jsonify({'error': 'Failed to capture frame', 'faces_detected': 0}), 500

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    results = {'faces_detected': len(faces), 'faces': [], 'timestamp': int(time.time() * 1000)}
    for (x, y, w, h) in faces:
        results['faces'].append({'x': int(x), 'y': int(y), 'width': int(w), 'height': int(h), 'confidence': 0.0})

    return jsonify(results)


def cleanup():
    global cap
    try:
        if cap and cap.isOpened():
            cap.release()
    except Exception:
        pass


if __name__ == '__main__':
    try:
        print('Starting local camera server on http://127.0.0.1:5000')
        app.run(host='0.0.0.0', port=5000, debug=False)
    except KeyboardInterrupt:
        print('\nStopping server')
        cleanup()
    except Exception as e:
        print('Server error:', e)
        cleanup()
