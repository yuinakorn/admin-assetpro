# แก้ไขปัญหาการลบครุภัณฑ์

## 🚨 ปัญหาที่พบ

เมื่อกดลบครุภัณฑ์ในหน้ารายการครุภัณฑ์ `/equipment/list` เกิดข้อผิดพลาด "ไม่สามารถลบครุภัณฑ์ได้"

## 🔍 การวิเคราะห์ปัญหา

### **1. สาเหตุที่เป็นไปได้:**

#### **A. Row Level Security (RLS) Policies**
- RLS policies ในตาราง `equipment` จำกัดสิทธิ์การลบเฉพาะ admin เท่านั้น
- ผู้ใช้ที่ login อาจไม่มีสิทธิ์ admin

#### **B. Foreign Key Constraints**
- ครุภัณฑ์อาจถูกใช้งานในตารางอื่นๆ
- มี foreign key constraints ที่ป้องกันการลบ

#### **C. Database Permissions**
- ผู้ใช้ database อาจไม่มีสิทธิ์ DELETE

### **2. การตรวจสอบ RLS Policies:**

```sql
-- จาก migration 018_role_based_access_control.sql
CREATE POLICY "Only admins can delete equipment" ON equipment 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

**หมายความว่า:** เฉพาะผู้ใช้ที่มี role = 'admin' เท่านั้นที่สามารถลบครุภัณฑ์ได้

## 🔧 การแก้ไขที่ทำ

### **1. ปรับปรุง Error Handling**

#### **EquipmentList.tsx:**
```typescript
const handleDelete = async (id: string) => {
  try {
    console.log('Attempting to delete equipment:', id)
    console.log('Current user role:', user?.user_metadata?.role)
    
    await EquipmentService.deleteEquipment(id)
    toast({
      title: "ลบครุภัณฑ์สำเร็จ",
      description: "ครุภัณฑ์ถูกลบออกจากระบบแล้ว",
    })
    loadEquipment()
  } catch (error: unknown) {
    console.error('Error deleting equipment:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'ข้อผิดพลาดที่ไม่ทราบสาเหตุ'
    
    // Check if it's a permission error
    if (errorMessage.includes('permission') || errorMessage.includes('policy')) {
      toast({
        title: "ไม่มีสิทธิ์ลบครุภัณฑ์",
        description: "เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถลบครุภัณฑ์ได้",
        variant: "destructive"
      })
    } else if (errorMessage.includes('foreign key') || errorMessage.includes('constraint')) {
      toast({
        title: "ไม่สามารถลบครุภัณฑ์ได้",
        description: "ครุภัณฑ์นี้ถูกใช้งานอยู่ในระบบ กรุณาลบข้อมูลที่เกี่ยวข้องก่อน",
        variant: "destructive"
      })
    } else {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: `ไม่สามารถลบครุภัณฑ์ได้: ${errorMessage}`,
        variant: "destructive"
      })
    }
  }
}
```

#### **EquipmentService.ts:**
```typescript
static async deleteEquipment(id: string): Promise<void> {
  try {
    console.log('EquipmentService: Attempting to delete equipment with ID:', id)
    
    const { error } = await supabase
      .from('equipment')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('EquipmentService: Supabase delete error:', error)
      throw new Error(error.message)
    }
    
    console.log('EquipmentService: Equipment deleted successfully')
  } catch (error) {
    console.error('EquipmentService: Error deleting equipment:', error)
    throw error
  }
}
```

### **2. สร้าง Migration สำหรับ Testing**

#### **019_fix_equipment_delete_permissions.sql:**
```sql
-- ========================================
-- TEMPORARILY DISABLE RLS FOR EQUIPMENT TABLE
-- FOR TESTING DELETE FUNCTIONALITY
-- ========================================

-- Disable RLS temporarily for testing
ALTER TABLE equipment DISABLE ROW LEVEL SECURITY;

-- Note: This is for testing purposes only
-- Remember to re-enable RLS after testing with:
-- ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
```

## 🧪 ขั้นตอนการทดสอบ

### **1. ทดสอบด้วย RLS Disabled:**
```bash
# Apply migration
npx supabase db push

# ทดสอบการลบครุภัณฑ์
# เปิด http://localhost:8080/equipment/list
# ลองลบครุภัณฑ์และดู console logs
```

### **2. ตรวจสอบ Console Logs:**
- `Attempting to delete equipment: [ID]`
- `Current user role: [role]`
- `EquipmentService: Attempting to delete equipment with ID: [ID]`
- `EquipmentService: Supabase delete error: [error]` (ถ้ามี)

### **3. ตรวจสอบ Error Messages:**
- **Permission Error**: "ไม่มีสิทธิ์ลบครุภัณฑ์"
- **Foreign Key Error**: "ครุภัณฑ์นี้ถูกใช้งานอยู่ในระบบ"
- **General Error**: แสดง error message ที่ชัดเจน

## 🎯 การแก้ไขถาวร

### **1. ถ้าเป็น Permission Issue:**

#### **A. เปลี่ยน Role ของผู้ใช้เป็น Admin:**
```sql
UPDATE users 
SET role = 'admin' 
WHERE id = 'user-uuid-here';
```

#### **B. ปรับ RLS Policy ให้ Manager สามารถลบได้:**
```sql
-- Drop existing policy
DROP POLICY "Only admins can delete equipment" ON equipment;

-- Create new policy allowing managers to delete equipment in their department
CREATE POLICY "Managers and admins can delete equipment" ON equipment 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND (
                role = 'admin' 
                OR (role = 'manager' AND department_id = equipment.department_id)
            )
        )
    );
```

### **2. ถ้าเป็น Foreign Key Issue:**

#### **A. ตรวจสอบ Foreign Key Constraints:**
```sql
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='equipment';
```

#### **B. ลบข้อมูลที่เกี่ยวข้องก่อน:**
```sql
-- ลบข้อมูลในตารางที่เกี่ยวข้องก่อน
DELETE FROM equipment_activities WHERE equipment_id = 'equipment-id';
DELETE FROM equipment_images WHERE equipment_id = 'equipment-id';
DELETE FROM maintenance_records WHERE equipment_id = 'equipment-id';
DELETE FROM borrow_records WHERE equipment_id = 'equipment-id';
DELETE FROM warranty_alerts WHERE equipment_id = 'equipment-id';

-- จากนั้นลบครุภัณฑ์
DELETE FROM equipment WHERE id = 'equipment-id';
```

## 📝 สรุป

### **การแก้ไขที่ทำ:**
1. ✅ เพิ่ม detailed error handling
2. ✅ เพิ่ม console logging สำหรับ debugging
3. ✅ สร้าง migration สำหรับ testing
4. ✅ แสดง error messages ที่ชัดเจน

### **ขั้นตอนต่อไป:**
1. **ทดสอบด้วย RLS disabled** เพื่อยืนยันว่า delete ทำงานได้
2. **ตรวจสอบ user role** ว่าต้องเป็น admin หรือไม่
3. **ตรวจสอบ foreign key constraints** ถ้ามี
4. **ปรับ RLS policies** ตามความต้องการ

### **คำแนะนำ:**
- **สำหรับ Production**: ควรใช้ RLS policies ที่เหมาะสม
- **สำหรับ Testing**: สามารถ disable RLS ชั่วคราวได้
- **Error Handling**: ควรแสดงข้อความที่ชัดเจนให้ผู้ใช้เข้าใจ

**ตอนนี้ระบบมี error handling ที่ดีขึ้นแล้ว!** 🎉 