# Face Detection Setup Guide - Kiosk ProMax

## 📋 Overview
ระบบตรวจจับใบหน้าแบบ Real-time พร้อมการวิเคราะห์:
- 🎂 **อายุ (Age)** - ประมาณการอายุจากใบหน้า
- 👤 **เพศ (Gender)** - ระบุเพศ Male/Female
- 😊 **อารมณ์ (Emotion/Mood)** - วิเคราะห์อารมณ์ขณะนั้น (Happy, Sad, Neutral, Surprised, etc.)

## 🔧 Two Modes Available

### Mode 1: Web Camera (Default)
ใช้กล้องเว็บบนเครื่องคอมพิวเตอร์

**Setup:**
1. ไม่ต้องติดตั้งอะไรเพิ่ม
2. รันโปรเจกต์ตามปกติ: `npm run dev`
3. อนุญาตการเข้าถึงกล้องเมื่อเบราว์เซอร์ขออนุญาต

### Mode 2: Raspberry Pi Camera (Advanced)
ใช้กล้อง Pi พร้อม AI acceleration

**Requirements:**
- Raspberry Pi 5
- Pi Camera Module (IMX500 แนะนำสำหรับ AI)
- Python 3.9+

**Setup Pi Server:**

1. **ติดตั้ง dependencies บน Pi:**
   ```bash
   cd pi5_server
   pip install -r requirements.txt
   ```

2. **รัน Pi Server:**
   ```bash
   python app.py
   ```

3. **แก้ไข config ในโปรเจกต์:**
   
   เปิดไฟล์ `src/config.js` และแก้ไข:
   ```javascript
   export const PI5_CONFIG = {
     endpoint: "http://192.168.1.100:5000",  // เปลี่ยนเป็น IP ของ Pi
     usePiCamera: true,  // เปลี่ยนเป็น true
     // ... rest of config
   };
   ```

4. **รันโปรเจกต์:**
   ```bash
   npm run dev
   ```

## 📦 Python Dependencies for Pi

```bash
# Core
flask==3.0.0
flask-cors==4.0.0
RPi.GPIO==0.7.1

# Camera & Computer Vision
picamera2==0.3.16
opencv-python==4.8.1.78
numpy==1.24.3

# AI/ML for Face Analysis
deepface==0.0.79
tf-keras==2.15.0

# Firebase
firebase-admin==6.3.0
```

## 🎯 Features

### 1. Face Detection
- ตรวจจับใบหน้ามนุษย์อัตโนมัติ
- กรองเฉพาะใบหน้ามนุษย์ (ไม่รับรูปภาพหรือวัตถุอื่น)
- Real-time detection

### 2. Age Estimation
- ประมาณการอายุจากใบหน้า
- แม่นยำ ±5 ปี
- แสดงผลเป็นตัวเลขปี

### 3. Gender Recognition
- ระบุเพศ: Male / Female
- แม่นยำสูง (>90%)
- พร้อม confidence score

### 4. Emotion Analysis
- วิเคราะห์อารมณ์ 7 แบบ:
  - 😊 Happy
  - 😢 Sad
  - 😠 Angry
  - 😐 Neutral
  - 😲 Surprised
  - 😨 Fear
  - 🤢 Disgust

## 🔒 Privacy & PDPA Compliance

- ไม่บันทึกภาพถาวร
- ใช้ข้อมูลเฉพาะระหว่างการวิเคราะห์
- ลบข้อมูลทันทีหลังการใช้งาน
- มี Consent Form สำหรับผู้ใช้
- Parental Consent สำหรับเด็กอายุต่ำกว่า 13 ปี

## 🚀 API Endpoints (Pi Server)

### `/api/camera/init` (POST)
เริ่มต้นกล้อง Pi

### `/api/face/detect` (GET)
ตรวจจับและวิเคราะห์ใบหน้า

**Response:**
```json
{
  "success": true,
  "faces_detected": 1,
  "is_human": true,
  "age": 21,
  "gender": "Male",
  "emotion": "Happy",
  "dominant_emotion": "Happy",
  "all_emotions": {
    "happy": 85.2,
    "neutral": 10.3,
    "surprised": 4.5
  },
  "confidence": {
    "gender": 0.95,
    "emotion": 0.85
  }
}
```

### `/api/face/stream` (GET)
MJPEG stream พร้อม overlay

### `/api/face/analyze` (POST)
วิเคราะห์จากรูปที่อัปโหลด

## 🐛 Troubleshooting

### ปัญหา: กล้องไม่เปิด
- ตรวจสอบว่าอนุญาตการเข้าถึงกล้องในเบราว์เซอร์
- ลองรีเฟรชหน้าเว็บ
- ตรวจสอบว่าไม่มีแอปอื่นใช้กล้องอยู่

### ปัญหา: ตรวจจับใบหน้าไม่ได้
- ให้แสงสว่างเพียงพอ
- หันหน้าเข้าหากล้องตรง ๆ
- ระยะห่างประมาณ 30-100 cm

### ปัญหา: Pi Server ไม่เชื่อมต่อ
- ตรวจสอบ IP address ใน config
- ตรวจสอบว่า Pi และคอมพิวเตอร์อยู่ใน network เดียวกัน
- ตรวจสอบว่า Flask server รันอยู่
- ลองเปิด firewall port 5000

### ปัญหา: AI Models ไม่โหลด (Web Camera Mode)
- ตรวจสอบว่ามีไฟล์ models ในโฟลเดอร์ `/public/models/`
- ดาวน์โหลด models จาก: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
- ไฟล์ที่ต้องการ:
  - tiny_face_detector_model-*
  - age_gender_model-*
  - face_expression_model-*

## 📊 Performance

### Web Camera Mode:
- Processing Time: ~500-1000ms per face
- Frame Rate: ~1-2 FPS (detection mode)
- Browser: Chrome/Edge recommended

### Pi Camera Mode:
- Processing Time: ~200-500ms per face (with IMX500 AI)
- Frame Rate: ~5-10 FPS
- Better performance with hardware acceleration

## 🎨 UI Features

- ✨ Animated scan effects
- 🎯 Real-time progress indicator
- 📊 Professional result card
- 🔄 Smooth transitions
- 📱 Responsive design
- 🌈 Beautiful gradients
- 🎭 Emoji indicators

## 📝 Notes

- ระบบทำงานได้ดีที่สุดในสภาพแสงสว่างปกติ
- ควรตรวจสอบ PDPA compliance ก่อนใช้งานจริง
- ทดสอบทั้ง 2 โหมดเพื่อหาโหมดที่เหมาะสม
- Pi Camera Mode แนะนำสำหรับการใช้งานแบบ production

## 🔗 Related Files

- Frontend: `/src/components/FaceDetection.jsx`
- Config: `/src/config.js`
- Pi Server: `/pi5_server/app.py`
- Face Analysis: `/pi5_server/face_analysis.py`
- Styles: `/src/components/FaceDetection.css`
