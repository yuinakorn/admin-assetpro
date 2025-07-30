# แก้ไขปัญหาการลบครุภัณฑ์ - Foreign Key Constraints

## 🚨 ปัญหาที่พบ

ข้อความ error: **"Unable to delete rows as one of them is currently referenced by a foreign key constraint from the table `users`"**

## 🔍 สาเหตุของปัญหา

### **Foreign Key Constraints ที่ไม่มี ON DELETE Behavior**

ปัญหาหลักคือ foreign key constraints ระหว่างตารางต่างๆ ไม่มีการกำหนดพฤติกรรมเมื่อลบข้อมูล:

#### **1. ตารางที่เกี่ยวข้อง:**
```sql
-- Users -> Departments
users.department_id -> departments.id
-- ไม่มี ON DELETE behavior

-- Departments -> Users (manager)
departments.manager_id -> users.id  
-- ไม่มี ON DELETE behavior

-- Equipment -> Departments
equipment.department_id -> departments.id
-- ไม่มี ON DELETE behavior

-- Equipment -> Users
equipment.current_user_id -> users.id
equipment.created_by -> users.id
equipment.updated_by -> users.id
-- ไม่มี ON DELETE behavior
```

#### **2. ปัญหาที่เกิดขึ้น:**
- เมื่อพยายามลบ `departments` แต่มี `users` ที่อ้างอิงอยู่
- เมื่อพยายามลบ `users` แต่มี `equipment` ที่อ้างอิงอยู่
- เมื่อพยายามลบ `equipment` แต่มี foreign key constraints ที่ไม่ถูกต้อง

## 🔧 การแก้ไขที่ทำ

### **Migration: 022_fix_foreign_key_constraints.sql**

#### **1. ลบ Foreign Key Constraints เดิม:**
```sql
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_department_id_fkey;
ALTER TABLE departments DROP CONSTRAINT IF EXISTS fk_departments_manager;
ALTER TABLE equipment DROP CONSTRAINT IF EXISTS equipment_department_id_fkey;
ALTER TABLE equipment DROP CONSTRAINT IF EXISTS equipment_current_user_id_fkey;
ALTER TABLE equipment DROP CONSTRAINT IF EXISTS equipment_created_by_fkey;
ALTER TABLE equipment DROP CONSTRAINT IF EXISTS equipment_updated_by_fkey;
```

#### **2. สร้าง Foreign Key Constraints ใหม่ด้วย ON DELETE SET NULL:**
```sql
-- Users -> Departments: SET NULL when department is deleted
ALTER TABLE users ADD CONSTRAINT users_department_id_fkey 
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- Departments -> Users (manager): SET NULL when manager is deleted
ALTER TABLE departments ADD CONSTRAINT fk_departments_manager 
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;

-- Equipment -> Departments: SET NULL when department is deleted
ALTER TABLE equipment ADD CONSTRAINT equipment_department_id_fkey 
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- Equipment -> Users: SET NULL when user is deleted
ALTER TABLE equipment ADD CONSTRAINT equipment_current_user_id_fkey 
  FOREIGN KEY (current_user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE equipment ADD CONSTRAINT equipment_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE equipment ADD CONSTRAINT equipment_updated_by_fkey 
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
```

## 🎯 ข้อดีของการแก้ไขนี้

### **✅ ON DELETE SET NULL:**
- เมื่อลบ `departments` → `users.department_id` จะเป็น `NULL`
- เมื่อลบ `users` → `equipment.current_user_id` จะเป็น `NULL`
- ข้อมูลจะไม่หายไป แต่จะไม่มี reference

### **✅ ON DELETE CASCADE (ที่มีอยู่แล้ว):**
- `equipment_images`, `equipment_activities`, `borrow_records`, `maintenance_records`, `warranty_alerts` 
- เมื่อลบ `equipment` → ข้อมูลที่เกี่ยวข้องจะถูกลบอัตโนมัติ

### **✅ Data Integrity:**
- ข้อมูลไม่สูญหายโดยไม่จำเป็น
- สามารถลบข้อมูลได้โดยไม่มี foreign key constraint errors
- ระบบยังคงทำงานได้ปกติ

## 🧪 ขั้นตอนการทดสอบ

### **1. Apply Migration:**
```bash
# ไปที่ Supabase Dashboard > SQL Editor
# Copy และรัน SQL จาก 022_fix_foreign_key_constraints.sql
```

### **2. ทดสอบการลบ:**
1. ลองลบ `departments` ที่มี `users` อ้างอิงอยู่
2. ลองลบ `users` ที่มี `equipment` อ้างอิงอยู่  
3. ลองลบ `equipment` ที่มีข้อมูลที่เกี่ยวข้อง

### **3. ตรวจสอบผลลัพธ์:**
- ข้อมูลที่อ้างอิงควรเป็น `NULL` แทนที่จะ error
- ข้อมูลที่เกี่ยวข้องควรถูกลบอัตโนมัติ (CASCADE)

## 📝 สรุป

### **การแก้ไขที่ทำ:**
1. ✅ ลบ foreign key constraints เดิม
2. ✅ สร้าง constraints ใหม่ด้วย ON DELETE SET NULL
3. ✅ รักษา ON DELETE CASCADE สำหรับตารางที่เกี่ยวข้อง

### **ผลลัพธ์ที่คาดหวัง:**
- สามารถลบ `departments` ได้โดยไม่มี error
- สามารถลบ `users` ได้โดยไม่มี error  
- สามารถลบ `equipment` ได้โดยไม่มี error
- ข้อมูลที่เกี่ยวข้องจะถูกลบอัตโนมัติ

### **ข้อควรระวัง:**
- ข้อมูลที่อ้างอิงจะเป็น `NULL` หลังจากลบ
- ควรตรวจสอบข้อมูลหลังจากลบเสมอ
- อาจต้องอัปเดต UI เพื่อจัดการกับ `NULL` values

**ตอนนี้ระบบควรจะลบข้อมูลได้โดยไม่มี foreign key constraint errors แล้ว!** 🎉

การแก้ไขนี้จะทำให้ระบบสามารถลบข้อมูลได้อย่างปลอดภัยโดยไม่สูญเสียข้อมูลที่ไม่จำเป็น 