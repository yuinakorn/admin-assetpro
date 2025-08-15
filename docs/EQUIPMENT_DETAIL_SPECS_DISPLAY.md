# การเพิ่มการแสดงคุณสมบัติพิเศษในหน้า Equipment Detail

## ความต้องการ
ในหน้า equipment/[id] ยังไม่ได้ดึงข้อมูลคุณสมบัติพิเศษมาแสดง ให้เพิ่มการแสดงข้อมูลเหล่านี้

## การแก้ไขที่ทำ

### 1. อัปเดต Equipment Service
ในไฟล์ `src/services/equipmentService.ts` อัปเดต `getEquipmentById` เพื่อดึงข้อมูลคุณสมบัติพิเศษ:

```typescript
async getEquipmentById(id: string): Promise<Equipment | null> {
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
    .eq('id', id)
    .single()

  if (error) {
      console.error('Error fetching equipment by ID:', error)
      throw error
  }
  return data as unknown as Equipment | null
}
```

### 2. อัปเดต Interface EquipmentDetail
ในไฟล์ `src/pages/EquipmentDetail.tsx` เพิ่มฟิลด์ใหม่ใน interface:

```typescript
interface EquipmentDetail {
  // ... existing fields
  current_employee_name?: string
  cpu_id?: string
  cpu_series?: string
  ram?: number
  storage?: string
  gpu?: string
  operating_system?: string
  product_key?: string
  ip_address?: string
  mac_address?: string
  hostname?: string
  harddisk_id?: string
  os_id?: string
  office_id?: string
  // ... existing fields
  cpu?: {
    cpu_name: string
  }
  harddisk?: {
    hdd_type: string
  }
  os?: {
    os_name: string
  }
  office?: {
    office_name: string
  }
}
```

### 3. อัปเดตการแสดงคุณสมบัติเฉพาะ
เปลี่ยนจาก "สเปคคอมพิวเตอร์" เป็น "คุณสมบัติเฉพาะ" และแสดงข้อมูลครบถ้วน:

```tsx
{/* Computer Specifications (if applicable) */}
{(equipment.cpu_id || equipment.cpu_series || equipment.ram || equipment.storage || equipment.harddisk_id || equipment.os_id || equipment.office_id) && (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Shield className="w-5 h-5" />
        คุณสมบัติเฉพาะ
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {equipment.cpu && (
          <div>
            <Label className="text-sm font-medium text-muted-foreground">CPU</Label>
            <p className="text-sm">{equipment.cpu.cpu_name}</p>
          </div>
        )}
        {equipment.cpu_series && (
          <div>
            <Label className="text-sm font-medium text-muted-foreground">CPU Series</Label>
            <p className="text-sm">{equipment.cpu_series}</p>
          </div>
        )}
        {equipment.ram && (
          <div>
            <Label className="text-sm font-medium text-muted-foreground">RAM</Label>
            <p className="text-sm">{equipment.ram} GB</p>
          </div>
        )}
        {equipment.storage && (
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Storage</Label>
            <p className="text-sm">{equipment.storage}</p>
          </div>
        )}
        {equipment.harddisk && (
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Harddisk Type</Label>
            <p className="text-sm">{equipment.harddisk.hdd_type}</p>
          </div>
        )}
        {equipment.os && (
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Operating System</Label>
            <p className="text-sm">{equipment.os.os_name}</p>
          </div>
        )}
        {equipment.office && (
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Office</Label>
            <p className="text-sm">{equipment.office.office_name}</p>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
)}
```

### 4. เพิ่มการแสดงชื่อเจ้าของเครื่อง
เพิ่มการแสดง `current_employee_name` ในส่วนการมอบหมาย:

```tsx
<Separator />
<div>
  <Label className="text-sm font-medium text-muted-foreground">ชื่อเจ้าของเครื่อง</Label>
  <p className="text-sm flex items-center gap-2">
    <User className="w-4 h-4 text-muted-foreground" />
    {equipment.current_employee_name || 'ยังไม่ได้กำหนด'}
  </p>
</div>
```

## ข้อมูลที่แสดงในคุณสมบัติเฉพาะ

### ฟิลด์ที่แสดง
1. **CPU** - ชื่อ CPU จากตาราง cpu
2. **CPU Series** - CPU Series ที่กรอก
3. **RAM** - ขนาด RAM พร้อมหน่วย GB
4. **Storage** - ขนาดพื้นที่จัดเก็บข้อมูล
5. **Harddisk Type** - ประเภท harddisk จากตาราง harddisk
6. **Operating System** - ระบบปฏิบัติการจากตาราง os
7. **Office** - โปรแกรม Office จากตาราง office

### เงื่อนไขการแสดง
การ์ด "คุณสมบัติเฉพาะ" จะแสดงเมื่อมีข้อมูลอย่างน้อยหนึ่งฟิลด์จาก:
- cpu_id
- cpu_series
- ram
- storage
- harddisk_id
- os_id
- office_id

## ผลลัพธ์
- หน้า equipment detail แสดงข้อมูลคุณสมบัติพิเศษครบถ้วน
- ข้อมูลถูกดึงจากตารางที่เกี่ยวข้อง (cpu, harddisk, os, office)
- แสดงชื่อเจ้าของเครื่องในส่วนการมอบหมาย
- UI เป็นระเบียบและอ่านง่าย

## ไฟล์ที่แก้ไข
1. `src/services/equipmentService.ts`
2. `src/pages/EquipmentDetail.tsx`

## วันที่แก้ไข
19 ธันวาคม 2024 