import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import FaceDetection from './components/FaceDetection';
import AvatarVideo from './components/AvatarVideo';
import CareerCards from './components/CareerCards';
import TuitionInfo from './components/TuitionInfo';
import AdSlideshow from './components/AdSlideshow';
import KidsMode from './components/KidsMode';
import ContentPopup from './components/ContentPopup';
import AdminMenu from './components/AdminMenu';
import PersonalizedContentPopup from './components/PersonalizedContentPopup';
import { getAgeGroupConfig } from './config';
import { createSession, logConversionStep, logPageTransition, logHeatmapClick } from './firebaseService';
// import { subscribeToPresence, updateLedStatus } from './firebase'; // Commented out - enable when Firebase is configured
import voiceService, { speak } from './voiceService';
import './App.css';

function App() {
  const [userDetected, setUserDetected] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [detectedInterests, setDetectedInterests] = useState([]);
  const [showAvatar, setShowAvatar] = useState(false);
  const [showTuition, setShowTuition] = useState(false);
  const [isIdle, setIsIdle] = useState(true); // เริ่มต้นที่สไลด์โชว์
  const [detectedAge, setDetectedAge] = useState(null);
  const [detectedGender, setDetectedGender] = useState(null);
  const [detectedEmotion, setDetectedEmotion] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [ageGroup, setAgeGroup] = useState('ADULTS_18_PLUS'); // default age group
  const [showContentPopup, setShowContentPopup] = useState(false);
  
  // Use refs for timer management
  const idleTimerRef = useRef(null);
  const resetIdleTimerRef = useRef(null);
  const contentPopupTimerRef = useRef(null);

  // Idle timeout duration (2 minutes)
  const IDLE_TIMEOUT = 120000;

  // Initialize session on app load
  useEffect(() => {
    const initSession = async () => {
      const newSessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      setSessionId(newSessionId);
      setSessionStartTime(Date.now());
      sessionStorage.setItem('sessionId', newSessionId);
      
      // Log conversion step: visit
      await logConversionStep('visit', newSessionId, {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
    };
    
    initSession();
  }, []);

  // Reset idle timer - use useCallback with no dependencies for stability
  const resetIdleTimer = useCallback(() => {
    // Clear existing timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    
    // Set new timer
    idleTimerRef.current = setTimeout(() => {
      console.log('⏰ Idle timeout reached - returning to home');
      setIsIdle(true);
      // กลับไปหน้า home เมื่อ idle
      setCurrentPage('home');
      setShowAvatar(false);
      setShowTuition(false);
    }, IDLE_TIMEOUT);
  }, []); // No dependencies - function never changes

  // Update ref whenever resetIdleTimer changes
  resetIdleTimerRef.current = resetIdleTimer;

  // Handle user interaction (ออกจาก idle mode)
  const handleUserInteraction = () => {
    if (isIdle) {
      setIsIdle(false);
      setCurrentPage('home');
      resetIdleTimer(); // เริ่มนับ idle timer หลังจาก user กดจอ
    } else {
      resetIdleTimer(); // reset timer ถ้ากำลังใช้งานอยู่
    }
  };

  // Handle screen click for heatmap logging
  const handleScreenClick = (e) => {
    // คำนวณตำแหน่งเป็น percentage ของหน้าจอ
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    
    // บันทึกลง Firebase
    logHeatmapClick(x, y, currentPage);
    
    // เรียก handleUserInteraction ด้วย
    handleUserInteraction();
  };

  useEffect(() => {
    // Initialize voice service
    setTimeout(() => {
      voiceService.init();
    }, 1000);

    // Make resetIdleTimer available globally for voice service
    window.resetIdleTimer = resetIdleTimer;

    return () => {
      window.resetIdleTimer = null;
    };
  }, []);

  // Separate useEffect for event listeners to avoid re-registration
  useEffect(() => {
    // Listen for user interactions - always reset timer on any interaction
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleEvent = (e) => {
      if (resetIdleTimerRef.current) {
        resetIdleTimerRef.current();
      }
    };
    
    events.forEach(event => {
      document.addEventListener(event, handleEvent, { passive: true });
    });

    console.log('✅ Event listeners registered for idle timer reset');

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleEvent);
      });
      console.log('🧹 Event listeners cleaned up');
    };
  }, []); // Empty deps - register once

  useEffect(() => {

    // Subscribe to Pi5 presence sensor (Commented out - enable when Pi5 and Firebase are configured)
    /*
    const unsubscribe = subscribeToPresence((presenceData) => {
      if (presenceData && presenceData.userPresent) {
        setUserDetected(true);
        updateLedStatus(true);
        
        // Welcome greeting with voice
        if (!showAvatar && currentPage === 'home') {
          speak('ยินดีต้อนรับค่ะ! พร้อมจะค้นหาสาขาที่ใช่แล้วหรือยัง?', 'th');
        }
      } else {
        setUserDetected(false);
        updateLedStatus(false);
        // Reset after 5 seconds of no presence
        setTimeout(() => {
          setCurrentPage('home');
          setShowAvatar(false);
        }, 5000);
      }
    });

    return () => unsubscribe();
    */
  }, []);

  const handleFaceDetected = (interests) => {
    resetIdleTimer();
    
    // ถ้า user ไม่ยินยอม PDPA ให้ข้ามไปหน้าข้อมูล
    if (interests.skipScan && interests.goToInfo) {
      setCurrentPage('explore');
      setDetectedInterests([]);
      return;
    }
    
    // Handle age, gender, emotion detection from face detection component
    if (interests.age) {
      setDetectedAge(interests.age);
      const config = getAgeGroupConfig(interests.age);
      setAgeGroup(config.id);
    }
    
    if (interests.gender) {
      setDetectedGender(interests.gender);
    }
    
    if (interests.emotion) {
      setDetectedEmotion(interests.emotion);
    }
    
    setDetectedInterests(interests);
    
    // 🎯 แสดงป๊อปอัพแนะนำข่าวทันทีหลังสแกนหน้าเสร็จ (5 วินาที)
    if (contentPopupTimerRef.current) {
      clearTimeout(contentPopupTimerRef.current);
    }
    
    contentPopupTimerRef.current = setTimeout(() => {
      if (interests.age && interests.gender && interests.emotion) {
        console.log('🎯 Showing personalized content popup with:', {
          age: interests.age,
          gender: interests.gender,
          emotion: interests.emotion
        });
        setShowContentPopup(true);
      }
    }, 5000); // แสดงหลัง 5 วินาที
    
    if (interests.length > 0) {
      // Log page transition: home -> explore
      logPageTransition(sessionId, 'home', 'explore');
      setCurrentPage('explore');
    }
  };

  const handleReset = () => {
    setCurrentPage('home');
    setDetectedInterests([]);
    setShowAvatar(false);
    setShowContentPopup(false);
    
    // Clear content popup timer
    if (contentPopupTimerRef.current) {
      clearTimeout(contentPopupTimerRef.current);
    }
    
    resetIdleTimer();
  };

  const handleAvatarOpen = () => {
    setShowAvatar(true);
    resetIdleTimer();
  };

  const handleAvatarClose = () => {
    setShowAvatar(false);
    resetIdleTimer();
  };

  const handleNavigate = (page) => {
    if (page === 'home') {
      handleReset();
    }
    // Analytics now handled within AdminDashboard
  };

  return (
    <div className="app" onClick={isIdle ? handleUserInteraction : handleScreenClick}>
      {/* Admin Menu */}
      <AdminMenu onNavigate={handleNavigate} />
      
      {/* Background */}
      <div className="app-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="grid-overlay"></div>
      </div>

      {/* Header */}
      <header className="app-header" style={{ display: isIdle ? 'none' : 'flex' }}>
        <motion.div 
          className="logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="logo-icon">🎓</div>
          <div className="logo-text">
            <h1>Lanna Polytechnic Chiangmai</h1>
            <p className="logo-subtitle">Technological College</p>
          </div>
        </motion.div>
        
        <div className="header-actions">
          <button 
            className="scholarships-btn"
            onClick={() => setShowTuition(true)}
          >
            💰 Scholarships & Fees
          </button>
        </div>
      </header>

      {/* Ad Slideshow - แสดงเมื่อ idle */}
      {isIdle && (
        <AdSlideshow onInteraction={handleUserInteraction} />
      )}

      {/* Main Content */}
      <main className="app-main" style={{ display: isIdle ? 'none' : 'block' }}>
        {currentPage === 'home' && (
          <motion.div 
            className="home-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="hero-content">
              <motion.h2 
                className="hero-title"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                ค้นพบเส้นทาง
                <span className="gradient-text"> อาชีพในฝัน</span>
              </motion.h2>
              
              <motion.p 
                className="hero-subtitle"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                สแกนใบหน้าเพื่อรับคำแนะนำสาขาวิชาที่เหมาะกับคุณ
              </motion.p>

              <motion.div
                className="scan-area"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <FaceDetection onDetected={handleFaceDetected} />
              </motion.div>

              <motion.button
                className="btn-primary"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                onClick={() => setCurrentPage('explore')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                เริ่มต้นสำรวจ
              </motion.button>
            </div>
          </motion.div>
        )}

        {currentPage === 'explore' && (
          <motion.div 
            className="explore-page"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            {/* Age-based rendering: KidsMode for ages 3-12 */}
            {detectedAge && detectedAge >= 3 && detectedAge < 13 ? (
              <KidsMode 
                careerSuggestions={detectedInterests}
                onComplete={(selectedCareers) => {
                  logConversionStep('clicked', sessionId, {
                    careers: selectedCareers,
                    ageGroup: 'KIDS_3_12'
                  });
                  setShowAvatar(true);
                }}
              />
            ) : (
              <CareerCards 
                suggestedInterests={detectedInterests}
                onAvatarClick={handleAvatarOpen}
              />
            )}
          </motion.div>
        )}
      </main>

      {/* Avatar Chat */}
      {showAvatar && (
        <AvatarVideo onClose={handleAvatarClose} interests={detectedInterests} />
      )}
      
      {/* Tuition Info Modal */}
      {showTuition && (
        <TuitionInfo onClose={() => setShowTuition(false)} />
      )}
      
      {/* 🎯 Personalized Content Popup - แสดงข่าวตามอายุ/เพศ/อารมณ์ */}
      {showContentPopup && detectedAge && detectedGender && detectedEmotion && (
        <PersonalizedContentPopup
          userProfile={{
            age: detectedAge,
            gender: detectedGender,
            expression: detectedEmotion
          }}
          onClose={() => setShowContentPopup(false)}
        />
      )}

      {/* Footer */}
      <footer className="app-footer" style={{ display: isIdle ? 'none' : 'block' }}>
        <p>© 2026 วิทยาลัยเทคโนโลยีโปลิเทคนิคลานนา เชียงใหม่</p>
        <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', opacity: 0.8 }}>
          จัดทำโดย สาขาเทคโนโลยีสารสนเทศ | Information Technology
        </p>
      </footer>
    </div>
  );
}

export default App;
