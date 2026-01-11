/**
 * Script to seed initial content data to Firestore
 * Run with: node seed-content.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // ต้อง download จาก Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ข้อมูลตัวอย่าง
const sampleContents = {
  kids: [
    {
      title: '🎨 ค่ายเด็กสร้างสรรค์',
      description: 'ค่ายวิทยาศาสตร์และเทคโนโลยีสำหรับน้องๆ อายุ 8-12 ปี เรียนรู้ผ่านการเล่นและสนุก!',
      type: 'event',
      ageGroupId: 'kids',
      priority: 8,
      tags: ['ค่าย', 'วิทยาศาสตร์', 'เด็ก', 'สนุก'],
      imageUrl: '',
      isActive: true,
      viewCount: 0,
      clickCount: 0,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    },
    {
      title: '🤖 เรียนรู้การเขียนโปรแกรม',
      description: 'เรียนเขียนโค้ดแบบสนุกๆ ผ่านเกมและการ์ตูน ด้วย Scratch และ Blockly',
      type: 'activity',
      ageGroupId: 'kids',
      priority: 7,
      tags: ['โปรแกรม', 'เกม', 'เด็ก', 'coding'],
      imageUrl: '',
      isActive: true,
      viewCount: 0,
      clickCount: 0,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    },
    {
      title: '🎮 แข่งขันหุ่นยนต์เด็ก',
      description: 'การแข่งขันหุ่นยนต์สำหรับเด็ก ประเภทต่างๆ ทดลองสร้างและควบคุมหุ่นยนต์',
      type: 'event',
      ageGroupId: 'kids',
      priority: 6,
      tags: ['หุ่นยนต์', 'แข่งขัน', 'เด็ก'],
      imageUrl: '',
      isActive: true,
      viewCount: 0,
      clickCount: 0,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    }
  ],
  teens: [
    {
      title: '🎓 ทุนการศึกษา 100%',
      description: 'รับสมัครทุนการศึกษาเต็มจำนวนสำหรับนักเรียนเก่ง GPA 3.5 ขึ้นไป ทุกสาขาวิชา',
      type: 'scholarship',
      ageGroupId: 'teens',
      priority: 10,
      tags: ['ทุน', 'การศึกษา', 'ฟรี', '100%'],
      imageUrl: '',
      isActive: true,
      viewCount: 0,
      clickCount: 0,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    },
    {
      title: '💻 14 สาขาวิชาที่เปิดสอน',
      description: 'เลือกสาขาที่ใช่ ตอบโจทย์อนาคต ทั้งช่างอุตสาหกรรม พาณิชยกรรม และการท่องเที่ยว',
      type: 'career',
      ageGroupId: 'teens',
      priority: 9,
      tags: ['สาขา', 'เรียน', 'อนาคต'],
      imageUrl: '',
      isActive: true,
      viewCount: 0,
      clickCount: 0,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    },
    {
      title: '🎉 โควตาพิเศษ ม.6',
      description: 'สมัครรอบโควตาคุ้มกว่า! ลดค่าเล่าเรียน พร้อมของแถมมากมาย สมัครเลย!',
      type: 'promotion',
      ageGroupId: 'teens',
      priority: 8,
      tags: ['โควตา', 'ม.6', 'ส่วนลด'],
      imageUrl: '',
      isActive: true,
      viewCount: 0,
      clickCount: 0,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    },
    {
      title: '⚽ กิจกรรมนักศึกษา',
      description: 'ชมรมกีฬา ดนตรี ศิลปะ และอีกมากมาย เรียนรู้นอกห้องเรียน พัฒนาตนเอง',
      type: 'activity',
      ageGroupId: 'teens',
      priority: 7,
      tags: ['กีฬา', 'ดนตรี', 'ชมรม'],
      imageUrl: '',
      isActive: true,
      viewCount: 0,
      clickCount: 0,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    },
    {
      title: '💰 ผ่อนชำระได้ 0%',
      description: 'ค่าเล่าเรียนผ่อนได้ ไม่มีดอกเบี้ย เริ่มต้นเพียงเดือนละ 3,000 บาท',
      type: 'promotion',
      ageGroupId: 'teens',
      priority: 8,
      tags: ['ผ่อน', 'ค่าเรียน', '0%'],
      imageUrl: '',
      isActive: true,
      viewCount: 0,
      clickCount: 0,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    },
    {
      title: '🏆 แข่งขันทักษะวิชาชีพ',
      description: 'ร่วมแข่งขันทักษะวิชาชีพระดับชาติ สะสมประสบการณ์ ได้ทุนเรียนต่อ',
      type: 'event',
      ageGroupId: 'teens',
      priority: 7,
      tags: ['แข่งขัน', 'ทักษะ', 'ทุน'],
      imageUrl: '',
      isActive: true,
      viewCount: 0,
      clickCount: 0,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    },
    {
      title: '🌟 Open House 2026',
      description: 'งานเปิดบ้านวิทยาลัย พบกับกิจกรรมมากมาย ชมผลงานนักศึกษา รับของที่ระลึก',
      type: 'event',
      ageGroupId: 'teens',
      priority: 9,
      tags: ['openhouse', 'กิจกรรม', 'ชมงาน'],
      imageUrl: '',
      isActive: true,
      viewCount: 0,
      clickCount: 0,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    },
    {
      title: '📱 กยศ. กู้ได้เต็มจำนวน',
      description: 'กองทุนเงินให้กู้ยืมเพื่อการศึกษา กู้ได้เต็มจำนวน ผ่อนชำระหลังจบ',
      type: 'scholarship',
      ageGroupId: 'teens',
      priority: 8,
      tags: ['กยศ', 'กู้ยืม', 'ผ่อน'],
      imageUrl: '',
      isActive: true,
      viewCount: 0,
      clickCount: 0,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    }
  ],
  adults: [
    {
      title: '📊 ROI การลงทุนการศึกษา',
      description: 'เปรียบเทียบค่าใช้จ่ายและผลตอบแทนจากการศึกษาวิชาชีพ คุ้มค่ากว่าที่คิด!',
      type: 'news',
      ageGroupId: 'adults',
      priority: 9,
      tags: ['ROI', 'การลงทุน', 'คุ้มค่า'],
      imageUrl: '',
      isActive: true,
      viewCount: 0,
      clickCount: 0,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    },
    {
      title: '💼 สถิติการมีงานทำ 95%',
      description: 'บัณฑิตของเรามีงานทำภายใน 6 เดือนหลังจบ อัตราเงินเดือนเริ่มต้น 15,000-25,000 บาท',
      type: 'news',
      ageGroupId: 'adults',
      priority: 8,
      tags: ['งาน', 'สถิติ', 'เงินเดือน'],
      imageUrl: '',
      isActive: true,
      viewCount: 0,
      clickCount: 0,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    },
    {
      title: '🎯 ความต้องการบุคลากรวิชาชีพ',
      description: 'ตลาดแรงงานขาดแคลนช่างฝีมือ โอกาสการทำงานสูง รายได้ดี',
      type: 'news',
      ageGroupId: 'adults',
      priority: 7,
      tags: ['ตลาดแรงงาน', 'โอกาส', 'ช่าง'],
      imageUrl: '',
      isActive: true,
      viewCount: 0,
      clickCount: 0,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    },
    {
      title: '💰 เปรียบเทียบค่าใช้จ่าย',
      description: 'ค่าใช้จ่ายการศึกษาวิชาชีพ เทียบกับมหาวิทยาลัย ประหยัดกว่าถึง 50%',
      type: 'news',
      ageGroupId: 'adults',
      priority: 7,
      tags: ['ค่าใช้จ่าย', 'เปรียบเทียบ', 'ประหยัด'],
      imageUrl: '',
      isActive: true,
      viewCount: 0,
      clickCount: 0,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    }
  ]
};

// Content Types
const contentTypes = [
  { id: 'scholarship', name: 'ทุนการศึกษา', icon: '🎓', color: '#10b981' },
  { id: 'news', name: 'ข่าวสาร', icon: '📰', color: '#3b82f6' },
  { id: 'event', name: 'กิจกรรม', icon: '🎉', color: '#f59e0b' },
  { id: 'promotion', name: 'โปรโมชั่น', icon: '🎁', color: '#ef4444' },
  { id: 'career', name: 'สาขาวิชา', icon: '💼', color: '#8b5cf6' },
  { id: 'activity', name: 'กิจกรรมนักศึกษา', icon: '⚽', color: '#ec4899' }
];

// Age Groups
const ageGroups = [
  { id: 'kids', name: 'วัยเด็ก', ageMin: 3, ageMax: 12, description: 'เนื้อหาสำหรับเด็ก', emoji: '👶' },
  { id: 'teens', name: 'วัยรุ่น', ageMin: 13, ageMax: 21, description: 'เนื้อหาสำหรับวัยรุ่น', emoji: '🎓' },
  { id: 'adults', name: 'วัยทำงาน', ageMin: 22, ageMax: 100, description: 'เนื้อหาสำหรับผู้ปกครอง', emoji: '👨‍💼' }
];

async function seedData() {
  try {
    console.log('🌱 Starting to seed data...\n');

    // Seed Content Items
    console.log('📝 Seeding content items...');
    let totalItems = 0;
    
    for (const [ageGroup, contents] of Object.entries(sampleContents)) {
      console.log(`  → Adding ${contents.length} items for ${ageGroup}...`);
      
      for (const content of contents) {
        await db.collection('content_items').add(content);
        totalItems++;
      }
    }
    console.log(`✅ Added ${totalItems} content items\n`);

    // Seed Content Types
    console.log('🏷️  Seeding content types...');
    for (const type of contentTypes) {
      await db.collection('content_types').doc(type.id).set(type);
    }
    console.log(`✅ Added ${contentTypes.length} content types\n`);

    // Seed Age Groups
    console.log('👥 Seeding age groups...');
    for (const group of ageGroups) {
      await db.collection('age_groups').doc(group.id).set(group);
    }
    console.log(`✅ Added ${ageGroups.length} age groups\n`);

    console.log('🎉 All done! Data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Content Items: ${totalItems}`);
    console.log(`   - Content Types: ${contentTypes.length}`);
    console.log(`   - Age Groups: ${ageGroups.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    process.exit();
  }
}

seedData();
