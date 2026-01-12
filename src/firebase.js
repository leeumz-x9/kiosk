import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getDatabase, ref, set, onValue } from 'firebase/database';
import { firebaseConfig } from './config';

// Check if Firebase config is set (not placeholder)
const isFirebaseConfigured = firebaseConfig.apiKey && 
                             firebaseConfig.apiKey !== 'YOUR_API_KEY' && 
                             firebaseConfig.projectId && 
                             firebaseConfig.projectId !== 'YOUR_PROJECT_ID';

// Initialize Firebase only if properly configured
let app, db, rtdb;
let warningShown = false;

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
  console.warn('⚠️ Firebase not configured - using default configuration');
  warningShown = true;
}

export { db, rtdb };

// Heatmap functions
export const recordHeatmapClick = async (x, y, page) => {
  console.log('🎯 recordHeatmapClick called:', { x, y, page, hasDB: !!db, isConfigured: isFirebaseConfigured });
  
  if (!isFirebaseConfigured || !db) {
    console.warn('⚠️ Firebase not configured - skipping heatmap recording');
    return;
  }
  
  try {
    const docRef = await addDoc(collection(db, 'heatmap_clicks'), {
      x,
      y,
      category: page,
      timestamp: serverTimestamp()
    });
    console.log('✅ Heatmap click recorded:', { id: docRef.id, x, y, page });
  } catch (error) {
    console.error('❌ Error recording heatmap:', error);
  }
};

export const subscribeToHeatmap = (callback) => {
  if (!isFirebaseConfigured || !db) {
    return () => {};  // ไม่ต้อง log
  }
  const heatmapRef = collection(db, 'heatmap_clicks');
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
  console.log('💾 saveSession called:', { 
    hasDB: !!db, 
    isConfigured: isFirebaseConfigured,
    data: sessionData 
  });
  
  if (!isFirebaseConfigured || !db) {
    console.warn('⚠️ Firebase not configured - skipping session save');
    return;
  }
  
  try {
    const docRef = await addDoc(collection(db, 'face_scan_sessions'), {
      ...sessionData,
      timestamp: serverTimestamp(),
      faceDetected: true
    });
    console.log('✅ Session saved successfully:', docRef.id);
  } catch (error) {
    console.error('❌ Error saving session:', error);
  }
};
