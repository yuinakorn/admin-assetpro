import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Plus, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { EquipmentService } from "@/services/equipmentService"
import { EquipmentCategoryService } from "@/services/equipmentCategoryService"
import { ImageUpload } from "@/components/ui/image-upload"
import { useToast } from "@/hooks/use-toast"

export default function EquipmentAdd() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    type: "computer" as "computer" | "laptop" | "monitor" | "printer" | "ups" | "network_device",
    brand: "",
    model: "",
    serial_number: "",
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
  const [departments, setDepartments] = useState<Array<{ id: string; name: string; code: string }>>([])
  const [users, setUsers] = useState<Array<{ id: string; name: string; role: string }>>([])
  const [categories, setCategories] = useState<Array<{ id: string; name: string; code: string }>>([])
  const [departmentsLoading, setDepartmentsLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [createdEquipmentId, setCreatedEquipmentId] = useState<string | null>(null)

  // Load departments, users, and categories on component mount
  useEffect(() => {
    loadDepartments()
    loadUsers()
    loadCategories()
  }, [])

  const loadDepartments = async () => {
    try {
      setDepartmentsLoading(true)
      const data = await EquipmentService.getDepartmentsForEquipment()
      setDepartments(data)
    } catch (error) {
      console.error('Error loading departments:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดรายชื่อแผนกได้",
        variant: "destructive"
      })
    } finally {
      setDepartmentsLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      setUsersLoading(true)
      const data = await EquipmentService.getUsersForEquipment()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดรายชื่อผู้ใช้งานได้",
        variant: "destructive"
      })
    } finally {
      setUsersLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true)
      console.log('Loading categories...')
      const data = await EquipmentCategoryService.getCategoriesForEquipment()
      console.log('Categories loaded:', data)
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดประเภทครุภัณฑ์ได้",
        variant: "destructive"
      })
    } finally {
      setCategoriesLoading(false)
    }
  }

  // Helper function to map category code to equipment type
  const mapCategoryCodeToType = (code: string): "computer" | "laptop" | "monitor" | "printer" | "ups" | "network_device" => {
    const codeMap: Record<string, "computer" | "laptop" | "monitor" | "printer" | "ups" | "network_device"> = {
      'COMPUTER': 'computer',
      'LAPTOP': 'laptop',
      'MONITOR': 'monitor',
      'PRINTER': 'printer',
      'UPS': 'ups',
      'NETWORK': 'network_device'
    }
    return codeMap[code] || 'computer'
  }

  // Show loading state while initial data is loading
  if (departmentsLoading || usersLoading || categoriesLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate("/equipment/list")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">เพิ่มครุภัณฑ์ใหม่</h1>
                <p className="text-muted-foreground">
                  เพิ่มครุภัณฑ์ใหม่เข้าสู่ระบบ
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>กำลังโหลดข้อมูล...</span>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Validate required fields
      if (!formData.name.trim() || !formData.brand.trim() || !formData.model.trim() || !formData.serial_number.trim()) {
        toast({
          title: "ข้อมูลไม่ครบถ้วน",
          description: "กรุณากรอกข้อมูลที่จำเป็นให้ครบ",
          variant: "destructive"
        })
        return
      }

      // Check if serial number exists
      const serialExists = await EquipmentService.checkSerialNumberExists(formData.serial_number)
      if (serialExists) {
        toast({
          title: "เลขประจำเครื่องซ้ำ",
          description: "เลขประจำเครื่องนี้มีในระบบแล้ว กรุณาตรวจสอบ",
          variant: "destructive"
        })
        return
      }

      // Create equipment data
      const equipmentData = {
        name: formData.name,
        type: formData.type,
        brand: formData.brand,
        model: formData.model,
        serial_number: formData.serial_number,
        notes: formData.notes,
        purchase_date: formData.purchase_date || null,
        warranty_date: formData.warranty_date || null,
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
        department_id: formData.department_id || null,
        current_user_id: formData.current_user_id || null,
        current_employee_name: formData.current_employee_name || null,
        status: formData.status,
        location: formData.location
      }

      const createdEquipment = await EquipmentService.createEquipment(equipmentData)
      
      // Set the created equipment ID for image upload
      setCreatedEquipmentId(createdEquipment.id)
      
      toast({
        title: "เพิ่มครุภัณฑ์สำเร็จ",
        description: "เพิ่มครุภัณฑ์ใหม่เรียบร้อยแล้ว คุณสามารถอัพโหลดรูปภาพได้",
      })
      
      // Don't navigate immediately, let user upload images first
      // navigate("/equipment/list")
    } catch (error) {
      console.error('Error creating equipment:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มครุภัณฑ์ได้",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/equipment/list")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">เพิ่มครุภัณฑ์ใหม่</h1>
              <p className="text-muted-foreground">
                เพิ่มครุภัณฑ์ใหม่เข้าสู่ระบบ
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">ชื่อครุภัณฑ์ *</Label>
                      <Input 
                        id="name" 
                        placeholder="ชื่อครุภัณฑ์"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">ประเภท *</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value: "computer" | "laptop" | "monitor" | "printer" | "ups" | "network_device") => setFormData({ ...formData, type: value })}
                        disabled={categoriesLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={categoriesLoading ? "กำลังโหลด..." : "เลือกประเภท"} />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriesLoading ? (
                            <div className="flex items-center justify-center gap-2 py-2 px-3">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm text-muted-foreground">กำลังโหลด...</span>
                            </div>
                          ) : categories.length === 0 ? (
                            <div className="flex items-center justify-center py-2 px-3">
                              <span className="text-sm text-muted-foreground">ไม่พบประเภทครุภัณฑ์</span>
                            </div>
                          ) : (
                            categories.map((category) => (
                              <SelectItem 
                                key={category.id} 
                                value={mapCategoryCodeToType(category.code)}
                              >
                                {category.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="brand">ยี่ห้อ *</Label>
                      <Input 
                        id="brand" 
                        placeholder="ยี่ห้อ"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="model">รุ่น *</Label>
                      <Input 
                        id="model" 
                        placeholder="รุ่น"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="serial_number">เลขครุภัณฑ์</Label>
                      <Input 
                        id="serial_number" 
                        placeholder="เลขครุภัณฑ์ประจำเครื่อง"
                        value={formData.serial_number}
                        onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">สถานที่ตั้ง</Label>
                      <Input 
                        id="location" 
                        placeholder="สถานที่ตั้ง"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">หมายเหตุ</Label>
                    <Textarea 
                      id="notes" 
                      placeholder="หมายเหตุเพิ่มเติม"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Purchase Information */}
              <Card>
                <CardHeader>
                  <CardTitle>ข้อมูลการจัดซื้อ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="purchase_date">วันที่จัดซื้อ</Label>
                      <Input 
                        id="purchase_date" 
                        type="date"
                        value={formData.purchase_date}
                        onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="warranty_date">วันหมดประกัน</Label>
                      <Input 
                        id="warranty_date" 
                        type="date"
                        value={formData.warranty_date}
                        onChange={(e) => setFormData({ ...formData, warranty_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="purchase_price">ราคา (บาท)</Label>
                      <Input 
                        id="purchase_price" 
                        type="number"
                        placeholder="0.00"
                        value={formData.purchase_price}
                        onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assignment */}
              <Card>
                <CardHeader>
                  <CardTitle>การมอบหมาย</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">แผนก</Label>
                      {departmentsLoading ? (
                        <div className="flex items-center gap-2 py-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">กำลังโหลดแผนก...</span>
                        </div>
                      ) : (
                        <Select 
                          value={formData.department_id || undefined} 
                          onValueChange={(value) => setFormData({ ...formData, department_id: value || "" })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกแผนก (ไม่บังคับ)" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.length === 0 ? (
                              <div className="flex items-center justify-center py-2 px-3">
                                <span className="text-sm text-muted-foreground">ไม่พบแผนก</span>
                              </div>
                            ) : (
                              departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                  {dept.name} ({dept.code})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="current_user_id">ผู้รับผิดชอบ</Label>
                      {usersLoading ? (
                        <div className="flex items-center gap-2 py-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">กำลังโหลดผู้ใช้งาน...</span>
                        </div>
                      ) : (
                        <Select 
                          value={formData.current_user_id || undefined} 
                          onValueChange={(value) => setFormData({ ...formData, current_user_id: value || "" })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกผู้รับผิดชอบ (ไม่บังคับ)" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.length === 0 ? (
                              <div className="flex items-center justify-center py-2 px-3">
                                <span className="text-sm text-muted-foreground">ไม่พบผู้ใช้งาน</span>
                              </div>
                            ) : (
                              users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.name} ({user.role})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="current_employee_name">ชื่อเจ้าของเครื่อง</Label>
                    <Input 
                      id="current_employee_name" 
                      placeholder="ชื่อเจ้าของเครื่องปัจจุบัน"
                      value={formData.current_employee_name}
                      onChange={(e) => setFormData({ ...formData, current_employee_name: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Image Upload */}
              {createdEquipmentId && (
                <Card>
                  <CardHeader>
                    <CardTitle>รูปภาพครุภัณฑ์</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ImageUpload 
                      equipmentId={createdEquipmentId}
                      maxImages={10}
                      onImagesUploaded={(images) => {
                        console.log('Images uploaded:', images)
                        toast({
                          title: "อัพโหลดรูปภาพสำเร็จ",
                          description: `อัพโหลดรูปภาพ ${images.length} รูปเรียบร้อยแล้ว`
                        })
                      }}
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>สถานะ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="status">สถานะครุภัณฑ์ *</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value: "normal" | "maintenance" | "damaged" | "disposed" | "borrowed") => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกสถานะ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">พร้อมใช้งาน</SelectItem>
                        <SelectItem value="maintenance">อยู่ระหว่างบำรุงรักษา</SelectItem>
                        <SelectItem value="damaged">เสียหาย</SelectItem>
                        <SelectItem value="disposed">ปลดระวาง</SelectItem>
                        <SelectItem value="borrowed">ยืมออก</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {!createdEquipmentId ? (
                      <Button 
                        type="submit" 
                        className="w-full gap-2" 
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        เพิ่มครุภัณฑ์
                      </Button>
                    ) : (
                      <Button 
                        type="button" 
                        className="w-full gap-2"
                        onClick={() => navigate("/equipment/list")}
                      >
                        เสร็จสิ้น
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full"
                      type="button"
                      onClick={() => navigate("/equipment/list")}
                    >
                      ยกเลิก
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}