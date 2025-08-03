import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { EquipmentService } from "@/services/equipmentService"
import { EquipmentCategoryService } from "@/services/equipmentCategoryService"
import { useToast } from "@/hooks/use-toast"
import { Department, User } from "@/types/database" // Assuming these types exist

export default function EquipmentEdit() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    brand: "",
    model: "",
    serial_number: "",
    asset_number: "",
    notes: "",
    purchase_date: "",
    warranty_date: "",
    purchase_price: "",
    department_id: "",
    current_user_id: "",
    current_employee_name: "",
    status: "normal" as "normal" | "maintenance" | "damaged" | "disposed" | "borrowed",
    location: ""
  })

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [departments, setDepartments] = useState<Array<{ id: string; name: string; code: string }>>([])
  const [users, setUsers] = useState<Array<{ id: string; name: string; role: string }>>([])
  const [categories, setCategories] = useState<Array<{ id: string; name: string; code: string }>>([])

  useEffect(() => {
    if (id) {
      const loadAllData = async () => {
        try {
          setInitialLoading(true)
          const [equipmentData, departmentsData, usersData, categoriesData] = await Promise.all([
            EquipmentService.getEquipmentById(id),
            EquipmentService.getDepartmentsForEquipment(),
            EquipmentService.getUsersForEquipment(),
            EquipmentCategoryService.getCategoriesForEquipment(),
          ])

          if (!equipmentData) {
            toast({ title: "ไม่พบข้อมูล", description: "ไม่พบข้อมูลครุภัณฑ์นี้", variant: "destructive" })
            navigate("/equipment/list")
            return
          }

          setFormData({
            name: equipmentData.name || "",
            category_id: equipmentData.category_id || "",
            brand: equipmentData.brand || "",
            model: equipmentData.model || "",
            serial_number: equipmentData.serial_number || "",
            asset_number: equipmentData.asset_number || "",
            notes: equipmentData.notes || "",
            purchase_date: equipmentData.purchase_date?.split('T')[0] || "",
            warranty_date: equipmentData.warranty_date?.split('T')[0] || "",
            purchase_price: equipmentData.purchase_price?.toString() || "",
            department_id: equipmentData.department_id || "",
            current_user_id: equipmentData.current_user_id || "",
            current_employee_name: equipmentData.current_employee_name || "",
            status: equipmentData.status,
            location: equipmentData.location || ""
          })
          
          setDepartments(departmentsData)
          setUsers(usersData)
          setCategories(categoriesData)

        } catch (error) {
          console.error('Error loading data for edit page:', error)
          toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถโหลดข้อมูลได้", variant: "destructive"})
        } finally {
          setInitialLoading(false)
        }
      }
      loadAllData()
    }
  }, [id, navigate, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return;
    setLoading(true)
    
    try {
      const serialExists = await EquipmentService.checkSerialNumberExists(formData.serial_number, id)
      if (serialExists) {
        toast({ title: "เลขประจำเครื่องซ้ำ", description: "เลขประจำเครื่องนี้มีในระบบแล้ว", variant: "destructive"})
        return
      }

      await EquipmentService.updateEquipment(id, {
        name: formData.name,
        category_id: formData.category_id,
        brand: formData.brand,
        model: formData.model,
        serial_number: formData.serial_number,
        asset_number: formData.asset_number,
        notes: formData.notes,
        purchase_date: formData.purchase_date || null,
        warranty_date: formData.warranty_date || null,
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
        department_id: formData.department_id || null,
        current_user_id: formData.current_user_id || null,
        current_employee_name: formData.current_employee_name,
        status: formData.status,
        location: formData.location
      })
      
      toast({ title: "สำเร็จ", description: "อัปเดตข้อมูลครุภัณฑ์เรียบร้อยแล้ว" })
      navigate("/equipment/list")

    } catch (error) {
      console.error("Error updating equipment:", error)
      toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถอัปเดตข้อมูลได้", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">กำลังโหลดข้อมูล...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/equipment/list")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">แก้ไขข้อมูลครุภัณฑ์</h1>
            <p className="text-muted-foreground">แก้ไขข้อมูลครุภัณฑ์ในระบบ</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader><CardTitle>ข้อมูลพื้นฐาน</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">ชื่อครุภัณฑ์ *</Label>
                      <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="category_id">ประเภท *</Label>
                      <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                        <SelectTrigger><SelectValue placeholder="เลือกประเภท" /></SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="brand">ยี่ห้อ *</Label>
                      <Input id="brand" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="model">รุ่น *</Label>
                      <Input id="model" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="serial_number">เลขประจำเครื่อง *</Label>
                      <Input id="serial_number" value={formData.serial_number} onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="asset_number">เลขครุภัณฑ์</Label>
                      <Input id="asset_number" value={formData.asset_number} onChange={(e) => setFormData({ ...formData, asset_number: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="purchase_date">วันที่ซื้อ</Label>
                      <Input id="purchase_date" type="date" value={formData.purchase_date} onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="warranty_date">วันหมดประกัน</Label>
                      <Input id="warranty_date" type="date" value={formData.warranty_date} onChange={(e) => setFormData({ ...formData, warranty_date: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="purchase_price">ราคาซื้อ (บาท)</Label>
                      <Input id="purchase_price" type="number" value={formData.purchase_price} onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="location">สถานที่</Label>
                      <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">หมายเหตุ</Label>
                    <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader><CardTitle>ข้อมูลการมอบหมาย</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department_id">แผนก</Label>
                      <Select value={formData.department_id} onValueChange={(value) => setFormData({ ...formData, department_id: value })}>
                        <SelectTrigger><SelectValue placeholder="เลือกแผนก" /></SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="current_user_id">ผู้ใช้งาน</Label>
                      <Select value={formData.current_user_id} onValueChange={(value) => setFormData({ ...formData, current_user_id: value })}>
                        <SelectTrigger><SelectValue placeholder="เลือกผู้ใช้งาน" /></SelectTrigger>
                        <SelectContent>
                          {users.map((user) => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="current_employee_name">ชื่อเจ้าของเครื่องปัจจุบัน</Label>
                      <Input id="current_employee_name" value={formData.current_employee_name} onChange={(e) => setFormData({ ...formData, current_employee_name: e.target.value })} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* ... other cards ... */}
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>สถานะ</CardTitle></CardHeader>
                <CardContent>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger><SelectValue placeholder="เลือกสถานะ" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">พร้อมใช้งาน</SelectItem>
                      <SelectItem value="maintenance">อยู่ระหว่างบำรุงรักษา</SelectItem>
                      <SelectItem value="damaged">เสียหาย</SelectItem>
                      <SelectItem value="disposed">ปลดระวาง</SelectItem>
                      <SelectItem value="borrowed">ยืมออก</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    บันทึกการเปลี่ยนแปลง
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
