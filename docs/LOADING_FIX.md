# การแก้ไขปัญหาหน้า Loading ค้าง

## ปัญหาที่พบ
- หน้าเว็บค้างอยู่ที่หน้า loading spinner และข้อความ "กำลังโหลด..."
- ระบบไม่สามารถโหลดข้อมูล user profile ได้

## สาเหตุของปัญหา
1. **ProtectedRoute** ยังใช้ `user.user_metadata?.role` แทนที่จะใช้ `userProfile?.role`
2. **Index.tsx** ยังใช้ `user` แทนที่จะใช้ `userProfile` ในการตรวจสอบการ redirect
3. **AuthContext** ไม่มีการจัดการ error ที่เหมาะสม

## การแก้ไข

### 1. แก้ไข ProtectedRoute.tsx
- เพิ่ม `userProfile` ใน destructuring จาก `useAuth()`
- เปลี่ยนการอ่าน role จาก `userProfile?.role` เป็นหลัก
- ใช้ `user?.user_metadata?.role` เป็น fallback

### 2. แก้ไข Index.tsx
- เพิ่ม `userProfile` ใน destructuring จาก `useAuth()`
- เปลี่ยนเงื่อนไขการ redirect เป็น `user && userProfile`
- เปลี่ยนเงื่อนไขการแสดงหน้า loading เป็น `user && userProfile`

### 3. แก้ไข AuthContext.tsx
- เพิ่ม error handling ใน `getInitialSession()`
- เพิ่ม console.log เพื่อ debug
- เพิ่มการจัดการ error ที่เหมาะสม

## ผลลัพธ์
- ระบบจะโหลดข้อมูล user profile ได้อย่างถูกต้อง
- หน้า loading จะหายไปเมื่อโหลดเสร็จ
- ระบบจะ redirect ไปยัง dashboard เมื่อ login สำเร็จ

## การทดสอบ
1. รีเฟรชหน้าเว็บ
2. ตรวจสอบ console เพื่อดู log การโหลด
3. ตรวจสอบว่าหน้า loading หายไปและ redirect ไปยัง dashboard

## ไฟล์ที่แก้ไข
- `src/components/auth/ProtectedRoute.tsx` - แก้ไขการอ่าน role
- `src/pages/Index.tsx` - แก้ไขเงื่อนไขการ redirect
- `src/contexts/AuthContext.tsx` - เพิ่ม error handling และ debug log 