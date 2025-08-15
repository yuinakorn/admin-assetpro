# การเพิ่มฟิลด์ Storage สำหรับ Harddisk

## ความต้องการ
เพิ่มฟิลด์ harddisk storage ให้กรอกเป็น text หน่วยเป็น GB และบันทึกในฟิลด์ storage ของตาราง equipment

## การแก้ไขที่ทำ

### 1. เพิ่มฟิลด์ storage ใน formData
ในไฟล์ `src/pages/EquipmentAdd.tsx` เพิ่ม `storage: ""` ใน formData state:

```typescript
const [formData, setFormData] = useState({
  // ... existing fields
  cpu_id: "",
  cpu_series: "",
  ram: "",
  storage: "", // เพิ่มฟิลด์ใหม่
  harddisk_id: "",
  os_id: "",
  office_id: ""
})
```

### 2. เพิ่มการส่งข้อมูล storage
ในส่วน `handleSubmit` เพิ่มการส่งข้อมูล storage:

```typescript
if (showComputerFields) {
  equipmentData.cpu_id = formData.cpu_id || null
  equipmentData.cpu_series = formData.cpu_series || null
  equipmentData.ram = formData.ram ? parseInt(formData.ram, 10) : null
  equipmentData.storage = formData.storage || null // เพิ่มการส่งข้อมูล
  equipmentData.harddisk_id = formData.harddisk_id || null
  equipmentData.os_id = formData.os_id || null
  equipmentData.office_id = formData.office_id || null
}
```

### 3. เพิ่มฟิลด์ storage ใน UI
เพิ่ม Input field สำหรับ storage ในส่วน "คุณสมบัติเฉพาะ":

```tsx
<div>
  <Label htmlFor="storage">Storage (GB)</Label>
  <Input
    id="storage"
    type="text"
    placeholder="เช่น 256, 512, 1TB"
    value={formData.storage}
    onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
  />
</div>
```

### 4. ปรับปรุง Label ของ Harddisk Type
เปลี่ยน label จาก "Harddisk" เป็น "Harddisk Type" เพื่อให้ชัดเจนขึ้น:

```tsx
<div>
  <Label htmlFor="harddisk">Harddisk Type</Label>
  <Select
    value={formData.harddisk_id}
    onValueChange={(value) => setFormData({ ...formData, harddisk_id: value })}
    disabled={harddisksLoading}
  >
    // ... existing select content
  </Select>
</div>
```

## โครงสร้างข้อมูล

### Database Schema
ฟิลด์ `storage` มีอยู่แล้วในตาราง `equipment`:
```sql
storage VARCHAR(100),
```

### TypeScript Types
ฟิลด์ `storage` มีอยู่แล้วใน interface `Equipment`:
```typescript
storage?: string;
```

## ผลลัพธ์
- ผู้ใช้สามารถกรอกข้อมูล storage เป็น text ได้ (เช่น "256", "512", "1TB")
- ข้อมูลจะถูกบันทึกในฟิลด์ `storage` ของตาราง `equipment`
- ฟิลด์จะแสดงเฉพาะเมื่อเลือกประเภทครุภัณฑ์ที่เป็นคอมพิวเตอร์ (คอมพิวเตอร์, โน้ตบุ๊ค)
- มีการแยกความแตกต่างระหว่าง:
  - **Storage**: ขนาดพื้นที่จัดเก็บข้อมูล (กรอกเป็น text)
  - **Harddisk Type**: ประเภทของ harddisk (เลือกจาก dropdown)

## ไฟล์ที่แก้ไข
- `src/pages/EquipmentAdd.tsx`

## วันที่แก้ไข
19 ธันวาคม 2024 