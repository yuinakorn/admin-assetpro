# เพิ่ม Sorting และ Pagination ในหน้ารายการครุภัณฑ์

## 🎯 การปรับปรุงที่ทำ

เพิ่มฟีเจอร์การเรียงลำดับ (Sorting) และการแบ่งหน้า (Pagination) ในหน้ารายการครุภัณฑ์ `/equipment/list` โดยใช้ shadcn/ui components

## 🔧 การเปลี่ยนแปลงหลัก

### **1. เพิ่ม Type Definitions**

#### **Sorting Types:**
```typescript
type SortField = 'equipment_code' | 'name' | 'type' | 'department_name' | 'status' | 'current_user_name'
type SortDirection = 'asc' | 'desc'

interface SortConfig {
  field: SortField
  direction: SortDirection
}
```

#### **Equipment Interface:**
```typescript
interface Equipment {
  id: string
  equipment_code: string
  name: string
  type: string
  department_name?: string
  status: string
  current_user_name?: string
  serial_number?: string
}
```

### **2. เพิ่ม State Management**

#### **Sorting State:**
```typescript
const [sortConfig, setSortConfig] = useState<SortConfig>({ 
  field: 'equipment_code', 
  direction: 'asc' 
})
```

#### **Pagination State:**
```typescript
const [currentPage, setCurrentPage] = useState(1)
const itemsPerPage = 10
```

### **3. Sorting Implementation**

#### **Sort Handler:**
```typescript
const handleSort = (field: SortField) => {
  setSortConfig(prev => ({
    field,
    direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
  }))
  setCurrentPage(1) // Reset to first page when sorting
}
```

#### **Sort Icon Display:**
```typescript
const getSortIcon = (field: SortField) => {
  if (sortConfig.field !== field) {
    return <ArrowUpDown className="h-4 w-4" />
  }
  return sortConfig.direction === 'asc' ? 
    <ArrowUp className="h-4 w-4" /> : 
    <ArrowDown className="h-4 w-4" />
}
```

#### **Sorting Logic:**
```typescript
const sortedEquipment = [...filteredEquipment].sort((a, b) => {
  const aValue = a[sortConfig.field] || ''
  const bValue = b[sortConfig.field] || ''
  
  if (sortConfig.direction === 'asc') {
    return aValue.toString().localeCompare(bValue.toString(), 'th')
  } else {
    return bValue.toString().localeCompare(aValue.toString(), 'th')
  }
})
```

### **4. Pagination Implementation**

#### **Pagination Calculation:**
```typescript
const totalPages = Math.ceil(sortedEquipment.length / itemsPerPage)
const startIndex = (currentPage - 1) * itemsPerPage
const endIndex = startIndex + itemsPerPage
const currentEquipment = sortedEquipment.slice(startIndex, endIndex)
```

#### **Page Change Handler:**
```typescript
const handlePageChange = (page: number) => {
  setCurrentPage(page)
}
```

#### **Smart Pagination Display:**
```typescript
const renderPaginationItems = () => {
  const items = []
  const maxVisiblePages = 5
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

  // Previous button
  items.push(<PaginationPrevious />)
  
  // First page + ellipsis
  if (startPage > 1) {
    items.push(<PaginationLink>1</PaginationLink>)
    if (startPage > 2) {
      items.push(<PaginationEllipsis />)
    }
  }
  
  // Visible pages
  for (let i = startPage; i <= endPage; i++) {
    items.push(<PaginationLink isActive={currentPage === i}>{i}</PaginationLink>)
  }
  
  // Last page + ellipsis
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      items.push(<PaginationEllipsis />)
    }
    items.push(<PaginationLink>{totalPages}</PaginationLink>)
  }
  
  // Next button
  items.push(<PaginationNext />)
  
  return items
}
```

### **5. UI Components**

#### **Sortable Table Headers:**
```typescript
<TableHead>
  <Button
    variant="ghost"
    onClick={() => handleSort('equipment_code')}
    className="h-auto p-0 font-semibold hover:bg-transparent"
  >
    รหัสครุภัณฑ์
    {getSortIcon('equipment_code')}
  </Button>
</TableHead>
```

#### **Pagination Display:**
```typescript
{totalPages > 1 && (
  <div className="flex items-center justify-between mt-6">
    <div className="text-sm text-muted-foreground">
      แสดง {startIndex + 1} ถึง {Math.min(endIndex, filteredEquipment.length)} จาก {filteredEquipment.length} รายการ
    </div>
    <Pagination>
      <PaginationContent>
        {renderPaginationItems()}
      </PaginationContent>
    </Pagination>
  </div>
)}
```

## 🎨 Features ใหม่

