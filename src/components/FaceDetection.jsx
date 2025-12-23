import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { motion } from 'framer-motion';
import ScanFrame from './ScanFrame';
import { CAREER_CATEGORIES } from '../config';
import { recordHeatmapClick } from '../firebase';
import './FaceDetection.css';

const FaceDetection = ({ onDetected }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedInfo, setDetectedInfo] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState('');
  const [autoScanAttempts, setAutoScanAttempts] = useState(0);
  const [showConsent, setShowConsent] = useState(true);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [showResultStep, setShowResultStep] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0); // เพิ่ม cooldown timer
  const autoScanIntervalRef = useRef(null);
  const cooldownIntervalRef = useRef(null); // เพิ่ม cooldown interval ref

  useEffect(() => {
    if (consentAccepted) {
      loadModels();
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (autoScanIntervalRef.current) {
        clearInterval(autoScanIntervalRef.current);
      }
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, [consentAccepted]);

  // แก้ไข auto scan logic - ไม่ให้สแกนอัตโนมัติเลย (ให้ user กดเอง)
  useEffect(() => {
    // ปิดการสแกนอัตโนมัติ - ให้ user กดปุ่มเอง
    if (autoScanIntervalRef.current) {
      clearInterval(autoScanIntervalRef.current);
    }
    return () => {
      if (autoScanIntervalRef.current) {
        clearInterval(autoScanIntervalRef.current);
      }
    };
  }, [consentAccepted, isLoading, detectedInfo, autoScanAttempts]);

  const loadModels = async () => {
    try {
      await startVideo();
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading models:', error);
      setIsLoading(false);
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const resetScan = () => {
    setDetectedInfo(null);
    setIsDetecting(false);
    setScanProgress(0);
    setScanStep('');
    setShowResultStep(0);
    setAutoScanAttempts(0);
    setCooldownTime(0); // reset cooldown
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const startCooldown = () => {
    setCooldownTime(10); // เริ่มที่ 10 วินาที
    cooldownIntervalRef.current = setInterval(() => {
      setCooldownTime(prev => {
        if (prev <= 1) {
          clearInterval(cooldownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const detectFace = async () => {
    if (!videoRef.current || isDetecting || cooldownTime > 0) return; // เช็ค cooldown

    setIsDetecting(true);
    setScanProgress(0);
    setScanStep('');

    try {
      // เพิ่มการจำลองการตรวจจับว่ามีใบหน้าหรือไม่
      setScanStep('🔍 กำลังค้นหาใบหน้า...');
      setScanProgress(10);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // จำลองการตรวจจับใบหน้า - 70% โอกาสเจอใบหน้า
      const faceDetected = Math.random() > 0.3;
      
      if (!faceDetected) {
        setScanStep('❌ ไม่พบใบหน้า กรุณายืนหน้ากล้อง');
        setScanProgress(0);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsDetecting(false);
        return;
      }

      setScanStep('✅ พบใบหน้า! กำลังวิเคราะห์...');
      setScanProgress(20);
      await new Promise(resolve => setTimeout(resolve, 800));

      setScanStep('📊 วิเคราะห์อายุ...');
      setScanProgress(40);
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockAge = 17 + Math.floor(Math.random() * 4);

      setScanStep('👤 ระบุเพศ...');
      setScanProgress(60);
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockGender = Math.random() > 0.48 ? 'male' : 'female';

      setScanStep('😊 วิเคราะห์อารมณ์...');
      setScanProgress(80);
      await new Promise(resolve => setTimeout(resolve, 1500));
      // อารมณ์ที่สมจริงสำหรับวัยรุ่น
      const emotionRandom = Math.random();
      const mockExpressions = emotionRandom > 0.6 ? {
        // 40% - ร่าเริง (วัยรุ่นมักยิ้มแย้ม)
        happy: 0.65,
        neutral: 0.25,
        surprised: 0.08,
        sad: 0.02
      } : emotionRandom > 0.3 ? {
        // 30% - สงบ เฉยๆ
        neutral: 0.60,
        happy: 0.25,
        surprised: 0.10,
        sad: 0.05
      } : emotionRandom > 0.15 ? {
        // 15% - อยากรู้อยากเห็น
        surprised: 0.50,
        neutral: 0.30,
        happy: 0.15,
        sad: 0.05
      } : {
        // 15% - จริงจัง
        neutral: 0.50,
        sad: 0.30,
        happy: 0.15,
        surprised: 0.05
      };

      setScanStep('🎯 คำนวณสาขาที่เหมาะสม...');
      setScanProgress(95);
      await new Promise(resolve => setTimeout(resolve, 600));
      const interests = analyzeInterests(mockAge, mockGender, mockExpressions);

      setScanProgress(100);
      setScanStep('✅ วิเคราะห์เสร็จสมบูรณ์');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      setDetectedInfo({
        age: mockAge,
        gender: mockGender,
        expressions: mockExpressions,
        interests
      });

      recordHeatmapClick(0, 0, 'face-scan');

      // เริ่ม cooldown 10 วินาทีหลังสแกนเสร็จ
      startCooldown();

      setTimeout(() => setShowResultStep(1), 1000);   // 1 วิ - อายุ
      setTimeout(() => setShowResultStep(2), 3000);   // 3 วิ - เพศ
      setTimeout(() => setShowResultStep(3), 5500);   // 5.5 วิ - อารมณ์
      setTimeout(() => {
        setShowResultStep(4);
        // เด้งไปหน้าสาขาที่แนะนำทันที (ไม่ต้องรอ user)
        if (onDetected) {
          onDetected(interests);
        }
      }, 8000); // 8 วิ - แสดงสาขา + เด้งไปหน้าถัดไป
    } catch (error) {
      console.error('Error detecting face:', error);
    }

    setIsDetecting(false);
  };

  const analyzeInterests = (age, gender, expressions) => {
    const interests = [];
    
    if (age <= 16) {
      interests.push('co', 'it', 'dt');
    } else if (age <= 18) {
      interests.push('ev', 'it', 'mk');
    } else if (age <= 20) {
      interests.push('ac', 'mk', 'au');
    } else {
      interests.push('au', 'ep', 'ac');
    }

    if (gender === 'male') {
      interests.push('au', 'ev', 'ep', 'el', 'co', 'ct', 'it');
    } else {
      interests.push('ac', 'mk', 'dt', 'hm', 'tg', 'it', 'co');
    }

    const dominantExpression = Object.keys(expressions).reduce((a, b) => 
      expressions[a] > expressions[b] ? a : b
    );

    switch (dominantExpression) {
      case 'happy':
        interests.push('hm', 'tg', 'mk', 'dt');
        break;
      case 'neutral':
        interests.push('ep', 'el', 'ac', 'au', 'co');
        break;
      case 'surprised':
        interests.push('it', 'dt', 'co', 'ev', 'ar');
        break;
      case 'sad':
        interests.push('ar', 'ct', 'el', 'ep');
        break;
      default:
        interests.push('co', 'au', 'ac', 'mk');
    }

    const interestCounts = {};
    interests.forEach(id => {
      interestCounts[id] = (interestCounts[id] || 0) + 1;
    });

    const topInterests = Object.entries(interestCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);

    const allCareerIds = ['au', 'ev', 'ep', 'el', 'co', 'ar', 'ct', 'it', 'ac', 'mk', 'dt', 'tg', 'hm'];
    while (topInterests.length < 3) {
      const randomId = allCareerIds[Math.floor(Math.random() * allCareerIds.length)];
      if (!topInterests.includes(randomId)) {
        topInterests.push(randomId);
      }
    }

    return topInterests;
  };

  const getDominantExpression = (expressions) => {
    const dominant = Object.keys(expressions).reduce((a, b) => 
      expressions[a] > expressions[b] ? a : b
    );
    
    switch (dominant) {
      case 'happy': return '😊 ร่าเริง สดใส';
      case 'neutral': return '😐 สงบ มั่นคง';
      case 'surprised': return '😮 อยากรู้ อยากเห็น';
      default: return '😔 จริงจัง ใคร่ครวญ';
    }
  };

  return (
    <div className="face-detection">
      {showConsent && !consentAccepted && (
        <motion.div 
          className="consent-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="consent-modal"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2>🔒 ความเป็นส่วนตัวและความปลอดภัย</h2>
            <div className="consent-content">
              <p>📸 <strong>ระบบจะใช้กล้องเพื่อ:</strong></p>
              <ul>
                <li>✅ วิเคราะห์อายุและเพศโดยประมาณ</li>
                <li>✅ แนะนำสาขาที่เหมาะสมกับคุณ</li>
                <li>✅ ปรับปรุงประสบการณ์การใช้งาน</li>
              </ul>
              <p>🔐 <strong>เราไม่เก็บข้อมูล:</strong></p>
              <ul>
                <li>❌ ไม่บันทึกภาพหรือวิดีโอ</li>
                <li>❌ ไม่เก็บข้อมูลส่วนบุคคล</li>
                <li>❌ ไม่แชร์ข้อมูลกับบุคคลที่สาม</li>
              </ul>
              <p>🔊 <strong>เสียงพูด:</strong></p>
              <ul>
                <li>✅ ระบบใช้เสียงพูดเพื่อแนะนำสาขา</li>
                <li>⚠️ Browser อาจขอ Notification Permission (กด Deny ได้ เสียงจะทำงานปกติ)</li>
              </ul>
              <p className="consent-note">
                การใช้งานระบบนี้ถือว่าคุณยินยอมให้เข้าถึงกล้องและใช้เสียงพูดตามวัตถุประสงค์ดังกล่าว
              </p>
            </div>
            <div className="consent-actions">
              <button 
                className="btn-decline"
                onClick={() => {
                  setShowConsent(false);
                }}
              >
                ❌ ไม่ยินยอม
              </button>
              <button 
                className="btn-accept"
                onClick={() => {
                  setConsentAccepted(true);
                  setShowConsent(false);
                }}
              >
                ✅ ยินยอม
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {consentAccepted && (
        <>
          <ScanFrame 
            status={isDetecting ? scanStep : isLoading ? 'กำลังโหลด...' : 'พร้อมสแกน'} 
            showProgress={isDetecting}
            progress={scanProgress}
          >
            <div className="video-container">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                width="640"
                height="480"
                onLoadedMetadata={() => {
                  if (canvasRef.current) {
                    canvasRef.current.width = videoRef.current.videoWidth;
                    canvasRef.current.height = videoRef.current.videoHeight;
                  }
                }}
              />
              <canvas ref={canvasRef} className="detection-canvas" />
              
              {isLoading && (
                <div className="loading-overlay">
                  <div className="loader"></div>
                  <p>กำลังโหลดระบบตรวจจับใบหน้า...</p>
                </div>
              )}
            </div>
          </ScanFrame>

          {!isLoading && !detectedInfo && (
            <motion.div
              className="scan-status-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p>{isDetecting ? scanStep : '👤 ยืนหน้ากล้องเพื่อสแกนอัตโนมัติ'}</p>
              {isDetecting && (
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${scanProgress}%` }}>
                    <span>{scanProgress}%</span>
                  </div>
                </div>
              )}
              <motion.button
                className="btn-scan"
                onClick={detectFace}
                disabled={isDetecting || cooldownTime > 0} // ปิดปุ่มถ้าอยู่ใน cooldown
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isDetecting ? '⏳ กำลังสแกน...' : cooldownTime > 0 ? `⏳ รอ ${cooldownTime} วินาที` : '🎯 สแกนด้วยตนเอง'}
              </motion.button>
            </motion.div>
          )}

          {detectedInfo && (
            <motion.div 
              className="detection-result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3>✨ ผลการสแกน AI วิเคราะห์</h3>
              <div className="result-grid">
                {showResultStep >= 1 && (
                  <motion.div 
                    className="result-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <span className="label">อายุโดยประมาณ</span>
                    <span className="value">{detectedInfo.age} ปี</span>
                  </motion.div>
                )}
                
                {showResultStep >= 2 && (
                  <motion.div 
                    className="result-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="label">เพศ</span>
                    <span className="value">{detectedInfo.gender === 'male' ? 'ชาย' : 'หญิง'}</span>
                  </motion.div>
                )}
                
                {showResultStep >= 3 && (
                  <motion.div 
                    className="result-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <span className="label">บุคลิก/อารมณ์</span>
                    <span className="value">
                      {getDominantExpression(detectedInfo.expressions)}
                    </span>
                  </motion.div>
                )}
              </div>
              
              {showResultStep >= 4 && (
                <motion.div
                  className="interest-tags"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="label">🎯 สาขาที่แนะนำสำหรับคุณ</p>
                  <div className="tags">
                    {detectedInfo.interests.map(interest => {
                      const category = CAREER_CATEGORIES.find(c => c.id === interest);
                      return (
                        <motion.span 
                          key={interest} 
                          className="tag"
                          style={{ borderColor: category?.color, color: category?.color }}
                          whileHover={{ scale: 1.1 }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          {category?.icon} {category?.name}
                        </motion.span>
                      );
                    })}
                  </div>
                </motion.div>
              )}
              
              {showResultStep >= 4 && (
                <motion.div
                  className="reset-actions"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <button 
                    className="btn-reset"
                    onClick={resetScan}
                  >
                    🔄 สแกนใหม่อีกครั้ง
                  </button>
                  <button 
                    className="btn-next-user"
                    onClick={() => {
                      resetScan();
                      if (onDetected) {
                        onDetected([]);
                      }
                    }}
                  >
                    👥 คนต่อไป
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default FaceDetection;
