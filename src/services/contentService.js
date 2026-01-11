/**
 * Content Management Service
 * จัดการเนื้อหาที่แสดงตามช่วงอายุ
 */

import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  updateDoc,
  doc,
  increment
} from 'firebase/firestore';

// Cache สำหรับ age groups เพื่อไม่ต้อง query ซ้ำ
let ageGroupsCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 นาที

// ===== GET AGE GROUPS FROM FIREBASE =====
export const getAgeGroups = async () => {
  try {
    // ถ้ามี cache และยังไม่หมดอายุ ใช้ cache
    const now = Date.now();
    if (ageGroupsCache && (now - lastFetchTime) < CACHE_DURATION) {
      return ageGroupsCache;
    }

    console.log('📥 Fetching age groups from Firebase...');
    const ageGroupsRef = collection(db, 'age_groups');
    const snapshot = await getDocs(ageGroupsRef);
    
    if (snapshot.empty) {
      console.warn('⚠️ No age groups found in Firebase, using fallback');
      return getFallbackAgeGroups();
    }

    const groups = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));

    // Sort by ageMin
    groups.sort((a, b) => a.ageMin - b.ageMin);

    // Update cache
    ageGroupsCache = groups;
    lastFetchTime = now;

    console.log(`✅ Loaded ${groups.length} age groups`);
    return groups;

  } catch (error) {
    console.error('❌ Error fetching age groups:', error);
    return getFallbackAgeGroups();
  }
};

// ===== FIND AGE GROUP FOR SPECIFIC AGE =====
export const findAgeGroup = async (age) => {
  const ageGroups = await getAgeGroups();
  
  // หาช่วงอายุที่ตรงกับ age
  const matchedGroup = ageGroups.find(group => 
    age >= group.ageMin && age <= group.ageMax
  );

  if (matchedGroup) {
    console.log(`🎯 Age ${age} matches group: ${matchedGroup.name} (${matchedGroup.id})`);
    return matchedGroup;
  }

  // ถ้าไม่เจอ ใช้ default group (อายุสูงสุด)
  const defaultGroup = ageGroups[ageGroups.length - 1];
  console.warn(`⚠️ Age ${age} not matched, using default: ${defaultGroup.name}`);
  return defaultGroup;
};

// ===== GET CONTENT BY AGE (DYNAMIC) =====
export const getContentByAge = async (age, limitCount = 20) => {
  try {
    // หาช่วงอายุที่ตรงกับ age
    const ageGroup = await findAgeGroup(age);
    
    if (!ageGroup) {
      console.error('❌ No age group found');
      return getFallbackContent(age);
    }

    console.log(`📚 Fetching content for age ${age} (${ageGroup.name} - ${ageGroup.id})`);

    const contentRef = collection(db, 'content_items');
    const q = query(
      contentRef,
      where('ageGroupId', '==', ageGroup.id),
      where('isActive', '==', true),
      orderBy('priority', 'desc'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const contents = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));

    console.log(`✅ Found ${contents.length} content items for ${ageGroup.name}`);
    return contents;

  } catch (error) {
    console.error('❌ Error fetching content:', error);
    return getFallbackContent(age);
  }
};

