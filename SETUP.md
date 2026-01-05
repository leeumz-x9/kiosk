# วิธีการติดตั้งและใช้งาน 🚀

## ⚙️ ขั้นตอนการติดตั้งเบื้องต้น

### 1. ติดตั้ง Node.js และ npm
ตรวจสอบว่าติดตั้งแล้ว:
```bash
node --version
npm --version
```

ถ้ายังไม่มี ดาวน์โหลดจาก: https://nodejs.org/

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. ดาวน์โหลด Face Detection Models

**สำคัญมาก!** ต้องดาวน์โหลด models สำหรับ face-api.js

#### วิธีที่ 1: ดาวน์โหลดจาก GitHub
1. ไปที่: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
2. ดาวน์โหลดไฟล์ทั้งหมด:
   - `tiny_face_detector_model-weights_manifest.json`
   - `tiny_face_detector_model-shard1`
   - `face_landmark_68_model-weights_manifest.json`
   - `face_landmark_68_model-shard1`
   - `face_recognition_model-weights_manifest.json`
   - `face_recognition_model-shard1`
   - `face_expression_model-weights_manifest.json`
   - `face_expression_model-shard1`
   - `age_gender_model-weights_manifest.json`
   - `age_gender_model-shard1`

3. สร้างโฟลเดอร์ `public/models/`
4. วางไฟล์ทั้งหมดลงในโฟลเดอร์นี้

#### วิธีที่ 2: ใช้ Git Clone
```bash
git clone https://github.com/justadudewhohacks/face-api.js-models
cp -r face-api.js-models/weights/* public/models/
```

### 4. ตั้งค่า Firebase

#### 4.1 สร้าง Firebase Project
1. ไปที่: https://console.firebase.google.com/
2. คลิก "Add project"
3. ตั้งชื่อโปรเจกต์
4. Enable Google Analytics (optional)

#### 4.2 เปิดใช้งาน Services
- **Firestore Database**: เปิดใช้งานในโหมด Test
- **Realtime Database**: เปิดใช้งานในโหมด Test
- **Hosting**: เปิดใช้งาน

#### 4.3 ดึง Configuration
1. ไปที่ Project Settings
2. คัดลอก Firebase Config
3. แก้ไขไฟล์ `src/config.js`:

```javascript
export const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com"
};
```

#### 4.4 ติดตั้ง Firebase CLI
```bash
npm install -g firebase-tools
firebase login
firebase init
```

เลือก:
- ✅ Firestore
- ✅ Realtime Database
- ✅ Hosting

### 5. ตั้งค่า OpenAI (ถ้าต้องการ Avatar พูดคุย)

1. สมัครที่: https://platform.openai.com/
2. สร้าง API Key
3. เพิ่มใน `src/config.js`:

```javascript
export const OPENAI_API_KEY = "sk-XXXXXXXXXXXXXXXXXXXXXXXX";
```

**หมายเหตุ**: ใน production ควรใช้ Environment Variables

---

## 🎮 การรันโปรเจกต์

### Development Mode
```bash
npm run dev
```
เปิดเบราว์เซอร์: http://localhost:3000

### Build สำหรับ Production
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

### Deploy ไปยัง Firebase
```bash
npm run build
firebase deploy
```

---

## 🔌 ติดตั้ง IoT Server (Raspberry Pi 5)

### ขั้นตอนการติดตั้ง

#### 1. เตรียม Raspberry Pi
```bash
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install python3-pip python3-rpi.gpio
```

#### 2. ต่ออุปกรณ์

**LED Strip (WS2812B):**
- Data Pin → GPIO 18
- VCC → 5V
- GND → GND

**HC-SR04 Sensor:**
- VCC → 5V (Pin 2)
- TRIG → GPIO 23 (Pin 16)
- ECHO → GPIO 24 (Pin 18)
- GND → GND (Pin 6)

#### 3. ติดตั้ง Python Dependencies
```bash
cd pi5_server
pip3 install -r requirements.txt
```

