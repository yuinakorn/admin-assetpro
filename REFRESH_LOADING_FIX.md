# การแก้ไขปัญหาหน้า Loading ค้างเมื่อ Refresh

## ปัญหาที่พบ
- เมื่อ refresh หน้าเว็บ ระบบจะค้างอยู่ที่หน้า loading spinner
- Console แสดงว่า "Fetching user profile for: [user_id]" แต่ไม่มีการตอบกลับ
- ระบบไม่สามารถโหลดข้อมูล user profile ได้

## สาเหตุของปัญหา
1. **การดึงข้อมูล user profile** อาจใช้เวลานานหรือมีปัญหาในการเชื่อมต่อ
2. **ไม่มี fallback mechanism** เมื่อการดึงข้อมูลล้มเหลว
3. **Loading state** ไม่ถูก reset เมื่อเกิด error

## การแก้ไข

### 1. แก้ไข AuthContext.tsx
- เพิ่ม error handling ใน `getInitialSession()`
- เพิ่ม fallback mechanism เมื่อการดึง user profile ล้มเหลว
- ใช้ข้อมูลจาก `user_metadata` เป็น fallback
- เพิ่ม `finally` block เพื่อให้แน่ใจว่า `loading` จะถูก set เป็น `false`

### 2. Fallback Mechanism
- เมื่อการดึง user profile ล้มเหลว ระบบจะสร้าง profile จาก `user_metadata`
- ใช้ข้อมูลพื้นฐานจาก Supabase Auth session
- กำหนด role เป็น 'user' เป็นค่าเริ่มต้น

## ผลลัพธ์
- ระบบจะไม่ค้างที่หน้า loading อีกต่อไป
- มี fallback mechanism เมื่อการดึงข้อมูลล้มเหลว
- Loading state จะถูกจัดการอย่างถูกต้อง

## การทดสอบ
1. Refresh หน้าเว็บ
2. ตรวจสอบว่าไม่ค้างที่หน้า loading
3. ตรวจสอบ console เพื่อดู log การทำงาน
4. ตรวจสอบว่าสามารถใช้งานระบบได้ปกติ

## ไฟล์ที่แก้ไข
- `src/contexts/AuthContext.tsx` - เพิ่ม error handling และ fallback mechanism 