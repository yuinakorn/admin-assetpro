# Equipment Table Structure Analysis

## ตาราง equipment บน Supabase

### 🎯 **Primary Key (PK)**
```sql
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
```

### 🔗 **Foreign Keys (FK)**

#### 1. **department_id**
```sql
department_id UUID REFERENCES departments(id)
```
- **ตารางปลายทาง**: `departments`
- **ความสัมพันธ์**: Many-to-One (Equipment → Department)
- **การใช้งาน**: ระบุแผนกที่ครุภัณฑ์อยู่

#### 2. **current_user_id**
```sql
current_user_id UUID REFERENCES users(id)
```
- **ตารางปลายทาง**: `users`
- **ความสัมพันธ์**: Many-to-One (Equipment → User)
- **การใช้งาน**: ระบุผู้ใช้งานปัจจุบันของครุภัณฑ์

#### 3. **created_by**
```sql
created_by UUID REFERENCES users(id)
```
- **ตารางปลายทาง**: `users`
- **ความสัมพันธ์**: Many-to-One (Equipment → User)
- **การใช้งาน**: ระบุผู้สร้างครุภัณฑ์

#### 4. **updated_by**
```sql
updated_by UUID REFERENCES users(id)
```
- **ตารางปลายทาง**: `users`
- **ความสัมพันธ์**: Many-to-One (Equipment → User)
- **การใช้งาน**: ระบุผู้แก้ไขครุภัณฑ์ล่าสุด

#### 5. **category_id** (เพิ่มใน migration 042)
```sql
category_id UUID REFERENCES equipment_categories(id)
```
- **ตารางปลายทาง**: `equipment_categories`
- **ความสัมพันธ์**: Many-to-One (Equipment → EquipmentCategory)
- **การใช้งาน**: ระบุประเภทครุภัณฑ์

#### 6. **cpu_id** (เพิ่มใน migration 045)
```sql
cpu_id UUID REFERENCES cpu(id) ON DELETE SET NULL
```
- **ตารางปลายทาง**: `cpu`
- **ความสัมพันธ์**: Many-to-One (Equipment → CPU)
- **การใช้งาน**: ระบุ CPU ของครุภัณฑ์

#### 7. **harddisk_id** (เพิ่มใน migration 050)
```sql
harddisk_id UUID REFERENCES harddisk(id) ON DELETE SET NULL
```
- **ตารางปลายทาง**: `harddisk`
- **ความสัมพันธ์**: Many-to-One (Equipment → Harddisk)
- **การใช้งาน**: ระบุประเภทฮาร์ดดิสก์

#### 8. **os_id** (เพิ่มใน migration 050)
```sql
os_id UUID REFERENCES os(id) ON DELETE SET NULL
```
- **ตารางปลายทาง**: `os`
- **ความสัมพันธ์**: Many-to-One (Equipment → OS)
- **การใช้งาน**: ระบุระบบปฏิบัติการ

#### 9. **office_id** (เพิ่มใน migration 050)
```sql
office_id UUID REFERENCES office(id) ON DELETE SET NULL
```
- **ตารางปลายทาง**: `office`
- **ความสัมพันธ์**: Many-to-One (Equipment → Office)
- **การใช้งาน**: ระบุ Office Software

### 📊 **Indexes ที่เกี่ยวข้อง**

```sql
-- Indexes สำหรับ Foreign Keys
CREATE INDEX idx_equipment_department ON equipment(department_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_type ON equipment(type);
CREATE INDEX idx_equipment_current_user ON equipment(current_user_id);
CREATE INDEX idx_equipment_warranty_date ON equipment(warranty_date);
CREATE INDEX idx_equipment_serial_number ON equipment(serial_number);
CREATE INDEX idx_equipment_asset_number ON equipment(asset_number);

-- Indexes เพิ่มเติมจาก migrations
CREATE INDEX idx_equipment_category_id ON public.equipment(category_id);
CREATE INDEX idx_equipment_cpu_id ON public.equipment(cpu_id);
CREATE INDEX idx_equipment_harddisk_id ON public.equipment(harddisk_id);
CREATE INDEX idx_equipment_os_id ON public.equipment(os_id);
CREATE INDEX idx_equipment_office_id ON public.equipment(office_id);
```

### 🗂️ **ตารางที่เกี่ยวข้อง**

#### ตารางหลัก
1. **departments** - แผนก
2. **users** - ผู้ใช้งาน
3. **equipment_categories** - ประเภทครุภัณฑ์
4. **cpu** - CPU
5. **harddisk** - ฮาร์ดดิสก์
6. **os** - ระบบปฏิบัติการ
7. **office** - Office Software

#### ตารางรอง
1. **equipment_images** - รูปภาพครุภัณฑ์
2. **equipment_activities** - กิจกรรมครุภัณฑ์
3. **borrow_records** - บันทึกการยืม-คืน
4. **maintenance_records** - บันทึกการซ่อมบำรุง

### 🔄 **การ Join ที่ใช้ใน Application**

```sql
-- ตัวอย่างการ join ที่ใช้ใน EquipmentService
SELECT 
  *,
  equipment_categories (name),
  cpu (cpu_name),
  harddisk (hdd_type),
  os (os_name),
  office (office_name)
FROM equipment
```

### 📝 **หมายเหตุสำคัญ**

1. **ON DELETE SET NULL**: Foreign keys ใหม่ (cpu_id, harddisk_id, os_id, office_id) ใช้ `ON DELETE SET NULL` เพื่อไม่ให้ลบข้อมูลครุภัณฑ์เมื่อลบข้อมูลในตารางที่เกี่ยวข้อง

2. **Migration History**: ตาราง equipment มีการพัฒนาต่อเนื่องผ่านหลาย migration:
   - Migration 001: สร้างตารางพื้นฐาน
   - Migration 011: เพิ่ม equipment_categories
   - Migration 032: เพิ่มตาราง cpu
   - Migration 037: เพิ่มตาราง harddisk
   - Migration 038: เพิ่มตาราง os
   - Migration 040: เพิ่มตาราง office
   - Migration 042: เพิ่ม category_id
   - Migration 045: เพิ่ม cpu_id
   - Migration 050: เพิ่ม harddisk_id, os_id, office_id

3. **Data Consistency**: ควรตรวจสอบความสอดคล้องของข้อมูลระหว่างตารางที่เกี่ยวข้องเสมอ
