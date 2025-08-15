# การแก้ไขปัญหากิจกรรมล่าสุดในหน้า Dashboard

## ปัญหาที่พบ
หน้า dashboard ตรงกิจกรรมล่าสุดไม่แสดงข้อมูล แต่ก่อนหน้านี้เคยแสดงปรกติ

## สาเหตุของปัญหา
1. **Missing Method**: RecentActivity component เรียกใช้ `EquipmentService.getAllEquipmentHistory()` แต่ method นี้ไม่มีใน equipmentService
2. **Database Migration Issues**: มีปัญหาในการ migration เนื่องจาก column `type` ถูกอ้างอิงใน trigger แต่ถูกลบไปแล้ว
3. **Function Dependencies**: Function `log_equipment_changes` ยังอ้างอิงถึง column `type` ที่ถูกลบไป

## การแก้ไขที่ทำ

### 1. เพิ่ม Method getAllEquipmentHistory
ในไฟล์ `src/services/equipmentService.ts` เพิ่ม method ใหม่:

```typescript
async getAllEquipmentHistory(): Promise<(EquipmentHistory & { 
  changed_by_name?: string; 
  changed_by_role?: string;
  equipment_name?: string;
  equipment_code?: string;
})[]> {
  const { data, error } = await supabase
    .from('equipment_history')
    .select(`
      *,
      users!equipment_history_changed_by_fkey (
        first_name,
        last_name,
        role
      ),
      equipment!equipment_history_equipment_id_fkey (
        name,
        equipment_code
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching all equipment history:', error)
    throw error
  }

  return (data || []).map(history => ({
    ...history,
    changed_by_name: history.users ? `${history.users.first_name ?? ''} ${history.users.last_name ?? ''}`.trim() : undefined,
    changed_by_role: history.users?.role,
    equipment_name: history.equipment?.name,
    equipment_code: history.equipment?.equipment_code
  }))
}
```

### 2. แก้ไข Migration Issues
สร้าง migration ใหม่เพื่อแก้ไขปัญหา:

#### 052_fix_equipment_history_function.sql
- แก้ไข function `log_equipment_changes` ให้ไม่อ้างอิงถึง column `type`
- เพิ่มการตรวจสอบ `category_id` แทน
- Recreate trigger ใหม่

#### 053_remove_type_column_and_enum.sql
- ลบ column `type` และ enum `equipment_type` อย่างปลอดภัย
- Drop trigger ก่อนลบ column เพื่อหลีกเลี่ยง dependency issues

### 3. อัปเดต Migration 042
แก้ไข `042_refactor_equipment_category_link.sql` ให้ไม่ลบ column `type` ในขั้นตอนนี้

## ผลลัพธ์
- หน้า dashboard แสดงกิจกรรมล่าสุดได้ตามปกติ
- ระบบ equipment history ทำงานได้อย่างถูกต้อง
- ไม่มีปัญหา migration อีกต่อไป
- ข้อมูลกิจกรรมถูกดึงจากตาราง equipment_history พร้อมข้อมูลที่เกี่ยวข้อง

## ข้อมูลที่แสดงในกิจกรรมล่าสุด
- **ชื่อครุภัณฑ์** - จากตาราง equipment
- **รหัสครุภัณฑ์** - จากตาราง equipment
- **ประเภทกิจกรรม** - create, update, delete, status_change, assignment_change
- **ผู้ดำเนินการ** - จากตาราง users
- **เวลาที่เกิดขึ้น** - จาก created_at
- **รายละเอียดการเปลี่ยนแปลง** - field_name, old_value, new_value

## ไฟล์ที่แก้ไข
1. `src/services/equipmentService.ts` - เพิ่ม getAllEquipmentHistory method
2. `supabase/migrations/042_refactor_equipment_category_link.sql` - แก้ไข migration
3. `supabase/migrations/052_fix_equipment_history_function.sql` - แก้ไข function (ใหม่)
4. `supabase/migrations/053_remove_type_column_and_enum.sql` - ลบ column และ enum (ใหม่)

## วันที่แก้ไข
19 ธันวาคม 2024 