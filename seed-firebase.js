/**
 * Seed Firebase with initial data
 * Run: node seed-firebase.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

// Import config
const firebaseConfig = {
  apiKey: "AIzaSyBD7qwPXdRdzdKTKE9XgT20g1dV7iH49Jo",
  authDomain: "smart-papr-kiosk.firebaseapp.com",
  projectId: "smart-papr-kiosk",
  storageBucket: "smart-papr-kiosk.firebasestorage.app",
  messagingSenderId: "139324926582",
  appId: "1:139324926582:web:98889c32aacc42ff634d57",
  databaseURL: "https://smart-papr-kiosk-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🔥 Connecting to Firebase...');

// Age Groups Data
const ageGroups = [
  {
    id: 'KIDS_3_12',
    name: 'เด็ก',
    ageMin: 3,
    ageMax: 12,
    emoji: '👶',
    color: '#FF6B6B',
    description: 'เนื้อหาสำหรับเด็กประถม'
  },
  {
    id: 'TEENS_13_17',
    name: 'วัยรุ่น',
    ageMin: 13,
    ageMax: 17,
    emoji: '🧒',
    color: '#4ECDC4',
    description: 'เนื้อหาสำหรับวัยรุ่นมัธยม'
  },
  {
    id: 'ADULTS_18_PLUS',
    name: 'ผู้ใหญ่',
    ageMin: 18,
    ageMax: 100,
    emoji: '👨',
    color: '#95E1D3',
    description: 'เนื้อหาสำหรับผู้ใหญ่และผู้ปกครอง'
  }
];

// Sample Content Items
const contentItems = [
  {
    id: 'scholarship-1',
    title: 'ทุนการศึกษาเด็กเก่ง',
    description: 'ทุนสำหรับนักเรียนที่มีผลการเรียนดี GPA 3.5 ขึ้นไป',
    type: 'scholarship',
    ageGroupId: 'TEENS_13_17',
    priority: 10,
    imageUrl: 'https://placehold.co/400x300/4ECDC4/FFFFFF/png?text=Scholarship',
    videoUrl: '',
    linkUrl: 'https://lannatech.ac.th/scholarship',
    tags: ['ทุน', 'การศึกษา', 'เด็กเก่ง'],
    isActive: true,
    viewCount: 0,
    clickCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'event-1',
    title: 'วันเปิดบ้านวิทยาลัย',
    description: 'ชมการสาธิตจากนักศึกษา พบอาจารย์ และทดลองเรียนจริง',
    type: 'event',
    ageGroupId: 'TEENS_13_17',
    priority: 9,
    imageUrl: 'https://placehold.co/400x300/FF6B6B/FFFFFF/png?text=Open+House',
    videoUrl: '',
    linkUrl: '',
    tags: ['กิจกรรม', 'open house'],
    isActive: true,
    viewCount: 0,
    clickCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'activity-1',
    title: 'ค่ายเด็กสนุกกับวิทยาศาสตร์',
    description: 'เรียนรู้วิทยาศาสตร์ผ่านการทดลองสนุกๆ',
    type: 'activity',
    ageGroupId: 'KIDS_3_12',
    priority: 8,
    imageUrl: 'https://placehold.co/400x300/95E1D3/FFFFFF/png?text=Science+Camp',
    videoUrl: '',
    linkUrl: '',
    tags: ['วิทยาศาสตร์', 'เด็ก', 'ค่าย'],
    isActive: true,
    viewCount: 0,
    clickCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'career-1',
    title: 'สาขาเทคโนโลยีสารสนเทศ',
    description: 'เรียนเขียนโปรแกรม พัฒนาเว็บไซต์ และแอปพลิเคชัน',
    type: 'career',
    ageGroupId: 'ADULTS_18_PLUS',
    priority: 10,
    imageUrl: 'https://placehold.co/400x300/667EEA/FFFFFF/png?text=IT',
    videoUrl: '',
    linkUrl: '',
    tags: ['IT', 'โปรแกรมมิ่ง', 'เทคโนโลยี'],
    isActive: true,
    viewCount: 0,
    clickCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedData() {
  try {
    console.log('📦 Seeding Age Groups...');
    for (const group of ageGroups) {
      const docRef = doc(db, 'age_groups', group.id);
      await setDoc(docRef, group);
      console.log(`✅ Added: ${group.name} (${group.id})`);
    }

    console.log('\n📦 Seeding Content Items...');
    for (const item of contentItems) {
      const docRef = doc(db, 'content_items', item.id);
      await setDoc(docRef, item);
      console.log(`✅ Added: ${item.title}`);
    }

    console.log('\n🎉 Seeding complete!');
    console.log('✨ You can now use the Admin Panel to manage data.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
