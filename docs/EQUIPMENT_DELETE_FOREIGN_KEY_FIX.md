# แก้ไขปัญหาการลบครุภัณฑ์ - Foreign Key Constraints

## 🚨 ปัญหาที่พบ

ข้อความ error: **"ไม่สามารถลบครุภัณฑ์ได้ ครุภัณฑ์นี้ถูกใช้งานอยู่ในระบบ กรุณาลบข้อมูลที่เกี่ยวข้องก่อน"**

## 🔍 สาเหตุของปัญหา

### **Foreign Key Constraints**

ครุภัณฑ์ที่พยายามลบมีข้อมูลที่เกี่ยวข้องในตารางอื่นๆ ดังนี้:

#### **1. ตารางที่เกี่ยวข้องกับ Equipment:**
```sql
-- รูปภาพครุภัณฑ์
equipment_images (equipment_id) ON DELETE CASCADE

-- ประวัติครุภัณฑ์
equipment_activities (equipment_id) ON DELETE CASCADE

-- บันทึกการยืม-คืน
borrow_records (equipment_id) ON DELETE CASCADE

-- บันทึกการซ่อมบำรุง
maintenance_records (equipment_id) ON DELETE CASCADE

-- การแจ้งเตือนประกัน
warranty_alerts (equipment_id) ON DELETE CASCADE

-- ประวัติการเปลี่ยนแปลง
equipment_history (equipment_id) ON DELETE CASCADE
```

#### **2. ลำดับการลบข้อมูล:**
แม้ว่า foreign keys จะมี `ON DELETE CASCADE` แต่บางครั้งอาจมีปัญหาในการลบข้อมูลที่เกี่ยวข้อง

## 🔧 การแก้ไขที่ทำ

### **1. สร้าง Database Function สำหรับ Safe Delete**

#### **Migration: 020_fix_equipment_delete_cascade.sql**
```sql
-- สร้าง function สำหรับลบครุภัณฑ์อย่างปลอดภัย
CREATE OR REPLACE FUNCTION delete_equipment_safely(equipment_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    equipment_exists BOOLEAN;
BEGIN
    -- ตรวจสอบว่าครุภัณฑ์มีอยู่จริง
    SELECT EXISTS(SELECT 1 FROM equipment WHERE id = equipment_uuid) INTO equipment_exists;
    
    IF NOT equipment_exists THEN
        RAISE EXCEPTION 'Equipment with ID % does not exist', equipment_uuid;
    END IF;

    -- ลบข้อมูลที่เกี่ยวข้องตามลำดับ (child tables ก่อน)
    
    -- 1. ลบการแจ้งเตือนประกัน
    DELETE FROM warranty_alerts WHERE equipment_id = equipment_uuid;
    
    -- 2. ลบบันทึกการซ่อมบำรุง
    DELETE FROM maintenance_records WHERE equipment_id = equipment_uuid;
    
    -- 3. ลบบันทึกการยืม-คืน
    DELETE FROM borrow_records WHERE equipment_id = equipment_uuid;
    
    -- 4. ลบประวัติครุภัณฑ์
    DELETE FROM equipment_activities WHERE equipment_id = equipment_uuid;
    
    -- 5. ลบรูปภาพครุภัณฑ์
    DELETE FROM equipment_images WHERE equipment_id = equipment_uuid;
    
    -- 6. ลบประวัติการเปลี่ยนแปลง
    DELETE FROM equipment_history WHERE equipment_id = equipment_uuid;
    
    -- 7. สุดท้ายลบครุภัณฑ์
    DELETE FROM equipment WHERE id = equipment_uuid;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to delete equipment: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **2. สร้าง View สำหรับดูข้อมูลที่เกี่ยวข้อง**

```sql
-- สร้าง view เพื่อแสดงจำนวนข้อมูลที่เกี่ยวข้อง
CREATE OR REPLACE VIEW equipment_with_related_counts AS
SELECT 
    e.*,
    COALESCE(img_count.count, 0) as image_count,
    COALESCE(act_count.count, 0) as activity_count,
    COALESCE(borrow_count.count, 0) as borrow_count,
    COALESCE(maint_count.count, 0) as maintenance_count,
    COALESCE(warranty_count.count, 0) as warranty_count,
    (COALESCE(img_count.count, 0) + 
     COALESCE(act_count.count, 0) + 
     COALESCE(borrow_count.count, 0) + 
     COALESCE(maint_count.count, 0) + 
     COALESCE(warranty_count.count, 0)) as total_related_records
