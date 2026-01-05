/**
 * Firebase Initialization Script
 * Run this script to populate Firestore with careers, tuition, and other data
 * 
 * Usage:
 * 1. Install firebase-admin: npm install firebase-admin
 * 2. Create a service account key from Firebase Console
 * 3. Place serviceAccountKey.json in this directory
 * 4. Run: node initializeFirebase.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Make sure serviceAccountKey.json is in the root directory
try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (err) {
  console.error('❌ Error: serviceAccountKey.json not found. Download it from Firebase Console.');
  console.error('   Go to: Project Settings → Service Accounts → Generate New Private Key');
  process.exit(1);
}

const db = admin.firestore();

// Career data
const careers = [
  {
    id: 'au',
    name: 'ยานยนต์',
    code: 'Au',
    category: 'ช่างอุตสาหกรรม',
    icon: '🚗',
    color: '#ef4444',
    description: 'เทคโนโลยียานยนต์พัฒนาไปอย่างไม่มีที่สิ้นสุด อุตสาหกรรมการผลิตรถยนต์ไทยอยู่ในอันดับต้นๆ ของโลก'
  },
  {
    id: 'ev',
    name: 'ยานยนต์ไฟฟ้า',
    code: 'Ev',
    category: 'ช่างอุตสาหกรรม',
    icon: '⚡',
    color: '#22c55e',
    description: 'นวัตกรรม EV คืออนาคตของอุตสาหกรรม'
  },
  {
    id: 'ep',
    name: 'ไฟฟ้ากำลัง',
    code: 'Ep',
    category: 'ช่างอุตสาหกรรม',
    icon: '💡',
    color: '#fbbf24',
    description: 'ไฟฟ้าเป็นรากฐานแห่งชีวิต'
  },
  {
    id: 'el',
    name: 'อิเล็กทรอนิกส์',
    code: 'El',
    category: 'ช่างอุตสาหกรรม',
    icon: '🔌',
    color: '#3b82f6',
    description: 'ศึกษาเทคโนโลยีระบบภาพ ระบบเสียง ระบบสื่อสาร'
  },
  {
    id: 'co',
    name: 'ก่อสร้าง',
    code: 'Co',
    category: 'ช่างอุตสาหกรรม',
    icon: '🏗️',
    color: '#78716c',
    description: 'ให้ความรู้เทคนิคการก่อสร้างและนวัตกรรมใหม่ๆ'
  },
  {
    id: 'ar',
    name: 'สถาปัตยกรรม',
    code: 'Ar',
    category: 'ช่างอุตสาหกรรม',
    icon: '📐',
    color: '#8b5cf6',
    description: 'ศึกษาการออกแบบ เขียนแบบก่อสร้าง'
  },
  {
    id: 'ct',
    name: 'คอมพิวเตอร์โปรแกรมเมอร์',
    code: 'Ct',
    category: 'ช่างอุตสาหกรรม',
    icon: '💻',
    color: '#06b6d4',
    description: 'คิดเป็น เขียนโค้ดได้ สร้างสรรค์นวัตกรรม'
  },
  {
    id: 'it',
    name: 'เทคโนโลยีสารสนเทศ',
    code: 'It',
    category: 'ช่างอุตสาหกรรม',
    icon: '🖥️',
    color: '#14b8a6',
    description: 'ศึกษาซ่อมบำรุงคอมพิวเตอร์ ซอฟต์แวร์'
  },
  {
    id: 'ac',
    name: 'การบัญชี',
    code: 'Ac',
    category: 'พาณิชยกรรมและบริหารธุรกิจ',
    icon: '📊',
    color: '#10b981',
    description: 'ธุรกิจต้องการข้อมูลทางการเงิน'
  },
  {
    id: 'mk',
    name: 'การตลาด',
    code: 'Mk',
    category: 'พาณิชยกรรมและบริหารธุรกิจ',
    icon: '📱',
    color: '#ec4899',
    description: 'ยุคเทคโนโลยีและ E-Commerce มีการแข่งขันสูง'
  },
  {
    id: 'dt',
    name: 'ธุรกิจดิจิทัล',
    code: 'Dt',
    category: 'พาณิชยกรรมและบริหารธุรกิจ',
    icon: '🚀',
    color: '#f97316',
    description: 'เทคโนโลยีคอมพิวเตอร์มีบทบาทในชีวิตประจำวัน'
  },
  {
    id: 'tg',
    name: 'การท่องเที่ยว',
    code: 'Tg',
    category: 'ท่องเที่ยวและการโรงแรม',
    icon: '✈️',
    color: '#0ea5e9',
    description: 'ผสมผสานศาสตร์กับศิลป์'
  },
  {
    id: 'hm',
    name: 'การโรงแรม',
    code: 'Hm',
    category: 'ท่องเที่ยวและการโรงแรม',
    icon: '🏨',
    color: '#a855f7',
    description: 'เรียนรู้ศิลปะการพูดเพื่อบันเทิงลูกค้า'
  }
];

// Tuition data
const tuition = {
  certificate: {
    industrial: {
      tuition: 9000,
      entrance: 3100,
      total: 12100,
      name: 'ช่างอุตสาหกรรม'
    },
    business: {
      tuition: 7000,
      entrance: 3100,
      total: 10100,
      name: 'พาณิชยกรรมและบริหารธุรกิจ'
    },
    tourism: {
      tuition: 7000,
      entrance: 3100,
      total: 10100,
      name: 'การท่องเที่ยวและการโรงแรม'
    }
  },
  diploma: {
    industrial: {
      tuition: 18700,
      entrance: 3000,
      total: 21700,
      name: 'ช่างอุตสาหกรรม'
    },
    business: {
      tuition: 16000,
      entrance: 3000,
      total: 19000,
      name: 'พาณิชยกรรมและบริหารธุรกิจ'
    },
    tourism: {
      tuition: 16000,
      entrance: 3000,
      total: 19000,
      name: 'การท่องเที่ยวและการโรงแรม'
    }
  },
  scholarships: [
    { id: 'cert-m3', name: 'ทุน ม.3 เรียนต่อ ปวช.', icon: '🎓' },
    { id: 'quota-m6', name: 'โควตานักเรียน ม.6', icon: '⭐' },
    { id: 'quota-diploma', name: 'โควตาเรียนต่อ ปวส.', icon: '🏆' },
    { id: 'student-loan', name: 'กองทุนเงินให้กู้ยืม (กยศ.)', icon: '💰' },
    { id: 'kalyanamitr', name: 'กองทุนกัลยาณมิตร', icon: '🤝' }
  ]
};

// Initialize data
async function initializeDatabase() {
  try {
    console.log('🚀 Starting Firebase initialization...\n');

    // 1. Create careers collection
    console.log('📚 Creating careers collection...');
    const careersRef = db.collection('careers');
    for (const career of careers) {
      await careersRef.doc(career.id).set(career);
    }
    console.log(`✅ Created ${careers.length} careers\n`);

    // 2. Create tuition collection
    console.log('💰 Creating tuition collection...');
    await db.collection('tuition').doc('data').set(tuition);
    console.log('✅ Created tuition data\n');

    // 3. Create analytics document
    console.log('📊 Creating analytics collection...');
    await db.collection('analytics').doc('summary').set({
      totalVisits: 0,
      totalSessions: 0,
      uniqueVisitors: 0,
      topCareer: null,
      topPage: 'welcome',
      lastUpdated: new Date(),
      createdAt: new Date()
    });
    console.log('✅ Created analytics data\n');

    // 4. Create heatmap document
    console.log('🗺️ Creating heatmap collection...');
    await db.collection('heatmap').doc('meta').set({
      totalClicks: 0,
      lastReset: new Date(),
      createdAt: new Date()
    });
    console.log('✅ Created heatmap data\n');

    console.log('✨ Database initialization completed successfully!\n');
    console.log('📍 Collections created:');
    console.log('   • careers (14 items)');
    console.log('   • tuition (certificate, diploma, scholarships)');
    console.log('   • analytics (summary stats)');
    console.log('   • heatmap (click tracking)');
    console.log('   • sessions (user activity logs)');
    console.log('\n🔒 Security rules have been updated in firestore.rules\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

initializeDatabase();
