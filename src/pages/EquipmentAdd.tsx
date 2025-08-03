import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Plus, Loader2 } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { EquipmentService } from "@/services/equipmentService"
import { EquipmentInsert } from "@/types/database"
import { EquipmentCategoryService } from "@/services/equipmentCategoryService"
import { cpuService, CPU } from "@/services/cpuService"
import { harddiskService, Harddisk } from "@/services/harddiskService"
import { osService, OS } from "@/services/osService"
import { officeService, Office } from "@/services/officeService"
import { ImageUpload } from "@/components/ui/image-upload"
import { useToast } from "@/hooks/use-toast"

export default function EquipmentAdd() {
  const navigate = useNavigate()
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
    location: "",
    cpu_id: "",
    cpu_series: "",
    ram: "",
    storage: "",
    harddisk_id: "",
    os_id: "",
    office_id: ""
  })

  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<Array<{ id: string; name: string; code: string }>>([])
  const [users, setUsers] = useState<Array<{ id: string; name: string; role: string }>>([])
  const [categories, setCategories] = useState<Array<{ id: string; name: string; code: string }>>([])
  const [cpus, setCpus] = useState<CPU[]>([])
  const [harddisks, setHarddisks] = useState<Harddisk[]>([])
  const [oses, setOses] = useState<OS[]>([])
  const [offices, setOffices] = useState<Office[]>([])
  const [departmentsLoading, setDepartmentsLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [cpusLoading, setCpusLoading] = useState(true)
  const [harddisksLoading, setHarddisksLoading] = useState(true)
  const [osesLoading, setOsesLoading] = useState(true)
  const [officesLoading, setOfficesLoading] = useState(true)
  const [createdEquipmentId, setCreatedEquipmentId] = useState<string | null>(null)

  // Load departments, users, and categories on component mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadDepartments(),
        loadUsers(),
        loadCategories(),
        loadCpus(),
        loadHarddisks(),
        loadOses(),
        loadOffices()
      ])
    }
    loadData()
  }, [])

  const loadDepartments = useCallback(async () => {
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
  }, [toast])

  const loadUsers = useCallback(async () => {
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
  }, [toast])

  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true)
      console.log('Loading categories...')
      const data = await EquipmentCategoryService.getCategoriesForEquipment()
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
  }, [toast])

  const loadCpus = useCallback(async () => {
    try {
      setCpusLoading(true)
      const data = await cpuService.getAllCPUs()
      setCpus(data)
    } catch (error) {
      console.error('Error loading cpus:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูล CPU ได้",
        variant: "destructive"
      })
    } finally {
      setCpusLoading(false)
    }
  }, [toast])

  const loadHarddisks = useCallback(async () => {
    try {
      setHarddisksLoading(true)
      const data = await harddiskService.getAllHarddisks()
      setHarddisks(data)
    } catch (error) {
      console.error('Error loading harddisks:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูล Harddisk ได้",
        variant: "destructive"
      })
    } finally {
      setHarddisksLoading(false)
    }
  }, [toast])

  const loadOses = useCallback(async () => {
    try {
      setOsesLoading(true)
      const data = await osService.getAllOS()
      setOses(data)
    } catch (error) {
      console.error('Error loading oses:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูล OS ได้",
        variant: "destructive"
      })
    } finally {
      setOsesLoading(false)
    }
  }, [toast])

  const loadOffices = useCallback(async () => {
    try {
      setOfficesLoading(true)
      const data = await officeService.getAllOffices()
      setOffices(data)
    } catch (error) {
      console.error('Error loading offices:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูล Office ได้",
        variant: "destructive"
      })
    } finally {
      setOfficesLoading(false)
    }
  }, [toast])

  // Show loading state while initial data is loading
  if (departmentsLoading || usersLoading || categoriesLoading || cpusLoading || harddisksLoading || osesLoading || officesLoading) {
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

  const selectedCategoryName = categories.find(c => c.id === formData.category_id)?.name || ''
  const showComputerFields = ['คอมพิวเตอร์', 'โน้ตบุ๊ค'].includes(selectedCategoryName)
  
  // Debug log
  console.log('Selected category ID:', formData.category_id)
  console.log('Selected category name:', selectedCategoryName)
  console.log('Show computer fields:', showComputerFields)

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
      const equipmentData: Omit<EquipmentInsert, 'created_by' | 'updated_by' | 'equipment_code'> = {
        name: formData.name,
        category_id: formData.category_id || null,
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
        current_employee_name: formData.current_employee_name || null,
        status: formData.status,
        location: formData.location,
        cpu_id: null,
        cpu_series: null,
        ram: null,
        storage: null,
        gpu: null,
        operating_system: null,
        product_key: null,
        ip_address: null,
        mac_address: null,
        hostname: null,
        qr_code: null,
        supplier: null,
        harddisk_id: null,
        os_id: null,
        office_id: null,
      };

      if (showComputerFields) {
        equipmentData.cpu_id = formData.cpu_id || null
        equipmentData.cpu_series = formData.cpu_series || null
        equipmentData.ram = formData.ram ? parseInt(formData.ram, 10) : null
        equipmentData.storage = formData.storage || null
        equipmentData.harddisk_id = formData.harddisk_id || null
        equipmentData.os_id = formData.os_id || null
        equipmentData.office_id = formData.office_id || null
      }

      const createdEquipment = await EquipmentService.createEquipment(equipmentData as EquipmentInsert)
      
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
                        value={formData.category_id} 
                        onValueChange={(value) => setFormData({ ...formData, category_id: value })}
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
                                value={category.id}
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
                    <div className="space-y-2">
  <Label htmlFor="serial_number">เลขประจำเครื่อง</Label>
  <Input
    id="serial_number"
    placeholder="Serial Number ของเครื่อง"
    value={formData.serial_number}
    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
  />
</div>
<div className="space-y-2">
  <Label htmlFor="asset_number">เลขครุภัณฑ์</Label>
  <Input
    id="asset_number"
    placeholder="เลขครุภัณฑ์ขององค์กร"
    value={formData.asset_number}
    onChange={(e) => setFormData({ ...formData, asset_number: e.target.value })}
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

              {/* Specific Properties */}
              {showComputerFields && (
                <Card>
                  <CardHeader>
                    <CardTitle>คุณสมบัติเฉพาะ</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="cpu">CPU</Label>
                        <Select
                          value={formData.cpu_id}
                          onValueChange={(value) => setFormData({ ...formData, cpu_id: value })}
                          disabled={cpusLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={cpusLoading ? "กำลังโหลด..." : "เลือก CPU"} />
                          </SelectTrigger>
                          <SelectContent>
                            {cpus.map((cpu) => (
                              <SelectItem key={cpu.id} value={cpu.id!}>
                                {cpu.cpu_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="cpu_series">CPU Series</Label>
                        <Input
                          id="cpu_series"
                          placeholder="เช่น Core i5-8250U"
                          value={formData.cpu_series}
                          onChange={(e) => setFormData({ ...formData, cpu_series: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="ram">RAM (GB)</Label>
                      <Input
                        id="ram"
                        type="number"
                        placeholder="เช่น 8"
                        value={formData.ram}
                        onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="harddisk">Harddisk Type</Label>
                        <Select
                          value={formData.harddisk_id}
                          onValueChange={(value) => setFormData({ ...formData, harddisk_id: value })}
                          disabled={harddisksLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={harddisksLoading ? "กำลังโหลด..." : "เลือก Harddisk"} />
                          </SelectTrigger>
                          <SelectContent>
                                                       {harddisks.map((harddisk) => (
                               <SelectItem key={harddisk.id} value={harddisk.id!}>
                                 {harddisk.hdd_type}
                               </SelectItem>
                             ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="storage">Storage (GB,TB)</Label>
                        <Input
                          id="storage"
                          type="text"
                          placeholder="เช่น 256, 512, 1TB"
                          value={formData.storage}
                          onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="os">Operating System</Label>
                      <Select
                        value={formData.os_id}
                        onValueChange={(value) => setFormData({ ...formData, os_id: value })}
                        disabled={osesLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={osesLoading ? "กำลังโหลด..." : "เลือก Operating System"} />
                        </SelectTrigger>
                        <SelectContent>
                          {oses.map((os) => (
                            <SelectItem key={os.id} value={os.id!}>
                              {os.os_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="office">Office</Label>
                      <Select
                        value={formData.office_id}
                        onValueChange={(value) => setFormData({ ...formData, office_id: value })}
                        disabled={officesLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={officesLoading ? "กำลังโหลด..." : "เลือก Office"} />
                        </SelectTrigger>
                        <SelectContent>
                          {offices.map((office) => (
                            <SelectItem key={office.id} value={office.id!}>
                              {office.office_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                    <Label htmlFor="current_employee_name">ชื่อเจ้าของเครื่อง *</Label>
                    <Input 
                      id="current_employee_name" 
                      placeholder="ชื่อเจ้าของเครื่องปัจจุบัน"
                      value={formData.current_employee_name}
                      onChange={(e) => setFormData({ ...formData, current_employee_name: e.target.value })}
                      required
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