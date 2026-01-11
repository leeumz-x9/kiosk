# 📊 โครงสร้างข้อมูลเนื้อหา (Content Management)

## 🎯 Collections ใน Firestore

### 1. `content_items` - เนื้อหาที่จะแสดง
```javascript
{
  id: "auto-generated",
  title: "ทุนการศึกษา 100% สำหรับนักเรียนเก่ง",
  description: "รับสมัครทุนการศึกษาเต็มจำนวน...",
  imageUrl: "https://...",
  type: "scholarship", // scholarship, news, event, promotion, career, activity
  ageGroup: "teens", // kids, teens, adults
  priority: 5, // 1-10 (สูงกว่าแสดงก่อน)
  tags: ["ทุน", "การศึกษา", "ฟรี"],
  isActive: true,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  viewCount: 0,
  clickCount: 0
}
```

### 2. `age_groups` - กำหนดช่วงอายุ
```javascript
{
  id: "kids",
  name: "วัยเด็ก",
  ageMin: 3,
  ageMax: 12,
  description: "เนื้อหาสำหรับเด็ก",
  emoji: "👶"
}

{
  id: "teens", 
  name: "วัยรุ่น",
  ageMin: 13,
  ageMax: 21,
  description: "เนื้อหาสำหรับวัยรุ่น",
  emoji: "🎓"
}

{
  id: "adults",
  name: "วัยทำงาน", 
  ageMin: 22,
  ageMax: 100,
  description: "เนื้อหาสำหรับผู้ปกครอง",
  emoji: "👨‍💼"
}
```

### 3. `content_types` - ประเภทเนื้อหา
```javascript
{
  id: "scholarship",
  name: "ทุนการศึกษา",
  icon: "🎓",
  color: "#10b981"
}

{
  id: "news",
  name: "ข่าวสาร",
  icon: "📰", 
  color: "#3b82f6"
}

{
  id: "event",
  name: "กิจกรรม",
  icon: "🎉",
  color: "#f59e0b"
}

{
  id: "promotion",
  name: "โปรโมชั่น",
  icon: "🎁",
  color: "#ef4444"
}

{
  id: "career",
  name: "สาขาวิชา",
  icon: "💼",
  color: "#8b5cf6"
}

{
  id: "activity",
  name: "กิจกรรมนักศึกษา",
  icon: "⚽",
  color: "#ec4899"
}
```

### 4. `user_interactions` - บันทึกการใช้งาน
```javascript
{
  sessionId: "session-xxx",
  age: 18,
  gender: "male",
  emotion: "happy",
  contentViewed: ["content-1", "content-2"],
  contentClicked: ["content-1"],
  timestamp: Timestamp,
  duration: 45 // seconds
}
```

## 🔥 Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Content items - Read public, Write admin only
    match /content_items/{contentId} {
      allow read: if true;
      allow write: if false; // จัดการผ่าน Firebase Console หรือ Admin
    }
    
    // Age groups - Read only
    match /age_groups/{groupId} {
      allow read: if true;
      allow write: if false;
    }
    
    // Content types - Read only
    match /content_types/{typeId} {
      allow read: if true;
      allow write: if false;
    }
    
    // User interactions - Log only
    match /user_interactions/{interactionId} {
      allow read: if false;
      allow create: if true;
      allow update, delete: if false;
    }
  }
}
```

## 📝 ตัวอย่างข้อมูลที่ควรมี

### วัยเด็ก (3-12 ปี)
- กิจกรรมค่ายวิทยาศาสตร์สำหรับเด็ก
- ภาพการ์ตูนแนะนำสาขาวิชา
- เกมเสริมทักษะ
- วิดีโอสนุกๆ

### วัยรุ่น (13-21 ปี) 
- ทุนการศึกษา
- สาขาวิชาที่เปิดสอน (14 สาขา)
- กิจกรรมนักศึกษา
- การแข่งขันทักษะวิชาชีพ
- ค่าเล่าเรียนและการผ่อนชำระ
- โควตาพิเศษ

### วัยทำงาน (22+ ปี)
- หลักสูตรเรียนต่อเสริมทักษะ
- ROI การลงทุนการศึกษา
- สถิติการมีงานทำของบัณฑิต
- เปรียบเทียบค่าเล่าเรียน

## 🎨 การออกแบบป๊อปอัพ

### แสดงแบบ Carousel/Slideshow
- แสดงทีละ 1 เนื้อหา
- Auto slide ทุก 8-10 วินาที
- สามารถกดเพื่อดูรายละเอียดเพิ่ม
- กดปุ่ม Next/Previous เพื่อเลื่อนดู
- แสดง indicator จำนวนเนื้อหา (1/5, 2/5, ...)

### UI Components
```
┌──────────────────────────────────┐
│  🎓 ทุนการศึกษา 100%              │
│                                  │
│  [Image/Icon]                    │
│                                  │
│  รับสมัครทุนการศึกษาเต็มจำนวน   │
│  สำหรับนักเรียนเก่ง GPA 3.5+     │
│                                  │
│  [< Previous]  1/5  [Next >]     │
│  [อ่านเพิ่มเติม]    [ปิด ×]      │
└──────────────────────────────────┘
```

## ⚡ Performance & Optimization

### เพื่อไม่ให้เครื่องหนัก:
1. **Limit Query** - ดึงแค่ 20 รายการต่อ age group
2. **Index Images** - ใช้ CDN หรือ Firebase Storage
3. **Cache** - เก็บข้อมูลใน local state, refresh ทุก 5 นาที
4. **Lazy Loading** - โหลดรูปตอนแสดงจริง
5. **Pagination** - ถ้ามีมากกว่า 20 ให้โหลดเพิ่ม

### Real-time vs Polling:
- **Real-time Listener**: ดีสำหรับข้อมูลที่เปลี่ยนบ่อย (แต่กินทรัพยากร)
- **One-time Fetch + Cache**: เหมาะสำหรับเนื้อหาที่ไม่เปลี่ยนบ่อย ✅ (แนะนำ)
- **Refresh on demand**: เมื่อ user กลับมาหน้า home

## 📱 Flow การทำงาน

```
1. User เข้ามาหน้าเครื่อง
   ↓
2. Face Detection → แสดง อายุ, เพศ, อารมณ์
   ↓
3. รอ 10 วินาที
   ↓
4. Query Firestore: ดึงเนื้อหาตาม ageGroup + isActive=true + order by priority
   ↓
5. แสดงป๊อปอัพ Carousel (auto slide 8-10 วินาที)
   ↓
6. บันทึก view/click ไป user_interactions
   ↓
7. วนลูปจนกว่า user จะเดินจากเครื่อง (idle timeout)
```

## 🛠️ วิธีจัดการข้อมูล

### Option 1: Firebase Console (ง่าย)
- เข้า Firebase Console
- เลือก Firestore Database
- เพิ่ม/ลบ/แก้ไข document ใน `content_items`

### Option 2: Admin Panel (แนะนำ)
- สร้าง Admin component ใน React
- มีฟอร์มเพิ่ม/แก้ไข/ลบเนื้อหา
- Upload รูปผ่าน Firebase Storage
- Protected ด้วย password

### Option 3: Script Upload (จำนวนมาก)
- เขียน Node.js script
- อ่านข้อมูลจาก CSV/JSON
- Batch upload ไป Firestore
