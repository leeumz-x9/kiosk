import React from 'react';
import { motion } from 'framer-motion';
import './WelcomeScreen.css';

const WelcomeScreen = ({ onStart }) => {
  return (
    <motion.div 
      className="welcome-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Tech Frame */}
      <div className="welcome-frame">
        <div className="corner corner-tl"></div>
        <div className="corner corner-tr"></div>
        <div className="corner corner-bl"></div>
        <div className="corner corner-br"></div>
        
        {/* Content */}
        <div className="welcome-content">
          <motion.div
            className="welcome-title"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1>ค้นหาอนาคตคุณที่ Lanna Poly!</h1>
            <p className="subtitle">Find Your Future!</p>
          </motion.div>

          <motion.button
            className="start-btn"
            onClick={onStart}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="btn-ring ring-outer"></span>
            <span className="btn-ring ring-middle"></span>
            <span className="btn-ring ring-inner"></span>
            <span className="btn-text">START<br/>SCAN</span>
          </motion.button>

          <motion.p
            className="ai-powered"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            AI-Powered Discovery
          </motion.p>
        </div>

        {/* Wave Animation */}
        <div className="wave-container">
          <svg className="wave" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,50 C150,80 350,20 600,50 C850,80 1050,20 1200,50 L1200,120 L0,120 Z" 
                  fill="url(#waveGradient)" fillOpacity="0.3"/>
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00a651"/>
                <stop offset="50%" stopColor="#ffd100"/>
                <stop offset="100%" stopColor="#00a651"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Decorative Elements */}
        <div className="deco-line deco-line-1"></div>
        <div className="deco-line deco-line-2"></div>
        <div className="deco-bar deco-bar-1"></div>
        <div className="deco-bar deco-bar-2"></div>
      </div>

      {/* Footer */}
      <motion.div 
        className="welcome-footer"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <p>วิทยาลัยเทคโนโลยีล้านนาเชียงใหม่ | อนาคตในฝีมือของคุณ</p>
        <div className="social-icons">
          <span>📘</span>
          <span>🐦</span>
          <span>📷</span>
          <span>🌐</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeScreen;
