import { VOICE_CONFIG } from './config';

/**
 * Text-to-Speech Service using ResponsiveVoice
 * รองรับ 3 ภาษา: ไทย, อังกฤษ, จีน
 * โทนเสียงผู้หญิงสาววัยรุ่นสดใส สไตล์สาวช่างอุตสาหกรรม
 */

class VoiceService {
  constructor() {
    this.isEnabled = VOICE_CONFIG.enabled;
    this.currentLanguage = VOICE_CONFIG.defaultLanguage;
    this.isSpeaking = false;
    this.initialized = false;
  }

  /**
   * Initialize ResponsiveVoice
   */
  init() {
    if (typeof responsiveVoice === 'undefined') {
      console.warn('ResponsiveVoice not loaded');
      this.isEnabled = false;
      return false;
    }

    // Wait for ResponsiveVoice to be ready
    responsiveVoice.init();
    this.initialized = true;
    console.log('✅ ResponsiveVoice initialized');
    return true;
  }

  /**
   * Detect language from text
   */
  detectLanguage(text) {
    // Thai detection
    if (/[\u0E00-\u0E7F]/.test(text)) {
      return 'th';
    }
    // Chinese detection
    if (/[\u4E00-\u9FFF]/.test(text)) {
      return 'zh';
    }
    // Default to English
    return 'en';
  }

  /**
   * Get voice settings for language
   */
  getVoiceSettings(language) {
    switch (language) {
      case 'th':
        return VOICE_CONFIG.thai;
      case 'en':
        return VOICE_CONFIG.english;
      case 'zh':
        return VOICE_CONFIG.chinese;
      default:
        return VOICE_CONFIG.thai;
    }
  }

  /**
   * Speak text with auto language detection
   */
  speak(text, language = null) {
    if (!this.isEnabled || !this.initialized) {
      console.warn('Voice service not enabled or initialized');
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      // Auto-detect language if not specified
      const lang = language || this.detectLanguage(text);
      const settings = this.getVoiceSettings(lang);

      // Stop current speech
      this.stop();

      console.log(`Speaking in ${lang}:`, text);
      console.log('Voice settings:', settings);

      // Speak with ResponsiveVoice
      this.isSpeaking = true;
      
      responsiveVoice.speak(text, settings.voice, {
        pitch: settings.pitch,
        rate: settings.rate,
        volume: settings.volume,
        onstart: () => {
          console.log('🔊 เริ่มพูด:', text);
        },
        onend: () => {
          this.isSpeaking = false;
          console.log('✅ พูดจบ');
          resolve();
        },
        onerror: (error) => {
          console.error('ResponsiveVoice error:', error);
          // ถ้า error ลองใช้เสียงอังกฤษแทน
          if (lang === 'zh') {
            console.log('พยายามพูดภาษาจีนด้วยเสียงอังกฤษแทน...');
            responsiveVoice.speak(text, 'UK English Female', {
              pitch: 1.0,
              rate: 1.0,
              volume: 1.0,
              onend: () => {
                this.isSpeaking = false;
                resolve();
              }
            });
          } else {
            this.isSpeaking = false;
            resolve();
          }
        }
      });
    });
  }

  /**
   * Stop current speech
   */
  stop() {
    if (this.isSpeaking && typeof responsiveVoice !== 'undefined') {
      responsiveVoice.cancel();
      this.isSpeaking = false;
    }
  }

  /**
   * Pause speech
   */
  pause() {
    if (typeof responsiveVoice !== 'undefined') {
      responsiveVoice.pause();
    }
  }

  /**
   * Resume speech
   */
  resume() {
    if (typeof responsiveVoice !== 'undefined') {
      responsiveVoice.resume();
    }
  }

  /**
   * Get available voices
   */
  getVoices() {
    if (typeof responsiveVoice !== 'undefined') {
      return responsiveVoice.getVoices();
    }
    return [];
  }

  /**
   * Check if currently speaking
   */
  isSpeakingNow() {
    return this.isSpeaking;
  }

  /**
   * Set language
   */
  setLanguage(language) {
    if (['th', 'en', 'zh'].includes(language)) {
      this.currentLanguage = language;
    }
  }

  /**
   * Get current language
   */
  getLanguage() {
    return this.currentLanguage;
  }
}

// Export singleton instance
const voiceService = new VoiceService();

// Initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      voiceService.init();
    }, 1000);
  });
}

export default voiceService;

/**
 * Helper functions for quick access
 */

export const speak = (text, language = null) => {
  return voiceService.speak(text, language);
};

export const stopSpeaking = () => {
  voiceService.stop();
};

export const isSpeaking = () => {
  return voiceService.isSpeakingNow();
};

/**
 * Greeting messages in 3 languages
 */
export const GREETINGS = {
  th: [
    'สวัสดีค่ะ! ยินดีต้อนรับสู่ระบบแนะแนวอาชีพ',
    'หวัดดีจ้า มาหาสาขาที่เหมาะกับเราไปด้วยกัน!',
    'เฮ้ยจ้า! พร้อมจะค้นหาอาชีพในฝันกันหรือยัง?'
  ],
  en: [
    'Hello! Welcome to Career Guidance System',
    'Hey there! Ready to find your dream career?',
    'Hi! Let\'s explore your future together!'
  ],
  zh: [
    '你好！欢迎来到职业指导系统',
    '嗨！准备好找到你的梦想职业了吗？',
    '您好！让我们一起探索你的未来'
  ]
};

/**
 * Career-related phrases
 */
export const CAREER_PHRASES = {
  tech: {
    th: 'สาขาเทคโนโลยีเหมาะสำหรับคนที่ชอบคิด ชอบแก้ปัญหา และชอบสร้างสรรค์สิ่งใหม่ๆ',
    en: 'Technology field is perfect for creative problem solvers',
    zh: '技术领域非常适合喜欢思考和解决问题的人'
  },
  business: {
    th: 'สาขาธุรกิจเหมาะกับคนที่ชอบติดต่อคน ชอบขาย และมีทักษะการสื่อสาร',
    en: 'Business field suits people who love communication and sales',
    zh: '商业领域适合喜欢与人交流和销售的人'
  },
  design: {
    th: 'สาขาออกแบบเหมาะสำหรับคนที่มีความคิดสร้างสรรค์ ชอบศิลปะและความงาม',
    en: 'Design field is ideal for creative and artistic minds',
    zh: '设计领域非常适合有创造力和艺术天赋的人'
  },
  engineering: {
    th: 'สาขาวิศวกรรมเหมาะกับคนที่ชอบประดิษฐ์ ชอบซ่อม และคิดเป็นระบบ',
    en: 'Engineering suits those who love to build and fix things',
    zh: '工程领域适合喜欢制造和修理的人'
  },
  hospitality: {
    th: 'สาขาการโรงแรมเหมาะสำหรับคนที่ชอบบริการ มีมนุษยสัมพันธ์ดี',
    en: 'Hospitality is perfect for service-oriented personalities',
    zh: '酒店管理适合喜欢服务和善于交际的人'
  },
  health: {
    th: 'สาขาสุขภาพเหมาะกับคนที่ชอบดูแลคน มีจิตใจเมตตา และอยากช่วยเหลือผู้อื่น',
    en: 'Healthcare suits caring individuals who want to help others',
    zh: '医疗保健适合关心他人并想帮助别人的人'
  }
};
