import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FaceDetection from './components/FaceDetection';
import Avatar3D from './components/Avatar3D';
import CareerCards from './components/CareerCards';
import Heatmap from './components/Heatmap';
import TuitionInfo from './components/TuitionInfo';
import WelcomeScreen from './components/WelcomeScreen';
import { subscribeToPresence, updateLedStatus } from './firebase';
import voiceService, { speak } from './voiceService';
import './App.css';

function App() {
  const [userDetected, setUserDetected] = useState(false);
  const [userDistance, setUserDistance] = useState(null); // ระยะห่างจากเซนเซอร์
  const [currentPage, setCurrentPage] = useState('promo'); // เปลี่ยนเป็น promo แทน home
  const [detectedInterests, setDetectedInterests] = useState([]);
  const [showAvatar, setShowAvatar] = useState(false);
  const [showAvatarFullscreen, setShowAvatarFullscreen] = useState(false);
  const [showTuition, setShowTuition] = useState(false);
  const [idleTimer, setIdleTimer] = useState(null);

  useEffect(() => {
    // Initialize voice service
    setTimeout(() => {
      voiceService.init();
    }, 1000);

    // Subscribe to Pi5 presence sensor
    const unsubscribe = subscribeToPresence((presenceData) => {
      if (presenceData && presenceData.userPresent) {
        const distance = presenceData.distance || 100; // cm
        setUserDistance(distance);
        
        // ถ้าใกล้กว่า 1 เมตร (100 cm)
        if (distance <= 100) {
          setUserDetected(true);
          updateLedStatus(true);
          
          // เปลี่ยนจากหน้า promo ไปหน้า home (โหมดวิเคราะห์)
          if (currentPage === 'promo') {
            setCurrentPage('home');
            speak('ยินดีต้อนรับค่ะ! กรุณายืนนิ่งๆ เพื่อให้ระบบสแกนใบหน้าของคุณ', 'th');
          }
          
          // Reset idle timer
          if (idleTimer) clearTimeout(idleTimer);
        } else {
          // ถ้าห่างเกิน 1 เมตร
          setUserDetected(false);
        }
      } else {
        setUserDetected(false);
        setUserDistance(null);
        updateLedStatus(false);
        
        // Reset หลังจาก 10 วินาที ไม่มีคน
        const timer = setTimeout(() => {
          setCurrentPage('promo');
          setShowAvatar(false);
          setShowAvatarFullscreen(false);
        }, 10000);
        setIdleTimer(timer);
      }
    });

    return () => {
      unsubscribe();
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, [currentPage, idleTimer]);

  const handleFaceDetected = (interests) => {
    setDetectedInterests(interests);
    if (interests.length > 0) {
      setCurrentPage('explore');
    }
  };

  const handleReset = () => {
    setCurrentPage('promo');
    setDetectedInterests([]);
    setShowAvatar(false);
    setShowAvatarFullscreen(false);
  };

  const handleAvatarOpen = () => {
    setShowAvatar(true);
  };

  const handleAvatarClose = () => {
    setShowAvatar(false);
    setShowAvatarFullscreen(false);
  };

  const handleTalkToTiw = () => {
    setShowAvatarFullscreen(true);
    speak('สวัสดีค่ะ! ดิฉันทิวใส ผู้ช่วยแนะแนวของวิทยาลัยล้านนา มีอะไรให้ช่วยไหมคะ?', 'th');
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
      <header className="app-header">
        <motion.div 
          className="logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="logo-icon">🎓</div>
          <h1 className="gradient-text">LANNA POLY</h1>
        </motion.div>
        
        <div className="header-actions">
          {currentPage !== 'promo' && (
            <button 
              className="home-btn"
              onClick={handleReset}
            >
              🏠 หน้าแรก
            </button>
          )}
          <button 
            className="tuition-btn"
            onClick={() => setShowTuition(true)}
          >
            💰 ค่าเทอม & ทุนการศึกษา
          </button>
          
          <button 
            className="avatar-btn"
            onClick={handleTalkToTiw}
          >
            💬 คุยกับน้องทิวใส
          </button>
          
          {userDetected && (
            <motion.div 
              className="status-indicator"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <span className="status-dot"></span>
              <span>
                {userDistance ? `${Math.round(userDistance)} cm` : 'ยินดีต้อนรับ'}
              </span>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <AnimatePresence mode="wait">
          {/* หน้าป้ายประชาสัมพันธ์ - วนลูปเมื่อไม่มีคน */}
          {currentPage === 'promo' && (
            <WelcomeScreen key="promo" />
          )}

          {/* หน้าโหมดสแกน - เมื่อมีคนเดินเข้ามา 1 เมตร */}
          {currentPage === 'home' && (
            <motion.div 
              key="home"
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
                  {userDetected 
                    ? 'กรุณายืนนิ่งๆ เพื่อให้ระบบสแกนใบหน้าของคุณ' 
                    : 'กรุณาเข้าใกล้กล้อง (ระยะ 1 เมตร)'}
                </motion.p>

                <motion.div
                  className="scan-area"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <FaceDetection 
                    onDetected={handleFaceDetected}
                    userDetected={userDetected}
                    userDistance={userDistance}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* หน้าแสดงสาขาที่แนะนำ */}
          {currentPage === 'explore' && (
            <motion.div 
              key="explore"
              className="explore-page"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
            >
              <CareerCards 
                suggestedInterests={detectedInterests}
                onAvatarClick={handleAvatarOpen}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Avatar Chat - โหมดเต็มจอ */}
      <AnimatePresence>
        {showAvatarFullscreen && (
          <Avatar3D 
            key="avatar-fullscreen"
            onClose={handleAvatarClose} 
            interests={detectedInterests}
            fullscreen={true}
          />
        )}
        
        {/* Avatar Chat - โหมดปกติ (จากการกดที่การ์ดสาขา) */}
        {showAvatar && !showAvatarFullscreen && (
          <Avatar3D 
            key="avatar-normal"
            onClose={handleAvatarClose} 
            interests={detectedInterests}
            fullscreen={false}
          />
        )}
      </AnimatePresence>
      
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
      <footer className="app-footer">
        <p>© 2025 College Career Guide - Powered by AI & IoT</p>
      </footer>
    </div>
  );
}

export default App;
