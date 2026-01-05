# College Kiosk ProMax 🎓✨

ระบบ Kiosk สำหรับแนะแนวการศึกษาอัจฉริยะ พร้อมเทคโนโลยี AI, Face Recognition, 3D Avatar และ IoT

## 🌟 Features

### ✅ Frontend (React + Vite)
- 🎨 **UI มินิมอล** สไตล์วัยรุ่น 14-22 ปี
- 🟢 **ธีมสีเขียว-เหลือง** สดใส ทันสมัย
- 📱 **Responsive Design** รองรับทุกหน้าจอ
- ✨ **Smooth Animations** ด้วย Framer Motion
- 🎤 **Text-to-Speech 3 ภาษา** (ไทย, อังกฤษ, จีน)
- 🗣️ **เสียงผู้หญิงสาววัยรุ่น** สดใส สไตล์สาวช่างอุตสาหกรรม

### 👤 Face Detection & AI
- 📸 **Face Recognition** - สแกนใบหน้าเพื่อวิเคราะห์ความสนใจ
- 🧠 **Interest Detection** - ทำนายสาขาที่เหมาะสมจากใบหน้า
- 🎯 **Personalized Recommendations** - แนะนำสาขาที่ตรงใจ
- 📊 **Age & Gender Detection** - วิเคราะห์ข้อมูลเชิงลึก

### 🤖 3D Avatar Interactive
- 🗣️ **AI Chatbot** - ตอบคำถามด้วย OpenAI
- 🎭 **3D Model** - Avatar ที่มีชีวิตชีวา
- 💬 **Real-time Chat** - พูดคุยโต้ตอบได้
- 🎨 **Animated Expressions** - แสดงอารมณ์ขณะพูด

### 🔥 Heatmap Analytics
- 📈 **Real-time Tracking** - ติดตามการใช้งานแบบ Realtime
- 🗺️ **Click Heatmap** - แสดงพื้นที่ที่ผู้ใช้คลิกมากที่สุด
- 📊 **Firebase Sync** - เก็บข้อมูลอัตโนมัติ
- 🎯 **User Behavior** - วิเคราะห์พฤติกรรมผู้ใช้

### 🔌 IoT Integration (Raspberry Pi 5)
- 💡 **Smart LED Strip** - ควบคุม LED อัตโนมัติ
- 👁️ **Proximity Sensor** - ตรวจจับการเข้าใกล้
- 🤖 **Auto Control** - เปิด/ปิด LED ตามการมีผู้ใช้
- 🌐 **REST API** - ควบคุมผ่าน HTTP
- 📷 **IMX500 AI Camera** - กล้อง 12MP พร้อม AI acceleration
- 🎥 **Real-time Streaming** - ส่งภาพแบบ Realtime

### 🔥 Firebase Backend
- 💾 **Firestore** - เก็บข้อมูล Heatmap และ Sessions
- ⚡ **Realtime Database** - สำหรับ IoT และ Presence
- 🚀 **Hosting** - Deploy แบบ Static Site
- 🔐 **Security Rules** - ปลอดภัยด้วย Rules

## 📁 Project Structure

```
kiosk-promax/
├── src/
│   ├── components/
│   │   ├── FaceDetection.jsx      # Face recognition component
│   │   ├── Avatar3D.jsx           # 3D Avatar with chat
│   │   ├── CareerCards.jsx        # Career category cards
│   │   └── Heatmap.jsx            # Heatmap visualization
│   ├── App.jsx                    # Main app component
│   ├── App.css                    # Main styles
│   ├── config.js                  # Configuration
│   ├── firebase.js                # Firebase setup
│   └── main.jsx                   # Entry point
├── pi5_server/
│   ├── app.py                     # Flask IoT server (basic)
│   ├── app_imx500.py              # Flask with IMX500 camera
│   ├── requirements.txt           # Python dependencies
├── public/
│   └── models/                    # Face-api.js models (download required)
├── firebase.json                  # Firebase config
├── firestore.rules               # Firestore security
├── package.json
├── vite.config.js
├── README.md                      # This file
├── SETUP.md                       # Setup instructions
└── RESPONSIVEVOICE_GUIDE.md      # Voice setup guides               # Firestore security
├── package.json
└── vite.config.js
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Download Face Detection Models
ดาวน์โหลด models จาก [face-api.js models](https://github.com/justadudewhohacks/face-api.js/tree/master/weights) แล้ววางใน `public/models/`

ไฟล์ที่ต้องการ:
- tiny_face_detector_model-weights_manifest.json
- tiny_face_detector_model-shard1
- face_landmark_68_model-weights_manifest.json
- face_landmark_68_model-shard1
- face_recognition_model-weights_manifest.json
- face_recognition_model-shard1
- face_expression_model-weights_manifest.json
- face_expression_model-shard1
- age_gender_model-weights_manifest.json
- age_gender_model-shard1

### 3. Configure Firebase
แก้ไขไฟล์ `src/config.js`:
```javascript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com"
### 4. Setup OpenAI (Optional)
เพิ่ม API Key ใน `src/config.js`:
```javascript
export const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY";
```

