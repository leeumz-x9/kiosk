# ResponsiveVoice Integration Guide 🎤

## 🎵 Text-to-Speech แบบ 3 ภาษา

ระบบ TTS ด้วยเสียงผู้หญิงสาววัยรุ่นสดใส สไตล์สาวช่างอุตสาหกรรม ปวส. 💪

---

## 🔧 Setup ResponsiveVoice

### 1. Get API Key (Free)

1. ไปที่: https://responsivevoice.org/
2. คลิก "Get Started Free"
3. สมัครสมาชิก (Free tier: 5000 requests/day)
4. Copy API Key

### 2. แก้ไข `index.html`

```html
<!-- ResponsiveVoice API -->
<script src="https://code.responsivevoice.org/responsivevoice.js?key=YOUR_API_KEY"></script>
```

**แทนที่ `YOUR_API_KEY`** ด้วย key ที่ได้จากการสมัคร

---

## 🎙️ Voice Configuration

### เสียงที่ใช้ (3 ภาษา)

#### 🇹🇭 ไทย - Thai Female
```javascript
{
  voice: "Thai Female",
  rate: 1.1,    // เร็วขึ้นนิด - สดใส
  pitch: 1.2,   // สูงขึ้น - วัยรุ่น
  volume: 1.0
}
```

**ลักษณะเสียง:**
- วัยรุ่น สดใส
- พูดเร็วในระดับที่เหมาะสม
- เป็นกันเอง สไตล์สาวช่าง
- ชัดเจน น่าฟัง

#### 🇺🇸 อังกฤษ - US English Female
```javascript
{
  voice: "US English Female",
  rate: 1.15,
  pitch: 1.1,
  volume: 1.0
}
```

**ลักษณะเสียง:**
- Young energetic female
- Clear American accent
- Professional but friendly

#### 🇨🇳 จีน - Chinese Female
```javascript
{
  voice: "Chinese Female",
  rate: 1.1,
  pitch: 1.15,
  volume: 1.0
}
```

**ลักษณะเสียง:**
- Mandarin Chinese
- Young female voice
- Clear pronunciation

---

## 📝 Code Usage

### Basic Usage

```javascript
import voiceService, { speak } from './voiceService';

// Auto-detect language and speak
speak('สวัสดีครับ');  // Will speak in Thai
speak('Hello there'); // Will speak in English
speak('你好');        // Will speak in Chinese

// Specify language explicitly
speak('Welcome!', 'en');
speak('ยินดีต้อนรับ', 'th');
speak('欢迎', 'zh');
```

### In React Components

```jsx
import { speak, stopSpeaking } from '../voiceService';

function MyComponent() {
  const handleClick = () => {
    speak('คลิกที่สาขาที่สนใจได้เลยค่ะ', 'th');
  };

  return (
    <button onClick={handleClick}>
      คลิกฟัง
    </button>
  );
}
```

### Avatar Integration

```jsx
// In Avatar3D.jsx
const sendMessage = async () => {
  const response = await getChatResponse(message);
  
  // Speak the response
  setIsSpeaking(true);
  await speak(response, currentLanguage);
  setIsSpeaking(false);
};
```

---

## 🎯 Use Cases in Kiosk

### 1. Welcome Greeting
```javascript
// When user detected
speak('ยินดีต้อนรับค่ะ! พร้อมจะค้นหาสาขาที่ใช่แล้วหรือยัง?', 'th');
```

### 2. Career Description
```javascript
// When card clicked
const phrases = {
  tech: 'สาขาเทคโนโลยีเหมาะสำหรับคนที่ชอบคิด ชอบแก้ปัญหา',
  business: 'สาขาธุรกิจเหมาะกับคนที่ชอบติดต่อคน ชอบขาย',
  // ...
};

speak(phrases.tech, 'th');
```

### 3. Avatar Chat
```javascript
// Interactive conversation
speak('มีคำถามอะไรให้ช่วยไหมคะ?', 'th');
```

### 4. Instructions
```javascript
// Guide users
speak('กรุณาวางใบหน้าในกรอบเพื่อสแกนค่ะ', 'th');
```

---

## 🎨 Customizing Voice

### Adjust Rate (ความเร็ว)
```javascript
{
  rate: 0.8,  // ช้า - เข้าใจง่าย
  rate: 1.0,  // ปกติ
  rate: 1.2,  // เร็ว - สดใส วัยรุ่น
  rate: 1.5   // เร็วมาก
}
```

### Adjust Pitch (ระดับเสียง)
```javascript
{
  pitch: 0.8,  // ต่ำ - เป็นทางการ
  pitch: 1.0,  // ปกติ
  pitch: 1.2,  // สูง - วัยรุ่น สดใส
  pitch: 1.5   // สูงมาก
}
```

### Adjust Volume
```javascript
{
  volume: 0.5,  // เบา
  volume: 1.0,  // ปกติ
  volume: 1.5   // ดัง (max 2.0)
}
```

---

## 🎬 Examples

### Example 1: Welcome Message
```javascript
const welcomeMessages = {
  th: 'หวัดดีจ้า! มาหาสาขาที่เหมาะกับเรากัน',
  en: 'Hey there! Let\'s find your perfect career',
  zh: '你好！让我们找到适合你的职业'
};

speak(welcomeMessages.th, 'th');
```