// ===== GET CONTENT BY TYPE =====
export const getContentByType = async (type, ageGroupId = null, limitCount = 10) => {
  try {
    const contentRef = collection(db, 'content_items');
    
    let q;
    if (ageGroupId) {
      q = query(
        contentRef,
        where('type', '==', type),
        where('ageGroupId', '==', ageGroupId),
        where('isActive', '==', true),
        orderBy('priority', 'desc'),
        limit(limitCount)
      );
    } else {
      q = query(
        contentRef,
        where('type', '==', type),
        where('isActive', '==', true),
        orderBy('priority', 'desc'),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  } catch (error) {
    console.error('❌ Error fetching content by type:', error);
    return [];
  }
};

// ===== LOG CONTENT VIEW =====
export const logContentView = async (contentId, sessionData) => {
  try {
    // Update view count
    const contentRef = doc(db, 'content_items', contentId);
    await updateDoc(contentRef, {
      viewCount: increment(1)
    });

    // Log interaction
    const interactionRef = collection(db, 'user_interactions');
    await addDoc(interactionRef, {
      ...sessionData,
      contentId,
      action: 'view',
      timestamp: new Date()
    });

    console.log(`👁️ Logged view for content: ${contentId}`);
  } catch (error) {
    console.error('❌ Error logging view:', error);
  }
};

// ===== LOG CONTENT CLICK =====
export const logContentClick = async (contentId, sessionData) => {
  try {
    // Update click count
    const contentRef = doc(db, 'content_items', contentId);
    await updateDoc(contentRef, {
      clickCount: increment(1)
    });

    // Log interaction
    const interactionRef = collection(db, 'user_interactions');
    await addDoc(interactionRef, {
      ...sessionData,
      contentId,
      action: 'click',
      timestamp: new Date()
    });

    console.log(`🖱️ Logged click for content: ${contentId}`);
  } catch (error) {
    console.error('❌ Error logging click:', error);
  }
};

// ===== FALLBACK AGE GROUPS =====
const getFallbackAgeGroups = () => {
  return [
    { 
      id: 'kids', 
      name: 'วัยเด็ก', 
      ageMin: 3, 
      ageMax: 12, 
      description: 'เนื้อหาสำหรับเด็ก', 
      emoji: '👶',
      color: '#22c55e'
    },
    { 
      id: 'teens', 
      name: 'วัยรุ่น', 
      ageMin: 13, 
      ageMax: 21, 
      description: 'เนื้อหาสำหรับวัยรุ่น', 
      emoji: '🎓',
      color: '#3b82f6'
    },
    { 
      id: 'adults', 
      name: 'วัยทำงาน', 
      ageMin: 22, 
      ageMax: 100, 
      description: 'เนื้อหาสำหรับผู้ปกครอง', 
      emoji: '👨‍💼',
      color: '#8b5cf6'
    }
  ];
};

// ===== FALLBACK DATA (ถ้า Firebase ยังไม่ได้ setup) =====
const getFallbackContent = async (age) => {
  const ageGroup = await findAgeGroup(age);
  const ageGroupId = ageGroup ? ageGroup.id : 'teens';
  
  const fallbackData = {
    kids: [
      {
        id: 'fallback-kids-1',
        title: '🎨 ค่ายเด็กสร้างสรรค์',
        description: 'ค่ายวิทยาศาสตร์และเทคโนโลยีสำหรับน้องๆ อายุ 8-12 ปี',
        type: 'event',
        ageGroupId: 'kids',
        priority: 8,
        imageUrl: null,
        isActive: true
      },
      {
        id: 'fallback-kids-2',
        title: '🤖 เรียนรู้การเขียนโปรแกรม',
        description: 'เรียนเขียนโค้ดแบบสนุกๆ ผ่านเกมและการ์ตูน',
        type: 'activity',
        ageGroupId: 'kids',
        priority: 7,
        imageUrl: null,
        isActive: true
      }
    ],
    teens: [
      {
        id: 'fallback-teens-1',
        title: '🎓 ทุนการศึกษา 100%',
        description: 'รับสมัครทุนการศึกษาเต็มจำนวนสำหรับนักเรียนเก่ง GPA 3.5+',
        type: 'scholarship',
        ageGroupId: 'teens',
        priority: 10,
        imageUrl: null,
        isActive: true
      },
      {
        id: 'fallback-teens-2',
        title: '💻 14 สาขาวิชาที่เปิดสอน',
        description: 'เลือกสาขาที่ใช่ ตอบโจทย์อนาคต ทั้งช่างอุตสาหกรรม พาณิชยกรรม และการท่องเที่ยว',
        type: 'career',
        ageGroupId: 'teens',
        priority: 9,
        imageUrl: null,
        isActive: true
      },
      {
        id: 'fallback-teens-3',
        title: '🎉 โควตาพิเศษ ม.6',
        description: 'สมัครรอบโควตาคุ้มกว่า! ลดค่าเล่าเรียน พร้อมของแถมมากมาย',
        type: 'promotion',
        ageGroupId: 'teens',
        priority: 8,
        imageUrl: null,
        isActive: true
      },
      {
        id: 'fallback-teens-4',
        title: '⚽ กิจกรรมนักศึกษา',
        description: 'ชมรมกีฬา ดนตรี ศิลปะ และอีกมากมาย เรียนรู้นอกห้องเรียน',
        type: 'activity',
        ageGroupId: 'teens',
        priority: 7,
        imageUrl: null,
        isActive: true
      },
      {
        id: 'fallback-teens-5',
        title: '💰 ผ่อนชำระได้ 0%',
        description: 'ค่าเล่าเรียนผ่อนได้ ไม่มีดอกเบี้ย เริ่มต้นเพียงเดือนละ 3,000 บาท',
        type: 'promotion',
        ageGroupId: 'teens',
        priority: 8,
        imageUrl: null,
        isActive: true
      }
    ],
    adults: [
      {
        id: 'fallback-adults-1',
        title: '📊 ROI การลงทุนการศึกษา',
        description: 'เปรียบเทียบค่าใช้จ่ายและผลตอบแทนจากการศึกษาวิชาชีพ',
        type: 'news',
        ageGroupId: 'adults',
        priority: 9,
        imageUrl: null,
        isActive: true
      },
      {
        id: 'fallback-adults-2',
        title: '💼 สถิติการมีงานทำ 95%',
        description: 'บัณฑิตของเรามีงานทำภายใน 6 เดือนหลังจบ อัตราเงินเดือนเริ่มต้น 15,000+',
        type: 'news',
        ageGroupId: 'adults',
        priority: 8,
        imageUrl: null,
        isActive: true
      }
    ]
  };

  return fallbackData[ageGroupId] || fallbackData.teens;
};

// ===== GET ALL CONTENT TYPES =====
export const getContentTypes = async () => {
  try {
    const typesRef = collection(db, 'content_types');
    const snapshot = await getDocs(typesRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ Error fetching content types:', error);
    return [
      { id: 'scholarship', name: 'ทุนการศึกษา', icon: '🎓', color: '#10b981' },
      { id: 'news', name: 'ข่าวสาร', icon: '📰', color: '#3b82f6' },
      { id: 'event', name: 'กิจกรรม', icon: '🎉', color: '#f59e0b' },
      { id: 'promotion', name: 'โปรโมชั่น', icon: '🎁', color: '#ef4444' },
      { id: 'career', name: 'สาขาวิชา', icon: '💼', color: '#8b5cf6' },
      { id: 'activity', name: 'กิจกรรมนักศึกษา', icon: '⚽', color: '#ec4899' }
    ];
  }
};
