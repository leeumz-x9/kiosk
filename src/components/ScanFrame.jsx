import React from 'react';
import { motion } from 'framer-motion';
import './ScanFrame.css';

const ScanFrame = ({ children, status = 'Ready', showProgress = false }) => {
  return (
    <motion.div 
      className="scan-frame-container"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="tech-scan-frame">
        {/* Corner Brackets */}
        <div className="corner-tl"></div>
        <div className="corner-tr"></div>
        <div className="corner-bl"></div>
        <div className="corner-br"></div>
        
        {/* Scanning Lines */}
        <div className="scan-lines"></div>
        <div className="scan-line-horizontal"></div>
        
        {/* Tech Info */}
        <div className="scan-info">► LANNA POLY AI</div>
        
        {/* Content */}
        {children}
        
        {/* Progress Bar */}
        {showProgress && (
          <div className="scan-progress">
            <div className="scan-progress-bar"></div>
          </div>
        )}
        
        {/* Status Text */}
        <div className="scan-status">{status}</div>
      </div>
    </motion.div>
  );
};

export default ScanFrame;
