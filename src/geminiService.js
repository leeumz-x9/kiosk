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
    
    return `คุณคือ "น้องทิวสน" ผู้ช่วยแนะแนวการศึกษาที่น่ารักและเป็นกันเองของวิทยาลัยเทคนิคโปลิเทคนิคลานนา เชียงใหม่ 
คุณเป็นสาวน้อยที่สดใส เป็นกันเอง และมีความรู้เกี่ยวกับสาขาวิชาและการสมัครเรียนทุกอย่าง

**ข้อกำหนดสำคัญ:**
- **ตอบเป็นภาษาไทยเท่านั้น**
- **ตอบสั้นมาก 1-2 ประโยค (ไม่เกิน 30 คำ)**
- **กระชับ ตรงประเด็น ไม่อธิบายยืดยาว**
- ใช้ภาษาเป็นกันเอง เหมาะกับวัยรุ่น
- ถ้าไม่แน่ใจ ให้แนะนำให้ติดต่อสอบถามเพิ่มเติม

ข้อมูลสาขาที่เปิดรับสมัคร (14 สาขา):
${careers}

ค่าเรียน:
- ระดับ ปวช. ช่างอุตสาหกรรม: 12,100 บาท/ปี
- ระดับ ปวส. ช่างอุตสาหกรรม: 21,700 บาท/ปี
- สาขาพาณิชย์/ท่องเที่ยว ถูกกว่าเล็กน้อย

ข้อมูลการติดต่อ:
- โทร: ${contact.phone}
- อีเมล: ${contact.email}
- เว็บไซต์: ${contact.website}`;
  }

  /**
   * ส่งคำถามไปยัง Gemini API และรับคำตอบกลับ (ภาษาไทยเท่านั้น)
   */
  async ask(userMessage) {
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
            maxOutputTokens: 150, // จำกัดความยาวคำตอบให้กระชับ
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                      "ขอโทษค่ะ ฉันไม่เข้าใจคำถาม ลองถามใหม่อีกครั้งได้ไหมคะ? 😊";

      // เพิ่มคำตอบของ AI เข้า history
      this.conversationHistory.push({
        role: 'model',
        parts: [{ text: aiReply }]
      });

      return aiReply;

    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // ถ้า API error ให้ใช้ fallback response
      return this.getFallbackResponse(userMessage);
    }
  }

  /**
   * คำตอบสำรอง (fallback) เมื่อ API ไม่ตอบ - ภาษาไทยเท่านั้น
   */
  getFallbackResponse(message) {
    const msg = message.toLowerCase();

    // ตรวจจับคำถามพื้นฐาน
    if (msg.includes('สาขา') || msg.includes('เรียน')) {
      return 'เรามี 14 สาขาให้เลือก ทั้งช่างอุตสาหกรรมและเทคโนโลยี ลองดูการ์ดด้านล่างได้เลยค่ะ 📚';
    }

    if (msg.includes('ค่าเรียน') || msg.includes('ค่าเทอม')) {
      return 'ค่าเรียน ปวช. 12,100 บาท/ปี, ปวส. 21,700 บาท/ปี (ช่างอุตสาหกรรม) ค่ะ 💰';
    }

    if (msg.includes('สมัคร')) {
      const contact = TUITION_INFO?.contact || { phone: '053-277-777', website: 'www.lannapoly.ac.th' };
      return `สมัครได้ที่เว็บไซต์ ${contact.website} หรือโทรสอบถาม ${contact.phone} ค่ะ 📞`;
    }

    if (msg.includes('ติดต่อ') || msg.includes('โทร')) {
      const contact = TUITION_INFO?.contact || { phone: '053-277-777', email: 'lannapoly@edu.th' };
      return `ติดต่อได้ที่ โทร ${contact.phone} หรืออีเมล ${contact.email} ค่ะ ☎️`;
    }

    // คำตอบทั่วไป
    return 'มีอะไรให้ช่วยเกี่ยวกับการสมัครเรียนหรือข้อมูลสาขาไหมคะ? 😊';
  }

  /**
   * รับคำทักทายแบบสุ่ม - ภาษาไทยเท่านั้น
   */
  getGreeting() {
    const greetings = [
      'สวัสดีค่ะ! มีอะไรให้ช่วยเกี่ยวกับการสมัครเรียนไหมคะ? 😊',
      'หวัดดีจ้า! อยากรู้เกี่ยวกับสาขาไหนบ้างคะ? 🎓',
      'เฮ้ย! สนใจสาขาอะไรดีจ้า? ✨'
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  /**
   * รีเซ็ต conversation history
   */
  resetConversation() {
    this.conversationHistory = [];
  }
}

// Export singleton instance
const geminiService = new GeminiService();
export default geminiService;

// Export helper functions
export const askGemini = (message) => geminiService.ask(message);
export const resetChat = () => geminiService.resetConversation();
export const getGreeting = () => geminiService.getGreeting();
