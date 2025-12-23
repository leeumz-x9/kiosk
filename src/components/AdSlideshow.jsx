/**
 * AdSlideshow Component
 * แสดงโฆษณาสไลด์ของวิทยาลัยเทคนิคโปลิเทคนิคลานนา
 * เมื่อไม่มี user เข้ามาใช้งาน (idle mode)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AdSlideshow.css';

const AdSlideshow = ({ onInteraction }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // รูปภาพโฆษณาของวิทยาลัย (สามารถเปลี่ยนเป็น path จริงได้)
  const slides = [
    {
      id: 1,
      type: 'welcome',
      title: 'ยินดีต้อนรับสู่',
      subtitle: 'วิทยาลัยเทคนิคโปลิเทคนิคลานนา เชียงใหม่',
      description: 'สถาบันการศึกษาชั้นนำด้านช่างอุตสาหกรรมและเทคโนโลยี',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      icon: '🎓'
    },
    {
      id: 2,
      type: 'courses',
      title: '14 สาขาวิชา',
      subtitle: 'เลือกเส้นทางสู่อนาคต',
      description: 'ช่างอุตสาหกรรม | เทคโนโลยี | ธุรกิจ | ศิลปะ',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      icon: '🛠️'
    },
    {
      id: 3,
      type: 'facilities',
      title: 'เครื่องมือทันสมัย',
      subtitle: 'ห้องปฏิบัติการมาตรฐานสากล',
      description: 'พร้อมเครื่องมืออุปกรณ์ทันสมัย เทคโนโลยีล่าสุด',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      icon: '⚙️'
    },
    {
      id: 4,
      type: 'jobs',
      title: 'ทำงานได้ทันที',
      subtitle: '95% ได้งานภายใน 6 เดือน',
      description: 'พันธมิตรกับบริษัทชั้นนำกว่า 200 แห่ง',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      icon: '💼'
    },
    {
      id: 5,
      type: 'admission',
      title: 'เปิดรับสมัคร',
      subtitle: 'ปีการศึกษา 2568',
      description: 'สมัครได้ทุกช่องทาง | ค่าเทอมถูก | ทุนการศึกษามากมาย',
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      icon: '📝'
    },
    {
      id: 6,
      type: 'cta',
      title: 'มาหาเราสิ!',
      subtitle: 'สัมผัสกับระบบแนะแนวอัจฉริยะ',
      description: 'เดินเข้ามาใกล้จอ เพื่อค้นหาสาขาที่ใช่สำหรับคุณ',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      icon: '👋',
      pulse: true
    }
  ];

  useEffect(() => {
    // เปลี่ยนสไลด์ทุก 5 วินาที
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const handleClick = () => {
    if (onInteraction) {
      onInteraction();
    }
  };

  return (
    <div className="ad-slideshow" onClick={handleClick}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          className="slide"
          style={{ background: slides[currentSlide].gradient }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <div className="slide-content">
            <motion.div
              className={`slide-icon ${slides[currentSlide].pulse ? 'pulse' : ''}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              {slides[currentSlide].icon}
            </motion.div>

            <motion.h1
              className="slide-title"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {slides[currentSlide].title}
            </motion.h1>

            <motion.h2
              className="slide-subtitle"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {slides[currentSlide].subtitle}
            </motion.h2>

            <motion.p
              className="slide-description"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {slides[currentSlide].description}
            </motion.p>

            {slides[currentSlide].type === 'cta' && (
              <motion.div
                className="cta-hint"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="hand-wave">👋</div>
                <p>เดินเข้ามาใกล้จอ</p>
              </motion.div>
            )}
          </div>

          {/* Progress Dots */}
          <div className="slide-dots">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(index);
                }}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Touch/Click hint */}
      <div className="interaction-hint">
        <p>👆 แตะหน้าจอเพื่อเริ่มใช้งาน</p>
      </div>
    </div>
  );
};

export default AdSlideshow;
