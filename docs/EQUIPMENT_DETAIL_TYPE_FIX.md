# การแก้ไขปัญหา Equipment Detail Type

## ปัญหาที่พบ
ในหน้า equipment/[id] ตรงช่อง "ประเภท" ไม่แสดงข้อมูล

## สาเหตุ
1. ฐานข้อมูลได้เปลี่ยนจาก `type` enum เป็น `category_id` ที่เชื่อมโยงกับตาราง `equipment_categories`
2. หน้า EquipmentDetail ยังใช้ `equipment.type` แทนที่จะเป็น `equipment.equipment_categories.name`
3. Interface `EquipmentDetail` ยังใช้ `type: string` แทนที่จะเป็น `category_id` และ `equipment_categories`

## การแก้ไข

### 1. แก้ไข Interface EquipmentDetail
```typescript
// เปลี่ยนจาก
interface EquipmentDetail {
  type: string
  // ... other fields
}

// เป็น
interface EquipmentDetail {
  category_id?: string
  equipment_categories?: {
    name: string
  }
  // ... other fields
}
```

### 2. แก้ไขการแสดงผลประเภท
```typescript
// เปลี่ยนจาก
<p className="text-sm">{getTypeText(equipment.type)}</p>

// เป็น
<p className="text-sm">{equipment.equipment_categories?.name || '-'}</p>
```

### 3. ลบฟังก์ชัน getTypeText ที่ไม่ใช้แล้ว
```typescript
// ลบฟังก์ชันนี้เพราะไม่ใช้แล้ว
const getTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    computer: "คอมพิวเตอร์",
    laptop: "โน้ตบุ๊ค",
    monitor: "จอภาพ",
    printer: "เครื่องพิมพ์",
    ups: "UPS",
    network_device: "อุปกรณ์เครือข่าย"
  }
  return typeMap[type] || type
}
```

## ไฟล์ที่แก้ไข
- `src/pages/EquipmentDetail.tsx` - แก้ไข interface และการแสดงผลประเภท

## ผลลัพธ์
- ช่อง "ประเภท" แสดงข้อมูลได้ถูกต้อง
- ข้อมูลมาจากตาราง `equipment_categories` ตามโครงสร้างฐานข้อมูลใหม่
- ไม่มี TypeScript errors

## การทดสอบ
1. เข้าหน้า equipment detail
2. ตรวจสอบว่าช่อง "ประเภท" แสดงข้อมูล
3. ตรวจสอบ console ไม่มี errors 