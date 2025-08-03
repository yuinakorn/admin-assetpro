# การแก้ไขปัญหาแสดงฟิลด์คอมพิวเตอร์ในหน้า EquipmentAdd

## ปัญหาที่พบ
การ์ด "คุณสมบัติเฉพาะ" ไม่แสดงออกมาเมื่อเลือกประเภทคอมพิวเตอร์

## สาเหตุ
เงื่อนไขการแสดงผลใช้ชื่อภาษาอังกฤษ แต่ข้อมูลในฐานข้อมูลเป็นภาษาไทย

## การแก้ไข

### 1. แก้ไขเงื่อนไขการแสดงผล
```typescript
// เปลี่ยนจาก
const selectedCategoryName = categories.find(c => c.id === formData.category_id)?.name.toLowerCase() || ''
const showComputerFields = ['computer', 'laptop', 'aio'].includes(selectedCategoryName)

// เป็น
const selectedCategoryName = categories.find(c => c.id === formData.category_id)?.name || ''
const showComputerFields = ['คอมพิวเตอร์', 'โน้ตบุ๊ค'].includes(selectedCategoryName)
```

### 2. ข้อมูลในตาราง equipment_categories
```sql
INSERT INTO equipment_categories (name, code, description, icon, color, sort_order) VALUES
('คอมพิวเตอร์', 'COMPUTER', 'คอมพิวเตอร์ตั้งโต๊ะและเครื่องเซิร์ฟเวอร์', 'Monitor', '#3B82F6', 1),
('โน้ตบุ๊ค', 'LAPTOP', 'คอมพิวเตอร์พกพาและแท็บเล็ต', 'Laptop', '#10B981', 2),
-- ... other categories
```

### 3. เพิ่ม Debug Log
```typescript
// Debug log เพื่อตรวจสอบการทำงาน
console.log('Selected category ID:', formData.category_id)
console.log('Selected category name:', selectedCategoryName)
console.log('Show computer fields:', showComputerFields)
```

## เงื่อนไขการแสดงผล
- แสดงการ์ด "คุณสมบัติเฉพาะ" เมื่อเลือกประเภท:
  - "คอมพิวเตอร์" (Desktop Computer)
  - "โน้ตบุ๊ค" (Laptop)

## ฟิลด์ที่แสดงในคุณสมบัติเฉพาะ
1. **CPU** - Dropdown จากตาราง `cpu`
2. **CPU Series** - Text input
3. **RAM** - Text input
4. **Harddisk** - Dropdown จากตาราง `harddisk`
5. **Operating System** - Dropdown จากตาราง `os`
6. **Office** - Dropdown จากตาราง `office`

## ไฟล์ที่แก้ไข
- `src/pages/EquipmentAdd.tsx` - แก้ไขเงื่อนไขการแสดงผล

## ผลลัพธ์
- เมื่อเลือกประเภท "คอมพิวเตอร์" หรือ "โน้ตบุ๊ค" จะแสดงการ์ด "คุณสมบัติเฉพาะ"
- ฟิลด์ทั้งหมดแสดงผลและทำงานได้ถูกต้อง
- ข้อมูลถูกบันทึกในฐานข้อมูลเมื่อสร้างครุภัณฑ์

## การทดสอบ
1. เข้าหน้า EquipmentAdd
2. เลือกประเภท "คอมพิวเตอร์" หรือ "โน้ตบุ๊ค"
3. ตรวจสอบว่าการ์ด "คุณสมบัติเฉพาะ" แสดงผล
4. ตรวจสอบ console log เพื่อดูการทำงาน 