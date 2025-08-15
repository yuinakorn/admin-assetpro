import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Monitor, 
  Users, 
  Building2, 
  Package, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Loader2,
  BarChart3,
  PieChart,
  TrendingUp
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState, useCallback } from "react"
import { DashboardService, DashboardStats } from "@/services/dashboardService"
import { EquipmentService, EquipmentWithDetails } from "@/services/equipmentService"
import { EquipmentTypeChart, EquipmentDepartmentChart } from "@/components/dashboard/EquipmentChart"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { 
  CategoryChart, 
  BrandChart, 
  CPUChart, 
  RAMChart, 
  OSChart, 
  OfficeChart,
  PurchaseYearChart
} from "@/components/dashboard/DepartmentEquipmentCharts"

export default function Dashboard() {
  const { user, userProfile } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    total_equipment: 0,
    normal_equipment: 0,
    maintenance_equipment: 0,
    damaged_equipment: 0,
    disposed_equipment: 0,
    borrowed_equipment: 0,
    total_users: 0,
    total_departments: 0,
    total_equipment_types: 0,
    expiring_warranty: 0,
    expired_warranty: 0
  })
  const [allEquipment, setAllEquipment] = useState<EquipmentWithDetails[]>([])
  const [filteredEquipment, setFilteredEquipment] = useState<EquipmentWithDetails[]>([])
  const [categories, setCategories] = useState<Array<{ id: string; name: string; code: string }>>([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [yearFilter, setYearFilter] = useState<string>("all")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [showAdvancedCharts, setShowAdvancedCharts] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
             const [statsData, equipmentData, categoriesData] = await Promise.all([
         DashboardService.getDashboardStats(),
         EquipmentService.getEquipment(),
         EquipmentService.getCategoriesForEquipment()
       ])
      
      setStats(statsData)
      setAllEquipment(equipmentData)
      setFilteredEquipment(equipmentData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setCategoryFilter("all")
    setYearFilter("all")
    setDepartmentFilter("all")
  }

  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0
    return Math.round((value / total) * 100)
  }

  const getUserDisplayName = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`
    }
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
    }
    return user?.email || 'ผู้ใช้งาน'
  }

  const getUserRole = () => {
    const role = userProfile?.role || user?.user_metadata?.role || 'user'
    const roleLabels = {
      'admin': 'ผู้ดูแลระบบ',
      'manager': 'ผู้จัดการ',
      'user': 'ผู้ใช้งาน'
    }
    return roleLabels[role as keyof typeof roleLabels] || 'ผู้ใช้งาน'
  }

  // Get available years from equipment data
  const getAvailableYears = () => {
    const years = new Set<string>()
    allEquipment.forEach(item => {
      if (item.purchase_date) {
        const year = new Date(item.purchase_date).getFullYear().toString()
        years.add(year)
      }
    })
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a))
  }

  // Get available departments from equipment data
  const getAvailableDepartments = () => {
    const departments = new Map<string, string>()
    allEquipment.forEach(item => {
      if (item.department_id && item.department_name) {
        departments.set(item.department_id, item.department_name)
      }
    })
    return Array.from(departments.entries()).map(([id, name]) => ({ id, name }))
  }

  // Pagination functions
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const renderPaginationItems = () => {
    const totalPages = Math.ceil(filteredEquipment.length / itemsPerPage)
    const items = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious 
          onClick={() => handlePageChange(currentPage - 1)}
          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
        />
      </PaginationItem>
    )

    // First page
    if (startPage > 1) {
      items.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
        </PaginationItem>
      )
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
    }

    // Visible pages
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
      items.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => handlePageChange(totalPages)}>{totalPages}</PaginationLink>
        </PaginationItem>
      )
    }

    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext 
          onClick={() => handlePageChange(currentPage + 1)}
          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
        />
      </PaginationItem>
    )

    return items
  }

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = allEquipment

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.equipment_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.current_employee_name && item.current_employee_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Apply status filter
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    // Apply category filter
    if (categoryFilter && categoryFilter !== "all") {
      filtered = filtered.filter(item => item.category_id === categoryFilter)
    }

    // Apply year filter
    if (yearFilter && yearFilter !== "all") {
      filtered = filtered.filter(item => {
        if (!item.purchase_date) return false
        const itemYear = new Date(item.purchase_date).getFullYear().toString()
        return itemYear === yearFilter
      })
    }

    // Apply department filter
    if (departmentFilter && departmentFilter !== "all") {
      filtered = filtered.filter(item => item.department_id === departmentFilter)
    }

    setFilteredEquipment(filtered)
  }, [searchTerm, statusFilter, categoryFilter, yearFilter, departmentFilter, allEquipment])

  // Apply filters when any filter changes
  useEffect(() => {
    if (allEquipment.length > 0) {
      applyFilters()
    }
  }, [searchTerm, statusFilter, categoryFilter, yearFilter, departmentFilter, allEquipment, applyFilters])

  // Calculate filtered stats
  const filteredStats = {
    total: filteredEquipment.length,
    normal: filteredEquipment.filter(e => e.status === 'normal').length,
    maintenance: filteredEquipment.filter(e => e.status === 'maintenance').length,
    damaged: filteredEquipment.filter(e => e.status === 'damaged').length,
    disposed: filteredEquipment.filter(e => e.status === 'disposed').length,
    borrowed: filteredEquipment.filter(e => e.status === 'borrowed').length
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <div className="text-muted-foreground">กำลังโหลดข้อมูล...</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              ยินดีต้อนรับ, {getUserDisplayName()}!
            </h1>
            <p className="text-muted-foreground mt-1">
              {getUserRole()} • ระบบจัดการครุภัณฑ์คอมพิวเตอร์
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {getUserRole()}
            </Badge>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ครุภัณฑ์ทั้งหมด</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_equipment}</div>
              <p className="text-xs text-muted-foreground">
                เครื่องคอมพิวเตอร์และอุปกรณ์
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ใช้งานปกติ</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.normal_equipment}
              </div>
              <p className="text-xs text-muted-foreground">
                {calculatePercentage(stats.normal_equipment, stats.total_equipment)}% ของทั้งหมด
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ต้องซ่อมบำรุง</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.maintenance_equipment + stats.damaged_equipment}
              </div>
              <p className="text-xs text-muted-foreground">
                {calculatePercentage(stats.maintenance_equipment + stats.damaged_equipment, stats.total_equipment)}% ของทั้งหมด
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">หมดประกัน</CardTitle>
              <Clock className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.expiring_warranty + stats.expired_warranty}
              </div>
              <p className="text-xs text-muted-foreground">
                ต้องต่ออายุประกัน
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              ตัวกรองข้อมูลครุภัณฑ์
                             {(categoryFilter !== "all" || statusFilter !== "all" || yearFilter !== "all" || departmentFilter !== "all" || searchTerm) && (
                 <Badge variant="secondary" className="ml-2">
                   ใช้งานอยู่
                 </Badge>
               )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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

                {/* Department Filter */}
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกแผนก" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกแผนก</SelectItem>
                    {getAvailableDepartments().map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Year Filter */}
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกปีงบประมาณ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกปี</SelectItem>
                    {getAvailableYears().map((year) => (
                      <SelectItem key={year} value={year}>
                        ปีงบประมาณ {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกสถานะ</SelectItem>
                    <SelectItem value="normal">ใช้งานปกติ</SelectItem>
                    <SelectItem value="maintenance">บำรุงรักษา</SelectItem>
                    <SelectItem value="damaged">ชำรุด</SelectItem>
                    <SelectItem value="disposed">จำหน่ายแล้ว</SelectItem>
                    <SelectItem value="borrowed">เบิกแล้ว</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  แสดงผล {filteredEquipment.length} จาก {allEquipment.length} รายการ
                </div>
                <Button variant="outline" onClick={clearFilters}>
                  ล้างตัวกรอง
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtered Stats Cards */}
        {(categoryFilter !== "all" || statusFilter !== "all" || yearFilter !== "all" || departmentFilter !== "all" || searchTerm) && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Monitor className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">ทั้งหมด</p>
                    <p className="text-xl font-bold">{filteredStats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">ใช้งานปกติ</p>
                    <p className="text-xl font-bold">{filteredStats.normal}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">บำรุงรักษา</p>
                    <p className="text-xl font-bold">{filteredStats.maintenance}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">ชำรุด</p>
                    <p className="text-xl font-bold">{filteredStats.damaged}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Package className="w-6 h-6 text-gray-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">จำหน่ายแล้ว</p>
                    <p className="text-xl font-bold">{filteredStats.disposed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">เบิกแล้ว</p>
                    <p className="text-xl font-bold">{filteredStats.borrowed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Basic Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EquipmentTypeChart equipment={filteredEquipment} /> {/* กราฟประเภทครุภัณฑ์ */}
          <EquipmentDepartmentChart equipment={filteredEquipment} /> {/* กราฟแผนก */}
        </div>

        {/* Advanced Charts Toggle */}
        <div className="flex items-center justify-center">
          <Button 
            onClick={() => setShowAdvancedCharts(!showAdvancedCharts)}
            className="gap-2"
          >
            {showAdvancedCharts ? <PieChart className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
            {showAdvancedCharts ? 'ซ่อน' : 'แสดง'} กราฟเพิ่มเติม
          </Button>
        </div>

        {/* Advanced Charts Section */}
        {showAdvancedCharts && filteredEquipment.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                สถิติครุภัณฑ์เพิ่มเติม
                                 {(categoryFilter !== "all" || statusFilter !== "all" || yearFilter !== "all" || departmentFilter !== "all" || searchTerm) && (
                   <span className="text-sm font-normal text-muted-foreground ml-2">
                     (แสดงผลตามตัวกรองที่เลือก)
                   </span>
                 )}
              </h2>
            </div>
            
            {/* Advanced Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CategoryChart equipment={filteredEquipment} />
              <BrandChart equipment={filteredEquipment} />
              <CPUChart equipment={filteredEquipment} />
              <RAMChart equipment={filteredEquipment} />
              <OSChart equipment={filteredEquipment} />
              <OfficeChart equipment={filteredEquipment} />
            </div>
            
            {/* Purchase Year Chart - Full Width */}
            <div className="mt-6">
              <PurchaseYearChart equipment={filteredEquipment} />
            </div>
          </div>
        )}

        {/* No Data Message for Advanced Charts */}
        {showAdvancedCharts && filteredEquipment.length === 0 && (
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
        )}

        {/* Equipment Table Section */}
        <Card>
          <CardHeader>
            <CardTitle>รายการครุภัณฑ์ ({filteredEquipment.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>รหัสครุภัณฑ์</TableHead>
                    <TableHead>ชื่อครุภัณฑ์</TableHead>
                    <TableHead>ประเภท</TableHead>
                    <TableHead>แผนก</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>เจ้าของเครื่อง</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEquipment.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.equipment_code}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.asset_number && (
                              <p className="text-xs text-muted-foreground">{item.asset_number}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.category_name || '-'}</TableCell>
                      <TableCell>{item.department_name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={
                          item.status === 'normal' ? 'default' :
                          item.status === 'maintenance' ? 'secondary' :
                          item.status === 'damaged' ? 'destructive' :
                          item.status === 'disposed' ? 'outline' :
                          'secondary'
                        }>
                          {item.status === 'normal' ? 'ปกติ' :
                           item.status === 'maintenance' ? 'ซ่อมบำรุง' :
                           item.status === 'damaged' ? 'ชำรุด' :
                           item.status === 'disposed' ? 'จำหน่ายแล้ว' :
                           'เบิกแล้ว'}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.current_employee_name || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredEquipment.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                ไม่พบครุภัณฑ์ที่ตรงกับเงื่อนไขการค้นหา
              </div>
            )}

            {/* Pagination */}
            {filteredEquipment.length > itemsPerPage && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  แสดง {(currentPage - 1) * itemsPerPage + 1} ถึง {Math.min(currentPage * itemsPerPage, filteredEquipment.length)} จาก {filteredEquipment.length} รายการ
                </div>
                <Pagination>
                  <PaginationContent>
                    {renderPaginationItems()}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Section */}
        <RecentActivity />
      </div>
    </DashboardLayout>
  )
}