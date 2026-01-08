/**
 * Firebase Database Service
 * Handles all Firebase Firestore operations
 */

import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  getDoc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { firebaseConfig } from './config';

// Check if Firebase is properly configured
const isFirebaseConfigured = firebaseConfig.projectId !== 'YOUR_PROJECT_ID';

// Helper to safely execute Firebase operations
const safeFirebaseOperation = async (operation, fallbackValue = null) => {
  if (!isFirebaseConfigured || !db) {
    // เงียบๆ skip ไม่ต้อง log ทุกครั้ง
    return fallbackValue;
  }
  try {
    return await operation();
  } catch (error) {
    console.error('Firebase operation error:', error);
    return fallbackValue;
  }
};

// ===== CAREERS =====
export const getCareers = async () => {
  return safeFirebaseOperation(async () => {
    const careersRef = collection(db, 'careers');
    const snapshot = await getDocs(careersRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }, []);
};

export const getCareerById = async (careerId) => {
  return safeFirebaseOperation(async () => {
    const careerRef = doc(db, 'careers', careerId);
    const snapshot = await getDoc(careerRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  });
};

// ===== TUITION =====
export const getTuitionInfo = async () => {
  return safeFirebaseOperation(async () => {
    const tuitionRef = doc(db, 'tuition', 'data');
    const snapshot = await getDoc(tuitionRef);
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  });
};

// ===== HEATMAP =====
export const logHeatmapClick = async (x, y, page = 'unknown') => {
  return safeFirebaseOperation(async () => {
    const heatmapRef = collection(db, 'heatmap');
    await addDoc(heatmapRef, {
      x,
      y,
      page,
      timestamp: new Date()
    });
    console.log(`✅ Logged heatmap click at (${x}, ${y})`);
  });
};

export const getHeatmapData = async (limitCount = 100) => {
  return safeFirebaseOperation(async () => {
    const heatmapRef = collection(db, 'heatmap');
    const q = query(heatmapRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }, []);
};

export const subscribeToHeatmap = (callback) => {
  if (!isFirebaseConfigured || !db) {
    return () => {};  // เงียบๆ skip
  }
  try {
    const heatmapRef = collection(db, 'heatmap');
    const q = query(heatmapRef, orderBy('timestamp', 'desc'), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      callback(data);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to heatmap:', error);
    return () => {};
  }
};

// ===== SESSIONS (User Activity) =====
export const createSession = async (sessionData) => {
  return safeFirebaseOperation(async () => {
    const sessionsRef = collection(db, 'sessions');
    const docRef = await addDoc(sessionsRef, {
      ...sessionData,
      createdAt: new Date(),
      startTime: new Date()
    });
    return docRef.id;
  });
};

export const logSessionActivity = async (sessionId, activity) => {
  return safeFirebaseOperation(async () => {
    const sessionsRef = collection(db, 'sessions');
    await addDoc(sessionsRef, {
      sessionId,
      activity,
      timestamp: new Date()
    });
    return true;
  });
};

export const getRecentSessions = async (limitCount = 50) => {
  return safeFirebaseOperation(async () => {
    const sessionsRef = collection(db, 'sessions');
    const q = query(sessionsRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }, []);
};

// ===== ANALYTICS =====
export const getAnalyticsSummary = async () => {
  return safeFirebaseOperation(async () => {
    const analyticsRef = collection(db, 'analytics');
    const snapshot = await getDocs(analyticsRef);
    if (snapshot.docs.length > 0) {
      return snapshot.docs[0].data();
    }
    return null;
  });
};

export const updateAnalytics = async (updates) => {
  return safeFirebaseOperation(async () => {
    const analyticsRef = doc(db, 'analytics', 'summary');
    await updateDoc(analyticsRef, {
      ...updates,
      lastUpdated: new Date()
    });
    console.log('✅ Analytics updated');
  });
};

// ===== IoT / LED =====
export const getLEDStatus = async () => {
  return safeFirebaseOperation(async () => {
    const ledRef = doc(db, 'led_status', 'current');
    const snapshot = await getDoc(ledRef);
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  });
};

// ===== PRESENCE =====
export const getPresenceStatus = async () => {
  return safeFirebaseOperation(async () => {
    const presenceRef = doc(db, 'presence', 'sensor');
    const snapshot = await getDoc(presenceRef);
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  });
};

// ===== CONVERSION & SESSION TRACKING (NEW) =====

/**
 * Log conversion step in user journey
 * Steps: 'visit' → 'scanned' → 'clicked' → 'chatted' → 'form_filled'
 */
export const logConversionStep = async (step, sessionId, additionalData = {}) => {
  return safeFirebaseOperation(async () => {
    await addDoc(collection(db, 'conversion_funnel'), {
      step, // 'visit' | 'scanned' | 'clicked' | 'chatted' | 'form_filled'
      sessionId,
      timestamp: new Date(),
      ...additionalData
    });
    console.log(`✅ Logged conversion step: ${step}`);
  });
};

/**
 * Log session duration and pages visited
 */
export const logSessionDuration = async (sessionId, pageType, duration, demographics = {}) => {
  return safeFirebaseOperation(async () => {
    const sessionRef = doc(db, 'sessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (sessionSnap.exists()) {
      const sessionData = sessionSnap.data();
      const pages = sessionData.pages || [];
      
      pages.push({
        page: pageType,
        duration: duration, // seconds
        timestamp: new Date()
      });
      
      // Update session
      await updateDoc(sessionRef, {
        pages,
        lastUpdated: new Date(),
        ...demographics
      });
      console.log(`✅ Logged session duration: ${pageType} - ${duration}s`);
    }
  });
};

/**
 * Log page transition for user flow tracking
 */
export const logPageTransition = async (sessionId, fromPage, toPage) => {
  return safeFirebaseOperation(async () => {
    await addDoc(collection(db, 'page_transitions'), {
      sessionId,
      from: fromPage,
      to: toPage,
      timestamp: new Date()
    });
    console.log(`✅ Logged page transition: ${fromPage} → ${toPage}`);
  });
};

/**
 * Get conversion funnel statistics
 */
export const getConversionFunnel = async () => {
  return safeFirebaseOperation(async () => {
    const conversionRef = collection(db, 'conversion_funnel');
    const snapshot = await getDocs(conversionRef);
    
    const steps = {
      total: 0,
      visit: 0,
      scanned: 0,
      clicked: 0,
      chatted: 0,
      form_filled: 0
    };

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      steps.total++;
      if (data.step) {
        steps[data.step] = (steps[data.step] || 0) + 1;
      }
    });

    return {
      ...steps,
      scanRate: steps.total > 0 ? (steps.scanned / steps.total * 100).toFixed(1) : 0,
      clickRate: steps.scanned > 0 ? (steps.clicked / steps.scanned * 100).toFixed(1) : 0,
      chatRate: steps.clicked > 0 ? (steps.chatted / steps.clicked * 100).toFixed(1) : 0
    };
  });
};

/**
 * Get session analytics summary
 */
export const getSessionAnalytics = async () => {
  return safeFirebaseOperation(async () => {
    const sessionsRef = collection(db, 'sessions');
    const snapshot = await getDocs(sessionsRef);

    const sessionData = snapshot.docs.map(doc => doc.data());
    const sessionCount = sessionData.length;
    
    if (sessionCount === 0) {
      return {
        sessionCount: 0,
        avgSessionDuration: 0,
        totalPageViews: 0,
        pageMetrics: []
      };
    }

    // Calculate total duration
    let totalDuration = 0;
    const pageMetrics = {};

    sessionData.forEach(session => {
      if (session.pages) {
        session.pages.forEach(page => {
          const duration = page.duration || 0;
          totalDuration += duration;
          
          if (!pageMetrics[page.page]) {
            pageMetrics[page.page] = { count: 0, totalDuration: 0 };
          }
          pageMetrics[page.page].count++;
          pageMetrics[page.page].totalDuration += duration;
        });
      }
    });

    return {
      sessionCount,
      avgSessionDuration: (totalDuration / sessionCount).toFixed(1),
      totalPageViews: Object.values(pageMetrics).reduce((sum, p) => sum + p.count, 0),
      pageMetrics: Object.entries(pageMetrics).map(([page, metrics]) => ({
        page,
        views: metrics.count,
        avgDuration: (metrics.totalDuration / metrics.count).toFixed(1)
      })).sort((a, b) => b.views - a.views)
    };
  });
};

// ===== END CONVERSION & SESSION TRACKING =====
