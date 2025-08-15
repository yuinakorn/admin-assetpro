# แก้ไขปัญหา Duplicate Users

## 🎯 ปัญหาที่พบ

ระบบแจ้งว่า "สมัครสมาชิกสำเร็จ แต่ไม่สามารถสร้างข้อมูลผู้ใช้ได้: duplicate key value violates unique constraint "users_email_key""

## 🔍 สาเหตุของปัญหา

### 1. **Email ซ้ำในตาราง users**
- มี user ในตาราง `users` ที่มี email เดียวกัน
- เมื่อพยายาม insert user ใหม่ จะเกิด unique constraint violation
- แม้ว่า Supabase Auth signup จะสำเร็จแล้ว

### 2. **การตรวจสอบไม่ครบถ้วน**
- ระบบเดิมตรวจสอบเฉพาะ username ซ้ำ
- ไม่ได้ตรวจสอบ email ซ้ำ
- ทำให้เกิดปัญหาเมื่อ email ซ้ำ

## 🔧 การแก้ไขที่ทำ

### 1. **อัปเดต AuthContext.tsx**

#### **เพิ่มการตรวจสอบ Email ซ้ำ:**
```typescript
const signUp = async (username: string, email: string, password: string, userData: any) => {
  try {
    console.log('Starting signup process...', { username, email })
    
    // Check if username already exists
    const { data: existingUsername, error: checkUsernameError } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUsername) {
      console.log('Username already exists:', username)
      return { error: { message: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว' } }
    }

    // Check if email already exists
    const { data: existingEmail, error: checkEmailError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    if (existingEmail) {
      console.log('Email already exists:', email)
      return { error: { message: 'อีเมลนี้มีอยู่ในระบบแล้ว' } }
    }

    console.log('Username and email are available, proceeding with auth signup...')

    // ... rest of the function
  }
}
```

### 2. **สร้าง Migration ใหม่**

#### **017_cleanup_duplicate_users.sql:**
```sql
-- ========================================
-- CLEANUP DUPLICATE USERS
-- ========================================

-- Delete duplicate users based on email (keep the one with earliest created_at)
DELETE FROM users 
WHERE id NOT IN (
  SELECT DISTINCT ON (email) id
  FROM users 
  ORDER BY email, created_at ASC
);

-- Delete duplicate users based on username (keep the one with earliest created_at)
DELETE FROM users 
WHERE id NOT IN (
  SELECT DISTINCT ON (username) id
  FROM users 
  ORDER BY username, created_at ASC
);

-- Note: Unique constraints already exist on email and username
-- This migration just cleans up existing duplicates
```

## 🔄 Flow การทำงานใหม่

### **Register Flow:**
1. ผู้ใช้กรอกข้อมูลในหน้า Register
2. ระบบตรวจสอบ username ซ้ำในตาราง `users`
3. **ระบบตรวจสอบ email ซ้ำในตาราง `users`** ← เพิ่มใหม่
4. หากไม่ซ้ำ ระบบเรียก Supabase Auth signUp
5. หากสำเร็จ ระบบสร้าง record ในตาราง `users`
6. ระบบส่งอีเมลยืนยันไปยังผู้ใช้

## 🎯 ผลลัพธ์

### **ก่อนการแก้ไข:**
- ❌ ตรวจสอบเฉพาะ username ซ้ำ
- ❌ ไม่ตรวจสอบ email ซ้ำ
- ❌ เกิด duplicate key violation
- ❌ สมัครสมาชิกล้มเหลว

### **หลังการแก้ไข:**
- ✅ ตรวจสอบทั้ง username และ email ซ้ำ
- ✅ ลบ duplicate users ที่มีอยู่
- ✅ ป้องกัน duplicate ในอนาคต
- ✅ สมัครสมาชิกสำเร็จ

## 🧪 การทดสอบ

### **ทดสอบ Register:**
1. ไปที่ `/register`
2. กรอกข้อมูลใหม่:
   - ชื่อ: ทดสอบ
   - นามสกุล: ระบบ
   - ชื่อผู้ใช้: testuser3
   - อีเมล: test3@example.com
   - รหัสผ่าน: test123
   - ยืนยันรหัสผ่าน: test123
3. กด "สมัครสมาชิก"
4. ตรวจสอบว่า:
   - แสดงข้อความสำเร็จ
   - มี user ใน Supabase Auth
   - มี record ในตาราง `users`

### **ทดสอบ Duplicate Prevention:**
1. ลองสมัครสมาชิกด้วย username เดิม
2. ลองสมัครสมาชิกด้วย email เดิม
3. ตรวจสอบว่าแสดง error message ที่ถูกต้อง

## 🔐 ความปลอดภัย

### **การจัดการ Duplicates:**
- ลบ duplicate users ที่มีอยู่
- เก็บ user ที่เก่าที่สุด (earliest created_at)
- ป้องกัน duplicate ในอนาคต

### **การตรวจสอบ:**
- ตรวจสอบ username ซ้ำ
- ตรวจสอบ email ซ้ำ
- แสดง error message ที่ชัดเจน

## 🚀 สรุป

ระบบ Register ตอนนี้จัดการ duplicate users ได้แล้ว!

### **สิ่งที่แก้ไข:**
- ✅ เพิ่มการตรวจสอบ email ซ้ำ
- ✅ ลบ duplicate users ที่มีอยู่
- ✅ ป้องกัน duplicate ในอนาคต
- ✅ แสดง error message ที่ชัดเจน

### **การใช้งาน:**
- ✅ Register ใหม่ได้
- ✅ ป้องกัน username ซ้ำ
- ✅ ป้องกัน email ซ้ำ
- ✅ ระบบทำงานได้ปกติ

ระบบพร้อมใช้งานแล้ว! 🎉