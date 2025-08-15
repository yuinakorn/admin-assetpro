# สร้าง Admin User ใน Supabase Auth

## 🔧 วิธีแก้ไขปัญหา

เนื่องจากระบบใช้ Supabase Auth ซึ่งไม่ใช้ password_hash ในตาราง users ต้องสร้าง admin user ใน Supabase Auth โดยตรง

### วิธีที่ 1: ผ่าน Supabase Dashboard (แนะนำ)

1. **ไปที่ Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - เลือกโปรเจค `re_admin_assetpro`

2. **ไปที่ Authentication > Users**
   - คลิก "Add User"

3. **กรอกข้อมูล:**
   - **Email:** `admin@assetpro.local`
   - **Password:** `admin123`
   - **User Metadata:**
     ```json
     {
       "first_name": "ผู้ดูแล",
       "last_name": "ระบบ",
       "username": "admin",
       "role": "admin"
     }
     ```

4. **คลิก "Create User"**

### วิธีที่ 2: ผ่าน SQL Editor

1. **ไปที่ SQL Editor ใน Supabase Dashboard**
2. **รันคำสั่ง SQL:**

```sql
-- Insert admin user into auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@assetpro.local',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "ผู้ดูแล", "last_name": "ระบบ", "username": "admin", "role": "admin"}',
  false,
  '',
  '',
  '',
  ''
);
```

### วิธีที่ 3: ใช้ Supabase CLI

```bash
# สร้าง admin user ผ่าน CLI
npx supabase auth admin create-user \
  --email admin@assetpro.local \
  --password admin123 \
  --user-metadata '{"first_name": "ผู้ดูแล", "last_name": "ระบบ", "username": "admin", "role": "admin"}'
```

## 🔐 ข้อมูลการเข้าสู่ระบบ

หลังจากสร้าง admin user แล้ว:

**Email:** `admin@assetpro.local`  
**Password:** `admin123`

## 🚀 การทดสอบ

1. **ไปที่** `http://localhost:8081/login`
2. **กรอกข้อมูล:**
   - Email: `admin@assetpro.local`
   - Password: `admin123`
3. **คลิก "เข้าสู่ระบบ"**

## 📝 หมายเหตุ

- หากยังไม่สามารถเข้าสู่ระบบได้ ให้ตรวจสอบว่า:
  - Email ถูกต้อง
  - Password ถูกต้อง
  - User ถูกสร้างใน Supabase Auth แล้ว
  - ไม่มี error ใน browser console

- หากต้องการเปลี่ยนรหัสผ่าน:
  1. ไปที่ Supabase Dashboard > Authentication > Users
  2. คลิกที่ admin user
  3. คลิก "Reset Password"

## 🔧 การแก้ไขปัญหาเพิ่มเติม

### หากยังไม่สามารถเข้าสู่ระบบได้:

1. **ตรวจสอบ Browser Console**
   - กด F12 > Console
   - ดู error messages

2. **ตรวจสอบ Network Tab**
   - กด F12 > Network
   - ดู API calls ไปยัง Supabase

3. **ตรวจสอบ Supabase Logs**
   - ไปที่ Supabase Dashboard > Logs
   - ดู authentication logs

### หากต้องการลบและสร้างใหม่:

```sql
-- ลบ admin user เดิม
DELETE FROM auth.users WHERE email = 'admin@assetpro.local';
DELETE FROM users WHERE email = 'admin@assetpro.local';
```

แล้วสร้างใหม่ตามวิธีข้างต้น