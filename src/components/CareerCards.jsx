import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CAREER_CATEGORIES } from '../config';
import { recordHeatmapClick, saveSession } from '../firebase';
import { speak, CAREER_PHRASES } from '../voiceService';
import './CareerCards.css';

const CareerCards = ({ suggestedInterests = [], onAvatarClick }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Save session data
    saveSession({
      suggestedInterests,
      timestamp: new Date().toISOString()
    });
  }, [suggestedInterests]);

  const handleCardClick = (category) => {
    setSelectedCategory(category);
    recordHeatmapClick(50, 50, `career-${category.id}`);
    
    // Speak career description
    const phrase = CAREER_PHRASES[category.id];
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
          🤖 พูดคุยกับผู้ช่วย
        </button>
      </div>

      {/* Career Cards Grid */}
      <div className="cards-grid">
        {filteredCategories.map((category, index) => {
          const isSuggested = suggestedInterests.includes(category.id);
          
          return (
            <motion.div
              key={category.id}
              className={`career-card ${isSuggested ? 'suggested' : ''}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.05, y: -5 }}
              onClick={() => handleCardClick(category)}
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
            </motion.div>
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
                <p>หลักสูตรนี้เหมาะสำหรับผู้ที่สนใจด้าน {selectedCategory.name} 
                   มีการเรียนการสอนที่ทันสมัย เน้นภาคปฏิบัติจริง</p>
              </section>

              <section className="modal-section">
                <h3>💼 อาชีพที่เกี่ยวข้อง</h3>
                <ul>
                  <li>อาชีพหลัก 1</li>
                  <li>อาชีพหลัก 2</li>
                  <li>อาชีพหลัก 3</li>
                </ul>
              </section>

              <section className="modal-section">
                <h3>💰 รายได้โดยประมาณ</h3>
                <p>15,000 - 50,000+ บาท/เดือน</p>
              </section>

              <section className="modal-section">
                <h3>🎓 ระยะเวลาศึกษา</h3>
                <p>2-3 ปี (ปวช./ปวส.)</p>
              </section>

              <button 
                className="modal-btn"
                style={{ 
                  background: `linear-gradient(135deg, ${selectedCategory.color} 0%, ${selectedCategory.color}80 100%)`
                }}
                onClick={() => window.open('https://www.lannapoly.ac.th/admission/#/?from=website', '_blank')}
              >
                📝 สมัครเรียน
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
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
