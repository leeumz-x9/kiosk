# Firebase Setup Guide

## 🔥 Firebase Configuration

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name: `kiosk-promax`
4. Enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Register Web App

1. In Firebase console, click "Web" icon (</>) 
2. App nickname: `Kiosk Web App`
3. Check "Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the `firebaseConfig` object

### Step 3: Update Configuration

Edit `src/config.js`:

```javascript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com"
};
```

### Step 4: Enable Services

#### Firestore Database
1. Go to "Build" > "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select region (asia-southeast1 recommended)
5. Click "Enable"

#### Realtime Database
1. Go to "Build" > "Realtime Database"
2. Click "Create Database"
3. Choose "Start in test mode"
4. Click "Enable"

### Step 5: Security Rules

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Sessions collection
    match /sessions/{sessionId} {
      allow write: if request.time < timestamp.date(2026, 12, 31);
      allow read: if true;
    }
    
    // Heatmap collection
    match /heatmap/{heatmapId} {
      allow write: if request.time < timestamp.date(2026, 12, 31);
      allow read: if true;
    }
    
    // Careers collection
    match /careers/{careerId} {
      allow read: if true;
      allow write: if false; // Admin only
    }
  }
}
```

#### Realtime Database Rules
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

### Step 6: Deploy (Optional)

If using Firebase Hosting:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init

# Select:
# - Hosting
# - Firestore
# - Realtime Database

# Build
npm run build

# Deploy
firebase deploy
```

## 📊 Data Collections

### sessions
```javascript
{
  sessionId: "pi5_1234567890",
  type: "face_scan_pi5",
  demographics: {
    age: 21,
    gender: "male",
    emotion: "happy"
  },
  interests: ["engineering", "tech"],
  device: "pi5_imx500",
  timestamp: "2026-01-08T13:00:00.000Z"
}
```

### heatmap
```javascript
{
  x: 500,
  y: 300,
  page: "career-cards",
  timestamp: "2026-01-08T13:00:00.000Z"
}
```

## 🔒 Environment Variables

Create `.env.local`:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Then update `config.js`:

```javascript
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ...
};
```

## ✅ Testing

Test Firebase connection:

```javascript
import { db, rtdb } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

// Test Firestore
const testFirestore = async () => {
  await addDoc(collection(db, 'test'), {
    message: 'Hello Firebase!',
    timestamp: new Date()
  });
  console.log('✅ Firestore working!');
};

testFirestore();
```

## 🚀 Production Checklist

- [ ] Update security rules to production mode
- [ ] Enable billing alerts
- [ ] Set up backup schedule
- [ ] Configure indexes for queries
- [ ] Enable authentication (if needed)
- [ ] Set up monitoring and alerts

---

**Note**: Current config uses placeholder values. Firebase features are optional and the app works without it!
