import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import geminiService, { askGemini, resetChat, getGreeting } from '../geminiService';
import voiceService, { speak, stopSpeaking, GREETINGS, CAREER_PHRASES } from '../voiceService';
import './AvatarVideo.css';

function AvatarVideo({ onClose, interests = [] }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentVideo, setCurrentVideo] = useState('idle');
  const [showChat, setShowChat] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef(null);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'th-TH';
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  // Preload videos
  useEffect(() => {
    const videosToPreload = ['idle', 'talk', 'bye'];
    videosToPreload.forEach(videoName => {
      const video = document.createElement('video');
      video.src = `/VDO/${videoName}.mp4`;
      video.preload = 'auto';
    });
  }, []);

  useEffect(() => {
    // เล่นวิดีโอเริ่มต้น
    if (videoRef.current) {
      videoRef.current.play();
    }

    // ทักทายเมื่อเปิด
    if (!hasGreeted) {
      setTimeout(() => {
        const greeting = getGreeting();
        playVideoAndSpeak('talk', greeting);
        setMessages([{ role: 'assistant', content: greeting }]);
        setHasGreeted(true);
      }, 500);
    }

    return () => {
      stopSpeaking();
      resetChat();
    };
  }, []);

  const playVideoAndSpeak = (videoType, text) => {
    // เปลี่ยนวิดีโอแบบ smooth
    const video = videoRef.current;
    if (video) {
      // Fade out
      video.style.transition = 'opacity 0.2s ease';
      video.style.opacity = '0.5';
      
      setTimeout(() => {
        setCurrentVideo(videoType);
        setIsSpeaking(true);
        
        // เล่นวิดีโอแบบ loop ตลอดเวลาที่พูด
        video.loop = true;
        video.play().then(() => {
          // Fade in
          video.style.opacity = '1';
        });
      }, 200);
    }

    // พูด
    speak(text, 'th', () => {
      // พูดจบทันที - กลับไป idle และพร้อมรับฟังคำถามใหม่
      const video = videoRef.current;
      if (video) {
        video.loop = false;
        video.style.opacity = '0.5';
        
        setTimeout(() => {
          setCurrentVideo('idle');
          setIsSpeaking(false);
          video.loop = true; // idle loop - พร้อมรับฟังคำถามใหม่
          video.play().then(() => {
            video.style.opacity = '1';
          });
        }, 200);
      } else {
        setCurrentVideo('idle');
        setIsSpeaking(false);
      }
    });
  };

  const handleVideoEnd = () => {
    // ถ้าเป็นวิดีโอ idle ให้วนซ้ำ
    if (currentVideo === 'idle') {
      if (videoRef.current) {
        videoRef.current.play();
      }
    }
    // ถ้ากำลังพูดอยู่ ให้วิดีโอวนซ้ำต่อไป
    else if (isSpeaking) {
      if (videoRef.current) {
        videoRef.current.play();
      }
    }
    // ถ้าไม่ใช่กรณีข้างต้น ให้กลับไป idle
    else {
      setCurrentVideo('idle');
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText('');
    
    // เพิ่มข้อความผู้ใช้
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // แสดงสถานะกำลังคิด
    setIsThinking(true);
    setCurrentVideo('idle');

    try {
      // ส่งคำถามไปยัง Gemini (ภาษาไทยเท่านั้น)
      const response = await askGemini(userMessage);
      
      // เพิ่มข้อความตอบกลับ
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      
      // พูดและแสดงวิดีโอ talk
      playVideoAndSpeak('talk', response);
      
    } catch (error) {
      console.error('Error asking Gemini:', error);
      const errorMsg = 'ขอโทษค่ะ เกิดข้อผิดพลาดในการเชื่อมต่อ ลองใหม่อีกครั้งนะคะ 😊';
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
      playVideoAndSpeak('talk', errorMsg);
    } finally {
      setIsThinking(false);
    }
  };

  const handleQuickQuestion = (question, videoType = 'talk') => {
    setInputText(question);
    setTimeout(() => handleSend(), 100);
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('เบราว์เซอร์ของคุณไม่รองรับการรับเสียง กรุณาใช้ Google Chrome');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setCurrentVideo('idle');
      } catch (error) {
        console.error('Error starting recognition:', error);
        setIsListening(false);
      }
    }
  };

  const handleClose = () => {
    // เล่นวิดีโอลาก่อน
    setCurrentVideo('bye');
    playVideoAndSpeak('bye', 'ขอบคุณที่มาพูดคุยนะคะ หวังว่าจะได้พบกันอีกเร็วๆ นี้!');
    
    setTimeout(() => {
      stopSpeaking();
      onClose();
    }, 3000);
  };

  const quickQuestions = [
    { text: '🎓 สาขาอะไรที่น่าสนใจบ้าง?', video: 'talk' },
    { text: '💼 ทำงานอะไรได้บ้างหลังจบ?', video: 'talk' },
    { text: '💰 ค่าเทอมเท่าไหร่?', video: 'talk' },
    { text: '⏰ เรียนกี่ปี?', video: 'talk' },
  ];

  return (
    <AnimatePresence>
      <motion.div 
        className="avatar-video-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div 
          className="avatar-video-container"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* preload="auto"
              Video Avatar */}
          <div className="video-avatar-section">
            <video
              ref={videoRef}
              className="avatar-video"
              src={`/VDO/${currentVideo}.mp4`}
              loop={currentVideo === 'idle'}
              autoPlay
              muted={false}
              playsInline
              onEnded={handleVideoEnd}
              onError={(e) => {
                console.error('Video error:', e);
                // ถ้าโหลดไม่ได้ ให้ลอง idle
                if (currentVideo !== 'idle') {
                  setCurrentVideo('idle');
                }
              }}
            />
            
            {/* Status Indicator */}
            <div className="avatar-status">
              {isListening && (
                <motion.div 
                  className="status-badge listening"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  🎤 กำลังฟัง...
                </motion.div>
              )}
              {isSpeaking && (
                <motion.div 
                  className="status-badge speaking"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  🎤 กำลังพูด...
                </motion.div>
              )}
              {isThinking && (
                <motion.div 
                  className="status-badge thinking"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  💭 กำลังคิด...
                </motion.div>
              )}
            </div>

            {/* Video Controls */}
            <div className="video-info">
              <p className="video-state">สถานะ: {currentVideo}</p>
            </div>
          </div>

          {/* Chat Section */}
          <div className="chat-section">
            <div className="chat-header">
              <div className="header-info">
                <h3>👩‍🎓 น้องทิวสน</h3>
                <p className="header-subtitle">ผู้ช่วยให้คำปรึกษาสาขาวิชา</p>
              </div>
              <button className="close-btn" onClick={handleClose}>
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="messages-container">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  className={`message ${msg.role}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="message-avatar">
                    {msg.role === 'assistant' ? '🤖' : '👤'}
                  </div>
                  <div className="message-content">{msg.content}</div>
                </motion.div>
              ))}
              {isThinking && (
                <motion.div 
                  className="message assistant thinking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="message-avatar">🤖</div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length <= 2 && (
              <div className="quick-questions">
                <p className="quick-label">คำถามแนะนำ:</p>
                <div className="quick-buttons">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      className="quick-btn"
                      onClick={() => handleQuickQuestion(q.text, q.video)}
                      disabled={isThinking}
                    >
                      {q.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="chat-input">
              <button 
                onClick={toggleVoiceInput}
                className={`voice-btn ${isListening ? 'listening' : ''}`}
                disabled={isThinking}
                title="พูดคำถาม"
              >
                {isListening ? '🎤' : '🎙️'}
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? "กำลังฟัง..." : "พิมพ์หรือพูดคำถามของคุณ..."}
                disabled={isThinking}
              />
              <button 
                onClick={handleSend} 
                disabled={!inputText.trim() || isThinking}
                className="send-btn"
              >
                {isThinking ? '⏳' : '📤'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default AvatarVideo;
