/**
 * Google Gemini AI Service
 * สำหรับตอบคำถามอัตโนมัติเกี่ยวกับการสมัครเรียนและสาขาต่าง ๆ
 * รองรับ 3 ภาษา: ไทย, อังกฤษ, จีน
 */

import { GEMINI_API_KEY, CAREER_CATEGORIES, TUITION_INFO } from './config.js';

class GeminiService {
  constructor() {
    this.apiKey = GEMINI_API_KEY;
    this.endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
    this.conversationHistory = [];
    
    // System prompt สำหรับ avatar ของ Lanna Polytechnic
    this.systemContext = this.buildSystemContext();
  }

  /**
   * สร้าง context สำหรับ AI ให้รู้จักวิทยาลัยและสาขาต่าง ๆ
   */
  buildSystemContext() {
    const careers = CAREER_CATEGORIES.map(c => 
      `- ${c.name} (${c.code}): ${c.description}`
    ).join('\n');

    const tuitionInfo = TUITION_INFO || {};
    const contact = tuitionInfo.contact || { phone: '053-277-777', email: 'lannapoly@edu.th', website: 'www.lannapoly.ac.th' };
    
    return `คุณคือผู้ช่วยแนะแนวการศึกษาของวิทยาลัยเทคนิคโปลิเทคนิคลานนา เชียงใหม่ 
คุณเป็นสาวน้อยที่สดใส เป็นกันเอง และมีความรู้เกี่ยวกับสาขาวิชาและการสมัครเรียนทุกอย่าง

ข้อมูลสาขาที่เปิดรับสมัคร (14 สาขา):
${careers}

ค่าเรียน:
- ระดับ ปวช. ช่างอุตสาหกรรม: 12,100 บาท/ปี (ค่าเทอม 9,000 + ค่าแรกเข้า 3,100)
- ระดับ ปวส. ช่างอุตสาหกรรม: 21,700 บาท/ปี (ค่าเทอม 18,700 + ค่าแรกเข้า 3,000)
- สาขาพาณิชย์/ท่องเที่ยว ถูกกว่าเล็กน้อย

ข้อมูลการติดต่อ:
- โทร: ${contact.phone}
- อีเมล: ${contact.email}
- เว็บไซต์: ${contact.website}

การตอบคำถาม:
- ตอบแบบสั้น กระชับ เป็นกันเอง
- ใช้ภาษาที่เหมาะกับอายุวัยรุ่น
- ถ้าถามภาษาไทย ตอบภาษาไทย / ถ้าถามภาษาอังกฤษ ตอบอังกฤษ / ถ้าถามภาษาจีน ตอบจีน
- ถ้าไม่แน่ใจ ให้แนะนำให้ติดต่อสอบถามเพิ่มเติม
- ตอบไม่เกิน 2-3 ประโยค`;
  }

  /**
   * ส่งคำถามไปยัง Gemini API และรับคำตอบกลับ
   */
  async ask(userMessage, language = 'th') {
    try {
      // เพิ่มข้อความ user เข้า history
      this.conversationHistory.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      // สร้าง prompt ที่มี context + history
      const fullPrompt = this.conversationHistory.length === 1
        ? `${this.systemContext}\n\nคำถาม: ${userMessage}`
        : userMessage;

      // เรียก API
      const response = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: fullPrompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200, // จำกัดความยาวคำตอบ
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                      "ขออภัยค่ะ ฉันไม่เข้าใจคำถาม ลองถามใหม่อีกครั้งได้ไหมคะ?";

      // เพิ่มคำตอบของ AI เข้า history
      this.conversationHistory.push({
        role: 'model',
        parts: [{ text: aiReply }]
      });

      return aiReply;

    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // ถ้า API error ให้ใช้ fallback response
      return this.getFallbackResponse(userMessage, language);
    }
  }

