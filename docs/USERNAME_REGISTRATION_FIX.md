# การแก้ไขปัญหาการสมัครสมาชิก Username

## ปัญหาที่พบ
- ระบบสร้าง username อัตโนมัติแทนที่จะใช้ username ที่ผู้ใช้กรอกตอนสมัครสมาชิก
- ตัวอย่าง: ผู้ใช้กรอก username "yuinakorn" แต่ระบบสร้างเป็น "yuinakorn_e9b8"

## สาเหตุของปัญหา
1. **Migration 046** มี fallback logic ที่สร้าง username อัตโนมัติ:
   ```sql
   COALESCE(
     new.raw_user_meta_data ->> 'username',
     split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4)
   )
   ```

2. **AuthContext.tsx** ใช้ `options.data` แต่ Supabase Auth เก็บข้อมูลใน `raw_user_meta_data`

## การแก้ไข

### 1. แก้ไข AuthContext.tsx
- เพิ่มการ insert ข้อมูล user ลงในตาราง users โดยตรงหลังจากสร้าง auth user
- ใช้ username ที่ผู้ใช้กรอกจริงแทนที่จะพึ่งพา trigger

### 2. สร้าง Migration 048
- ปิดการใช้งาน trigger ที่สร้าง username อัตโนมัติ
- แก้ไขฟังก์ชัน `handle_new_user()` ให้ไม่สร้าง fallback username
- เพิ่มการตรวจสอบว่ามี user อยู่แล้วหรือไม่เพื่อป้องกัน duplicate

## ผลลัพธ์
- ระบบจะใช้ username ที่ผู้ใช้กรอกตอนสมัครสมาชิกจริง
- ไม่มีการสร้าง username อัตโนมัติอีกต่อไป
- ข้อมูล user จะถูกบันทึกอย่างถูกต้องในตาราง users

## การทดสอบ
1. ลองสมัครสมาชิกใหม่ด้วย username ที่ต้องการ
2. ตรวจสอบใน Supabase Dashboard ว่าข้อมูลถูกบันทึกถูกต้อง
3. ลองเข้าสู่ระบบด้วย username ที่กรอก

## ไฟล์ที่แก้ไข
- `src/contexts/AuthContext.tsx` - เพิ่มการ insert ข้อมูล user โดยตรง
- `supabase/migrations/048_disable_auto_username_generation.sql` - แก้ไข trigger และฟังก์ชัน 