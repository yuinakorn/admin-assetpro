# การแก้ไขปัญหาสิทธิ์ Admin

## ปัญหาที่พบ
- ผู้ใช้ที่มีสิทธิ์ admin ใน Supabase Dashboard แต่เมื่อ login เข้าระบบแล้วได้สิทธิ์แค่ user
- ระบบไม่สามารถอ่านข้อมูล role จากตาราง users ได้

## สาเหตุของปัญหา
1. **usePermissions hook** อ่าน role จาก `user?.user_metadata?.role` ซึ่งเป็นข้อมูลจาก Supabase Auth
2. **ข้อมูล role จริง** อยู่ในตาราง `users` ไม่ใช่ใน `user_metadata`
3. **AuthContext** ไม่ได้ดึงข้อมูล user profile จากตาราง users หลังจาก login

## การแก้ไข

### 1. แก้ไข AuthContext.tsx
- เพิ่ม state `userProfile` เพื่อเก็บข้อมูลจากตาราง users
- เพิ่มฟังก์ชัน `fetchUserProfile()` เพื่อดึงข้อมูล user profile
- เรียกใช้ `fetchUserProfile()` เมื่อ auth state เปลี่ยน
- ส่ง `userProfile` ไปยัง context value

### 2. แก้ไข usePermissions.ts
- เปลี่ยนจากการอ่าน role จาก `user?.user_metadata?.role`
- เป็นการอ่านจาก `userProfile?.role` เป็นหลัก
- ใช้ `user?.user_metadata?.role` เป็น fallback

## ผลลัพธ์
- ระบบจะอ่าน role จากตาราง users ที่ถูกต้อง
- ผู้ใช้ที่มีสิทธิ์ admin จะได้สิทธิ์ admin จริงๆ
- ระบบจะแสดงเมนูและฟีเจอร์ตามสิทธิ์ที่ถูกต้อง

## การทดสอบ
1. Login ด้วยบัญชี admin
2. ตรวจสอบว่าสามารถเข้าถึงเมนู admin ได้
3. ตรวจสอบว่าสามารถจัดการผู้ใช้ หน่วยงาน และครุภัณฑ์ได้

## ไฟล์ที่แก้ไข
- `src/contexts/AuthContext.tsx` - เพิ่มการดึง user profile
- `src/hooks/usePermissions.ts` - แก้ไขการอ่าน role จาก userProfile 