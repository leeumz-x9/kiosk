// Force replace with generations (no prompt)
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';

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

async function replaceWithGenerations() {
  try {
    console.log('🔥 Replacing age groups with generations...\n');
    
    const ageGroupsRef = collection(db, 'age_groups');
    const snapshot = await getDocs(ageGroupsRef);
    
    // Delete all existing
    if (!snapshot.empty) {
      console.log('🗑️  Deleting old groups...');
      for (const docSnap of snapshot.docs) {
        await deleteDoc(docSnap.ref);
        console.log(`   ✅ Deleted: ${docSnap.data().name}`);
      }
      console.log('');
    }
    
    // Add generations
    console.log('📝 Adding generations...\n');
    for (const gen of generations) {
      const docRef = doc(db, 'age_groups', gen.id);
      await setDoc(docRef, gen);
      console.log(`✅ ${gen.emoji} ${gen.name} (${gen.ageMin}-${gen.ageMax} ปี)`);
    }
    
    console.log('\n🎉 Successfully replaced with generations!');
    console.log('\n📋 All Generations:');
    console.log('   👶 Gen Alpha: 0-15 ปี (เกิด 2010-2025)');
    console.log('   🧒 Gen Z: 16-29 ปี (เกิด 1997-2009)');
    console.log('   👨 Gen Y: 30-45 ปี (เกิด 1981-1996)');
    console.log('   👔 Gen X: 46-61 ปี (เกิด 1965-1980)');
    console.log('   👴 Baby Boomers: 62+ ปี (เกิด 1946-1964)');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

replaceWithGenerations()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal:', error);
    process.exit(1);
  });
