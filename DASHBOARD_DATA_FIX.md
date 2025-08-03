# การแก้ไขปัญหา Dashboard Data

## ปัญหาที่พบ
หน้า Dashboard ไม่ได้ดึงข้อมูลจาก Supabase มาแสดงอย่างถูกต้อง

## สาเหตุ
1. ฐานข้อมูลได้เปลี่ยนจาก `type` enum เป็น `category_id` ที่เชื่อมโยงกับตาราง `equipment_categories`
2. DashboardService ยังใช้ `equipment.type` แทนที่จะเป็น `equipment.category_id`
3. TypeScript types ไม่ตรงกับโครงสร้างฐานข้อมูลใหม่

## การแก้ไข

### 1. แก้ไขฟังก์ชัน `getDashboardStats()`
```typescript
// เปลี่ยนจาก
.select('status, warranty_date, type')

// เป็น
.select('status, warranty_date, category_id')
```

### 2. แก้ไขการนับประเภทครุภัณฑ์
```typescript
// เปลี่ยนจาก
const uniqueTypes = new Set(equipment.map(item => item.type))

// เป็น
const uniqueCategories = new Set(equipment.map((item: any) => item.category_id).filter(Boolean))
```

### 3. แก้ไขฟังก์ชัน `getEquipmentByType()`
```typescript
// เปลี่ยนจาก
.select('type')

// เป็น
.select(`
  category_id,
  equipment_categories(name, code)
`)
```

### 4. อัปเดตการประมวลผลข้อมูล
```typescript
// เปลี่ยนจากการใช้ type enum เป็นการใช้ category data
const categoryCounts: Record<string, { name: string; code: string; count: number }> = {}
data.forEach((item: any) => {
  if (item.equipment_categories) {
    const categoryKey = item.equipment_categories.name
    if (!categoryCounts[categoryKey]) {
      categoryCounts[categoryKey] = {
        name: item.equipment_categories.name,
        code: item.equipment_categories.code,
        count: 0
      }
    }
    categoryCounts[categoryKey].count++
  }
})
```

## ไฟล์ที่แก้ไข
- `src/services/dashboardService.ts` - แก้ไขฟังก์ชันดึงข้อมูล Dashboard

## ผลลัพธ์
- Dashboard แสดงข้อมูลครุภัณฑ์ได้ถูกต้อง
- การนับประเภทครุภัณฑ์ทำงานได้ตามโครงสร้างฐานข้อมูลใหม่
- Charts แสดงข้อมูลตาม category ที่ถูกต้อง
- ไม่มี TypeScript errors

## การทดสอบ
1. เข้าหน้า Dashboard
2. ตรวจสอบว่าสถิติแสดงผลถูกต้อง
3. ตรวจสอบ Charts แสดงข้อมูลตาม category
4. ตรวจสอบ console ไม่มี errors 