#### 4. Setup Firebase Admin SDK
1. ไปที่ Firebase Console
2. Project Settings → Service Accounts
3. Generate New Private Key
4. บันทึกเป็น `firebase-credentials.json` ใน `pi5_server/`

#### 5. แก้ไข Config
แก้ไขใน `pi5_server/app.py`:
```python
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com'
})
```

#### 6. รัน Server
```bash
sudo python3 app.py
```

#### 7. ตั้งค่า Auto-start (Optional)
```bash
sudo nano /etc/systemd/system/kiosk-iot.service
```

เพิ่ม:
```ini
[Unit]
Description=College Kiosk IoT Server
After=network.target

[Service]
ExecStart=/usr/bin/python3 /home/pi/kiosk-promax/pi5_server/app.py
WorkingDirectory=/home/pi/kiosk-promax/pi5_server
Restart=always
User=root

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable kiosk-iot.service
sudo systemctl start kiosk-iot.service
```

---

## 🧪 ทดสอบการทำงาน

### 1. ทดสอบ Frontend
```bash
npm run dev
```
- เปิดกล้อง
- สแกนใบหน้า
- ดูสาขาวิชาที่แนะนำ
- คลิกพูดคุยกับ Avatar

### 2. ทดสอบ Firebase
- เปิด Firebase Console
- ตรวจสอบ Firestore → Collections
- ตรวจสอบ Realtime Database → Data

### 3. ทดสอบ Pi5 IoT
```bash
curl http://YOUR_PI5_IP:5000/api/status
```

Response ที่คาดหวัง:
```json
{
  "led_status": false,
  "user_present": false,
  "timestamp": 1703234567890
}
```

---

## ⚠️ Troubleshooting

### ❌ ปัญหา: Face Detection ไม่ทำงาน
**วิธีแก้:**
1. ตรวจสอบว่าดาวน์โหลด models ครบ
2. เช็คว่าเบราว์เซอร์อนุญาตกล้อง
3. ลองใช้ Chrome/Edge แทน Firefox

### ❌ ปัญหา: Firebase Connection Error
**วิธีแก้:**
1. ตรวจสอบ `firebaseConfig` ใน `config.js`
2. เช็คว่า Firebase project เปิดใช้งานแล้ว
3. ตรวจสอบ Network tab ในเบราว์เซอร์

### ❌ ปัญหา: Pi5 LED ไม่ติด
**วิธีแก้:**
1. ตรวจสอบการต่อสาย GPIO
2. ลองรันด้วย `sudo`
3. เช็ค `gpio readall` เพื่อดู pin status

### ❌ ปัญหา: Avatar ไม่พูด
**วิธีแก้:**
1. ตรวจสอบ OpenAI API Key
2. ดู Console สำหรับ error messages
3. ตรวจสอบ API quota

---

## 📊 Monitoring

### ดู Logs ของ Web App
เปิด Browser DevTools (F12):
- **Console**: ดู JavaScript errors
- **Network**: ดู API calls
- **Application**: ดู localStorage และ IndexedDB

### ดู Logs ของ Pi5
```bash
journalctl -u kiosk-iot.service -f
```

### ดู Firebase Usage
Firebase Console → Usage and billing

---

## 🎯 เคล็ดลับการใช้งาน

1. **ปิด Camera** เมื่อไม่ใช้งานเพื่อประหยัด CPU
2. **ใช้ HTTPS** สำหรับ production เพื่อความปลอดภัย
3. **Backup Firebase** เป็นประจำ
4. **Monitor Pi5 Temperature** ด้วย `vcgencmd measure_temp`
5. **ใช้ Service Worker** สำหรับ offline support

---

## 🆘 ติดต่อ Support

หากติดปัญหา:
1. อ่าน README.md และ SETUP.md นี้ก่อน
2. ตรวจสอบ Console และ Logs
3. ลองค้นหาใน Google หรือ Stack Overflow
4. สร้าง Issue ใน GitHub repository

---

**สำเร็จ! 🎉 คุณพร้อมใช้งาน College Kiosk ProMax แล้ว**
