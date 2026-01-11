import React from 'react';
import { motion } from 'framer-motion';
import './LoadingTransition.css';

const LoadingTransition = () => {
  return (
    <motion.div
      className="loading-transition-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 1.0,
        ease: [0.4, 0, 0.2, 1]
      }}
      style={{ 
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)'
      }}
    >
      <div className="loading-container">
        {/* Static scanning circle - no animation */}
        <motion.div
          className="loading-circle"
          style={{ 
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
            boxShadow: '0 0 0 10px rgba(244, 184, 68, 0.3)'
          }}
        >
          {/* Static inner element - no rotation */}
          <motion.div
            className="loading-inner"
            style={{ 
              transform: 'translateZ(0) rotate(0deg)',
              WebkitTransform: 'translateZ(0) rotate(0deg)'
            }}
          >
            style={{ 
              transform: 'translateZ(0) rotate(0deg)',
              WebkitTransform: 'translateZ(0) rotate(0deg)'
            }}
          >
            <div className="loading-dot"></div>
          </motion.div>
        </motion.div>

        {/* Static loading text */}
        <motion.h2
          className="loading-title"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          style={{ 
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)'
          }}
        >
          เตรียมเริ่มสแกน
        </motion.h2>

        <motion.p
          className="loading-subtitle"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          style={{ 
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)'
          }}
        >
          โปรดรอสักครู่...
        </motion.p>

        {/* Static loading bars - no animation */}
        <div className="loading-bars">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="loading-bar"
              style={{ 
                transform: 'translateZ(0)',
                WebkitTransform: 'translateZ(0)',
                height: '20px'
              }}
            />
          ))}
        </div>

        {/* Static progress text */}
        <motion.p
          className="loading-progress"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          style={{ 
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)'
          }}
        >
          กำลังเปิดกล้อง...
        </motion.p>
      </div>
    </motion.div>
  );
};

export default LoadingTransition;
