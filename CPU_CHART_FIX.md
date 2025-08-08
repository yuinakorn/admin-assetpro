# CPU Chart Fix Summary

## ปัญหาที่พบ
กราฟ CPU ใน `DepartmentEquipmentCharts` ไม่ได้ใช้ข้อมูล `cpu_name` ที่มาจากการ join ตาราง `equipment` กับตาราง `cpu` อย่างถูกต้อง

## สาเหตุของปัญหา
1. `EquipmentService.getEquipment()` ไม่มีการ join กับตาราง `cpu`
2. `CPUChart` ใช้ fallback ไปที่ `cpu_series` แทนที่จะใช้ `cpu_name` จากตาราง `cpu`

## การแก้ไข

### 1. แก้ไข EquipmentService.getEquipment()
**ก่อน:**
```typescript
async getEquipment(): Promise<EquipmentWithDetails[]> {
  const { data, error } = await supabase
    .from('equipment')
    .select(`*, equipment_categories (name)`)
    .order('created_at', { ascending: false })
  // ...
}
```

**หลัง:**
```typescript
async getEquipment(): Promise<EquipmentWithDetails[]> {
  const { data, error } = await supabase
    .from('equipment')
    .select(`
      *,
      equipment_categories (name),
      cpu (cpu_name),
      harddisk (hdd_type),
      os (os_name),
      office (office_name)
    `)
    .order('created_at', { ascending: false })
  // ...
}
```

### 2. แก้ไข CPUChart ใน DepartmentEquipmentCharts
**ก่อน:**
```typescript
const cpu = item.cpu_name || item.cpu_series || 'ไม่ระบุ'
```

**หลัง:**
```typescript
// ใช้ cpu_name จากตาราง cpu ที่ join มา
const cpu = item.cpu_name || 'ไม่ระบุ'
```

### 3. ตรวจสอบ mapEquipmentToDetails
ฟังก์ชันนี้จัดการกับ `cpu_name` อย่างถูกต้องแล้ว:
```typescript
cpu_name: (item as any).cpu?.cpu_name || item.cpu_series || 'ไม่ระบุ'
```

## ผลลัพธ์

### การปรับปรุงที่ได้
- ✅ กราฟ CPU แสดงข้อมูลจากตาราง `cpu` ที่ถูกต้อง
- ✅ ข้อมูล CPU จะสอดคล้องกับข้อมูลในฐานข้อมูล
- ✅ การ join ตารางทำงานได้อย่างถูกต้อง
- ✅ กราฟแสดงผลตาม filter ที่เลือก

### ข้อมูลที่ใช้
- **แหล่งข้อมูลหลัก**: `cpu.cpu_name` จากตาราง `cpu`
- **Fallback**: `'ไม่ระบุ'` หากไม่มีข้อมูล CPU
- **การ join**: `equipment.cpu_id` → `cpu.id`

## ไฟล์ที่แก้ไข
- `src/services/equipmentService.ts` - เพิ่มการ join กับตาราง `cpu`
- `src/components/dashboard/DepartmentEquipmentCharts.tsx` - ปรับปรุงการใช้ `cpu_name`

## การทดสอบ
หลังจากแก้ไขแล้ว:
1. กราฟ CPU จะแสดงข้อมูลจากตาราง `cpu` ที่ถูกต้อง
2. ข้อมูลจะสอดคล้องกับข้อมูลในหน้า Equipment Detail
3. การ filter จะส่งผลกระทบต่อกราฟ CPU
4. ข้อมูลจะอัปเดตแบบ real-time

## บทเรียนที่ได้
- ต้องตรวจสอบการ join ตารางให้ครบถ้วน
- ใช้ข้อมูลจากตารางที่เกี่ยวข้องแทนข้อมูล fallback
- ตรวจสอบ consistency ของข้อมูลระหว่างหน้าต่างๆ
