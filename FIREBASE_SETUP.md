# 🔥 Firebase Setup Guide

## ✅ สิ่งที่ทำงานได้แล้ว (ไม่ต้อง Firebase)
- ✅ Pi5 Camera IMX500 face detection
- ✅ ResponsiveVoice TTS (เสียงพูด)
- ✅ Web interface
- ✅ Age/Gender/Emotion detection

## 📝 การตั้งค่า Firebase (ถ้าต้องการเก็บข้อมูล)

### 1. สร้าง Firebase Project
1. ไปที่ https://console.firebase.google.com
2. คลิก "Add project" หรือ "Create project"
3. ตั้งชื่อ project เช่น "kiosk-promax"
4. เปิด Google Analytics (optional)
5. คลิก "Create project"

### 2. เพิ่ม Web App
1. ใน Project Overview คลิก </> (Web icon)
2. ตั้งชื่อ app: "Kiosk Web"
3. คลิก "Register app"
4. **คัดลอก config object**:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc123",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com"
};
```

### 3. เปิดใช้ Firestore Database
1. ไปที่ **Build** > **Firestore Database**
2. คลิก "Create database"
3. เลือก Location: `asia-southeast1` (Singapore)
4. เริ่มด้วย **Production mode** หรือ **Test mode**

**Firestore Rules (สำหรับ production):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Sessions collection
    match /sessions/{sessionId} {
      allow write: if true; // Allow kiosk to write
      allow read: if false; // Read only for admin
    }
    
    // Heatmap collection
    match /heatmap/{docId} {
      allow write: if true;
      allow read: if request.auth != null; // Require auth
    }
    
    // Conversions collection
    match /conversions/{docId} {
      allow write: if true;
      allow read: if request.auth != null;
    }
  }
}
```

### 4. เปิดใช้ Realtime Database
1. ไปที่ **Build** > **Realtime Database**
2. คลิก "Create Database"
3. เลือก Location: `asia-southeast1`
4. เริ่มด้วย **Locked mode**

**Realtime Database Rules:**
```json
{
  "rules": {
    "led_status": {
      ".read": true,
      ".write": true
    },
    "presence": {
      ".read": true,
      ".write": true
    }
  }
}
```

### 5. อัพเดท config.js
แก้ไขไฟล์ `/src/config.js`:

```javascript
// Firebase Configuration
export const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",           // <-- ใส่ของจริง
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",             // <-- ใส่ของจริง
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc123",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com"  // <-- ใส่ของจริง
};
```

### 6. รีสตาร์ท Web Server
```bash
cd "/home/admin/Desktop/kiosk promax/kiosk"
pkill -f vite
npm run dev
```

## 📊 ข้อมูลที่เก็บใน Firebase

### 1. **sessions** collection
เก็บข้อมูลการใช้งานแต่ละครั้ง:
```json
{
  "sessionId": "pi5_1736352000000",
  "type": "face_scan_pi5",
  "demographics": {
    "age": 25,
    "gender": "female",
    "emotion": "happy"
  },
  "interests": ["it", "mk", "ev"],
  "device": "pi5_imx500",
  "timestamp": "2026-01-08T11:00:00Z"
}
```

### 2. **conversions** collection
เก็บขั้นตอนการใช้งาน:
```json
{
  "step": "scanned",
  "sessionId": "pi5_1736352000000",
  "age": 25,
  "gender": "female",
  "emotion": "happy",
  "source": "pi5_camera",
  "timestamp": "2026-01-08T11:00:00Z"
}
```

### 3. **heatmap** collection
เก็บตำแหน่งที่ผู้ใช้คลิก:
```json
{
  "x": 100,
  "y": 200,
  "page": "face-scan",
  "timestamp": "2026-01-08T11:00:00Z"
}
```

## 🔍 ตรวจสอบข้อมูล

### ใน Firebase Console:
1. ไปที่ **Firestore Database**
2. เลือก collection `sessions` หรือ `conversions`
3. ดูข้อมูลที่เก็บ

### ใน Browser Console:
```javascript
// เช็คว่า Firebase ทำงานหรือไม่
console.log('Firebase configured:', db !== undefined);
```

## ❌ ปิด Firebase (ไม่ใช้)

ถ้าไม่ต้องการใช้ Firebase เลย ให้แก้ `src/config.js`:

```javascript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",  // เก็บเป็น placeholder ไว้
  // ...
};
```

**หมายเหตุ:** ระบบจะทำงานปกติ แต่ข้อมูลจะไม่ถูกเก็บ

## 🎯 สรุป

### ถ้ามี Firebase:
- ✅ เก็บข้อมูลผู้ใช้
- ✅ วิเคราะห์ heatmap
- ✅ ดูสถิติการใช้งาน
- ✅ ควบคุม LED ผ่าน Realtime DB

### ถ้าไม่มี Firebase:
- ✅ Face detection ทำงานปกติ
- ✅ Voice ทำงานปกติ
- ✅ UI ทำงานปกติ
- ❌ ไม่เก็บข้อมูล

---

**ตอนนี้ระบบพร้อมใช้งาน!** 🎉
