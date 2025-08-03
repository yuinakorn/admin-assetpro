# การแก้ไขปัญหา Equipment List Type

## ปัญหาที่พบ
ในหน้า equipment/list ตรงช่อง "ประเภท" ไม่แสดงผล

## สาเหตุ
1. ฐานข้อมูลได้เปลี่ยนจาก `type` enum เป็น `category_id` ที่เชื่อมโยงกับตาราง `equipment_categories`
2. หน้า EquipmentList ยังใช้ `item.type` แทนที่จะเป็น `item.category_name`
3. Interface `Equipment` ยังใช้ `type: string` แทนที่จะเป็น `category_name`
4. SortField type ยังใช้ `'type'` แทนที่จะเป็น `'category_name'`

## การแก้ไข

### 1. แก้ไข Interface Equipment
```typescript
// เปลี่ยนจาก
interface Equipment {
  type: string
  // ... other fields
}

// เป็น
interface Equipment {
  category_name?: string
  // ... other fields
}
```

### 2. แก้ไข SortField Type
```typescript
// เปลี่ยนจาก
type SortField = 'equipment_code' | 'name' | 'type' | 'department_name' | 'status' | 'current_user_name'

// เป็น
type SortField = 'equipment_code' | 'name' | 'category_name' | 'department_name' | 'status' | 'current_user_name'
```

### 3. แก้ไขการแสดงผลประเภทในตาราง
```typescript
// เปลี่ยนจาก
<TableCell>{item.type}</TableCell>

// เป็น
<TableCell>{item.category_name || '-'}</TableCell>
```

### 4. แก้ไขการ sorting ประเภท
```typescript
// เปลี่ยนจาก
onClick={() => handleSort('type')}
{getSortIcon('type')}

// เป็น
onClick={() => handleSort('category_name')}
{getSortIcon('category_name')}
```

## ไฟล์ที่แก้ไข
- `src/pages/EquipmentList.tsx` - แก้ไข interface, type และการแสดงผลประเภท

## ผลลัพธ์
- ช่อง "ประเภท" แสดงข้อมูลได้ถูกต้อง
- การ sorting ตามประเภททำงานได้
- ข้อมูลมาจาก `category_name` ตามโครงสร้างฐานข้อมูลใหม่
- ไม่มี TypeScript errors

## การทดสอบ
1. เข้าหน้า equipment list
2. ตรวจสอบว่าช่อง "ประเภท" แสดงข้อมูล
3. ทดสอบการ sorting ตามประเภท
4. ตรวจสอบ console ไม่มี errors 