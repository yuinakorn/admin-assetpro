# การเพิ่มฟิลด์คอมพิวเตอร์ในหน้า EquipmentAdd

## ความต้องการ
เมื่อผู้ใช้เลือกประเภทเป็น คอมพิวเตอร์, คอมพิวเตอร์ All in one, โน๊ตบุค ให้ระบบแสดงการ์ดสำหรับใส่ข้อมูลเฉพาะที่เกี่ยวกับคอมพิวเตอร์

## ฟิลด์ที่เพิ่ม

### 1. CPU (cpu_id) - Dropdown
- ดึงข้อมูลจากตาราง `cpu` ใน Supabase
- ใช้ `cpuService.getAllCPUs()`

### 2. CPU Series (cpu_series) - Text Input
- ฟิลด์ข้อความให้กรอก
- เช่น "Core i5-8250U"

### 3. RAM (ram) - Text Input
- ฟิลด์ข้อความให้กรอก
- เช่น "8"

### 4. Harddisk (harddisk_id) - Dropdown
- ดึงข้อมูลจากตาราง `harddisk` ใน Supabase
- ใช้ `harddiskService.getAllHarddisks()`

### 5. Operating System (os_id) - Dropdown
- ดึงข้อมูลจากตาราง `os` ใน Supabase
- ใช้ `osService.getAllOS()`

### 6. Office (office_id) - Dropdown
- ดึงข้อมูลจากตาราง `office` ใน Supabase
- ใช้ `officeService.getAllOffices()`

## การแก้ไข

### 1. เพิ่ม Imports
```typescript
import { harddiskService, Harddisk } from "@/services/harddiskService"
import { osService, OS } from "@/services/osService"
import { officeService, Office } from "@/services/officeService"
```

### 2. เพิ่ม State
```typescript
const [harddisks, setHarddisks] = useState<Harddisk[]>([])
const [oses, setOses] = useState<OS[]>([])
const [offices, setOffices] = useState<Office[]>([])
const [harddisksLoading, setHarddisksLoading] = useState(true)
const [osesLoading, setOsesLoading] = useState(true)
const [officesLoading, setOfficesLoading] = useState(true)
```

### 3. เพิ่มฟิลด์ใน formData
```typescript
const [formData, setFormData] = useState({
  // ... existing fields
  harddisk_id: "",
  os_id: "",
  office_id: ""
})
```

### 4. เพิ่มฟังก์ชันโหลดข้อมูล
```typescript
const loadHarddisks = useCallback(async () => {
  // โหลดข้อมูลจาก harddiskService.getAllHarddisks()
}, [toast])

const loadOses = useCallback(async () => {
  // โหลดข้อมูลจาก osService.getAllOS()
}, [toast])

const loadOffices = useCallback(async () => {
  // โหลดข้อมูลจาก officeService.getAllOffices()
}, [toast])
```

### 5. อัปเดต Equipment Interface
```typescript
// ใน src/types/database.ts
export interface Equipment {
  // ... existing fields
  harddisk_id?: string;
  os_id?: string;
  office_id?: string;
}
```

### 6. เพิ่มฟิลด์ในฟอร์ม
```typescript
{showComputerFields && (
  <Card>
    <CardHeader>
      <CardTitle>คุณสมบัติเฉพาะ</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* CPU, CPU Series, RAM fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Harddisk, OS, Office dropdowns */}
      </div>
    </CardContent>
  </Card>
)}
```

## เงื่อนไขการแสดงผล
```typescript
const selectedCategoryName = categories.find(c => c.id === formData.category_id)?.name.toLowerCase() || ''
const showComputerFields = ['computer', 'laptop', 'aio'].includes(selectedCategoryName)
```

## ไฟล์ที่แก้ไข
- `src/pages/EquipmentAdd.tsx` - เพิ่มฟิลด์และฟังก์ชันโหลดข้อมูล
- `src/types/database.ts` - อัปเดต Equipment interface

## ผลลัพธ์
- เมื่อเลือกประเภทคอมพิวเตอร์ จะแสดงการ์ด "คุณสมบัติเฉพาะ"
- มีฟิลด์ CPU (dropdown), CPU Series (text), RAM (text)
- มีฟิลด์ Harddisk, OS, Office (dropdown) ที่ดึงข้อมูลจาก Supabase
- ข้อมูลถูกบันทึกในฐานข้อมูลเมื่อสร้างครุภัณฑ์ 