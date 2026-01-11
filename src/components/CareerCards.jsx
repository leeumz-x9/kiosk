import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CAREER_CATEGORIES, getAgeGroupConfig } from '../config';
import { recordHeatmapClick, saveSession } from '../firebase';
import { logConversionStep } from '../firebaseService';
import { speak, CAREER_PHRASES } from '../voiceService';
import './CareerCards.css';

const CareerCards = ({ suggestedInterests = [], onAvatarClick }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showAdmission, setShowAdmission] = useState(false);

  useEffect(() => {
    // Save session data
    saveSession({
      suggestedInterests,
      timestamp: new Date().toISOString()
    });
  }, [suggestedInterests]);

  const handleCardClick = (category, event) => {
    setSelectedCategory(category);
    
    // Record actual click position for heatmap
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100; // percentage
    const y = ((event.clientY - rect.top) / rect.height) * 100; // percentage
    
    // Scroll modal into view
    setTimeout(() => {
      const modalElement = document.querySelector('.detail-modal');
      if (modalElement) {
        modalElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    
    recordHeatmapClick(x, y, `career-${category.id}`);
    
    // Log conversion step: clicked
    const sessionId = sessionStorage.getItem('sessionId');
    logConversionStep('clicked', sessionId, {
      careerClicked: category.id,
      careerName: category.name
    });
    
    // Speak career description
    const phrase = CAREER_PHRASES[category.code];
    if (phrase) {
      speak(phrase.th, 'th');
    }
  };

  const filteredCategories = filter === 'all' 
    ? CAREER_CATEGORIES 
    : CAREER_CATEGORIES.filter(c => suggestedInterests.includes(c.id));

  return (
    <div className="career-cards-container">
      {/* Header */}
      <div className="cards-header">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🎯 สำรวจสาขาวิชา
        </motion.h2>

        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            ทั้งหมด
          </button>
          <button 
            className={`filter-btn ${filter === 'suggested' ? 'active' : ''}`}
            onClick={() => setFilter('suggested')}
            disabled={suggestedInterests.length === 0}
          >
            ✨ แนะนำสำหรับคุณ
          </button>
        </div>

        <button className="avatar-btn" onClick={onAvatarClick}>
          💬 พูดคุยกับน้องทิวสน
        </button>
      </div>

      {/* Career Cards Grid */}
      <div className="cards-grid">
        {filteredCategories.map((category) => {
          const isSuggested = suggestedInterests.includes(category.id);
          
          return (
            <div
              key={category.id}
              className={`career-card ${isSuggested ? 'suggested' : ''}`}
              onClick={(event) => handleCardClick(category, event)}
              style={{ 
                borderColor: isSuggested ? category.color : 'transparent',
                color: category.color
              }}
            >
              {/* Category Badge */}
              <div className="card-category">{category.category}</div>
              
              {/* Code Badge */}
              <div className="card-code" style={{ color: category.color }}>{category.code}</div>
              
              {/* Icon */}
              <div className="card-icon">{category.icon}</div>
              
              {/* Name */}
              <div className="card-name">{category.name}</div>
              
              {/* Description */}
              <div className="card-description">{category.description}</div>

              {isSuggested && (
                <div className="suggested-badge" style={{ background: category.gradient }}>
                  ⭐ แนะนำ
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedCategory && (
        <motion.div 
          className="detail-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedCategory(null)}
        >
          <motion.div 
            className="detail-modal"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="close-btn"
              onClick={() => setSelectedCategory(null)}
            >
              ✕
            </button>

            <div 
              className="modal-header"
              style={{ borderColor: selectedCategory.color }}
            >
              <div 
                className="modal-icon"
                style={{ color: selectedCategory.color }}
              >
                {getIconForCategory(selectedCategory.id)}
              </div>
              <h2 style={{ color: selectedCategory.color }}>
                {selectedCategory.name}
              </h2>
            </div>

            <div className="modal-content">
              <section className="modal-section">
                <h3>📖 รายละเอียดหลักสูตร</h3>
                <p>{selectedCategory.description}</p>
              </section>

              <section className="modal-section">
                <h3>📚 ข้อมูลเพิ่มเติม</h3>
                {CAREER_PHRASES[selectedCategory.code] && (
                  <p style={{ lineHeight: '1.8', textAlign: 'justify' }}>
                    {CAREER_PHRASES[selectedCategory.code].th}
                  </p>
                )}
              </section>

              <section className="modal-section">
                <h3>🎓 ระยะเวลาศึกษา</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ padding: '0.75rem', background: 'rgba(126, 200, 69, 0.1)', borderRadius: '8px', border: '1px solid rgba(126, 200, 69, 0.3)' }}>
                    <strong>📘 ปวช. (ประกาศนียบัตรวิชาชีพ)</strong><br/>
                    เรียน 3 ปี
                  </div>
                  <div style={{ padding: '0.75rem', background: 'rgba(0, 166, 81, 0.1)', borderRadius: '8px', border: '1px solid rgba(0, 166, 81, 0.3)' }}>
                    <strong>📗 ปวส. (ประกาศนียบัตรวิชาชีพชั้นสูง)</strong><br/>
                    เรียน 2 ปี
                    {selectedCategory.code === 'It' && <span style={{ color: '#f59e0b', marginLeft: '0.5rem' }}>⭐ (เปิดเฉพาะ ปวส.)</span>}
                  </div>
                </div>
              </section>

              <button 
                className="modal-btn"
                style={{ 
                  background: `linear-gradient(135deg, ${selectedCategory.color} 0%, ${selectedCategory.color}80 100%)`
                }}
                onClick={() => {
                  // Detect Android or iOS or fallback
                  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
                  if (isMobile) {
                    window.location.href = 'https://www.lannapoly.ac.th/admission/#/?from=website';
                  } else {
                    window.open('https://www.lannapoly.ac.th/admission/#/?from=website', '_blank');
                  }
                }}
              >
                📝 สมัครเรียน
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Admission Modal */}
      <AnimatePresence>
        {showAdmission && (
          <motion.div 
            className="external-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAdmission(false)}
          >
            <motion.div 
              className="external-modal"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="external-header">
                <h3>📝 สมัครเรียนออนไลน์</h3>
                <button className="back-btn" onClick={() => setShowAdmission(false)}>
                  ← กลับ
                </button>
              </div>
              {/* Fallback: If iframe fails, show open link button */}
              <iframe
                src="https://www.lannapoly.ac.th/admission/#/?from=website"
                className="admission-iframe"
                title="Online Admission"
                allowFullScreen
                loading="lazy"
                style={{ width: '100%', height: '500px', border: 'none' }}
                onError={(e) => {
                  const fallbackBtn = document.getElementById('admission-fallback-btn');
                  if (fallbackBtn) fallbackBtn.style.display = 'block';
                }}
              />
              <button
                id="admission-fallback-btn"
                style={{ display: 'none', marginTop: '16px' }}
                onClick={() => window.open('https://www.lannapoly.ac.th/admission/#/?from=website', '_blank')}
              >
                เปิดหน้าสมัครเรียนออนไลน์
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper function to get icon for each category
const getIconForCategory = (categoryId) => {
  const icons = {
    tech: '💻',
    business: '📊',
    design: '🎨',
    health: '⚕️',
    engineering: '⚙️',
    hospitality: '🏨'
  };
  return icons[categoryId] || '📚';
};

export default CareerCards;
