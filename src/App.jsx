import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FaceDetection from './components/FaceDetection';
import AvatarVideo from './components/AvatarVideo';
import CareerCards from './components/CareerCards';
import Heatmap from './components/Heatmap';
import TuitionInfo from './components/TuitionInfo';
import AdSlideshow from './components/AdSlideshow';
import KidsMode from './components/KidsMode';
import { getAgeGroupConfig } from './config';
import { createSession, logConversionStep, logPageTransition } from './firebaseService';
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
  const [idleTimer, setIdleTimer] = useState(null);
  const [detectedAge, setDetectedAge] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [ageGroup, setAgeGroup] = useState('ADULTS_18_PLUS'); // default age group

  // Idle timeout duration (30 seconds)
  const IDLE_TIMEOUT = 30000;

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

  // Reset idle timer
  const resetIdleTimer = () => {
    if (idleTimer) {
      clearTimeout(idleTimer);
    }
    
    const timer = setTimeout(() => {
      setIsIdle(true);
      // กลับไปหน้า home เมื่อ idle
      setCurrentPage('home');
      setShowAvatar(false);
      setShowTuition(false);
    }, IDLE_TIMEOUT);
    
    setIdleTimer(timer);
  };

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

  useEffect(() => {
    // Initialize voice service
    setTimeout(() => {
      voiceService.init();
    }, 1000);

    // ไม่เริ่ม idle timer จนกว่า user จะกดจอครั้งแรก

    // Listen for user interactions (เฉพาะเมื่อไม่ได้อยู่ใน idle mode)
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleEvent = () => {
      if (!isIdle) {
        resetIdleTimer();
      }
    };
    
    events.forEach(event => {
      document.addEventListener(event, handleEvent);
    });

    // Cleanup
    return () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
      events.forEach(event => {
        document.removeEventListener(event, handleEvent);
      });
    };
  }, [isIdle]);

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
    
    // Handle age detection from face detection component
    // Note: interests may contain age data in extended format
    if (interests.age) {
      setDetectedAge(interests.age);
      const config = getAgeGroupConfig(interests.age);
      setAgeGroup(config.id);
    }
    
    setDetectedInterests(interests);
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

  return (
    <div className="app">
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
            <h1>Lanna Polythentic College</h1>
            <p className="logo-subtitle">Uncover Your Future</p>
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

      {/* Admin Heatmap (hidden in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="admin-panel">
          <Heatmap />
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer" style={{ display: isIdle ? 'none' : 'block' }}>
        <p>© 2025 College Career Guide - Powered by AI & IoT</p>
      </footer>
    </div>
  );
}

export default App;
