import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Plus,
  Monitor,
  Laptop,
  Printer,
  Network,
  Loader2,
  ArrowLeft,
  Building
} from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { EquipmentService, EquipmentWithDetails } from "@/services/equipmentService"
import { DepartmentService } from "@/services/departmentService"
import { Department } from "@/types/database"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  CategoryChart, 
  BrandChart, 
  CPUChart, 
  RAMChart, 
  OSChart, 
  OfficeChart 
} from "@/components/dashboard/DepartmentEquipmentCharts"

export default function DepartmentEquipment() {
  const navigate = useNavigate()
  const { departmentId } = useParams<{ departmentId: string }>()
  const { toast } = useToast()
  const [equipment, setEquipment] = useState<EquipmentWithDetails[]>([])
  const [allEquipment, setAllEquipment] = useState<EquipmentWithDetails[]>([])
  const [department, setDepartment] = useState<Department | null>(null)
  const [categories, setCategories] = useState<Array<{ id: string; name: string; code: string }>>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)

  // Load department and equipment on component mount
  useEffect(() => {
    if (departmentId) {
      loadDepartmentData()
    }
  }, [departmentId])

  // Apply filters when search term, status filter, or category filter changes
  useEffect(() => {
    if (allEquipment.length > 0) {
      applyFilters()
    }
  }, [searchTerm, statusFilter, categoryFilter, allEquipment])

  const loadDepartmentData = async () => {
    if (!departmentId) return

    try {
      setLoading(true)
      const [deptData, equipData, categoriesData] = await Promise.all([
        DepartmentService.getDepartment(departmentId),
        EquipmentService.getEquipmentByDepartment(departmentId),
        EquipmentService.getCategoriesForEquipment()
      ])
      
      setDepartment(deptData)
      setAllEquipment(equipData)
      setEquipment(equipData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading department data:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลแผนกได้",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Apply filters
  const applyFilters = () => {
    let filteredEquipment = allEquipment

    // Apply search filter
    if (searchTerm.trim()) {
      filteredEquipment = filteredEquipment.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.equipment_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.current_employee_name && item.current_employee_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Apply status filter
    if (statusFilter) {
      filteredEquipment = filteredEquipment.filter(item => item.status === statusFilter)
    }

    // Apply category filter
    if (categoryFilter && categoryFilter !== "all") {
      filteredEquipment = filteredEquipment.filter(item => item.category_id === categoryFilter)
    }

    setEquipment(filteredEquipment)
  }



  // Filter by status
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
  }

  // Filter by category
  const handleCategoryFilter = (categoryId: string) => {
    setCategoryFilter(categoryId)
  }

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("")
    setCategoryFilter("all")
  }

  // Delete equipment
  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบครุภัณฑ์นี้?')) return

    try {
      await EquipmentService.deleteEquipment(id)
      toast({
        title: "สำเร็จ",
        description: "ลบครุภัณฑ์เรียบร้อยแล้ว"
      })
      loadDepartmentData() // Reload the list
    } catch (error) {
      console.error('Error deleting equipment:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบครุภัณฑ์ได้",
        variant: "destructive"
      })
    }
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'normal':
        return "default"
      case 'maintenance':
        return "secondary"
      case 'damaged':
        return "destructive"
      case 'disposed':
        return "outline"
      case 'borrowed':
        return "secondary"
      default:
        return "outline"
    }
  }

  // Get equipment icon
  const getEquipmentIcon = (categoryName?: string) => {
    if (!categoryName) return Monitor
    
    const category = categoryName.toLowerCase()
    if (category.includes('laptop') || category.includes('โน้ตบุ๊ค')) return Laptop
    if (category.includes('printer') || category.includes('เครื่องพิมพ์')) return Printer
    if (category.includes('network') || category.includes('เครือข่าย')) return Network
    return Monitor
  }

  // Calculate stats
  const stats = {
    total: equipment.length,
    normal: equipment.filter(e => e.status === 'normal').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
    damaged: equipment.filter(e => e.status === 'damaged').length,
    disposed: equipment.filter(e => e.status === 'disposed').length,
    borrowed: equipment.filter(e => e.status === 'borrowed').length
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">กำลังโหลดข้อมูล...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (!department) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">ไม่พบข้อมูลแผนก</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate("/departments")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                ครุภัณฑ์ในแผนก {department.name}
              </h1>
              <p className="text-muted-foreground">
                รหัสแผนก: {department.code} • ครุภัณฑ์ทั้งหมด: {stats.total} ชิ้น
              </p>
            </div>
          </div>
          <Button className="gap-2" onClick={() => navigate("/equipment/add")}>
            <Plus className="w-4 h-4" />
            เพิ่มครุภัณฑ์ใหม่
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Building className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">ทั้งหมด</p>
                  <p className="text-xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Monitor className="w-6 h-6 text-success" />
                <div>
                  <p className="text-xs text-muted-foreground">ใช้งานปกติ</p>
                  <p className="text-xl font-bold">{stats.normal}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Monitor className="w-6 h-6 text-warning" />
                <div>
                  <p className="text-xs text-muted-foreground">บำรุงรักษา</p>
                  <p className="text-xl font-bold">{stats.maintenance}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Monitor className="w-6 h-6 text-destructive" />
                <div>
                  <p className="text-xs text-muted-foreground">ชำรุด</p>
                  <p className="text-xl font-bold">{stats.damaged}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Monitor className="w-6 h-6 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">จำหน่ายแล้ว</p>
                  <p className="text-xl font-bold">{stats.disposed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Monitor className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">เบิกแล้ว</p>
                  <p className="text-xl font-bold">{stats.borrowed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        {allEquipment.length > 0 ? (
          equipment.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  สถิติครุภัณฑ์ในแผนก
                  {(categoryFilter !== "all" || statusFilter || searchTerm) && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      (แสดงผลตามตัวกรองที่เลือก)
                    </span>
                  )}
                </h2>
              </div>
              
              {/* Charts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CategoryChart equipment={equipment} />
                <BrandChart equipment={equipment} />
                <CPUChart equipment={equipment} />
                <RAMChart equipment={equipment} />
                <OSChart equipment={equipment} />
                <OfficeChart equipment={equipment} />
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">ไม่พบครุภัณฑ์ที่ตรงกับเงื่อนไข</h3>
                  <p className="text-muted-foreground mb-4">
                    ไม่มีครุภัณฑ์ที่ตรงกับเงื่อนไขการกรองที่เลือก
                  </p>
                  <Button onClick={clearFilters}>
                    ล้างตัวกรอง
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">ไม่มีครุภัณฑ์ในแผนกนี้</h3>
                <p className="text-muted-foreground mb-4">
                  ยังไม่มีครุภัณฑ์ที่ถูกกำหนดให้อยู่ในแผนก {department.name}
                </p>
                <Button onClick={() => navigate("/equipment/add")}>
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มครุภัณฑ์ใหม่
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Search */}
        {equipment.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="ค้นหาครุภัณฑ์, รหัส, ยี่ห้อ, รุ่น, เลขประจำเครื่อง, ชื่อพนักงาน..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchLoading && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 animate-spin" />
                  )}
                </div>
                
                {/* Filters Row */}
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Category Filter */}
                  <div className="flex-1">
                    <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภทครุภัณฑ์" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ทุกประเภท</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Status Filters */}
                  <div className="flex gap-2">
                    <Button 
                      variant={statusFilter === "" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusFilter("")}
                    >
                      ทุกสถานะ
                    </Button>
                    <Button 
                      variant={statusFilter === "normal" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusFilter("normal")}
                    >
                      ใช้งานปกติ
                    </Button>
                    <Button 
                      variant={statusFilter === "maintenance" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusFilter("maintenance")}
                    >
                      บำรุงรักษา
                    </Button>
                    <Button 
                      variant={statusFilter === "damaged" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusFilter("damaged")}
                    >
                      ชำรุด
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                    >
                      ล้างตัวกรอง
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Equipment Table */}
        {equipment.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                ครุภัณฑ์ทั้งหมด ({equipment.length} ชิ้น)
                {equipment.length !== allEquipment.length && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    จากทั้งหมด {allEquipment.length} ชิ้น
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">กำลังโหลดข้อมูล...</span>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>รหัส</TableHead>
                      <TableHead>ชื่อครุภัณฑ์</TableHead>
                      <TableHead>ประเภท</TableHead>
                      <TableHead>ยี่ห้อ/รุ่น</TableHead>
                      <TableHead>ผู้ใช้งาน</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipment.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {searchTerm || statusFilter || categoryFilter !== "all" ? "ไม่พบครุภัณฑ์ที่ตรงกับเงื่อนไขการกรอง" : "ไม่มีครุภัณฑ์ในแผนกนี้"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      equipment.map((item) => {
                        const EquipmentIcon = getEquipmentIcon(item.category_name)
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.equipment_code}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <EquipmentIcon className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">{item.serial_number}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {item.category_name || "ไม่ระบุ"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.brand}</p>
                                <p className="text-xs text-muted-foreground">{item.model}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {item.current_employee_name ? (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {item.current_employee_name}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(item.status)}>
                                {item.status_text}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    className="cursor-pointer"
                                    onClick={() => navigate(`/equipment/${item.id}`)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    ดูรายละเอียด
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="cursor-pointer"
                                    onClick={() => navigate(`/equipment/edit/${item.id}`)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    แก้ไข
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="cursor-pointer text-destructive"
                                    onClick={() => handleDelete(item.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    ลบ
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        )}
      </div>
    </DashboardLayout>
  )
} 