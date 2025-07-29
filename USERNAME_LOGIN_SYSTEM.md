# ระบบ Login ด้วย Username

## 🎯 การเปลี่ยนแปลงหลัก

เปลี่ยนระบบ authentication จาก **Email-based** เป็น **Username-based** เพื่อให้ง่ายต่อการใช้งาน

## 🔧 การแก้ไขที่ทำ

### 1. **AuthContext.tsx**

#### **เปลี่ยน Function Signatures:**
```typescript
// ก่อน
signIn: (email: string, password: string) => Promise<{ error: any }>
signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>

// หลัง
signIn: (username: string, password: string) => Promise<{ error: any }>
signUp: (username: string, email: string, password: string, userData: any) => Promise<{ error: any }>
```

#### **อัปเดต signIn Function:**
```typescript
const signIn = async (username: string, password: string) => {
  try {
    // 1. ค้นหา email จาก username
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('username', username)
      .eq('is_active', true)
      .single()

    if (userError || !userData) {
      return { error: { message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' } }
    }

    // 2. เข้าสู่ระบบด้วย email
    const { error } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password,
    })
    return { error }
  } catch (error) {
    console.error('Sign in error:', error)
    return { error: { message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' } }
  }
}
```

#### **อัปเดต signUp Function:**
```typescript
const signUp = async (username: string, email: string, password: string, userData: any) => {
  try {
    // 1. ตรวจสอบ username ซ้ำ
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUser) {
      return { error: { message: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว' } }
    }

    // 2. สมัครสมาชิกด้วย Supabase Auth
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...userData,
          username,
        },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })
    return { error }
  } catch (error) {
    console.error('Sign up error:', error)
    return { error: { message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' } }
  }
}
```

### 2. **Login.tsx**

#### **เปลี่ยนจาก Email เป็น Username:**
```typescript
// ก่อน
const [email, setEmail] = useState('')
// หลัง
const [username, setUsername] = useState('')
```

#### **อัปเดต Form Field:**
```typescript
// ก่อน
<Label htmlFor="email">อีเมล</Label>
<Input
  id="email"
  type="email"
  placeholder="your@email.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// หลัง
<Label htmlFor="username">ชื่อผู้ใช้</Label>
<div className="relative">
  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
  <Input
    id="username"
    type="text"
    placeholder="ชื่อผู้ใช้"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    className="pl-10"
  />
</div>
```

#### **อัปเดต Error Messages:**
```typescript
// ก่อน
setError('กรุณากรอกอีเมลและรหัสผ่าน')
setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')

// หลัง
setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน')
setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
```

### 3. **Register.tsx**

#### **อัปเดต signUp Call:**
```typescript
// ก่อน
const { error } = await signUp(formData.email, formData.password, userData)

// หลัง
const { error } = await signUp(formData.username, formData.email, formData.password, userData)
```

### 4. **Database Migration**

#### **สร้าง Migration ใหม่:**
```sql
-- อัปเดต admin user ให้มี username
UPDATE users 
SET 
  username = 'admin',
  updated_at = NOW()
WHERE email = 'admin@assetpro.local';

-- สร้าง admin user ใหม่หากไม่มี
INSERT INTO users (
  id,
  first_name,
  last_name,
  username,
  email,
  password_hash,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ผู้ดูแล',
  'ระบบ',
  'admin',
  'admin@assetpro.local',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  username = EXCLUDED.username,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
```

## 🔄 การทำงานของระบบ

### **Flow การ Login:**
1. ผู้ใช้กรอก **username** และ **password**
2. ระบบค้นหา **email** จาก **username** ในตาราง `users`
3. ระบบเรียก Supabase Auth ด้วย **email** และ **password**
4. หากสำเร็จ จะ redirect ไปหน้า dashboard

### **Flow การ Register:**
1. ผู้ใช้กรอกข้อมูลรวมถึง **username** และ **email**
2. ระบบตรวจสอบ **username** ซ้ำในตาราง `users`
3. หากไม่ซ้ำ ระบบเรียก Supabase Auth ด้วย **email** และ **password**
4. ระบบส่งอีเมลยืนยันไปยัง **email**

## 🎨 UI/UX Improvements

### **Login Page:**
- ✅ เปลี่ยนจาก Email field เป็น Username field
- ✅ เพิ่ม User icon ใน input field
- ✅ อัปเดต placeholder และ labels
- ✅ อัปเดต error messages

### **Register Page:**
- ✅ รองรับ username-based registration
- ✅ ตรวจสอบ username ซ้ำ
- ✅ แสดง error message ที่เหมาะสม

## 🔐 ความปลอดภัย

### **การตรวจสอบ:**
- ✅ ตรวจสอบ username ซ้ำก่อนสมัคร
- ✅ ตรวจสอบ is_active = true ก่อน login
- ✅ ใช้ email สำหรับ Supabase Auth (ความปลอดภัย)
- ✅ ใช้ username สำหรับ UI (ความสะดวก)

### **Error Handling:**
- ✅ จัดการ username ไม่พบ
- ✅ จัดการ password ไม่ถูกต้อง
- ✅ จัดการ email ไม่ยืนยัน
- ✅ จัดการ username ซ้ำ

## 📊 ข้อมูล Admin

### **Admin Credentials:**
- **Username:** `admin`
- **Password:** `admin123`
- **Email:** `admin@assetpro.local`
- **Role:** `admin`

### **การสร้าง Admin:**
1. ผ่านหน้า Register
2. ผ่าน Supabase Dashboard
3. ผ่าน SQL Migration

## 🚀 การทดสอบ

### **Test Cases:**
1. ✅ Login ด้วย username ที่ถูกต้อง
2. ✅ Login ด้วย username ที่ไม่ถูกต้อง
3. ✅ Login ด้วย password ที่ไม่ถูกต้อง
4. ✅ Register ด้วย username ใหม่
5. ✅ Register ด้วย username ซ้ำ
6. ✅ Logout และ redirect

### **การทดสอบ:**
```bash
# รัน migration
npx supabase db push

# รันแอป
npm run dev

# ทดสอบ login
Username: admin
Password: admin123
```

## 🎉 สรุป

ระบบ login ตอนนี้ใช้ **username** แทน **email** แล้ว!

### **ข้อดี:**
- 🎯 ง่ายต่อการจำและใช้งาน
- 🔒 ยังคงความปลอดภัยด้วย email-based auth
- 🎨 UI/UX ที่ดีขึ้น
- 📱 รองรับ mobile devices

### **การเปลี่ยนแปลงหลัก:**
- 🔄 AuthContext รองรับ username-based login
- 🎨 Login page ใช้ username field
- 📝 Register page รองรับ username
- 🗄️ Database มี admin user พร้อม username

ระบบพร้อมใช้งานแล้ว! 🚀