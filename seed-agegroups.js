// Script to seed initial age groups to Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';

// Your Firebase configuration from src/config.js
const firebaseConfig = {
  apiKey: "AIzaSyDI8v5Ku9TWjpYw-8t7AwzmjGS5xhvCpnw",
  authDomain: "smart-papr-kiosk.firebaseapp.com",
  projectId: "smart-papr-kiosk",
  storageBucket: "smart-papr-kiosk.firebasestorage.app",
  messagingSenderId: "473933068695",
  appId: "1:473933068695:web:7f879bece5b8b26b4cd89b",
  measurementId: "G-YLXKQ66V6R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const defaultAgeGroups = [
  {
    id: 'KIDS_3_12',
    name: 'เด็ก',
    emoji: '👶',
    ageMin: 3,
    ageMax: 12,
    description: 'กลุ่มเด็กและเยาวชน อายุ 3-12 ปี',
    priority: 1,
    createdAt: new Date()
  },
  {
    id: 'TEENS_13_17',
    name: 'วัยรุ่น',
    emoji: '🧒',
    ageMin: 13,
    ageMax: 17,
    description: 'กลุ่มวัยรุ่น นักเรียน ม.ต้น-ม.ปลาย',
    priority: 2,
    createdAt: new Date()
  },
  {
    id: 'ADULTS_18_PLUS',
    name: 'ผู้ใหญ่',
    emoji: '👨',
    ageMin: 18,
    ageMax: 100,
    description: 'กลุ่มผู้ใหญ่และนักศึกษา อายุ 18 ปีขึ้นไป',
    priority: 3,
    createdAt: new Date()
  }
];

async function seedAgeGroups() {
  try {
    console.log('🔥 Starting to seed age groups...');
    
    // Check if age groups already exist
    const ageGroupsRef = collection(db, 'age_groups');
    const snapshot = await getDocs(ageGroupsRef);
    
    if (!snapshot.empty) {
      console.log('⚠️  Age groups already exist in database!');
      console.log(`📊 Found ${snapshot.size} existing age groups:`);
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.emoji} ${data.name} (${data.ageMin}-${data.ageMax} ปี)`);
      });
      
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      return new Promise((resolve) => {
        rl.question('\n❓ Do you want to overwrite them? (yes/no): ', async (answer) => {
          rl.close();
          
          if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
            await addAgeGroups();
            resolve();
          } else {
            console.log('✅ Keeping existing age groups. Exiting...');
            resolve();
          }
        });
      });
    } else {
      await addAgeGroups();
    }
    
  } catch (error) {
    console.error('❌ Error seeding age groups:', error);
    process.exit(1);
  }
}

async function addAgeGroups() {
  console.log('\n📝 Adding age groups to Firebase...\n');
  
  for (const ageGroup of defaultAgeGroups) {
    try {
      const docRef = doc(db, 'age_groups', ageGroup.id);
      await setDoc(docRef, ageGroup);
      console.log(`✅ Added: ${ageGroup.emoji} ${ageGroup.name} (${ageGroup.ageMin}-${ageGroup.ageMax} ปี)`);
    } catch (error) {
      console.error(`❌ Error adding ${ageGroup.name}:`, error);
    }
  }
  
  console.log('\n🎉 Successfully seeded all age groups!');
  console.log('\n📋 Summary:');
  console.log('   Total age groups added: ' + defaultAgeGroups.length);
  console.log('\n💡 Next steps:');
  console.log('   1. Go to Admin Panel → "จัดการเนื้อหา"');
  console.log('   2. Add content and select age group');
  console.log('   3. Test face detection to see personalized content!');
}

// Run the seeder
seedAgeGroups()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
