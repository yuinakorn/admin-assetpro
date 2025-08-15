# แก้ไขปัญหาการลบครุภัณฑ์ - Function Not Found

## 🚨 ปัญหาที่พบ

ข้อความ error: **"Could not find the function public.delete_equipment_safely(equipment_uuid) in the schema cache"**

## 🔍 สาเหตุของปัญหา

### **Database Function ไม่ได้ถูกสร้าง**

Migration `020_fix_equipment_delete_cascade.sql` ไม่ได้ถูก apply ลงฐานข้อมูลเนื่องจาก:

1. **ปัญหาการเชื่อมต่อ Supabase**: ไม่สามารถเชื่อมต่อกับ remote database ได้
2. **Authentication Error**: SASL auth failed
3. **Database Password**: อาจต้อง reset password

## 🔧 การแก้ไขที่ทำ

### **1. ปรับปรุง EquipmentService ให้ลบข้อมูลด้วยตนเอง**

แทนที่จะใช้ database function ให้ลบข้อมูลทีละตาราง:

```typescript
static async deleteEquipment(id: string): Promise<void> {
  try {
    console.log('EquipmentService: Attempting to delete equipment with ID:', id)
    
    // First, check if equipment exists
    const { data: equipment, error: checkError } = await supabase
      .from('equipment')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError || !equipment) {
      throw new Error('Equipment not found')
    }

    // Delete related data in the correct order (child tables first)
    
    // 1. Delete warranty alerts
    const { error: warrantyError } = await supabase
      .from('warranty_alerts')
      .delete()
      .eq('equipment_id', id)
    
    if (warrantyError) {
      console.warn('Warning: Could not delete warranty alerts:', warrantyError)
    }

    // 2. Delete maintenance records
    const { error: maintenanceError } = await supabase
      .from('maintenance_records')
      .delete()
      .eq('equipment_id', id)
    
    if (maintenanceError) {
      console.warn('Warning: Could not delete maintenance records:', maintenanceError)
    }

    // 3. Delete borrow records
    const { error: borrowError } = await supabase
      .from('borrow_records')
      .delete()
      .eq('equipment_id', id)
    
    if (borrowError) {
      console.warn('Warning: Could not delete borrow records:', borrowError)
    }

    // 4. Delete equipment activities
    const { error: activitiesError } = await supabase
      .from('equipment_activities')
      .delete()
      .eq('equipment_id', id)
    
    if (activitiesError) {
      console.warn('Warning: Could not delete equipment activities:', activitiesError)
    }

    // 5. Delete equipment images
    const { error: imagesError } = await supabase
      .from('equipment_images')
      .delete()
      .eq('equipment_id', id)
    
    if (imagesError) {
      console.warn('Warning: Could not delete equipment images:', imagesError)
    }

    // 6. Delete equipment history (if exists)
    const { error: historyError } = await supabase
      .from('equipment_history')
      .delete()
      .eq('equipment_id', id)
    
    if (historyError) {
      console.warn('Warning: Could not delete equipment history:', historyError)
    }

    // 7. Finally delete the equipment
    const { error: deleteError } = await supabase
      .from('equipment')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('EquipmentService: Supabase delete error:', deleteError)
      throw new Error(deleteError.message)
    }
    
    console.log('EquipmentService: Equipment deleted successfully')
  } catch (error) {
    console.error('EquipmentService: Error deleting equipment:', error)
    throw error
  }
}
```

## 🎯 ข้อดีของการแก้ไขนี้

### **✅ ไม่ต้องพึ่งพา Database Function:**
- ลบข้อมูลโดยตรงผ่าน Supabase client
- ไม่ต้องรอ migration
- ทำงานได้ทันที

### **✅ Error Handling ที่ดี:**
- ตรวจสอบการมีอยู่ของครุภัณฑ์ก่อนลบ
- แสดง warning สำหรับตารางที่ไม่สามารถลบได้
- แสดง error ที่ชัดเจน

### **✅ ลำดับการลบที่ถูกต้อง:**
- ลบ child tables ก่อน
- ลบ parent table สุดท้าย
- ป้องกัน foreign key constraint violations

### **✅ Graceful Degradation:**
- ถ้าลบตารางใดไม่ได้ จะแสดง warning แต่ไม่หยุดการทำงาน
- พยายามลบครุภัณฑ์ต่อไป

## 🧪 ขั้นตอนการทดสอบ

### **1. ทดสอบการลบครุภัณฑ์:**
1. เปิด `http://localhost:8080/equipment/list`
2. ลองลบครุภัณฑ์ที่เคยมีปัญหา
3. ตรวจสอบ console logs

### **2. ตรวจสอบ Console Logs:**
- `EquipmentService: Attempting to delete equipment with ID: [ID]`
- Warning messages สำหรับตารางที่ไม่สามารถลบได้
- `EquipmentService: Equipment deleted successfully`

### **3. ตรวจสอบ Error Messages:**
- **Equipment not found**: ครุภัณฑ์ไม่มีอยู่
- **Permission error**: ไม่มีสิทธิ์ลบ
- **Foreign key error**: ยังมีข้อมูลที่เกี่ยวข้อง

## 🔄 ทางเลือกอื่น

### **ถ้าต้องการใช้ Database Function:**

#### **1. Reset Database Password:**
```bash
# ไปที่ Supabase Dashboard
# Settings > Database > Reset Database Password
```

#### **2. Apply Migration ผ่าน SQL Editor:**
```sql
-- Copy content จาก 020_fix_equipment_delete_cascade.sql
-- ไปรันใน Supabase SQL Editor
```

#### **3. ใช้ Supabase CLI:**
```bash
# Login ใหม่
npx supabase login

# Apply migration
npx supabase db push
```

## 📝 สรุป

### **สาเหตุของปัญหา:**
- Database function ไม่ได้ถูกสร้าง
- ปัญหาการเชื่อมต่อ Supabase
- Authentication failed

### **การแก้ไข:**
1. ✅ ปรับปรุง EquipmentService ให้ลบข้อมูลด้วยตนเอง
2. ✅ ลบข้อมูลตามลำดับที่ถูกต้อง
3. ✅ เพิ่ม error handling ที่ดี
4. ✅ ไม่ต้องพึ่งพา database function

### **ผลลัพธ์:**
- สามารถลบครุภัณฑ์ได้ทันที
- ไม่ต้องรอ migration
- มี error handling ที่ครบถ้วน

**ตอนนี้การลบครุภัณฑ์ควรทำงานได้แล้ว!** 🎉

การแก้ไขนี้จะทำให้สามารถลบครุภัณฑ์ได้โดยไม่ต้องพึ่งพา database function ที่ยังไม่ได้ถูกสร้าง 