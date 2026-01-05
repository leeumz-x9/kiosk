import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './KidsMode.css';

/**
 * Kids Mode UI for ages 3-12
 * Simple, colorful, interactive interface with big buttons and animations
 */
export default function KidsMode({ onComplete, careerSuggestions = [] }) {
  const [currentScreen, setCurrentScreen] = useState('welcome'); // welcome | explore | career
  const [selectedCareer, setSelectedCareer] = useState(null);

  const playSound = (type) => {
    // Simple beep sounds for interaction feedback
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    if (type === 'click') {
      oscillator.frequency.value = 800;
      gain.gain.setValueAtTime(0.1, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'success') {
      oscillator.frequency.value = 1200;
      gain.gain.setValueAtTime(0.1, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  };

  const handleBigButton = (action) => {
    playSound('click');
    if (action === 'start') {
      setCurrentScreen('explore');
    } else if (action === 'back') {
      setCurrentScreen('welcome');
    } else if (action === 'finish') {
      onComplete && onComplete();
    }
  };

  const handleCareerSelect = (career) => {
    playSound('success');
    setSelectedCareer(career);
    setCurrentScreen('career');
  };

  return (
    <div className="kids-mode">
      {/* Welcome Screen */}
      {currentScreen === 'welcome' && (
        <motion.div
          className="kids-screen welcome-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1 className="kids-title">
            สวัสดี น้อง! 👋
          </motion.h1>

          <motion.div
            className="emoji-bounce"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🎓
          </motion.div>

          <motion.p className="kids-subtitle">
            เรา ได้รับการคัดเลือกให้พูดคุย เกี่ยวกับอาชีพที่เจ๋ง!
          </motion.p>

          <motion.button
            className="big-button start-button"
            onClick={() => handleBigButton('start')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="button-text">เริ่มต้นกันเถอะ!</span>
            <span className="button-emoji">🚀</span>
          </motion.button>
        </motion.div>
      )}

      {/* Explore Careers */}
      {currentScreen === 'explore' && (
        <motion.div
          className="kids-screen explore-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2 className="kids-title">
            อาชีพที่เจ๋ง! 🌟
          </motion.h2>

          <div className="kids-career-grid">
            {careerSuggestions.length > 0 ? (
              careerSuggestions.map((career) => (
                <motion.div
                  key={career.id}
                  className="kids-career-card"
                  onClick={() => handleCareerSelect(career)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      `0 5px 15px rgba(0, 0, 0, 0.1)`,
                      `0 8px 25px rgba(0, 0, 0, 0.2)`,
                      `0 5px 15px rgba(0, 0, 0, 0.1)`
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="big-emoji">{career.icon}</div>
                  <div className="career-name">{career.name}</div>
                </motion.div>
              ))
            ) : (
              <p className="placeholder">กำลังโหลด...</p>
            )}
          </div>

          <motion.button
            className="big-button back-button"
            onClick={() => handleBigButton('back')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="button-emoji">⬅️</span>
            <span className="button-text">กลับไป</span>
          </motion.button>
        </motion.div>
      )}

      {/* Career Detail */}
      {currentScreen === 'career' && selectedCareer && (
        <motion.div
          className="kids-screen career-screen"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="big-emoji-large"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {selectedCareer.icon}
          </motion.div>

          <motion.h2 className="kids-title">
            {selectedCareer.name}
          </motion.h2>

          <motion.p className="kids-description">
            {selectedCareer.description}
          </motion.p>

          <div className="kids-buttons-row">
            <motion.button
              className="big-button back-button"
              onClick={() => handleBigButton('back')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="button-emoji">⬅️</span>
            </motion.button>

            <motion.button
              className="big-button finish-button"
              onClick={() => handleBigButton('finish')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="button-emoji">✅</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Confetti animation for celebration */}
      {currentScreen !== 'welcome' && (
        <div className="confetti">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="confetti-piece"
              initial={{ x: Math.random() * 300 - 150, y: -20, opacity: 1 }}
              animate={{ y: 400, opacity: 0 }}
              transition={{ duration: 2 + Math.random() * 1, repeat: Infinity }}
            >
              {['🎉', '🎈', '⭐', '🌟', '💫'][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