### Example 2: Multi-language Support
```javascript
const handleLanguageChange = (lang) => {
  const announcements = {
    th: 'เปลี่ยนเป็นภาษาไทยแล้วค่ะ',
    en: 'Language changed to English',
    zh: '语言已更改为中文'
  };
  
  speak(announcements[lang], lang);
};
```

### Example 3: Dynamic Content
```javascript
const speakCareerInfo = (careerName, salary) => {
  const message = `สาขา${careerName} มีรายได้ประมาณ ${salary} บาทต่อเดือนค่ะ`;
  speak(message, 'th');
};

speakCareerInfo('เทคโนโลยี', '25000-50000');
```

---

## 🎤 Voice Personality

### สไตล์สาวช่างอุตสาหกรรม ปวส.

**ลักษณะเฉพาะ:**
- 😊 **สดใส เป็นกันเอง** - ไม่เป็นทางการเกินไป
- 💪 **มั่นใจ แข็งแรง** - พูดชัดเจน หนักแน่น
- 🎯 **ตรงไปตรงมา** - ให้ข้อมูลแม่นยำ
- 🏭 **ความรู้เชิงเทคนิค** - เข้าใจเรื่องอุตสาหกรรม
- 🎓 **ใส่ใจในอนาคต** - แนะนำด้วยความเข้าใจ

**ตัวอย่างประโยค:**
```javascript
const sentences = [
  'เฮ้ย! สนใจสาขาเทคโนโลยีป่าวจ๊ะ?',
  'สาขานี้เจ๋งมาก เรียนแล้วได้งานเยอะเลย',
  'มาดูรายละเอียดกันดีกว่า จะได้ตัดสินใจถูกต้อง',
  'ถ้าชอบลงมือทำ สาขานี้เหมาะมากเลยค่ะ',
  'อยากถามอะไรเพิ่มไหม? ถามได้เลยนะ!'
];
```

---

## 🚀 Advanced Features

### 1. Speak with Callbacks
```javascript
speak('สวัสดีค่ะ', 'th').then(() => {
  console.log('Speech finished');
  // Do something after speaking
});
```

### 2. Stop Speaking
```javascript
import { stopSpeaking } from './voiceService';

stopSpeaking(); // Stop current speech
```

### 3. Check if Speaking
```javascript
import { isSpeaking } from './voiceService';

if (isSpeaking()) {
  console.log('Avatar is speaking...');
}
```

### 4. Queue Messages
```javascript
const messages = [
  'ยินดีต้อนรับค่ะ',
  'วันนี้มาดูสาขาอะไรดีจ๊ะ?',
  'มีหลายสาขาให้เลือกเลยนะ'
];

// Speak one by one
for (const msg of messages) {
  await speak(msg, 'th');
  await sleep(500); // Pause between messages
}
```

---

## 🧪 Testing

### Test Voice Service
```javascript
// In browser console
import voiceService from './voiceService';

// Test Thai
voiceService.speak('ทดสอบเสียงภาษาไทย', 'th');

// Test English
voiceService.speak('Testing English voice', 'en');

// Test Chinese
voiceService.speak('测试中文语音', 'zh');

// List available voices
console.log(voiceService.getVoices());
```

---

## ⚙️ Configuration Tips

### สำหรับ Kiosk Environment

```javascript
export const VOICE_CONFIG = {
  enabled: true,
  
  thai: {
    voice: "Thai Female",
    rate: 1.15,   // เร็วขึ้นสำหรับ Kiosk
    pitch: 1.2,   // สดใส วัยรุ่น
    volume: 1.2   // ดังขึ้นสำหรับสภาพแวดล้อมที่มีเสียงรบกวน
  },
  
  // Auto-replay after timeout
  autoReplayGreeting: true,
  greetingInterval: 30000, // 30 seconds
  
  // Background noise handling
  volumeBoost: true
};
```

---

## 📊 Performance

### ResponsiveVoice Benefits:
- ✅ **Fast** - Low latency (<500ms)
- ✅ **Reliable** - 99.9% uptime
- ✅ **Free tier** - 5000 requests/day
- ✅ **No download** - Cloud-based
- ✅ **Cross-browser** - Works everywhere

### Alternatives:
- Google Text-to-Speech (requires API key)
- Web Speech API (browser built-in, limited voices)
- Azure Cognitive Services (paid)

---

## 🎓 Best Practices

1. **ใช้ rate 1.1-1.2** - สดใส แต่ไม่เร็วเกินไป
2. **pitch 1.15-1.25** - วัยรุ่น แต่ยังฟังชัดเจน
3. **ประโยคสั้น** - แบ่งประโยคยาวๆ เป็นสั้นๆ
4. **เว้นจังหวะ** - ใช้ pause ระหว่างประโยค
5. **ทดสอบเสียง** - ฟังและปรับแต่งให้เหมาะสม

---

## 🆘 Troubleshooting

### ❌ เสียงไม่ออก
1. Check console for errors
2. Verify API key in `index.html`
3. Check browser console permissions
4. Test with: `responsiveVoice.speak('test')`

### ❌ เสียงช้า/สะดุด
1. Check internet connection
2. Reduce rate value
3. Pre-load voices on page load

### ❌ ภาษาไทยพูดไม่ชัด
1. Use shorter sentences
2. Avoid complex words
3. Add spaces between words

---

**พร้อมให้บริการด้วยเสียงที่ไพเราะแล้ว! 🎤✨**
