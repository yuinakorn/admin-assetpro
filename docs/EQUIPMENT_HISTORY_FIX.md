# การแก้ไขปัญหา Equipment History

## ปัญหาที่พบ
ในหน้า `equipment/[id]` เกิดข้อผิดพลาด "ไม่สามารถโหลดประวัติการแก้ไขได้" เนื่องจาก `EquipmentService.getEquipmentHistory` ไม่มีฟังก์ชันนี้

## สาเหตุ
1. ฟังก์ชัน `getEquipmentHistory` ไม่มีอยู่ใน `EquipmentService`
2. ฟังก์ชัน `getFieldDisplayName` และ `formatValueForDisplay` ไม่มีใน service
3. Type definitions ไม่ตรงกันระหว่าง service และ database types

## การแก้ไข

### 1. เพิ่มฟังก์ชันใน EquipmentService
```typescript
// src/services/equipmentService.ts
async getEquipmentHistory(equipmentId: string): Promise<(EquipmentHistory & { changed_by_name?: string; changed_by_role?: string })[]> {
  const { data, error } = await supabase
    .from('equipment_history')
    .select(`
      *,
      users!equipment_history_changed_by_fkey (
        first_name,
        last_name,
        role
      )
    `)
    .eq('equipment_id', equipmentId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching equipment history:', error)
    throw error
  }

  return (data || []).map(history => ({
    ...history,
    changed_by_name: history.users ? `${history.users.first_name ?? ''} ${history.users.last_name ?? ''}`.trim() : undefined,
    changed_by_role: history.users?.role
  })) as (EquipmentHistory & { changed_by_name?: string; changed_by_role?: string })[]
}
```

### 2. เพิ่มฟังก์ชันแสดงผลข้อมูล
```typescript
getFieldDisplayName(fieldName: string): string {
  const fieldMap: Record<string, string> = {
    name: 'ชื่อครุภัณฑ์',
    type: 'ประเภท',
    brand: 'ยี่ห้อ',
    model: 'รุ่น',
    serial_number: 'เลขประจำเครื่อง',
    status: 'สถานะ',
    department_id: 'แผนก',
    current_user_id: 'ผู้ใช้งาน',
    location: 'สถานที่',
    purchase_date: 'วันที่ซื้อ',
    warranty_date: 'วันหมดประกัน',
    purchase_price: 'ราคาซื้อ',
    notes: 'หมายเหตุ',
    asset_number: 'เลขครุภัณฑ์'
  }
  return fieldMap[fieldName] || fieldName
}

formatValueForDisplay(fieldName: string, value: string): string {
  // จัดการการแสดงผลข้อมูลตามประเภทฟิลด์
  // เช่น status, type, date, price
}
```

### 3. แก้ไข Type Definitions
- ใช้ `EquipmentHistory` type จาก `@/types/database`
- อัปเดต import statements
- แก้ไข state type ใน EquipmentDetail component

### 4. ไฟล์ที่แก้ไข
- `src/services/equipmentService.ts` - เพิ่มฟังก์ชันใหม่
- `src/pages/EquipmentDetail.tsx` - แก้ไข imports และ types

## ผลลัพธ์
- ฟังก์ชัน `getEquipmentHistory` ทำงานได้ปกติ
- ประวัติการแก้ไขแสดงผลได้ถูกต้อง
- ไม่มี TypeScript errors
- ข้อมูลแสดงผลเป็นภาษาไทย

## การทดสอบ
1. เข้าหน้า equipment detail
2. ตรวจสอบว่าประวัติการแก้ไขโหลดได้
3. ตรวจสอบ console ไม่มี errors
4. ตรวจสอบการแสดงผลข้อมูลเป็นภาษาไทย 