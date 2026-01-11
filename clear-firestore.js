// Clear old Firestore data to save quota
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBD7qwPXdRdzdKTKE9XgT20g1dV7iH49Jo",
  authDomain: "smart-papr-kiosk.firebaseapp.com",
  projectId: "smart-papr-kiosk",
  storageBucket: "smart-papr-kiosk.firebasestorage.app",
  messagingSenderId: "139324926582",
  appId: "1:139324926582:web:98889c32aacc42ff634d57"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const collectionsToClean = [
  'heatmap',
  'heatmap_clicks',
  'face_scan_sessions',
  'user_sessions',
  'scan_logs',
  'conversion_steps',
  'sessions'
];

async function clearCollection(collectionName) {
  console.log(`🗑️  Clearing ${collectionName}...`);
  const snapshot = await getDocs(collection(db, collectionName));
  
  let count = 0;
  const deletePromises = [];
  
  snapshot.docs.forEach((document) => {
    deletePromises.push(deleteDoc(doc(db, collectionName, document.id)));
    count++;
  });
  
  await Promise.all(deletePromises);
  console.log(`✅ Deleted ${count} documents from ${collectionName}`);
  return count;
}

async function clearAllData() {
  console.log('🚀 Starting Firestore cleanup...\n');
  
  let totalDeleted = 0;
  
  for (const collectionName of collectionsToClean) {
    try {
      const deleted = await clearCollection(collectionName);
      totalDeleted += deleted;
    } catch (error) {
      console.log(`⚠️  ${collectionName}: ${error.message}`);
    }
  }
  
  console.log(`\n✨ Cleanup complete! Deleted ${totalDeleted} total documents`);
  console.log('💡 Quota should be freed up now');
  process.exit(0);
}

clearAllData().catch(console.error);
