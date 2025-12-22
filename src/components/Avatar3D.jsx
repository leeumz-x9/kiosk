import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Text } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { OPENAI_API_KEY } from '../config';
import voiceService, { speak, stopSpeaking, GREETINGS, CAREER_PHRASES } from '../voiceService';
import './Avatar3D.css';

// 3D Avatar Model Component
function AvatarModel({ isThinking, isSpeaking }) {
  const meshRef = useRef();
  const [scale, setScale] = useState(1);

  useFrame((state) => {
    if (meshRef.current) {
      // Breathing animation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      
      // Speaking animation
      if (isSpeaking) {
        const scaleValue = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.05;
        setScale(scaleValue);
      } else {
        setScale(1);
      }
    }
  });

  return (
    <group ref={meshRef}>
      {/* Head */}
      <mesh position={[0, 0.5, 0]} scale={scale}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
          color={isSpeaking ? "#fbbf24" : "#10b981"} 
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.2, 0.6, 0.4]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.2, 0.6, 0.4]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Mouth - animated when speaking */}
      <mesh position={[0, 0.35, 0.45]} scale={[1, isSpeaking ? 1.2 : 0.8, 1]}>
        <sphereGeometry args={[0.1, 16, 16, 0, Math.PI]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>

      {/* Body */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 0.8, 32]} />
        <meshStandardMaterial 
          color="#059669" 
          metalness={0.2}
          roughness={0.6}
        />
      </mesh>

      {/* Thinking indicator */}
      {isThinking && (
        <>
          <mesh position={[-0.3, 1.2, 0]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
          </mesh>
          <mesh position={[0, 1.3, 0]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
          </mesh>
          <mesh position={[0.3, 1.4, 0]}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
          </mesh>
        </>
      )}
    </group>
  );
}

const Avatar3D = ({ onClose, interests = [] }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'สวัสดีค่ะ! ผมคือผู้ช่วยแนะแนวอาชีพ 😊 มีอะไรให้ผมช่วยไหมครับ?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('th');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
    
    // Speak greeting on mount
    const greeting = GREETINGS[currentLanguage][0];
    speak(greeting, currentLanguage).then(() => {
      setIsSpeaking(false);
    });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsThinking(true);

    try {
      // Call OpenAI API (or mock response)
      const response = await getChatResponse([...messages, userMessage], interests);
      
      setIsThinking(false);
      setIsSpeaking(true);
      
      const assistantMessage = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);

      // Text-to-speech with ResponsiveVoice
      await speak(response, currentLanguage);
      setIsSpeaking(false);

    } catch (error) {
      console.error('Error:', error);
      setIsThinking(false);
      const errorMsg = { 
        role: 'assistant', 
        content: 'ขออภัยครับ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' 
      };
      setMessages(prev => [...prev, errorMsg]);
      await speak(errorMsg.content, currentLanguage);
      setIsSpeaking(false);
    }
  };

  const getChatResponse = async (chatHistory, userInterests) => {
    // Mock response for demo
    // In production, call OpenAI API here
    
    const responses = [
      `ตามข้อมูลที่ผมได้วิเคราะห์ คุณน่าจะสนใจสาขา${userInterests.length > 0 ? 'ด้าน' + userInterests[0] : ''} ครับ`,
      'วิทยาลัยของเรามีหลักสูตรที่หลากหลาย ทั้งด้านเทคโนโลยี ธุรกิจ และศิลปะ',
      'แต่ละสาขามีโอกาสในการทำงานที่ดีมาก โดยเฉพาะในยุค 4.0 นี้',
      'คุณมีคำถามเพิ่มเติมเกี่ยวกับสาขาไหนไหมครับ?'
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const quickQuestions = [
    '📚 สาขาไหนน่าสนใจบ้าง?',
    '💼 มีงานอะไรหลังเรียนจบ?',
    '🎓 ค่าเทอมเท่าไหร่?',
    '⏰ เปิดรับสมัครเมื่อไหร่?'
  ];

  const handleLanguageChange = (lang) => {
    setCurrentLanguage(lang);
    voiceService.setLanguage(lang);
    
    // Announce language change
    const announcements = {
      th: 'เปลี่ยนเป็นภาษาไทยแล้วค่ะ',
      en: 'Language changed to English',
      zh: '语言已更改为中文'
    };
    speak(announcements[lang], lang);
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="avatar-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="avatar-container"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button className="avatar-close" onClick={onClose}>✕</button>

          {/* Language Selector */}
          <div className="language-selector">
            <button 
              className={`lang-btn ${currentLanguage === 'th' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('th')}
            >
              🇹🇭 ไทย
            </button>
            <button 
              className={`lang-btn ${currentLanguage === 'en' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('en')}
            >
              🇺🇸 EN
            </button>
            <button 
              className={`lang-btn ${currentLanguage === 'zh' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('zh')}
            >
              🇨🇳 中文
            </button>
          </div>

          {/* 3D Avatar */}
          <div className="avatar-3d">
            <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color="#fbbf24" />
              <Suspense fallback={null}>
                <AvatarModel isThinking={isThinking} isSpeaking={isSpeaking} />
              </Suspense>
              <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
          </div>

          {/* Chat Interface */}
          <div className="chat-interface">
            <div className="chat-header">
              <div className="avatar-status">
                <div className={`status-dot ${isSpeaking ? 'speaking' : isThinking ? 'thinking' : 'active'}`}></div>
                <span>
                  {isSpeaking ? 'กำลังพูด...' : isThinking ? 'กำลังคิด...' : 'พร้อมให้คำปรึกษา'}
                </span>
              </div>
            </div>

            <div className="chat-messages">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  className={`message ${msg.role}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {msg.role === 'assistant' && <div className="message-avatar">🤖</div>}
                  <div className="message-content">{msg.content}</div>
                  {msg.role === 'user' && <div className="message-avatar">👤</div>}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            <div className="quick-questions">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  className="quick-btn"
                  onClick={() => setInputMessage(question)}
                >
                  {question}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="chat-input">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="พิมพ์คำถามของคุณ..."
                disabled={isThinking}
              />
              <button 
                className="send-btn" 
                onClick={sendMessage}
                disabled={isThinking || !inputMessage.trim()}
              >
                {isThinking ? '⏳' : '📤'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Avatar3D;