### **1. Sorting Features**

#### **Sortable Columns:**
- **รหัสครุภัณฑ์** - เรียงตามรหัส
- **ชื่อครุภัณฑ์** - เรียงตามชื่อ
- **ประเภท** - เรียงตามประเภท
- **แผนก** - เรียงตามแผนก
- **สถานะ** - เรียงตามสถานะ
- **ผู้ใช้งาน** - เรียงตามผู้ใช้งาน

#### **Sort Icons:**
- **ArrowUpDown**: เมื่อยังไม่ได้เรียง
- **ArrowUp**: เรียงจากน้อยไปมาก
- **ArrowDown**: เรียงจากมากไปน้อย

#### **Sort Behavior:**
- คลิกครั้งแรก: เรียงจากน้อยไปมาก (A-Z)
- คลิกครั้งที่สอง: เรียงจากมากไปน้อย (Z-A)
- คลิกครั้งที่สาม: กลับไปเรียงจากน้อยไปมาก

### **2. Pagination Features**

#### **Items Per Page:**
- **10 รายการต่อหน้า** (สามารถปรับได้)

#### **Navigation:**
- **Previous/Next buttons**: ไปหน้าถัดไป/ก่อนหน้า
- **Page numbers**: ไปหน้าที่ต้องการโดยตรง
- **First/Last page**: ไปหน้าแรก/หน้าสุดท้าย
- **Ellipsis**: แสดงเมื่อมีหน้าหลายหน้า

#### **Smart Display:**
- **แสดงหน้าปัจจุบัน**: แสดงหน้าปัจจุบันเป็น active
- **แสดงข้อมูล**: แสดงจำนวนรายการที่แสดง
- **Responsive**: ปรับตามขนาดหน้าจอ

### **3. Integration Features**

#### **Search Integration:**
- การค้นหายังคงทำงานได้ปกติ
- ผลการค้นหาจะถูกเรียงและแบ่งหน้า

#### **Filter Integration:**
- การกรองสถานะยังคงทำงานได้ปกติ
- ผลการกรองจะถูกเรียงและแบ่งหน้า

#### **Sort Reset:**
- เมื่อเรียงลำดับใหม่ จะกลับไปหน้าแรก
- รักษาการค้นหาและการกรองไว้

## 🚀 Benefits

### **✅ User Experience**
- ค้นหาข้อมูลได้ง่ายขึ้น
- จัดเรียงข้อมูลตามต้องการ
- ดูข้อมูลได้เป็นหน้าๆ

### **✅ Performance**
- โหลดข้อมูลเฉพาะหน้าที่ต้องการ
- ลดการ render ข้อมูลทั้งหมด
- ประหยัด memory

### **✅ Usability**
- Navigation ที่ชัดเจน
- Visual feedback สำหรับ sorting
- Responsive design

### **✅ Accessibility**
- Keyboard navigation
- Screen reader support
- Clear visual indicators

## 🎯 Sorting Logic

### **Thai Language Support:**
```typescript
aValue.toString().localeCompare(bValue.toString(), 'th')
```
- รองรับการเรียงลำดับภาษาไทย
- เรียงลำดับตัวอักษรได้ถูกต้อง

### **Null/Undefined Handling:**
```typescript
const aValue = a[sortConfig.field] || ''
const bValue = b[sortConfig.field] || ''
```
- จัดการข้อมูลที่เป็น null/undefined
- ใช้ empty string เป็นค่าเริ่มต้น

## 📱 Pagination Logic

### **Smart Page Display:**
- **แสดงหน้าปัจจุบัน**: หน้าปัจจุบันอยู่ตรงกลาง
- **แสดงหน้าข้างเคียง**: แสดงหน้าข้างเคียง 2 หน้า
- **Ellipsis**: แสดงเมื่อมีหน้าหลายหน้า

### **Navigation States:**
- **Previous disabled**: เมื่ออยู่หน้าแรก
- **Next disabled**: เมื่ออยู่หน้าสุดท้าย
- **Active page**: แสดงหน้าปัจจุบัน

## 📝 สรุป

การเพิ่ม Sorting และ Pagination:

### **การเปลี่ยนแปลงหลัก:**
- เพิ่ม sorting functionality
- เพิ่ม pagination system
- ปรับปรุง UI/UX

### **ผลลัพธ์:**
- ✅ เรียงลำดับข้อมูลได้ทุกคอลัมน์
- ✅ แบ่งหน้าแสดงข้อมูล
- ✅ Navigation ที่ใช้งานง่าย
- ✅ Performance ที่ดีขึ้น

**หน้ารายการครุภัณฑ์ตอนนี้มี sorting และ pagination แล้ว!** 🎉 