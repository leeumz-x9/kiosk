import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FaceDetection from './components/FaceDetection';
import Avatar3D from './components/Avatar3D';
import CareerCards from './components/CareerCards';
import Heatmap from './components/Heatmap';
import TuitionInfo from './components/TuitionInfo';
// import { subscribeToPresence, updateLedStatus } from './firebase'; // Commented out - enable when Firebase is configured
import voiceService, { speak } from './voiceService';
import './App.css';

function App() {
  const [userDetected, setUserDetected] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [detectedInterests, setDetectedInterests] = useState([]);
  const [showAvatar, setShowAvatar] = useState(false);
  const [showTuition, setShowTuition] = useState(false);

  useEffect(() => {
    // Initialize voice service
    setTimeout(() => {
      voiceService.init();
    }, 1000);

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
    // ถ้า user ไม่ยินยอม PDPA ให้ข้ามไปหน้าข้อมูล
    if (interests.skipScan && interests.goToInfo) {
      setCurrentPage('explore');
      setDetectedInterests([]);
      return;
    }
    
    setDetectedInterests(interests);
    if (interests.length > 0) {
      setCurrentPage('explore');
    }
  };

  const handleReset = () => {
    setCurrentPage('home');
    setDetectedInterests([]);
    setShowAvatar(false);
  };

  const handleAvatarOpen = () => {
    setShowAvatar(true);
  };

  const handleAvatarClose = () => {
    setShowAvatar(false);
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

      {/* Main Content */}
      <main className="app-main">
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
            <CareerCards 
              suggestedInterests={detectedInterests}
              onAvatarClick={handleAvatarOpen}
            />
          </motion.div>
        )}
      </main>

      {/* Avatar Chat */}
      {showAvatar && (
        <Avatar3D onClose={handleAvatarClose} interests={detectedInterests} />
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
      <footer className="app-footer">
        <p>© 2025 College Career Guide - Powered by AI & IoT</p>
      </footer>
    </div>
  );
}

export default App;
