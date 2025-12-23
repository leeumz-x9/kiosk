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
  const [capturedImage, setCapturedImage] = useState(null);
  const autoScanIntervalRef = useRef(null);

  useEffect(() => {
    if (consentAccepted) {
      loadModels().then(() => {
        // Auto-start scan after models loaded
        setTimeout(() => {
          detectFace();
        }, 1000);
      });
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (autoScanIntervalRef.current) {
        clearInterval(autoScanIntervalRef.current);
      }
    };
  }, [consentAccepted]);

  const loadModels = async () => {
    try {
      const MODEL_URL = '/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);
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
    setCapturedImage(null);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const detectFace = async () => {
    if (isDetecting || !videoRef.current) return;

    setIsDetecting(true);
    setScanProgress(0);
    setScanStep('');

    try {
      setScanStep('🔍 กำลังตรวจจับใบหน้า...');
      setScanProgress(20);

      // Try detecting with lower threshold for better detection
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({
          inputSize: 416,
          scoreThreshold: 0.3
        }))
        .withAgeAndGender()
        .withFaceExpressions();

      if (!detections) {
        // Auto retry after 2 seconds instead of showing alert
        setScanStep('⏳ ไม่พบใบหน้า กำลังลองใหม่...');
        setIsDetecting(false);
        setTimeout(() => {
          detectFace();
        }, 2000);
        return;
      }

      // Capture face image
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, 200, 200);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);

      setScanStep('📊 กำลังวิเคราะห์...');
      setScanProgress(60);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const age = Math.round(detections.age);
      const gender = detections.gender;
      const expressions = detections.expressions;

      setScanStep('✅ วิเคราะห์เสร็จสิ้น');
      setScanProgress(90);
      await new Promise(resolve => setTimeout(resolve, 500));
      const interests = analyzeInterests(age, gender, expressions);

      setScanProgress(100);
      setScanStep('✅ เสร็จสมบูรณ์');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      setDetectedInfo({
        age,
        gender,
        expressions,
        interests
      });

      recordHeatmapClick(0, 0, 'face-scan');

      setTimeout(() => setShowResultStep(1), 1000);
      setTimeout(() => setShowResultStep(2), 3000);
      setTimeout(() => setShowResultStep(3), 5500);
      setTimeout(() => {
        setShowResultStep(4);
        if (onDetected) {
          onDetected(interests);
        }
      }, 8000);
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
    <div className="face-detection-container">
      {showConsent && !consentAccepted && (
        <motion.div 
          className="consent-card"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="consent-header">
            <div className="consent-icon">🔒</div>
            <h2 className="consent-title">Privacy & Data Protection</h2>
            <p className="consent-subtitle">PDPA Compliance Notice</p>
          </div>
          
          <div className="consent-body">
            <p className="consent-text">
              <strong>We will use the following data:</strong>
            </p>
            <ul className="consent-list">
              <li className="consent-item">Facial scan for age and gender detection</li>
              <li className="consent-item">Facial expression analysis</li>
              <li className="consent-item">Temporary video recording during scan</li>
            </ul>
            
            <p className="consent-text">
              <strong>We do NOT:</strong>
            </p>
            <ul className="consent-list">
              <li className="consent-item">Store your personal data</li>
              <li className="consent-item">Use microphone or record audio</li>
              <li className="consent-item">Share information with third parties</li>
            </ul>
            
            <p className="consent-text">
              By accepting, you consent to temporary facial analysis for career recommendations.
            </p>
          </div>
          
          <div className="consent-actions">
            <button 
              className="btn btn-decline"
              onClick={() => {
                setShowConsent(false);
                if (onDetected) {
                  onDetected({
                    skipScan: true,
                    goToInfo: true
                  });
                }
              }}
            >
              Decline
            </button>
            <button 
              className="btn btn-accept"
              onClick={() => {
                setConsentAccepted(true);
                setShowConsent(false);
              }}
            >
              Accept & Proceed
            </button>
          </div>
        </motion.div>
      )}

      {consentAccepted && !detectedInfo && (
        <div className="scanning-view">
          <div className="scan-header">
            <h2 className="scan-title">Face Detection</h2>
            <p className="scan-subtitle">Look at the camera for personalized recommendations</p>
          </div>

          <div className="video-scanner">
            <div className="scanner-frame">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="scanner-video"
              />
              <div className="scan-circle">
                {isDetecting && (
                  <>
                    <div className="scan-line"></div>
                    <div className="scan-corners">
                      <div className="corner corner-tl"></div>
                      <div className="corner corner-tr"></div>
                      <div className="corner corner-bl"></div>
                      <div className="corner corner-br"></div>
                    </div>
                    <div className="scan-grid"></div>
                    <div className="scan-particles">
                      {[...Array(20)].map((_, i) => (
                        <div key={i} className="particle" style={{
                          '--delay': `${i * 0.1}s`,
                          '--angle': `${i * 18}deg`
                        }}></div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <p className="scan-status">
              {isDetecting ? scanStep || 'Analyzing...' : isLoading ? 'Loading AI Models...' : 'Ready to Scan'}
            </p>
          </div>

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}

      {detectedInfo && (
        <motion.div 
          className="detection-result"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="result-hero">
            <h2 className="hero-title">
              FIND YOUR PATH.<br/>
              <span className="hero-highlight">UNLOCK & FUTURE.</span>
            </h2>
          </div>

          <div className="recommendation-card">
            <div className="card-header">PERSONALIZED RECOMMENDATION</div>
            <div className="card-body">
              <div className="profile-section">
                <div className="profile-avatar">
                  <div className="avatar-circle">
                    {capturedImage ? (
                      <img src={capturedImage} alt="Scanned face" className="avatar-image" />
                    ) : (
                      <span className="avatar-placeholder">👤</span>
                    )}
                  </div>
                </div>

                <div className="profile-info">
                  {showResultStep >= 1 && (
                    <motion.div 
                      className="info-row"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <span className="info-label">Age:</span>
                      <span className="info-value">{detectedInfo.age}</span>
                    </motion.div>
                  )}
                  
                  {showResultStep >= 2 && (
                    <motion.div 
                      className="info-row"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <span className="info-label">Gender:</span>
                      <span className="info-value">{detectedInfo.gender === 'male' ? 'Male' : 'Female'}</span>
                    </motion.div>
                  )}
                  
                  {showResultStep >= 3 && (
                    <motion.div 
                      className="info-row"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <span className="info-label">Mood:</span>
                      <span className="info-value">{getDominantExpression(detectedInfo.expressions)}</span>
                    </motion.div>
                  )}

                  {showResultStep >= 4 && (
                    <motion.div
                      className="interests-section"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p className="interests-title">Based on your profile, you might interested in:</p>
                      <ul className="interests-list">
                        {detectedInfo.interests.map((interest, index) => {
                          const category = CAREER_CATEGORIES.find(c => c.id === interest);
                          return (
                            <motion.li 
                              key={interest} 
                              className="interest-item"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              {category?.name}
                            </motion.li>
                          );
                        })}
                      </ul>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>

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
                Not Interested, Explore All
              </button>
              <button 
                className="btn-next"
                onClick={() => {
                  if (onDetected) {
                    onDetected(detectedInfo.interests);
                  }
                }}
              >
                Show Me!
              </button>
            </motion.div>
          )}

          {showResultStep >= 4 && (
            <motion.div
              className="result-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="footer-note">
                AI-Powered Career Recommendations
              </div>
              <div className="footer-icon">🎯</div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default FaceDetection;