### 5. Setup ResponsiveVoice
สมัครและเพิ่ม API Key ใน `index.html`:
```html
<script src="https://code.responsivevoice.org/responsivevoice.js?key=YOUR_API_KEY"></script>
```
เปิดเบราว์เซอร์: http://localhost:3000

### 7. Build for Production
### 6. Run Development Server "YOUR_OPENAI_API_KEY";
```

### 5. Run Development Server
npm run build
```

### 8. Deploy to Firebase
เปิดเบราว์เซอร์: http://localhost:3000

### 6. Build for Production
```bash
npm run build
```

### 7. Deploy to Firebase
```bash
firebase login
firebase init
firebase deploy
```

## 🔌 IoT Setup (Raspberry Pi 5)

### Hardware Requirements:
- Raspberry Pi 5
- **IMX500 AI Camera (12MP)** - Raspberry Pi AI Camera
- LED Strip (WS2812B)
- HC-SR04 Ultrasonic Sensor
- Jumper Wires

### Installation:
```bash
cd pi5_server

# For IMX500 Camera version
pip install -r requirements.txt
sudo python3 app_imx500.py
```

ดูรายละเอียดเพิ่มเติมใน:
- `pi5_server/README.md` - Basic setup
- `pi5_server/IMX500_SETUP.md` - IMX500 camera setup

## 🎨 Color Theme

- **Primary Green**: `#10b981` (Emerald)
- **Primary Yellow**: `#fbbf24` (Amber)
- **Dark Background**: `#0f172a` (Slate)
- **Card Background**: `#1e293b`

## 📱 Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ Requires webcam access for face detection

## 🔐 Security

- Firebase Security Rules configured
### Frontend:
- React 18
- Vite
- Three.js + React Three Fiber
- Framer Motion
- face-api.js
- TensorFlow.js
- ResponsiveVoice (TTS)

### Backend:
- Firebase (Firestore + Realtime DB + Hosting)
- OpenAI API (optional)

### IoT:
- Python Flask
- Raspberry Pi GPIO
- **Picamera2 + IMX500**
- OpenCV
- Firebase Admin SDKal)

### IoT:
- Python Flask
- Raspberry Pi GPIO
- Firebase Admin SDK

## 🎯 Use Cases

1. **วิทยาลัยเทคนิค** - ติดตั้งเป็น Kiosk แนะแนว
2. **งานแสดงการศึกษา** - ให้ข้อมูลแบบ Interactive
3. **ศูนย์ข้อมูลอาชีพ** - แนะนำอาชีพด้วย AI
4. **โรงเรียน** - ให้คำปรึกษาการเรียนต่อ

## 🤝 Contributing

ยินดีรับ Pull Requests และ Issues!

## 📄 License

MIT License

## 👨‍💻 Developer

Made with ❤️ for College Career Guidance

---

## 🆘 Support

หากมีปัญหาการใช้งาน:
1. ตรวจสอบ Console ในเบราว์เซอร์
2. ดู Firebase logs
3. ตรวจสอบ camera permissions
4. อ่าน README ใน pi5_server/ สำหรับ IoT

**Happy Coding! 🚀**
