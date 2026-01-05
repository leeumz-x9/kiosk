import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getDatabase, ref, set, onValue } from 'firebase/database';
import { firebaseConfig } from './config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

// Heatmap functions
export const recordHeatmapClick = async (x, y, page) => {
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
  const presenceRef = ref(rtdb, 'presence');
  return onValue(presenceRef, (snapshot) => {
    callback(snapshot.val());
  });
};

// Save user session
export const saveSession = async (sessionData) => {
  try {
    await addDoc(collection(db, 'sessions'), {
      ...sessionData,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error saving session:', error);
  }
};
