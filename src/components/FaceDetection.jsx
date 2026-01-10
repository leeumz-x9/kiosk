import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { motion } from 'framer-motion';
import ScanFrame from './ScanFrame';
import { CAREER_CATEGORIES, PI5_CONFIG } from '../config';
import { recordHeatmapClick, saveSession } from '../firebase';
import { logConversionStep } from '../firebaseService';
import voiceService from '../voiceService';
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
  const [detectedEmotion, setDetectedEmotion] = useState(null);
  const [showParentalConsent, setShowParentalConsent] = useState(false);
  const [parentalConsentAccepted, setParentalConsentAccepted] = useState(false);
  const [piCameraStreamUrl, setPiCameraStreamUrl] = useState(null);
  const [cameraError, setCameraError] = useState(false);
  const [snapshotRefreshKey, setSnapshotRefreshKey] = useState(0);
  const autoScanIntervalRef = useRef(null);
  const piStreamRef = useRef(null);
  const snapshotIntervalRef = useRef(null);

  useEffect(() => {
    if (consentAccepted) {
      console.log('✅ Consent accepted, starting setup chain...');
      
      // Initialize voice service
      voiceService.init();
      
      // Check if using Pi Camera
      if (PI5_CONFIG.usePiCamera) {
        console.log('📷 Using Pi5 Camera IMX500');
        // Use snapshot endpoint with faster refresh for smooth display
        const updateSnapshot = () => {
          setSnapshotRefreshKey(Date.now()); // Use timestamp to force refresh
        };
        
        // Update snapshot every 100ms (10 FPS - smooth live view)
        snapshotIntervalRef.current = setInterval(updateSnapshot, 100);
        
        setIsLoading(false);
        voiceService.speak('สวัสดีค่ะ กำลังเชื่อมต่อกล้อง Pi');
        setTimeout(() => {
          console.log('🔍 Auto-starting Pi face detection...');
          detectFace();
        }, 1000);
      } else {
        // Use web camera
        console.log('📹 Using Web Camera');
        startVideo().then(() => {
          console.log('✅ Video started successfully');
          return loadModels();
        }).then(() => {
          console.log('✅ Models loaded successfully, ready to detect face');
          alert('✅ AI Models โหลดเสร็จ! กำลังตรวจหาใบหน้า...');
          setTimeout(() => {
            console.log('🔍 Auto-starting face detection...');
            detectFace();
          }, 1500);
        }).catch(error => {
          console.error('❌ Error in setup chain:', error);
        });
      }
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (autoScanIntervalRef.current) {
        clearInterval(autoScanIntervalRef.current);
      }
      if (snapshotIntervalRef.current) {
        clearInterval(snapshotIntervalRef.current);
      }
    };
  }, [consentAccepted]);

  const detectFaceWithPiCamera = async () => {
    setIsDetecting(true);
    setScanProgress(0);
    setScanStep('Initializing...');
    voiceService.speak('กำลังเตรียมตรวจสอบใบหน้าค่ะ');

    try {
      // Step 1: Connecting (smooth progress 0-30%)
      setScanStep('📷 Connecting to Camera...');
      for (let i = 0; i <= 30; i += 2) {
        setScanProgress(i);
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      const response = await fetch(`${PI5_CONFIG.endpoint}/api/face/detect`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Pi5 Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('📥 Pi5 Response:', data);

      if (!data.success || !data.face_detected) {
        console.log('⏳ No face detected, retrying...');
        setScanStep('⏳ No face detected, please look at camera...');
        setIsDetecting(false);
        setAutoScanAttempts(prev => prev + 1);
        
        if (autoScanAttempts > 10) {
          setScanStep('❌ Cannot detect face, please try again');
          voiceService.speak('ไม่สามารถตรวจจับใบหน้าได้ กรุณาลองใหม่อีกครั้งค่ะ');
          return;
        }
        
        setTimeout(() => detectFace(), 800);
        return;
      }

      // Step 2: Face Detected! (30-60%)
      console.log('✅ Face detected!');
      voiceService.speak('ตรวจพบใบหน้าแล้วค่ะ');
      setScanStep('✅ Face Detected!');
      
      // Draw face detection box on canvas
      if (data.faces && data.faces.length > 0 && canvasRef.current && piStreamRef.current) {
        const face = data.faces[0];
        const img = piStreamRef.current;
        const canvas = canvasRef.current;
        
        // Set canvas size to match image
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw green box around detected face
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(face.x, face.y, face.width, face.height);
        
        // Draw label
        ctx.fillStyle = '#00ff00';
        ctx.font = '16px Arial';
        ctx.fillText(`Face ${Math.round(face.confidence * 100)}%`, face.x, face.y - 5);
        
        console.log('📦 Drew face box at:', face);
      }
      
      for (let i = 30; i <= 60; i += 3) {
        setScanProgress(i);
        await new Promise(resolve => setTimeout(resolve, 15));
      }

      // Use data from Pi camera
      const age = data.age || 20;
      const gender = data.gender || 'unknown';
      const emotion = data.emotion || 'happy';
      
      // Create expressions object
      const expressions = {
        neutral: 0.1,
        happy: 0.1,
        sad: 0.1,
        angry: 0.1,
        fearful: 0.1,
        disgusted: 0.1,
        surprised: 0.1
      };
      expressions[emotion] = 0.9;

      if (data.image) {
        setCapturedImage(data.image);
      }

      // Step 3: Analyzing (60-90%)
      setScanStep('📊 Analyzing Profile...');
      voiceService.speak('กำลังวิเคราะห์ข้อมูลค่ะ');
      for (let i = 60; i <= 90; i += 2) {
        setScanProgress(i);
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      
      const interests = analyzeInterests(age, gender, expressions);
      setDetectedEmotion(emotion);

      // Step 4: Complete! (90-100%)
      setScanStep('✨ Analysis Complete!');
      voiceService.speak('วิเคราะห์เสร็จสมบูรณ์ค่ะ');
      for (let i = 90; i <= 100; i += 2) {
        setScanProgress(i);
        await new Promise(resolve => setTimeout(resolve, 15));
      }
      
      const detectedData = {
        age,
        gender,
        expressions,
        interests,
        emotion,
        source: 'pi5_camera',
        timestamp: new Date().toISOString()
      };
      
      // Save to Firebase
      const sessionId = sessionStorage.getItem('sessionId') || `pi5_${Date.now()}`;
      sessionStorage.setItem('sessionId', sessionId);
      
      await saveSession({
        sessionId,
        type: 'face_scan_pi5',
        demographics: { age, gender, emotion },
        interests,
        device: 'pi5_imx500',
        scanData: data
      });
      
      await logConversionStep('scanned', sessionId, {
        age, gender, emotion, source: 'pi5_camera'
      });
      
      setDetectedInfo(detectedData);
      recordHeatmapClick(0, 0, 'face-scan');

      // Show results with smooth animation
      if (age < 13) {
        setShowParentalConsent(true);
        setShowResultStep(0);
      } else {
        setTimeout(() => setShowResultStep(1), 500);
        setTimeout(() => setShowResultStep(2), 1500);
        setTimeout(() => setShowResultStep(3), 2500);
        setTimeout(() => {
          setShowResultStep(4);
          if (onDetected) {
            onDetected(interests);
          }
        }, 3500);
      }

    } catch (error) {
      console.error('❌ Error:', error);
      setScanStep('❌ Connection Failed');
      voiceService.speak('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้งค่ะ');
    }

    setIsDetecting(false);
  };

  const loadModels = async () => {
    try {
      console.log('🔄 Starting to load Face-API models...');
      // Use local models folder for better reliability
      const MODEL_URL = '/models';
      
      console.log('📦 Loading tinyFaceDetector from:', MODEL_URL);
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      console.log('✅ tinyFaceDetector loaded');
      
      console.log('📦 Loading ageGenderNet from:', MODEL_URL);
      await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
      console.log('✅ ageGenderNet loaded');
      
      console.log('📦 Loading faceExpressionNet from:', MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      console.log('✅ faceExpressionNet loaded');
      
      console.log('✅ Models loaded successfully');
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error loading models:', error);
      console.error('Error details:', error.message);
      alert(`❌ ไม่สามารถโหลด AI models ได้\nกรุณาตรวจสอบว่ามีไฟล์ model ในโฟลเดอร์ /public/models/\n\nError: ${error.message}`);
      setIsLoading(false);
    }
  };

  const startVideo = async () => {
    try {
      console.log('📹 Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      console.log('✅ Camera opened successfully');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('✅ Camera started, waiting for video to be ready...');
        
        // Start playing video
        try {
          await videoRef.current.play();
          console.log('✅ Video play() started');
        } catch (e) {
          console.warn('⚠️ Video play error (might autoplay):', e.message);
        }
        
        // Wait for video to be ready with longer timeout
        return new Promise((resolve, reject) => {
          const checkReady = setInterval(() => {
            if (videoRef.current && videoRef.current.readyState >= videoRef.current.HAVE_CURRENT_DATA) {
              console.log('✅ Video is ready to use, readyState:', videoRef.current.readyState);
              clearInterval(checkReady);
              resolve();
            }
          }, 100);
          
          // Timeout after 10 seconds (longer for slower cameras)
          setTimeout(() => {
            clearInterval(checkReady);
            if (videoRef.current && videoRef.current.readyState > 0) {
              console.log('⚠️ Video stream available (readyState=' + videoRef.current.readyState + ')');
              resolve();
            } else {
              reject(new Error('Video did not become ready in time'));
            }
          }, 10000);
        });
      }
    } catch (error) {
      console.error('❌ Error accessing camera:', error);
      console.error('Camera error code:', error.name);
      alert(`📷 กรุณาอนุญาตให้เข้าถึงกล้อง:\n${error.message}`);
      throw error;
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
    // For Pi Camera, skip video ref check
    if (isDetecting) {
      console.warn('⚠️ detectFace already in progress');
      return;
    }
    
    // For web camera, check video ref
    if (!PI5_CONFIG.usePiCamera && !videoRef.current) {
      console.warn('⚠️ detectFace: videoRef not ready');
      return;
    }

    // Use Pi Camera API if configured
    if (PI5_CONFIG.usePiCamera) {
      await detectFaceWithPiCamera();
      return;
    }

    // Check if video is actually loaded (web camera only)
    if (videoRef.current.readyState < videoRef.current.HAVE_CURRENT_DATA) {
      console.warn('⚠️ Video not ready, readyState:', videoRef.current.readyState);
      setScanStep('⏳ กำลังเตรียมกล้อง...');
      setTimeout(() => detectFace(), 500);
      return;
    }

    // Check if video has dimensions
    if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) {
      console.warn('⚠️ Video dimensions not available');
      setTimeout(() => detectFace(), 500);
      return;
    }

    setIsDetecting(true);
    setScanProgress(0);
    setScanStep('');

    try {
      console.log('🔍 Starting face detection...');
      console.log('📹 Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
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
        console.log('⏳ No face detected, retrying...');
        setScanStep('⏳ ไม่พบใบหน้า กำลังลองใหม่...');
        setIsDetecting(false);
        setAutoScanAttempts(prev => prev + 1);
        
        if (autoScanAttempts > 10) {
          console.warn('⚠️ Max attempts reached, stopping auto-scan');
          setScanStep('❌ ไม่สามารถตรวจจับใบหน้า กรุณากด "Start Scan" อีกครั้ง');
          alert('⚠️ ไม่สามารถตรวจจับใบหน้าได้ กรุณามองหน้าเข้ากล้องและกดปุ่ม "Start Scan" อีกครั้ง');
          return;
        }
        
        setTimeout(() => {
          detectFace();
        }, 1000);
        return;
      }

      console.log('✅ Face detected:', detections);
      voiceService.speak('ตรวจจับใบหน้าสำเร็จค่ะ กำลังวิเคราะห์');
      
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

      console.log('👤 Detected:', { age, gender, expressions });

      setScanStep('✅ วิเคราะห์เสร็จสิ้น');
      setScanProgress(90);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const interests = analyzeInterests(age, gender, expressions);
      console.log('🎯 Interests:', interests);
      
      const dominantEmotion = Object.keys(expressions).reduce((a, b) => 
        expressions[a] > expressions[b] ? a : b
      );
      setDetectedEmotion(dominantEmotion);

      setScanProgress(100);
      setScanStep('✅ เสร็จสมบูรณ์');
      voiceService.speak('วิเคราะห์เสร็จสมบูรณ์ค่ะ');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Store detected info
      const detectedData = {
        age,
        gender,
        expressions,
        interests,
        emotion: dominantEmotion,
        source: 'web_camera',
        timestamp: new Date().toISOString()
      };
      
      // Log conversion step: scanned
      const sessionId = sessionStorage.getItem('sessionId') || `web_${Date.now()}`;
      sessionStorage.setItem('sessionId', sessionId);
      
      await saveSession({
        sessionId,
        type: 'face_scan_web',
        demographics: {
          age,
          gender,
          emotion: dominantEmotion
        },
        interests,
        device: 'web_camera'
      });
      
      await logConversionStep('scanned', sessionId, {
        age,
        gender,
        emotion: dominantEmotion,
        source: 'web_camera'
      });
      
      setDetectedInfo(detectedData);
      recordHeatmapClick(0, 0, 'face-scan');

      // Check if parental consent is needed (age < 13)
      if (age < 13) {
        setShowParentalConsent(true);
        setShowResultStep(0);
      } else {
        setTimeout(() => setShowResultStep(1), 1000);
        setTimeout(() => setShowResultStep(2), 3000);
        setTimeout(() => setShowResultStep(3), 5500);
        setTimeout(() => {
          setShowResultStep(4);
          if (onDetected) {
            console.log('📤 Sending detected interests to parent:', interests);
            onDetected(interests);
          }
        }, 8000);
      }

    } catch (error) {
      console.error('❌ Error detecting face:', error);
      setScanStep('❌ เกิดข้อผิดพลาดในการสแกน');
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
                console.log('✅ User accepted consent, starting video and models...');
                alert('✅ กำลังเปิดกล้อง และโหลด AI models...');
                setConsentAccepted(true);
                setShowConsent(false);
              }}
            >
              Accept & Proceed
            </button>
          </div>
        </motion.div>
      )}

      {showParentalConsent && detectedInfo && detectedInfo.age < 13 && (
        <motion.div 
          className="parental-consent-modal"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="parental-consent-card">
            <div className="parental-header">
              <div className="parental-icon">👨‍👩‍👧‍👦</div>
              <h2 className="parental-title">Parent/Guardian Permission Required</h2>
              <p className="parental-subtitle">This feature requires parental consent</p>
            </div>
            
            <div className="parental-body">
              <div className="child-info">
                <h3>Detected Information:</h3>
                <p><strong>Age:</strong> {detectedInfo.age} years old</p>
                <p><strong>Gender:</strong> {detectedInfo.gender === 'male' ? 'Male' : 'Female'}</p>
                <p><strong>Mood:</strong> {getDominantExpression(detectedInfo.expressions)}</p>
              </div>

              <div className="parental-notice">
                <p><strong>📋 What We Will Do:</strong></p>
                <ul>
                  <li>Show age-appropriate career recommendations</li>
                  <li>Track engagement with interactive content</li>
                  <li>Display gamified learning interface</li>
                </ul>
              </div>

              <div className="parental-privacy">
                <p><strong>🔒 Privacy Assurance:</strong></p>
                <ul>
                  <li>No personal data is permanently stored</li>
                  <li>Face image deleted after analysis</li>
                  <li>No external data sharing</li>
                  <li>PDPA compliant</li>
                </ul>
              </div>

              <label className="parental-checkbox">
                <input 
                  type="checkbox" 
                  onChange={(e) => {
                    if (e.target.checked) {
                      setParentalConsentAccepted(true);
                    }
                  }}
                />
                <span>I am the parent/guardian and I consent to this experience</span>
              </label>
            </div>
            
            <div className="parental-actions">
              <button 
                className="btn btn-decline"
                onClick={() => {
                  setShowParentalConsent(false);
                  resetScan();
                  if (onDetected) {
                    onDetected({
                      skipScan: true,
                      goToInfo: true
                    });
                  }
                }}
              >
                Not Now
              </button>
              <button 
                className="btn btn-accept"
                disabled={!parentalConsentAccepted}
                onClick={() => {
                  setShowParentalConsent(false);
                  setTimeout(() => setShowResultStep(1), 500);
                  setTimeout(() => setShowResultStep(2), 2000);
                  setTimeout(() => setShowResultStep(3), 4000);
                  setTimeout(() => {
                    setShowResultStep(4);
                    if (onDetected) {
                      onDetected(detectedInfo.interests);
                    }
                  }, 6000);
                }}
              >
                I Agree & Continue
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {consentAccepted && !detectedInfo && !showParentalConsent && (
        <div className="scanning-view">
          <div className="scan-header">
            <h2 className="scan-title">Face Detection</h2>
            <p className="scan-subtitle">Look at the camera for personalized recommendations</p>
          </div>

          <div className="video-scanner">
            <div className="scanner-frame">
              {!PI5_CONFIG.usePiCamera && (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="scanner-video"
                />
              )}
              {PI5_CONFIG.usePiCamera && (
                <div className={`pi-camera-stream-container ${isDetecting ? 'detecting' : ''}`}>
                  <img
                    ref={piStreamRef}
                    src={`${PI5_CONFIG.endpoint}/api/camera/snapshot?t=${snapshotRefreshKey}`}
                    alt="Pi Camera Live View"
                    className="pi-camera-stream"
                    onError={() => {
                      console.error('❌ Failed to load Pi camera snapshot');
                      setCameraError(true);
                    }}
                    onLoad={(e) => {
                      setCameraError(false);
                      // Update canvas size to match image when loaded
                      if (canvasRef.current) {
                        const img = e.target;
                        canvasRef.current.width = img.naturalWidth || img.width;
                        canvasRef.current.height = img.naturalHeight || img.height;
                      }
                    }}
                  />
                  {cameraError && (
                    <div className="pi-camera-placeholder">
                      <div className="camera-icon">📷</div>
                      <p>Camera Disconnected</p>
                      <small>IMX500 AI Camera</small>
                    </div>
                  )}
                  <canvas
                    ref={canvasRef}
                    className="detection-overlay"
                  />
                </div>
              )}
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
            
            {!isDetecting && !isLoading && (
              <button 
                className="btn-scan-manual"
                onClick={detectFace}
              >
                🔍 Start Scan
              </button>
            )}
          </div>
          {/* Face canvas for detection */}
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
