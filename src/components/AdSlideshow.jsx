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

  // รูปภาพโฆษณาของวิทยาลัย
  // วางรูปภาพในโฟลเดอร์ public/images/activities/
  // ตั้งชื่อเป็น 1.jpg, 2.jpg, 3.jpg, ...
  const slides = [
    {
      id: 1,
      type: 'image',
      title: 'ยินดีต้อนรับสู่',
      subtitle: 'วิทยาลัยเทคนิคโปลิเทคนิคลานนา เชียงใหม่',
      description: 'สถาบันการศึกษาชั้นนำด้านช่างอุตสาหกรรมและเทคโนโลยี',
      image: '/images/activities/1.jpg',
      gradient: 'linear-gradient(135deg, rgba(102, 126, 234, 0.7) 0%, rgba(118, 75, 162, 0.7) 100%)',
      icon: '🎓'
    },
    {
      id: 2,
      type: 'image',
      title: '14 สาขาวิชา',
      subtitle: 'เลือกเส้นทางสู่อนาคต',
      description: 'ช่างอุตสาหกรรม | เทคโนโลยี | ธุรกิจ | ศิลปะ',
      image: '/images/activities/2.jpg',
      gradient: 'linear-gradient(135deg, rgba(240, 147, 251, 0.7) 0%, rgba(245, 87, 108, 0.7) 100%)',
      icon: '🛠️'
    },
    {
      id: 3,
      type: 'image',
      title: 'เครื่องมือทันสมัย',
      subtitle: 'ห้องปฏิบัติการมาตรฐานสากล',
      description: 'พร้อมเครื่องมืออุปกรณ์ทันสมัย เทคโนโลยีล่าสุด',
      image: '/images/activities/3.jpg',
      gradient: 'linear-gradient(135deg, rgba(79, 172, 254, 0.7) 0%, rgba(0, 242, 254, 0.7) 100%)',
      icon: '⚙️'
    },
    {
      id: 4,
      type: 'image',
      title: 'กิจกรรมนักเรียน',
      subtitle: 'เรียนรู้นอกห้องเรียน',
      description: 'กิจกรรมหลากหลาย พัฒนาทักษะชีวิต',
      image: '/images/activities/4.jpg',
      gradient: 'linear-gradient(135deg, rgba(250, 112, 154, 0.7) 0%, rgba(254, 225, 64, 0.7) 100%)',
      icon: '🎯'
    },
    {
      id: 5,
      type: 'image',
      title: 'ทำงานได้ทันที',
      subtitle: '95% ได้งานภายใน 6 เดือน',
      description: 'พันธมิตรกับบริษัทชั้นนำกว่า 200 แห่ง',
      image: '/images/activities/5.jpg',
      gradient: 'linear-gradient(135deg, rgba(48, 207, 208, 0.7) 0%, rgba(51, 8, 103, 0.7) 100%)',
      icon: '💼'
    },
    {
      id: 6,
      type: 'image',
      title: 'เปิดรับสมัคร',
      subtitle: 'ปีการศึกษา 2568',
      description: 'สมัครได้ทุกช่องทาง | ค่าเทอมถูก | ทุนการศึกษามากมาย',
      image: '/images/activities/6.jpg',
      gradient: 'linear-gradient(135deg, rgba(168, 237, 234, 0.7) 0%, rgba(254, 214, 227, 0.7) 100%)',
      icon: '📝'
    },
    {
      id: 7,
      type: 'image',
      title: 'ชีวิตนักศึกษา',
      subtitle: 'ประสบการณ์ที่มากกว่าการเรียน',
      description: 'สร้างเพื่อน สร้างความทรงจำ สร้างอนาคต',
      image: '/images/activities/7.jpg',
      gradient: 'linear-gradient(135deg, rgba(255, 159, 124, 0.7) 0%, rgba(255, 95, 109, 0.7) 100%)',
      icon: '🎊'
    },
    {
      id: 8,
      type: 'image',
      title: 'เทคโนโลยีที่ทันสมัย',
      subtitle: 'เรียนรู้กับอุปกรณ์ล้ำสมัย',
      description: 'พร้อมเดินหน้าสู่ยุคดิจิทัล',
      image: '/images/activities/8.jpg',
      gradient: 'linear-gradient(135deg, rgba(67, 198, 172, 0.7) 0%, rgba(25, 22, 84, 0.7) 100%)',
      icon: '💻'
    },
    {
      id: 9,
      type: 'image',
      title: 'ทักษะที่ใช้ได้จริง',
      subtitle: 'ฝึกปฏิบัติมากกว่าทฤษฎี',
      description: 'เรียนรู้จากมืออาชีพ ฝึกฝนจนชำนาญ',
      image: '/images/activities/9.jpg',
      gradient: 'linear-gradient(135deg, rgba(255, 175, 189, 0.7) 0%, rgba(255, 195, 160, 0.7) 100%)',
      icon: '🔧'
    },
    {
      id: 10,
      type: 'image',
      title: 'ร่วมเป็นส่วนหนึ่งของเรา',
      subtitle: 'สร้างอนาคตที่ดีกว่าด้วยกัน',
      description: 'เริ่มต้นเส้นทางสู่ความสำเร็จ',
      image: '/images/activities/10.jpg',
      gradient: 'linear-gradient(135deg, rgba(132, 250, 176, 0.7) 0%, rgba(143, 211, 244, 0.7) 100%)',
      icon: '🌟'
    },
    {
      id: 11,
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
          style={{ 
            background: slides[currentSlide].gradient,
            backgroundImage: slides[currentSlide].image ? `url(${slides[currentSlide].image})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          {/* Overlay for better text readability */}
          {slides[currentSlide].image && (
            <div className="slide-overlay" style={{ background: slides[currentSlide].gradient }}></div>
          )}
          
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
