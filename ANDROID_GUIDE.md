# Mobile & Android Support Guide

## ✅ การรองรับ Android/Mobile

### 📱 Features ที่เพิ่ม:

1. **Viewport Optimization**
   - No zoom, no scale
   - Safe area insets สำหรับ notched devices
   - Viewport-fit: cover

2. **Touch Optimization**
   - ปิด tap highlight
   - ปิด 300ms delay
   - Touch-friendly button sizes (60-70px)
   - Prevent double-tap zoom

3. **PWA Support**
   - Manifest.json
   - Standalone mode
   - Add to home screen
   - Theme color

4. **Responsive Design**
   - ปรับ font size อัตโนมัติ
   - Admin button ขนาดใหญ่ขึ้นบน mobile
   - Modal เต็มหน้าจอบน mobile
   - Touch-friendly spacing

5. **Performance**
   - Smooth scrolling
   - Hardware acceleration
   - Optimized animations

---

## 🔧 การทดสอบบน Android

### วิธีทดสอบ:

1. **เปิดในเบราว์เซอร์**
   ```
   http://172.20.10.3:3000/
   ```

2. **ติดตั้งเป็น PWA**
   - เปิด Chrome บน Android
   - กดเมนู (⋮) → "Add to Home screen"
   - เปิดจาก home screen

3. **ทดสอบ Features:**
   - ✅ Touch ปุ่ม Admin
   - ✅ Scroll หน้า Admin
   - ✅ Face detection
   - ✅ Idle timeout
   - ✅ Heatmap

---

## 📊 Responsive Breakpoints:

| Device | Width | Font Size |
|--------|-------|-----------|
| Desktop | > 1024px | 16px |
| Tablet | 768-1024px | 14px |
| Mobile | 480-768px | 14px |
| Small Phone | < 480px | 12px |

---

## 🎯 ปุ่มบน Android:

### ตำแหน่งปุ่ม:
- **Admin (⚙️)**: ขวาล่าง (100px จากล่าง, 20px จากขวา)
- **Heatmap (📊)**: ซ้ายล่าง (20px จากล่าง, 20px จากซ้าย)

### ขนาดปุ่ม:
- **Desktop**: 60x60px
- **Mobile**: 70x70px (ใหญ่ขึ้นเพื่อ touch ง่าย)
- **Small Phone**: 60x60px

---

## 🚀 การใช้งาน:

1. **บนคอมพิวเตอร์**: ใช้งานปกติ
2. **บน Android**:
   - เปิด Chrome
   - ไปที่ URL
   - Add to Home Screen
   - เปิดแบบ fullscreen

---

## 💡 Tips สำหรับการแข่งขัน:

1. **ใช้ Tablet หรือ Phone ขนาดใหญ่**
   - ดีกว่าจอเล็ก
   - Touch ง่ายกว่า

2. **ตั้งค่า Android:**
   - ปิด Screen timeout
   - ตั้งค่า Stay awake
   - ปิด Notification

3. **เชื่อมต่อ WiFi:**
   - ใช้ hotspot จาก Raspberry Pi
   - หรือ WiFi ของงาน

4. **Battery:**
   - เสียบชาร์จตลอด
   - หรือใช้ Power bank

---

## 🔍 Troubleshooting:

### ปัญหา: หน้าจอเล็ก/ใหญ่เกินไป
✅ แก้: Reload หน้าเว็บ

### ปัญหา: Touch ไม่ตอบสนอง
✅ แก้: ปิดเบราว์เซอร์แล้วเปิดใหม่

### ปัญหา: Admin Panel เปิดไม่ได้
✅ แก้: Touch ค้างที่ปุ่ม (long press)

### ปัญหา: Idle timeout เร็วเกิน
✅ แก้: ตั้งค่าแล้ว 2 นาที (เพิ่มได้ใน App.jsx)

---

**Updated**: January 2026
**Version**: 2.0 - Android Ready 🤖
