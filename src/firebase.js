import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getDatabase, ref, set, onValue } from 'firebase/database';
import { firebaseConfig } from './config';

// Check if Firebase config is set (not placeholder)
const isFirebaseConfigured = firebaseConfig.projectId !== 'YOUR_PROJECT_ID';

// Initialize Firebase only if properly configured
let app, db, rtdb;
let warningShown = false;  // ตัวแปรติดตามการแสดง warning ซ้ำ

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    rtdb = getDatabase(app);
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.warn('⚠️ Firebase initialization failed:', error.message);
  }
} else {
  // Firebase ใช้ placeholder config - features disabled (ไม่แสดง warning)
  warningShown = true;
}

export { db, rtdb };

// Heatmap functions
export const recordHeatmapClick = async (x, y, page) => {
  if (!isFirebaseConfigured || !db) {
    return;  // เงียบๆ skip ไม่ต้อง log
  }
  try {
    await addDoc(collection(db, 'heatmap'), {
      x,
      y,
      page,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error recording heatmap:', error);
  }
};

export const subscribeToHeatmap = (callback) => {
  if (!isFirebaseConfigured || !db) {
    return () => {};  // ไม่ต้อง log
  }
  const heatmapRef = collection(db, 'heatmap');
  return onSnapshot(heatmapRef, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(data);
  });
};

// IoT LED Control
export const updateLedStatus = async (status) => {
  if (!isFirebaseConfigured || !rtdb) {
    return;  // เงียบๆ skip
  }
  try {
    await set(ref(rtdb, 'led_status'), {
      enabled: status,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error updating LED status:', error);
  }
};

export const subscribeToPresence = (callback) => {
  if (!isFirebaseConfigured || !rtdb) {
    return () => {};  // ไม่ต้อง log
  }
  const presenceRef = ref(rtdb, 'presence');
  return onValue(presenceRef, (snapshot) => {
    callback(snapshot.val());
  });
};

// Save user session
export const saveSession = async (sessionData) => {
  if (!isFirebaseConfigured || !db) {
    return;  // เงียบๆ skip
  }
  try {
    await addDoc(collection(db, 'sessions'), {
      ...sessionData,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error saving session:', error);
  }
};
