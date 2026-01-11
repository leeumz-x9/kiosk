// Script to seed Generation-based age groups
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDI8v5Ku9TWjpYw-8t7AwzmjGS5xhvCpnw",
  authDomain: "smart-papr-kiosk.firebaseapp.com",
  projectId: "smart-papr-kiosk",
  storageBucket: "smart-papr-kiosk.firebasestorage.app",
  messagingSenderId: "473933068695",
  appId: "1:473933068695:web:7f879bece5b8b26b4cd89b",
  measurementId: "G-YLXKQ66V6R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const generations = [
  {
    id: 'GEN_ALPHA',
    name: 'Gen Alpha',
    emoji: '👶',
    ageMin: 0,
    ageMax: 15,
    birthYears: '2010-2025',
    description: 'เจเนอเรชันอัลฟ่า - คนรุ่นดิจิทัลเนทีฟ',
    priority: 1,
    createdAt: new Date()
  },
  {
    id: 'GEN_Z',
    name: 'Gen Z',
    emoji: '🧒',
    ageMin: 16,
    ageMax: 29,
    birthYears: '1997-2009',
    description: 'เจเนอเรชันซี - คนรุ่นโซเชียลมีเดีย',
    priority: 2,
    createdAt: new Date()
  },
  {
    id: 'GEN_Y',
    name: 'Gen Y (Millennials)',
    emoji: '👨',
    ageMin: 30,
    ageMax: 45,
    birthYears: '1981-1996',
    description: 'เจเนอเรชันวาย/มิลเลนเนียล - คนรุ่นอินเทอร์เน็ต',
    priority: 3,
    createdAt: new Date()
  },
  {
    id: 'GEN_X',
    name: 'Gen X',
    emoji: '👔',
    ageMin: 46,
    ageMax: 61,
    birthYears: '1965-1980',
    description: 'เจเนอเรชันเอ็กซ์ - คนรุ่นทำงาน',
    priority: 4,
    createdAt: new Date()
  },
  {
    id: 'BABY_BOOMERS',
    name: 'Baby Boomers',
    emoji: '👴',
    ageMin: 62,
    ageMax: 100,
    birthYears: '1946-1964',
    description: 'เบบี้บูมเมอร์ - คนรุ่นผู้สูงอายุ',
    priority: 5,
    createdAt: new Date()
  }
];

async function seedGenerations() {
  try {
    console.log('🔥 Starting to seed generation-based age groups...\n');
    
    const ageGroupsRef = collection(db, 'age_groups');
    const snapshot = await getDocs(ageGroupsRef);
    
    if (!snapshot.empty) {
      console.log('⚠️  Age groups already exist!');
      console.log(`📊 Found ${snapshot.size} existing groups:\n`);
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   ${data.emoji} ${data.name} (${data.ageMin}-${data.ageMax} ปี)`);
      });
      
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      return new Promise((resolve) => {
        rl.question('\n❓ Replace with generations? (yes/no): ', async (answer) => {
          rl.close();
          
          if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
            // Delete old groups
            console.log('\n🗑️  Deleting old age groups...');
            for (const doc of snapshot.docs) {
              await doc.ref.delete();
              console.log(`   ✅ Deleted: ${doc.data().name}`);
            }
            await addGenerations();
            resolve();
          } else {
            console.log('✅ Keeping existing groups. Exiting...');
            resolve();
          }
        });
      });
    } else {
      await addGenerations();
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

async function addGenerations() {
  console.log('\n📝 Adding generation-based groups...\n');
  
  for (const gen of generations) {
    try {
      const docRef = doc(db, 'age_groups', gen.id);
      await setDoc(docRef, gen);
      console.log(`✅ ${gen.emoji} ${gen.name}`);
      console.log(`   อายุ: ${gen.ageMin}-${gen.ageMax} ปี (เกิด ${gen.birthYears})`);
    } catch (error) {
      console.error(`❌ Error adding ${gen.name}:`, error);
    }
  }
  
  console.log('\n🎉 Done! Added all generations');
  console.log('\n📋 Summary:');
  console.log('   👶 Gen Alpha: 0-15 ปี');
  console.log('   🧒 Gen Z: 16-29 ปี');
  console.log('   👨 Gen Y: 30-45 ปี');
  console.log('   👔 Gen X: 46-61 ปี');
  console.log('   👴 Baby Boomers: 62+ ปี');
}

seedGenerations()
  .then(() => {
    console.log('\n✨ Complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
