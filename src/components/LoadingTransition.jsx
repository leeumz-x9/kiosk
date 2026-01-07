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
      transition={{ duration: 0.3 }}
    >
      <div className="loading-container">
        {/* Animated scanning circle */}
        <motion.div
          className="loading-circle"
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(244, 184, 68, 0.7)',
              '0 0 0 30px rgba(244, 184, 68, 0.3)',
              '0 0 0 0 rgba(244, 184, 68, 0)'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut'
          }}
        >
          {/* Inner rotating element */}
          <motion.div
            className="loading-inner"
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            <div className="loading-dot"></div>
          </motion.div>
        </motion.div>

        {/* Loading text */}
        <motion.h2
          className="loading-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          เตรียมเริ่มสแกน
        </motion.h2>

        <motion.p
          className="loading-subtitle"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          โปรดรอสักครู่...
        </motion.p>

        {/* Animated loading bars */}
        <div className="loading-bars">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="loading-bar"
              animate={{
                height: ['10px', '30px', '10px']
              }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>

        {/* Progress text */}
        <motion.p
          className="loading-progress"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          กำลังเปิดกล้อง...
        </motion.p>
      </div>
    </motion.div>
  );
};

export default LoadingTransition;