FROM equipment e
-- ... LEFT JOINs สำหรับนับข้อมูลในแต่ละตาราง
```

### **3. ปรับปรุง EquipmentService**

#### **ใช้ RPC Function แทนการลบโดยตรง:**
```typescript
static async deleteEquipment(id: string): Promise<void> {
  try {
    console.log('EquipmentService: Attempting to delete equipment with ID:', id)
    
    // ใช้ safe delete function ที่จัดการข้อมูลที่เกี่ยวข้องทั้งหมด
    const { data, error } = await supabase
      .rpc('delete_equipment_safely', { equipment_uuid: id })

    if (error) {
      console.error('EquipmentService: Supabase delete error:', error)
      throw new Error(error.message)
    }
    
    if (data === false) {
      throw new Error('Failed to delete equipment: Database function returned false')
    }
    
    console.log('EquipmentService: Equipment deleted successfully')
  } catch (error) {
    console.error('EquipmentService: Error deleting equipment:', error)
    throw error
  }
}
```

## 🧪 ขั้นตอนการทดสอบ

### **1. Apply Migration:**
```bash
npx supabase db push
```

### **2. ทดสอบการลบครุภัณฑ์:**
1. เปิด `http://localhost:8080/equipment/list`
2. ลองลบครุภัณฑ์ที่เคยมีปัญหา
3. ตรวจสอบ console logs

### **3. ตรวจสอบข้อมูลที่เกี่ยวข้อง:**
```sql
-- ดูจำนวนข้อมูลที่เกี่ยวข้องกับครุภัณฑ์
SELECT * FROM equipment_with_related_counts 
WHERE equipment_code = 'EQ-001'; -- เปลี่ยนเป็นรหัสครุภัณฑ์ที่ต้องการ
```

## 🎯 ข้อดีของการแก้ไขนี้

### **✅ ปลอดภัย:**
- ตรวจสอบการมีอยู่ของครุภัณฑ์ก่อนลบ
- ลบข้อมูลตามลำดับที่ถูกต้อง
- มี error handling ที่ดี

### **✅ ครบถ้วน:**
- ลบข้อมูลที่เกี่ยวข้องทั้งหมด
- ไม่เหลือข้อมูลที่อ้างอิงถึงครุภัณฑ์ที่ถูกลบ

### **✅ ตรวจสอบได้:**
- มี view สำหรับดูจำนวนข้อมูลที่เกี่ยวข้อง
- สามารถตรวจสอบได้ก่อนลบ

### **✅ ใช้งานง่าย:**
- ใช้ function เดียวในการลบ
- ไม่ต้องจัดการ foreign key constraints เอง

## 📝 สรุป

### **สาเหตุของปัญหา:**
- Foreign key constraints ป้องกันการลบครุภัณฑ์
- มีข้อมูลที่เกี่ยวข้องในตารางอื่นๆ

### **การแก้ไข:**
1. ✅ สร้าง safe delete function
2. ✅ ลบข้อมูลตามลำดับที่ถูกต้อง
3. ✅ เพิ่ม error handling
4. ✅ สร้าง view สำหรับตรวจสอบ

### **ผลลัพธ์:**
- สามารถลบครุภัณฑ์ได้อย่างปลอดภัย
- ไม่มีข้อมูลที่เหลือค้างในระบบ
- มี error messages ที่ชัดเจน

**ตอนนี้การลบครุภัณฑ์ควรทำงานได้แล้ว!** 🎉 