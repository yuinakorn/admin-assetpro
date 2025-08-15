# วิธีการรัน Migration

## 🎯 **ขั้นตอนการรัน Migration**

### 1. **ตรวจสอบ Supabase CLI**

ก่อนอื่นต้องตรวจสอบว่า Supabase CLI ติดตั้งแล้วหรือไม่:

```bash
# ตรวจสอบเวอร์ชัน
supabase --version

# หากยังไม่ได้ติดตั้ง ให้ติดตั้งด้วย
npm install -g supabase
```

### 2. **เชื่อมต่อกับ Supabase Project**

```bash
# เชื่อมต่อกับ project (ใช้ project reference จาก Supabase Dashboard)
supabase link --project-ref YOUR_PROJECT_REF

# ตัวอย่าง:
supabase link --project-ref abcdefghijklmnop
```

### 3. **รัน Migration**

มีหลายวิธีในการรัน migration:

#### วิธีที่ 1: ใช้ npm script (แนะนำ)
```bash
# รัน migration ทั้งหมดที่ยังไม่ได้รัน
npm run db:migrate
```

#### วิธีที่ 2: ใช้ Supabase CLI โดยตรง
```bash
# รัน migration ทั้งหมด
supabase db push
```

#### วิธีที่ 3: รันเฉพาะ migration ใหม่
```bash
# รัน migration เฉพาะไฟล์ใหม่
supabase db push --include-all
```

### 4. **ตรวจสอบผลลัพธ์**

```bash
# ตรวจสอบสถานะ migration
npm run db:status

# หรือ
supabase status
```

## 🔍 **การตรวจสอบว่า Migration สำเร็จ**

### 1. **ตรวจสอบใน Supabase Dashboard**

1. ไปที่ [Supabase Dashboard](https://supabase.com/dashboard)
2. เลือก project ของคุณ
3. ไปที่ **SQL Editor**
4. รันคำสั่ง SQL นี้:

```sql
-- ตรวจสอบว่า UNIQUE constraint ถูกลบแล้ว
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'equipment' 
AND constraint_name LIKE '%asset_number%';
```

**ผลลัพธ์ที่คาดหวัง**: ไม่ควรมีแถวใดๆ กลับมา (หมายความว่า constraint ถูกลบแล้ว)

### 2. **ตรวจสอบใน Application**

1. เปิด application
2. ไปที่หน้า **เพิ่มครุภัณฑ์**
3. ลองเพิ่มครุภัณฑ์ที่มี `asset_number` ซ้ำกับที่มีอยู่แล้ว
4. ตรวจสอบว่าไม่เกิด error

## 🛠️ **Troubleshooting**

### ปัญหาที่อาจเกิดขึ้น:

#### 1. **Supabase CLI ไม่ได้ติดตั้ง**
```bash
# ติดตั้ง Supabase CLI
npm install -g supabase

# หรือใช้ npx
npx supabase --version
```

#### 2. **ไม่ได้เชื่อมต่อกับ project**
```bash
# ตรวจสอบการเชื่อมต่อ
supabase status

# หากไม่ได้เชื่อมต่อ ให้เชื่อมต่อใหม่
supabase link --project-ref YOUR_PROJECT_REF
```

#### 3. **Migration ไม่สำเร็จ**
```bash
# ตรวจสอบ error log
supabase db push --debug

# ตรวจสอบ migration status
supabase migration list
```

#### 4. **Permission Error**
```bash
# ตรวจสอบ access token
echo $SUPABASE_ACCESS_TOKEN

# หากไม่มี ให้ตั้งค่าใหม่
export SUPABASE_ACCESS_TOKEN=your_access_token
```

## 📝 **คำสั่งที่มีประโยชน์**

```bash
# ตรวจสอบ migration status
npm run db:status

# ดูความแตกต่างระหว่าง local และ remote
npm run db:diff

# Reset database (ระวัง: จะลบข้อมูลทั้งหมด)
npm run db:reset

# Generate TypeScript types
npm run db:generate
```

## 🎯 **สรุปขั้นตอน**

1. ✅ ตรวจสอบ Supabase CLI
2. ✅ เชื่อมต่อกับ project
3. ✅ รัน migration: `npm run db:migrate`
4. ✅ ตรวจสอบผลลัพธ์ใน Dashboard
5. ✅ ทดสอบใน application

## ⚠️ **หมายเหตุสำคัญ**

- **Backup ข้อมูล**: ควร backup ข้อมูลก่อนรัน migration
- **Test Environment**: ควรทดสอบใน test environment ก่อน
- **Rollback Plan**: เตรียมแผน rollback หากเกิดปัญหา

## 🆘 **หากมีปัญหา**

หากเกิดปัญหาขณะรัน migration:

1. ตรวจสอบ error message
2. ตรวจสอบ Supabase Dashboard
3. ตรวจสอบ migration status
4. ติดต่อ support หากจำเป็น
