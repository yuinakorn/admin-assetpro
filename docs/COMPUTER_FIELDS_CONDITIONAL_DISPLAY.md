# การปรับการแสดงการ์ดคุณสมบัติเฉพาะตามประเภทครุภัณฑ์

## ความต้องการ
ให้การ์ด "คุณสมบัติเฉพาะ" แสดงเฉพาะเมื่อผู้ใช้เลือก categories เป็น COMPUTER, LAPTOP, AIO เท่านั้น

## การแก้ไขที่ทำ

### 1. ปรับ Logic การแสดงฟิลด์
ในไฟล์ `src/pages/EquipmentAdd.tsx` เปลี่ยนจากการตรวจสอบชื่อเป็นตรวจสอบ code:

```typescript
// เดิม
const selectedCategoryName = categories.find(c => c.id === formData.category_id)?.name || ''
const showComputerFields = ['คอมพิวเตอร์', 'โน้ตบุ๊ค'].includes(selectedCategoryName)

// ใหม่
const selectedCategory = categories.find(c => c.id === formData.category_id)
const selectedCategoryCode = selectedCategory?.code || ''
const showComputerFields = ['COMPUTER', 'LAPTOP', 'AIO'].includes(selectedCategoryCode)
```

### 2. เพิ่ม AIO Category
สร้าง migration `051_add_aio_category.sql` เพื่อเพิ่ม AIO category:

```sql
-- Add AIO category
INSERT INTO equipment_categories (name, code, description, icon, color, sort_order) VALUES
('คอมพิวเตอร์ All-in-One', 'AIO', 'คอมพิวเตอร์ All-in-One ที่รวมจอภาพและเครื่องคอมพิวเตอร์ไว้ในเครื่องเดียว', 'Monitor', '#6366F1', 3)
ON CONFLICT (code) DO NOTHING;

-- Update sort order for existing categories
UPDATE equipment_categories SET sort_order = 4 WHERE code = 'MONITOR';
UPDATE equipment_categories SET sort_order = 5 WHERE code = 'PRINTER';
UPDATE equipment_categories SET sort_order = 6 WHERE code = 'UPS';
UPDATE equipment_categories SET sort_order = 7 WHERE code = 'NETWORK';
```

### 3. อัปเดต Debug Log
ปรับ debug log เพื่อแสดงข้อมูลที่ถูกต้อง:

```typescript
// Debug log
console.log('Selected category ID:', formData.category_id)
console.log('Selected category code:', selectedCategoryCode)
console.log('Selected category name:', selectedCategory?.name || '')
console.log('Show computer fields:', showComputerFields)
```

## Categories ที่รองรับการแสดงคุณสมบัติเฉพาะ

### ✅ แสดงคุณสมบัติเฉพาะ
- **COMPUTER** - คอมพิวเตอร์ตั้งโต๊ะ
- **LAPTOP** - โน้ตบุ๊ค
- **AIO** - คอมพิวเตอร์ All-in-One

### ❌ ไม่แสดงคุณสมบัติเฉพาะ
- **MONITOR** - จอภาพ
- **PRINTER** - เครื่องพิมพ์
- **UPS** - เครื่องสำรองไฟ
- **NETWORK** - อุปกรณ์เครือข่าย

## ฟิลด์ที่แสดงในคุณสมบัติเฉพาะ
เมื่อเลือกประเภท COMPUTER, LAPTOP, หรือ AIO จะแสดงฟิลด์ต่อไปนี้:

1. **CPU** - เลือกจาก dropdown
2. **CPU Series** - กรอกเป็น text
3. **RAM (GB)** - กรอกเป็น number
4. **Storage (GB,TB)** - กรอกเป็น text
5. **Harddisk Type** - เลือกจาก dropdown
6. **Operating System** - เลือกจาก dropdown
7. **Office** - เลือกจาก dropdown

## ผลลัพธ์
- การ์ด "คุณสมบัติเฉพาะ" จะแสดงเฉพาะเมื่อเลือกประเภทครุภัณฑ์ที่เป็นคอมพิวเตอร์
- ประเภทอื่นๆ เช่น จอภาพ, เครื่องพิมพ์ จะไม่แสดงฟิลด์คุณสมบัติเฉพาะ
- เพิ่ม AIO category ใหม่สำหรับคอมพิวเตอร์ All-in-One
- ใช้ category code แทนชื่อเพื่อความแม่นยำในการตรวจสอบ

## ไฟล์ที่แก้ไข
1. `src/pages/EquipmentAdd.tsx`
2. `supabase/migrations/051_add_aio_category.sql` (ใหม่)

## วันที่แก้ไข
19 ธันวาคม 2024 