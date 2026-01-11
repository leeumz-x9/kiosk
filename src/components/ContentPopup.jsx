import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getContentByAge, logContentView, logContentClick } from '../services/contentService';
import './ContentPopup.css';

export default function ContentPopup({ 
  age, 
  sessionId, 
  sessionData,
  onClose 
}) {
  const [contents, setContents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);

  // ดึงข้อมูลเนื้อหาตามอายุ
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const data = await getContentByAge(age, 20);
      setContents(data);
      setLoading(false);

      // Log view for first content
      if (data.length > 0) {
        logContentView(data[0].id, sessionData);
      }
    };

    fetchContent();
  }, [age]);

  // Auto slide ทุก 8 วินาที
  useEffect(() => {
    if (!autoPlay || contents.length === 0) return;

    const interval = setInterval(() => {
      handleNext();
    }, 8000);

    return () => clearInterval(interval);
  }, [autoPlay, currentIndex, contents.length]);

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % contents.length;
    setCurrentIndex(nextIndex);
    
    // Log view
    if (contents[nextIndex]) {
      logContentView(contents[nextIndex].id, sessionData);
    }
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + contents.length) % contents.length;
    setCurrentIndex(prevIndex);
    
    // Log view
    if (contents[prevIndex]) {
      logContentView(contents[prevIndex].id, sessionData);
    }
  };

  const handleContentClick = () => {
    if (contents[currentIndex]) {
      logContentClick(contents[currentIndex].id, sessionData);
      setAutoPlay(false); // หยุด auto play เมื่อ user interact
    }
  };

  if (loading) {
    return (
      <motion.div 
        className="content-popup-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="content-popup loading">
          <div className="loading-spinner"></div>
          <p>กำลังโหลดเนื้อหา...</p>
        </div>
      </motion.div>
    );
  }

  if (contents.length === 0) {
    return null;
  }

  const currentContent = contents[currentIndex];
  const typeEmoji = {
    scholarship: '🎓',
    news: '📰',
    event: '🎉',
    promotion: '🎁',
    career: '💼',
    activity: '⚽'
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="content-popup-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="content-popup"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>

          {/* Content Type Badge */}
          <div className="content-badge">
            <span className="badge-emoji">{typeEmoji[currentContent.type] || '📌'}</span>
            <span className="badge-text">{currentContent.type}</span>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentContent.id}
              className="content-body"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              onClick={handleContentClick}
            >
              {/* Image/Icon */}
              {currentContent.imageUrl ? (
                <div className="content-image">
                  <img src={currentContent.imageUrl} alt={currentContent.title} />
                </div>
              ) : (
                <div className="content-icon">
                  <span>{typeEmoji[currentContent.type] || '📌'}</span>
                </div>
              )}

              {/* Title */}
              <h2 className="content-title">{currentContent.title}</h2>

              {/* Description */}
              <p className="content-description">{currentContent.description}</p>

              {/* Tags */}
              {currentContent.tags && currentContent.tags.length > 0 && (
                <div className="content-tags">
                  {currentContent.tags.map((tag, idx) => (
                    <span key={idx} className="tag">#{tag}</span>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="content-navigation">
            <button 
              className="nav-btn prev" 
              onClick={handlePrev}
              disabled={contents.length <= 1}
            >
              ← ก่อนหน้า
            </button>

            <div className="content-indicator">
              <span className="current">{currentIndex + 1}</span>
              <span className="separator">/</span>
              <span className="total">{contents.length}</span>
            </div>

            <button 
              className="nav-btn next" 
              onClick={handleNext}
              disabled={contents.length <= 1}
            >
              ถัดไป →
            </button>
          </div>

          {/* Auto Play Toggle */}
          <div className="auto-play-control">
            <button 
              className={`auto-play-btn ${autoPlay ? 'active' : ''}`}
              onClick={() => setAutoPlay(!autoPlay)}
            >
              {autoPlay ? '⏸️ หยุดอัตโนมัติ' : '▶️ เล่นอัตโนมัติ'}
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="dots-indicator">
            {contents.map((_, idx) => (
              <button
                key={idx}
                className={`dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => {
                  setCurrentIndex(idx);
                  logContentView(contents[idx].id, sessionData);
                  setAutoPlay(false);
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
