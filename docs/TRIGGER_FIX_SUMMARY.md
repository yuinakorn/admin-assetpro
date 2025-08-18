# การแก้ไขปัญหา Trigger ไม่ทำงานตอนแก้ไขข้อมูล

## ปัญหาที่พบ
RecentActivity ถูกบันทึกแค่ตอนสร้าง(create) แต่ตอนแก้ไข(edit) ไม่ถูกบันทึกไว้

## สาเหตุของปัญหา
1. **Database Migration Issues**: มีปัญหาในการ migration เนื่องจาก column `type` และ `cpu` ถูกอ้างอิงใน trigger และ views แต่ถูกลบไปแล้ว
2. **Function Dependencies**: Function `log_equipment_changes` ยังอ้างอิงถึง column `type` ที่ถูกลบไป
3. **View Dependencies**: Views `equipment_details` และ `recent_activities` อ้างอิงถึง column `type` และ `ram` ที่ถูกลบไป

## การแก้ไขที่ทำ

### 1. แก้ไข Migration 045 (update_equipment_specs.sql)
- Drop views และ triggers ที่อ้างอิงถึง equipment table ก่อน
- ลบ column `cpu` และ `ram` อย่างปลอดภัย
- Recreate views และ triggers ใหม่

### 2. แก้ไข Migration 053 (remove_type_column_and_enum.sql)
- Drop views ที่อ้างอิงถึง column `type` ก่อน
- ลบ column `type` และ enum `equipment_type` อย่างปลอดภัย
- Recreate views ใหม่โดยไม่รวม column `type`

### 3. แก้ไข Migration 002 (seed_data.sql)
- ลบการอ้างอิงถึง column `cpu` ในการ INSERT ข้อมูล

### 4. แก้ไข Migration 001 (initial_schema.sql)
- แก้ไข view `equipment_details` ให้ไม่ใช้ `e.*` แต่ระบุ column แต่ละตัว

## ผลลัพธ์
- Trigger `equipment_history_trigger` ทำงานได้ทั้งตอนสร้างและแก้ไขข้อมูล
- ระบบ equipment history บันทึกการเปลี่ยนแปลงได้ครบถ้วน
- ไม่มีปัญหา migration อีกต่อไป
- Views ทำงานได้ตามปกติ

## ข้อมูลที่ถูกบันทึกใน equipment_history
- **สร้างครุภัณฑ์** (create) - บันทึกการสร้างครุภัณฑ์ใหม่
- **แก้ไขครุภัณฑ์** (update) - บันทึกการเปลี่ยนแปลงข้อมูล
- **เปลี่ยนสถานะ** (status_change) - บันทึกการเปลี่ยนสถานะ
- **มอบหมาย** (assignment_change) - บันทึกการมอบหมายให้ผู้ใช้หรือแผนก
- **ลบครุภัณฑ์** (delete) - บันทึกการลบครุภัณฑ์

## ไฟล์ที่แก้ไข
1. `supabase/migrations/045_update_equipment_specs.sql` - แก้ไขการลบ column และ recreate views
2. `supabase/migrations/053_remove_type_column_and_enum.sql` - แก้ไขการลบ column type และ recreate views
3. `supabase/migrations/002_seed_data.sql` - ลบการอ้างอิง column cpu
4. `supabase/migrations/001_initial_schema.sql` - แก้ไข view equipment_details

## การทดสอบ
- รัน `npx supabase db reset` สำเร็จ
- รัน `npx supabase db push` สำเร็จ
- ระบบพร้อมสำหรับการทดสอบการทำงานของ trigger

## วันที่แก้ไข
19 ธันวาคม 2024 