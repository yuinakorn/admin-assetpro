# ระบบจำกัดสิทธิ์ตามระดับผู้ใช้งาน (Role-Based Access Control)

## 🎯 ภาพรวม

ระบบจำกัดสิทธิ์ตามระดับผู้ใช้งาน (RBAC) ถูกออกแบบมาเพื่อควบคุมการเข้าถึงและสิทธิ์ในการใช้งานระบบตามระดับของผู้ใช้งานแต่ละคน

## 👥 ระดับผู้ใช้งาน

### 1. **ผู้ใช้งาน (User)**
- **สิทธิ์**: ดูข้อมูลได้อย่างเดียว
- **ขอบเขต**: เฉพาะในแผนกของตัวเอง
- **การดำเนินการ**:
  - ✅ ดูรายการครุภัณฑ์ในแผนก
  - ✅ ดูรายการประเภทครุภัณฑ์
  - ✅ ดูรายการแผนก
  - ✅ ดูประวัติการใช้งาน
  - ❌ เพิ่ม/แก้ไข/ลบครุภัณฑ์
  - ❌ จัดการผู้ใช้งาน
  - ❌ จัดการแผนก

### 2. **ผู้จัดการ (Manager)**
- **สิทธิ์**: ดู, เพิ่ม, แก้ไข (ไม่สามารถลบได้)
- **ขอบเขต**: เฉพาะในแผนกของตัวเอง
- **การดำเนินการ**:
  - ✅ ดูรายการครุภัณฑ์ในแผนก
  - ✅ เพิ่มครุภัณฑ์ในแผนก
  - ✅ แก้ไขครุภัณฑ์ในแผนก
  - ✅ ดู/เพิ่ม/แก้ไขประเภทครุภัณฑ์
  - ✅ ดูรายการแผนก
  - ✅ ดูประวัติการใช้งาน
  - ❌ ลบครุภัณฑ์
  - ❌ จัดการผู้ใช้งาน
  - ❌ จัดการแผนก

### 3. **ผู้ดูแลระบบ (Admin)**
- **สิทธิ์**: ทำได้ทุกอย่าง
- **ขอบเขต**: ทุกแผนก
- **การดำเนินการ**:
  - ✅ ดู/เพิ่ม/แก้ไข/ลบครุภัณฑ์ทุกแผนก
  - ✅ จัดการผู้ใช้งานทั้งหมด
  - ✅ จัดการแผนกทั้งหมด
  - ✅ จัดการประเภทครุภัณฑ์
  - ✅ ดูประวัติการใช้งานทั้งหมด

## 🔐 การป้องกันในระดับฐานข้อมูล (RLS Policies)

### **Users Table**
```sql
-- Users can view their own data
CREATE POLICY "Users can view their own data" ON users 
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update their own data" ON users 
    FOR UPDATE USING (auth.uid() = id);

-- Admins can manage all users
CREATE POLICY "Admins can manage all users" ON users 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

### **Equipment Table**
```sql
-- Users can view equipment in their department
CREATE POLICY "Users can view equipment in their department" ON equipment 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR department_id = equipment.department_id)
        )
    );

-- Managers can insert equipment in their department
CREATE POLICY "Managers can insert equipment in their department" ON equipment 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'manager' 
            AND department_id = equipment.department_id
        )
        OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can delete equipment
CREATE POLICY "Only admins can delete equipment" ON equipment 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

### **Departments Table**
```sql
-- Anyone can view departments
CREATE POLICY "Anyone can view departments" ON departments 
    FOR SELECT USING (true);

-- Only admins can manage departments
CREATE POLICY "Only admins can manage departments" ON departments 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

## 🎨 การแสดงผลใน UI

### **Sidebar Menu**
```typescript
const menuItems = [
  {
    label: "แดชบอร์ด",
    show: true // All users can see dashboard
  },
  {
    label: "ครุภัณฑ์",
    show: permissions.canViewEquipment,
    children: [
      { label: "รายการครุภัณฑ์", url: "/equipment/list" },
      { label: "เพิ่มครุภัณฑ์", url: "/equipment/add", show: permissions.canAddEquipment }
    ]
  },
  {
    label: "ผู้ใช้งาน",
    show: permissions.canViewUsers,
    children: [
      { label: "รายการผู้ใช้", url: "/users" },
      { label: "เพิ่มผู้ใช้", url: "/users/add", show: permissions.canAddUsers }
    ]
  }
]
```

### **Action Buttons**
```typescript
// Equipment List
{permissions.canAddEquipment && (
  <Button onClick={() => navigate("/equipment/add")}>
    <Plus className="w-4 h-4 mr-2" />
    เพิ่มครุภัณฑ์
  </Button>
)}

