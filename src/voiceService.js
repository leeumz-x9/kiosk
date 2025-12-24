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
          
          // หยุดเสียงเดิมก่อน
          responsiveVoice.cancel();
          this.isSpeaking = false;
          
          // ถ้า error ลองใช้เสียงอังกฤษแทน
          if (lang === 'zh') {
            console.log('พยายามพูดภาษาจีนด้วยเสียงอังกฤษแทน...');
            
            // รอสักครู่ให้เสียงเดิมหยุดสนิท
            setTimeout(() => {
              this.isSpeaking = true;
              responsiveVoice.speak(text, 'UK English Female', {
                pitch: 1.0,
                rate: 1.0,
                volume: 1.0,
                onend: () => {
                  this.isSpeaking = false;
                  resolve();
                },
                onerror: () => {
                  this.isSpeaking = false;
                  resolve();
                }
              });
            }, 300);
          } else {
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
 * Available Programs - สาขาที่เปิดรับสมัคร
 */
export const AVAILABLE_PROGRAMS = {
  industrial: {
    name: {
      th: 'ช่างอุตสาหกรรม',
      en: 'Industrial Technology',
      zh: '工业技术'
    },
    programs: [
      { code: 'Au', name: { th: 'สาขางานยานยนต์', en: 'Automotive', zh: '汽车技术' } },
      { code: 'Ev', name: { th: 'สาขายานยนต์ไฟฟ้า', en: 'Electric Vehicle', zh: '电动汽车' } },
      { code: 'Ep', name: { th: 'สาขาช่างไฟฟ้ากำลัง', en: 'Electrical Power', zh: '电力工程' } },
      { code: 'El', name: { th: 'สาขาช่างอิเล็กทรอนิกส์', en: 'Electronics', zh: '电子技术' } },
      { code: 'Co', name: { th: 'สาขาช่างก่อสร้าง', en: 'Construction', zh: '建筑施工' } },
      { code: 'Ar', name: { th: 'สาขาสถาปัตยกรรม', en: 'Architecture', zh: '建筑学' } },
      { code: 'Ct', name: { th: 'สาขาคอมพิวเตอร์โปรแกรมเมอร์', en: 'Computer Programming', zh: '计算机编程' } },
      { code: 'It', name: { th: 'สาขาเทคโนโลยีสารสนเทศ', en: 'Information Technology', zh: '信息技术' } }
    ]
  },
  business: {
    name: {
      th: 'พาณิชกรรมและบริหารธุรกิจ',
      en: 'Commerce and Business Administration',
      zh: '商业与工商管理'
    },
    programs: [
      { code: 'Ac', name: { th: 'สาขาการบัญชี', en: 'Accounting', zh: '会计学' } },
      { code: 'Mk', name: { th: 'สาขาการตลาด', en: 'Marketing', zh: '市场营销' } },
      { code: 'Dt', name: { th: 'สาขาธุรกิจดิจิทัล', en: 'Digital Business', zh: '数字商务' } }
    ]
  },
  tourism: {
    name: {
      th: 'การท่องเที่ยวและการโรงแรม',
      en: 'Tourism and Hotel Management',
      zh: '旅游与酒店管理'
    },
    programs: [
      { code: 'Tg', name: { th: 'สาขาการท่องเที่ยว', en: 'Tourism', zh: '旅游管理' } },
      { code: 'Hm', name: { th: 'สาขาการโรงแรม', en: 'Hotel Management', zh: '酒店管理' } }
    ]
  }
};

/**
 * Career-related phrases with detailed information
 */
export const CAREER_PHRASES = {
  // ช่างอุตสาหกรรม - Industrial Technology
  Au: {
    th: 'สาขางานยานยนต์ (Au) - เทคโนโลยียานยนต์พัฒนาไปอย่างไม่มีที่สิ้นสุด อุตสาหกรรมการผลิตรถยนต์ของประเทศไทยอยู่ในลำดับต้นๆ ของโลก คาดการณ์ว่าจะมียอดการผลิตรถยนต์ถึง 3 ล้านคันต่อปี ผู้สำเร็จการศึกษาสามารถประกอบอาชีพได้หลากหลาย เช่น ช่างยนต์ นายช่างตรวจสภาพรถ เจ้าของกิจการอู่รถ หรือศึกษาต่อด้านวิศวกรรมยานยนต์ วิศวกรรมเครื่องกล',
    en: 'Automotive Technology (Au) - Thailand\'s automotive industry ranks among the world\'s top producers, with projected output of 3 million vehicles annually. Graduates can work as mechanics, vehicle inspectors, or own auto repair businesses, or continue to automotive or mechanical engineering degrees.',
    zh: '汽车技术 (Au) - 泰国汽车制造业位居世界前列，预计年产量达300万辆。毕业生可从事机械师、车辆检验员，或拥有汽车维修企业，也可继续攻读汽车工程或机械工程学位。'
  },
  Ev: {
    th: 'สาขายานยนต์ไฟฟ้า (Ev) - เทคโนโลยียานยนต์พัฒนาไปอย่างไม่มีที่สิ้นสุด การเรียนรู้กับนวัตกรรมเหล่านี้คือความท้าทายให้กับนักศึกษาช่างยนต์ อุตสาหกรรมการผลิตรถยนต์ของประเทศไทยอยู่ในลำดับต้นๆ ของโลก ผู้สำเร็จการศึกษาสามารถประกอบอาชีพด้านช่างยนต์ไฟฟ้า นายช่างศูนย์บริการ หรือศึกษาต่อด้านวิศวกรรมยานยนต์ วิศวกรรมเครื่องกล',
    en: 'Electric Vehicle Technology (Ev) - Vehicle technology is constantly evolving. Thailand\'s automotive industry ranks among the world\'s top. Graduates can work as EV mechanics, service center supervisors, or continue to automotive or mechanical engineering degrees.',
    zh: '电动汽车技术 (Ev) - 车辆技术不断发展。泰国汽车制造业位居世界前列。毕业生可从事电动汽车机械师、服务中心主管，或继续攻读汽车工程或机械工程学位。'
  },
  Ep: {
    th: 'สาขาช่างไฟฟ้ากำลัง (Ep) - ไฟฟ้าเป็นสาขาวิชาที่เป็นรากฐานแห่งชีวิต มีความเกี่ยวข้องกับการดำเนินชีวิตประจำวัน ผู้สำเร็จการศึกษาสามารถประกอบอาชีพส่วนตัวได้ เช่น ช่างติดตั้งไฟฟ้า ช่างเครื่องปรับอากาศและเครื่องทำความเย็น หรือศึกษาต่อในระดับปริญญาตรี สาขาวิศวกรรมไฟฟ้า คณะครุศาสตร์ หรือคณะอุตสาหกรรมบัณฑิต',
    en: 'Electrical Power (Ep) - Electrical engineering is fundamental to modern life. Graduates can work as electrical installers, air conditioning and refrigeration technicians, or continue to electrical engineering, education, or industrial degrees.',
    zh: '电力工程 (Ep) - 电气工程是现代生活的基础。毕业生可从事电气安装工、空调和制冷技师，或继续攻读电气工程、教育或工业学位。'
  },
  El: {
    th: 'สาขาช่างอิเล็กทรอนิกส์ (El) - ศึกษาเทคโนโลยีระบบภาพ ระบบเสียง ระบบสื่อสาร ระบบควบคุมอุตสาหกรรม และหุ่นยนต์ ผู้สำเร็จการศึกษาสามารถทำงานในองค์กรต่างๆ เช่น ท่าอากาศยาน บริษัทวิทยุการบิน องค์การโทรศัพท์ หรือศึกษาต่อด้านวิศวกรรมการสื่อสาร วิศวกรรมอิเล็กทรอนิกส์และโทรคมนาคม วิศวกรรมมัลติมีเดีย',
    en: 'Electronics (El) - Study video systems, audio systems, communications, industrial control systems, and robotics. Graduates can work at airports, aviation companies, telecommunications, or continue to communications, electronics and telecommunications, or multimedia engineering degrees.',
    zh: '电子技术 (El) - 学习视频系统、音频系统、通信、工业控制系统和机器人技术。毕业生可在机场、航空公司、电信工作，或继续攻读通信、电子和电信或多媒体工程学位。'
  },
  Co: {
    th: 'สาขาช่างก่อสร้าง (Co) - ให้ความรู้ด้านเทคนิคการก่อสร้างและนวัตกรรมใหม่ๆ ผู้สำเร็จการศึกษาสามารถประกอบอาชีพ เช่น ผู้ควบคุมงานก่อสร้าง รับเหมาก่อสร้าง นายช่างโยธา Draft man ทำธุรกิจเกี่ยวกับวัสดุก่อสร้าง หรือศึกษาต่อด้านวิศวกรรมศาสตร์บัณฑิต ครุศาสตร์อุตสาหกรรมบัณฑิต ทางสาขาการก่อสร้างและโยธา',
    en: 'Construction (Co) - Learn construction techniques and innovations. Graduates can work as construction supervisors, contractors, civil technicians, draftsmen, or in construction materials business, or continue to civil engineering or industrial education degrees.',
    zh: '建筑施工 (Co) - 学习建筑技术和创新。毕业生可担任建筑监理、承包商、土木技术员、绘图员，或从事建筑材料业务，或继续攻读土木工程或工业教育学位。'
  },
  Ar: {
    th: 'สาขาสถาปัตยกรรม (Ar) - ศึกษาการออกแบบ เขียนแบบก่อสร้าง การประมาณราคา การทำแบบจำลอง การคำนวณโครงสร้าง ผู้สำเร็จการศึกษาสามารถประกอบอาชีพ เช่น นักออกแบบผลิตภัณฑ์อุตสาหกรรม มัณฑนากร ออกแบบตกแต่งภายใน นักออกแบบเฟอร์นิเจอร์ กราฟฟิก โฆษณา สถาปนิก หรือศึกษาต่อคณะสถาปัตยกรรม',
    en: 'Architecture (Ar) - Study design, construction drawing, cost estimation, model making, and structural calculations. Graduates can work as industrial product designers, decorators, interior designers, furniture designers, graphic designers, architects, or continue to architecture degrees.',
    zh: '建筑学 (Ar) - 学习设计、施工图、成本估算、模型制作和结构计算。毕业生可担任工业产品设计师、装饰师、室内设计师、家具设计师、平面设计师、建筑师，或继续攻读建筑学学位。'
  },
  Ct: {
    th: 'สาขาคอมพิวเตอร์โปรแกรมเมอร์ (Ct) - คิดเป็น เขียนโค้ดได้ และสร้างสรรค์นวัตกรรม เรียนรู้การเขียนโปรแกรมด้วยภาษา C, Java, Python ฯลฯ การพัฒนาเว็บไซต์ แอปพลิเคชันมือถือ การวิเคราะห์และออกแบบระบบ การจัดการฐานข้อมูล รวมถึงการเขียนโปรแกรมควบคุมอุปกรณ์ IoT ผู้มีทักษะด้านการเขียนโปรแกรมคือกำลังสำคัญในยุคเทคโนโลยี',
    en: 'Computer Programming (Ct) - Think, code, and innovate. Learn programming with C, Java, Python, web development, mobile apps, system analysis and design, database management, and IoT programming. Programming skills are essential in the technology era.',
    zh: '计算机编程 (Ct) - 思考、编码和创新。学习C、Java、Python编程、Web开发、移动应用、系统分析和设计、数据库管理以及物联网编程。编程技能是技术时代的关键。'
  },
  It: {
    th: 'สาขาเทคโนโลยีสารสนเทศ (It) - ระดับ ปวส. เท่านั้น ศึกษาการซ่อมบำรุงรักษาคอมพิวเตอร์ทั้งซอฟต์แวร์และฮาร์ดแวร์ ผู้สำเร็จการศึกษาสามารถทำงานในองค์กรที่มีระบบสารสนเทศ ธุรกิจผลิตซอฟต์แวร์ ธุรกิจบริการเครือข่ายคอมพิวเตอร์ อินเทอร์เน็ต พาณิชย์อิเล็กทรอนิกส์ ที่ปรึกษาด้าน IT ธุรกิจแอนิเมชั่นและเกม หรือศึกษาต่อด้านฐานข้อมูล เน็ตเวิร์ก ความปลอดภัยของระบบ',
    en: 'Information Technology (It) - Diploma level only. Study computer maintenance, software and hardware. Graduates can work in IT organizations, software companies, network services, internet, e-commerce, IT consulting, animation and gaming, or continue to database, network, or security studies.',
    zh: '信息技术 (It) - 仅限大专级别。学习计算机维护、软件和硬件。毕业生可在IT组织、软件公司、网络服务、互联网、电子商务、IT咨询、动画和游戏行业工作，或继续学习数据库、网络或安全。'
  },
  
  // พาณิชกรรมและบริหารธุรกิจ - Business
  Ac: {
    th: 'สาขาการบัญชี (Ac) - ในการดำเนินธุรกิจมีความจำเป็นต้องมีข้อมูลทางการเงิน วิทยาลัยเทคโนโลยีโปลิเทคนิคลานนา เชียงใหม่ ได้พัฒนาหลักสูตรเพื่อผลิตนักวิชาชีพบัญชีที่มีประสิทธิภาพ ผู้สำเร็จการศึกษาสามารถประกอบอาชีพ เช่น นักบัญชี ที่ปรึกษาทางบัญชี ตรวจสอบบัญชี นักวิเคราะห์ต้นทุน เจ้าหน้าที่การเงิน พนักงานธนาคาร',
    en: 'Accounting (Ac) - Businesses need financial data. Lanna Polytechnic College develops curricula to produce efficient accounting professionals. Graduates can work as accountants, accounting consultants, auditors, cost analysts, financial officers, or bank employees.',
    zh: '会计学 (Ac) - 企业需要财务数据。兰纳理工学院开发课程以培养高效的会计专业人员。毕业生可担任会计师、会计顾问、审计师、成本分析师、财务人员或银行员工。'
  },
  Mk: {
    th: 'สาขาการตลาด (Mk) - ในยุคของเทคโนโลยีและ E-Commerce ผู้ประกอบการมีการแข่งขันสูง ทำให้ตลาดมีความต้องการบุคลากรด้านการตลาดอย่างมาก ผู้สำเร็จการศึกษาสามารถประกอบอาชีพ เช่น นักวิจัยตลาด นักวิเคราะห์ตลาด นักสร้างแบรนด์ นักการตลาด นักวางแผนกลยุทธ์ บริหารงานขาย ธุรกิจค้าปลีก ค้าส่ง ส่งออกนำเข้า',
    en: 'Marketing (Mk) - In the era of technology and E-Commerce, high competition creates demand for marketing professionals. Graduates can work as market researchers, analysts, brand builders, marketers, strategists, sales managers, in retail, wholesale, or import-export businesses.',
    zh: '市场营销 (Mk) - 在技术和电子商务时代，激烈竞争创造了对营销专业人员的需求。毕业生可担任市场研究员、分析师、品牌建设者、营销人员、战略规划师、销售经理，从事零售、批发或进出口业务。'
  },
  Dt: {
    th: 'สาขาธุรกิจดิจิทัล (Dt) - ในปัจจุบันเทคโนโลยีคอมพิวเตอร์มีบทบาทในชีวิตประจำวัน การจัดทำธุรกิจและการประกอบอาชีพมีความเกี่ยวข้องกับระบบสารสนเทศ ผู้สำเร็จการศึกษาสามารถประกอบอาชีพ เช่น เจ้าหน้าที่คอมพิวเตอร์ นักวิเคราะห์ข้อมูล นักพัฒนาและออกแบบระบบงาน โปรแกรมเมอร์ ผู้จัดการฝ่ายสารสนเทศ เว็บมาสเตอร์',
    en: 'Digital Business (Dt) - Computer technology plays a role in daily life. Business operations relate to information systems. Graduates can work as computer officers, data analysts, system developers and designers, programmers, IT managers, or webmasters.',
    zh: '数字商务 (Dt) - 计算机技术在日常生活中发挥作用。商业运营与信息系统相关。毕业生可担任计算机专员、数据分析师、系统开发和设计师、程序员、IT经理或网站管理员。'
  },
  
  // การท่องเที่ยวและการโรงแรม - Tourism & Hospitality
  Tg: {
    th: 'สาขาการท่องเที่ยว (Tg) - สาขาวิชาที่ผสมผสานระหว่างศาสตร์กับศิลป์ ผู้เรียนจะได้รับความรู้ในวิชาแขนงต่างๆ เมื่อเข้าสู่ประชาคมอาเซียน ประเทศไทยจะเป็นศูนย์กลางด้านคมนาคมและธุรกิจท่องเที่ยว ผู้สำเร็จการศึกษาสามารถประกอบอาชีพ เช่น ไกด์นำเที่ยว การจัดการธุรกิจท่องเที่ยว การจัดการธุรกิจในแหล่งท่องเที่ยว การจัดการธุรกิจนันทนาการ',
    en: 'Tourism (Tg) - Blends science and art. Students gain knowledge in various fields. As ASEAN integrates, Thailand becomes the hub for transportation and tourism. Graduates can work as tour guides, tourism business managers, attraction site managers, or recreation business managers.',
    zh: '旅游管理 (Tg) - 融合科学与艺术。学生获得各领域知识。随着东盟一体化，泰国成为交通和旅游中心。毕业生可担任导游、旅游业务经理、景点管理员或娱乐业务经理。'
  },
  Hm: {
    th: 'สาขาการโรงแรม (Hm) - สาขาวิชาที่ผสมผสานระหว่างศาสตร์กับศิลป์ ผู้เรียนจะได้รับความรู้และศิลปะการพูดเพื่อให้ความบันเทิงกับลูกค้า เมื่อเข้าสู่ประชาคมอาเซียน ประเทศไทยจะเป็นศูนย์กลางด้านธุรกิจท่องเที่ยว ผู้สำเร็จการศึกษาสามารถประกอบอาชีพด้านการโรงแรม การจัดการธุรกิจท่องเที่ยว การจัดการธุรกิจในแหล่งท่องเที่ยว',
    en: 'Hotel Management (Hm) - Blends science and art. Students learn communication skills to entertain guests. As ASEAN integrates, Thailand becomes a tourism business hub. Graduates can work in hotel management, tourism business management, or attraction site management.',
    zh: '酒店管理 (Hm) - 融合科学与艺术。学生学习与客人沟通的技巧。随着东盟一体化，泰国成为旅游业中心。毕业生可从事酒店管理、旅游业务管理或景点管理。'
  }
};

/**
 * Study Duration
 */
export const STUDY_DURATION = {
  certificate: {
    th: 'ประกาศนียบัตรวิชาชีพ (ปวช.) เรียน 3 ปี',
    en: 'Vocational Certificate: 3 years',
    zh: '职业证书：3年'
  },
  diploma: {
    th: 'ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.) เรียน 2 ปี',
    en: 'Higher Vocational Diploma: 2 years',
    zh: '高级职业文凭：2年'
  },
  note: {
    th: 'หมายเหตุ: สาขาเทคโนโลยีสารสนเทศ (It) เปิดสอนเฉพาะระดับ ปวส. เท่านั้น',
    en: 'Note: Information Technology (It) is available only at Diploma level',
    zh: '注意：信息技术 (It) 仅在大专级别提供'
  }
};