  /**
   * คำตอบสำรอง (fallback) เมื่อ API ไม่ตอบ
   */
  getFallbackResponse(message, language = 'th') {
    const msg = message.toLowerCase();

    // ตรวจจับคำถามพื้นฐาน
    if (msg.includes('สาขา') || msg.includes('เรียน') || msg.includes('course') || msg.includes('major')) {
      return language === 'th' 
        ? 'เรามี 14 สาขาให้เลือก ทั้งช่างอุตสาหกรรมและเทคโนโลยี ลองดูการ์ดด้านล่างได้เลยค่ะ' 
        : 'We have 14 courses available. Check out the cards below!';
    }

    if (msg.includes('ค่าเรียน') || msg.includes('tuition') || msg.includes('fee')) {
      return language === 'th'
        ? 'ค่าเรียน ปวช. 12,100 บาท/ปี, ปวส. 21,700 บาท/ปี (ช่างอุตสาหกรรม) ค่ะ'
        : 'Tuition: Certificate 12,100 THB/year, Diploma 21,700 THB/year (Industrial)';
    }

    if (msg.includes('สมัคร') || msg.includes('apply') || msg.includes('admission')) {
      const contact = TUITION_INFO?.contact || { phone: '053-277-777', website: 'www.lannapoly.ac.th' };
      return language === 'th'
        ? `สมัครได้ที่เว็บไซต์ ${contact.website} หรือโทรสอบถาม ${contact.phone} ค่ะ`
        : `Apply at ${contact.website} or call ${contact.phone}`;
    }

    if (msg.includes('ติดต่อ') || msg.includes('contact') || msg.includes('โทร')) {
      const contact = TUITION_INFO?.contact || { phone: '053-277-777', email: 'lannapoly@edu.th' };
      return language === 'th'
        ? `ติดต่อได้ที่: โทร ${contact.phone}, อีเมล ${contact.email} ค่ะ`
        : `Contact: Phone ${contact.phone}, Email ${contact.email}`;
    }

    // คำตอบทั่วไป
    return language === 'th'
      ? 'สวัสดีค่ะ! มีอะไรให้ช่วยเกี่ยวกับการสมัครเรียนหรือข้อมูลสาขาไหมคะ?'
      : language === 'en'
      ? 'Hello! How can I help you with admissions or course information?'
      : '你好！我能帮你了解招生或课程信息吗？';
  }

  /**
   * ตรวจจับภาษาจากข้อความ
   */
  detectLanguage(text) {
    // ภาษาไทย
    if (/[\u0E00-\u0E7F]/.test(text)) return 'th';
    // ภาษาจีน
    if (/[\u4E00-\u9FFF]/.test(text)) return 'zh';
    // ภาษาอังกฤษ
    return 'en';
  }

  /**
   * รีเซ็ต conversation history
   */
  resetConversation() {
    this.conversationHistory = [];
  }

  /**
   * รับคำทักทายแบบสุ่ม
   */
  getGreeting(language = 'th') {
    const greetings = {
      th: [
        'สวัสดีค่ะ! มีอะไรให้ช่วยเกี่ยวกับการสมัครเรียนหรือข้อมูลสาขาไหมคะ?',
        'หวัดดีจ้า! อยากรู้เกี่ยวกับสาขาไหนบ้างคะ?',
        'เฮ้ย! สนใจสาขาอะไรดีจ้า?'
      ],
      en: [
        'Hello! How can I help you with admissions or course information?',
        'Hey there! Which course are you interested in?',
        'Hi! Ready to find your perfect major?'
      ],
      zh: [
        '你好！我能帮你了解招生或课程信息吗？',
        '嗨！你对哪个专业感兴趣？',
        '您好！准备找到你的理想专业了吗？'
      ]
    };

    const options = greetings[language] || greetings.th;
    return options[Math.floor(Math.random() * options.length)];
  }
}

// Export singleton instance
const geminiService = new GeminiService();
export default geminiService;

// Export helper functions
export const askGemini = (message, language) => geminiService.ask(message, language);
export const resetChat = () => geminiService.resetConversation();
export const getGreeting = (language) => geminiService.getGreeting(language);