{permissions.canEditEquipment && (
  <Button variant="ghost" size="sm">
    <Edit className="w-4 h-4" />
  </Button>
)}

{permissions.canDeleteEquipment && (
  <Button variant="ghost" size="sm">
    <Trash2 className="w-4 h-4" />
  </Button>
)}
```

## 🛠️ การใช้งาน

### **usePermissions Hook**
```typescript
import { usePermissions } from "@/hooks/usePermissions"

export function MyComponent() {
  const permissions = usePermissions()
  
  return (
    <div>
      {permissions.canAddEquipment && (
        <Button>เพิ่มครุภัณฑ์</Button>
      )}
      
      {permissions.isAdmin && (
        <Button>จัดการผู้ใช้</Button>
      )}
    </div>
  )
}
```

### **Helper Functions**
```typescript
// Check specific permissions
const canManageEquipment = useCanManageEquipment()
const canManageDepartments = useCanManageDepartments()
const canManageUsers = useCanManageUsers()
const canManageCategories = useCanManageCategories()
```

## 🔄 Flow การทำงาน

### **1. การตรวจสอบสิทธิ์**
1. ผู้ใช้ login เข้าระบบ
2. ระบบดึงข้อมูล role จาก user metadata
3. usePermissions hook สร้าง permissions object
4. UI แสดง/ซ่อน elements ตาม permissions

### **2. การป้องกันในระดับฐานข้อมูล**
1. ผู้ใช้พยายามเข้าถึงข้อมูล
2. RLS policies ตรวจสอบสิทธิ์
3. หากไม่มีสิทธิ์ จะได้รับ error
4. หากมีสิทธิ์ จะได้รับข้อมูลตามขอบเขต

### **3. การจัดการข้อมูล**
1. ผู้ใช้พยายามเพิ่ม/แก้ไข/ลบข้อมูล
2. Frontend ตรวจสอบ permissions ก่อนแสดงปุ่ม
3. Backend ตรวจสอบ RLS policies
4. หากผ่านทั้งสองขั้นตอน จะดำเนินการได้

## 🧪 การทดสอบ

### **ทดสอบ User Role**
1. Login ด้วย user role
2. ตรวจสอบว่า:
   - เห็นเฉพาะเมนูที่อนุญาต
   - ไม่เห็นปุ่มเพิ่ม/แก้ไข/ลบ
   - เห็นเฉพาะข้อมูลในแผนกของตัวเอง

### **ทดสอบ Manager Role**
1. Login ด้วย manager role
2. ตรวจสอบว่า:
   - เห็นปุ่มเพิ่ม/แก้ไขครุภัณฑ์
   - ไม่เห็นปุ่มลบครุภัณฑ์
   - เห็นเฉพาะข้อมูลในแผนกของตัวเอง

### **ทดสอบ Admin Role**
1. Login ด้วย admin role
2. ตรวจสอบว่า:
   - เห็นทุกเมนูและปุ่ม
   - สามารถจัดการข้อมูลทุกแผนก
   - สามารถลบข้อมูลได้

## 🔒 ความปลอดภัย

### **การป้องกันหลายชั้น**
1. **Frontend**: ซ่อน UI elements ตาม permissions
2. **Backend**: RLS policies ป้องกันการเข้าถึงข้อมูล
3. **API**: ตรวจสอบสิทธิ์ก่อนดำเนินการ
4. **Database**: Constraints และ triggers

### **การตรวจสอบสิทธิ์**
- ตรวจสอบ role ของผู้ใช้
- ตรวจสอบ department ของผู้ใช้
- ตรวจสอบ ownership ของข้อมูล
- ตรวจสอบ action ที่ต้องการทำ

## 🚀 สรุป

ระบบ RBAC นี้ให้:

### **✅ ความปลอดภัย**
- ป้องกันการเข้าถึงข้อมูลโดยไม่ได้รับอนุญาต
- จำกัดการดำเนินการตามระดับสิทธิ์
- ตรวจสอบสิทธิ์หลายชั้น

### **✅ ความยืดหยุ่น**
- ปรับแต่งสิทธิ์ได้ง่าย
- เพิ่มระดับผู้ใช้ใหม่ได้
- กำหนดสิทธิ์เฉพาะได้

### **✅ ความสะดวก**
- UI ปรับเปลี่ยนตามสิทธิ์อัตโนมัติ
- ไม่ต้องจำสิทธิ์ต่างๆ
- ใช้งานง่าย

### **✅ การบำรุงรักษา**
- โค้ดเป็นระเบียบ
- ง่ายต่อการแก้ไข
- มีเอกสารครบถ้วน

ระบบพร้อมใช้งานแล้ว! 🎉