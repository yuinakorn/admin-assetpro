# การแก้ไขปัญหาการแสดงสิทธิ์ใน Navbar และ Sidebar

## ปัญหาที่พบ
- Navbar และ Sidebar ยังแสดงสิทธิ์เป็น "ผู้ใช้งาน" แทนที่จะแสดงสิทธิ์ที่ถูกต้อง
- ระบบยังใช้ `user?.user_metadata?.role` แทนที่จะใช้ `userProfile?.role`

## สาเหตุของปัญหา
1. **AppNavbar.tsx** ยังใช้ `user?.user_metadata?.role` ในการแสดงสิทธิ์
2. **AppSidebar.tsx** ยังใช้ `user?.user_metadata?.role` ในการแสดงสิทธิ์
3. ข้อมูล role จริงอยู่ใน `userProfile` ที่ดึงมาจากตาราง users

## การแก้ไข

### 1. แก้ไข AppNavbar.tsx
- เพิ่ม `userProfile` ใน destructuring จาก `useAuth()`
- แก้ไข `getUserDisplayName()` ให้ใช้ `userProfile` เป็นหลัก
- แก้ไข `getUserRole()` ให้ใช้ `userProfile?.role` เป็นหลัก
- แก้ไข `getInitials()` ให้ใช้ `userProfile` เป็นหลัก

### 2. แก้ไข AppSidebar.tsx
- เพิ่ม `userProfile` ใน destructuring จาก `useAuth()`
- แก้ไข `getUserDisplayName()` ให้ใช้ `userProfile` เป็นหลัก
- แก้ไข `getUserRole()` ให้ใช้ `userProfile?.role` เป็นหลัก

## ผลลัพธ์
- Navbar และ Sidebar จะแสดงสิทธิ์ที่ถูกต้องตามข้อมูลในตาราง users
- ผู้ใช้ที่มีสิทธิ์ admin จะแสดงเป็น "ผู้ดูแลระบบ"
- ผู้ใช้ที่มีสิทธิ์ manager จะแสดงเป็น "ผู้จัดการ"
- ผู้ใช้ที่มีสิทธิ์ user จะแสดงเป็น "ผู้ใช้งาน"

## การทดสอบ
1. Login ด้วยบัญชี admin
2. ตรวจสอบว่า Navbar และ Sidebar แสดงสิทธิ์เป็น "ผู้ดูแลระบบ"
3. ตรวจสอบว่าเมนูต่างๆ แสดงตามสิทธิ์ที่ถูกต้อง

## ไฟล์ที่แก้ไข
- `src/components/layout/AppNavbar.tsx` - แก้ไขการแสดงชื่อและสิทธิ์
- `src/components/layout/AppSidebar.tsx` - แก้ไขการแสดงชื่อและสิทธิ์ 