# การแก้ไขปัญหา Equipment Add - Foreign Key Columns

## ปัญหาที่พบ
หน้า equipment/add ไม่สามารถเพิ่มครุภัณฑ์ได้ โดยมีข้อผิดพลาด:
```
Could not find the 'harddisk_id' column of 'equipment' in the schema cache
```

## สาเหตุของปัญหา
1. โค้ดใน `EquipmentAdd.tsx` พยายามส่งค่า `harddisk_id`, `os_id`, และ `office_id` ไปยัง database
2. แต่ตาราง `equipment` ใน database ยังไม่มี column เหล่านี้
3. มีการสร้างตาราง `harddisk`, `os`, และ `office` แล้ว แต่ยังไม่ได้เพิ่ม foreign key columns ในตาราง `equipment`

## การแก้ไข

### 1. สร้าง Migration ใหม่
สร้างไฟล์ `supabase/migrations/050_add_equipment_property_foreign_keys.sql`:

```sql
-- Add harddisk_id foreign key column
ALTER TABLE public.equipment
ADD COLUMN harddisk_id UUID REFERENCES public.harddisk(id) ON DELETE SET NULL;

-- Add os_id foreign key column
ALTER TABLE public.equipment
ADD COLUMN os_id UUID REFERENCES public.os(id) ON DELETE SET NULL;

-- Add office_id foreign key column
ALTER TABLE public.equipment
ADD COLUMN office_id UUID REFERENCES public.office(id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_equipment_harddisk_id ON public.equipment(harddisk_id);
CREATE INDEX IF NOT EXISTS idx_equipment_os_id ON public.equipment(os_id);
CREATE INDEX IF NOT EXISTS idx_equipment_office_id ON public.equipment(office_id);
```

### 2. อัปเดต Database Schema
อัปเดต `database_schema.sql` เพื่อเพิ่ม column ใหม่:

```sql
-- Computer-specific specifications
cpu_id UUID REFERENCES cpu(id) ON DELETE SET NULL,
cpu_series VARCHAR(100),
ram INTEGER, -- RAM size in GB
storage VARCHAR(100),
gpu VARCHAR(100),
operating_system VARCHAR(100),
product_key VARCHAR(255),
harddisk_id UUID REFERENCES harddisk(id) ON DELETE SET NULL,
os_id UUID REFERENCES os(id) ON DELETE SET NULL,
office_id UUID REFERENCES office(id) ON DELETE SET NULL,
```

### 3. เพิ่ม Indexes
เพิ่ม indexes ใหม่ใน database schema:

```sql
CREATE INDEX idx_equipment_cpu_id ON equipment(cpu_id);
CREATE INDEX idx_equipment_harddisk_id ON equipment(harddisk_id);
CREATE INDEX idx_equipment_os_id ON equipment(os_id);
CREATE INDEX idx_equipment_office_id ON equipment(office_id);
```

### 4. รัน Migration
```bash
npx supabase db push
```

## ผลลัพธ์
- ตาราง `equipment` มี foreign key columns สำหรับ `harddisk_id`, `os_id`, และ `office_id`
- หน้า equipment/add สามารถเพิ่มครุภัณฑ์ได้ตามปกติ
- ระบบสามารถเชื่อมโยงครุภัณฑ์กับข้อมูล CPU, Harddisk, OS, และ Office ได้

## ไฟล์ที่แก้ไข
1. `supabase/migrations/050_add_equipment_property_foreign_keys.sql` (ใหม่)
2. `database_schema.sql` (อัปเดต)

## วันที่แก้ไข
19 ธันวาคม 2024 