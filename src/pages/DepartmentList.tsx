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
  Users,
  Building,
  Loader2
} from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { DepartmentService, DepartmentWithStats } from "@/services/departmentService"
import { useToast } from "@/hooks/use-toast"

export default function DepartmentList() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [departments, setDepartments] = useState<DepartmentWithStats[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)

  // Load departments on component mount
  useEffect(() => {
    loadDepartments()
  }, [])

  const loadDepartments = async () => {
    try {
      setLoading(true)
      const data = await DepartmentService.getDepartments()
      setDepartments(data)
    } catch (error) {
      console.error('Error loading departments:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลแผนกได้",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Search departments
  const handleSearch = async (query: string) => {
    setSearchTerm(query)
    
    if (!query.trim()) {
      loadDepartments()
      return
    }

    try {
      setSearchLoading(true)
      const results = await DepartmentService.searchDepartments(query)
      setDepartments(results)
    } catch (error) {
      console.error('Error searching departments:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถค้นหาแผนกได้",
        variant: "destructive"
      })
    } finally {
      setSearchLoading(false)
    }
  }

  // Delete department
  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบแผนกนี้?')) return

    try {
      await DepartmentService.deleteDepartment(id)
      toast({
        title: "สำเร็จ",
        description: "ลบแผนกเรียบร้อยแล้ว"
      })
      loadDepartments() // Reload the list
    } catch (error) {
      console.error('Error deleting department:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบแผนกได้",
        variant: "destructive"
      })
    }
  }

  // Filter departments based on search term (client-side fallback)
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dept.manager_name && dept.manager_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">จัดการแผนก</h1>
            <p className="text-muted-foreground">
              จัดการข้อมูลแผนกและโครงสร้างองค์กร
            </p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/departments/add")}>
            <Plus className="w-4 h-4" />
            เพิ่มแผนกใหม่
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Building className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">แผนกทั้งหมด</p>
                  <p className="text-2xl font-bold">{departments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="w-8 h-8 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">พนักงานทั้งหมด</p>
                  <p className="text-2xl font-bold">
                    {departments.reduce((sum, dept) => sum + dept.employee_count, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Building className="w-8 h-8 text-warning" />
                <div>
                  <p className="text-sm text-muted-foreground">ครุภัณฑ์ทั้งหมด</p>
                  <p className="text-2xl font-bold">
                    {departments.reduce((sum, dept) => sum + dept.equipment_count, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="ค้นหาแผนก, รหัส, หรือผู้จัดการ..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {searchLoading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 animate-spin" />
                )}
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                ตัวกรอง
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Departments Table */}
        <Card>
          <CardHeader>
            <CardTitle>แผนกทั้งหมด ({filteredDepartments.length} แผนก)</CardTitle>
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
                      <TableHead>ชื่อแผนก</TableHead>
                      <TableHead>ผู้จัดการ</TableHead>
                      <TableHead>พนักงาน</TableHead>
                      <TableHead>ครุภัณฑ์</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDepartments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {searchTerm ? "ไม่พบแผนกที่ค้นหา" : "ไม่มีข้อมูลแผนก"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDepartments.map((department) => (
                        <TableRow key={department.id}>
                          <TableCell className="font-medium">{department.code}</TableCell>
                          <TableCell>
                            <div>
                              <p 
                                className="font-medium cursor-pointer hover:text-primary transition-colors"
                                onClick={() => navigate(`/departments/${department.id}/equipment`)}
                              >
                                {department.name}
                              </p>
                              <p className="text-xs text-muted-foreground">{department.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>{department.manager_name || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {department.employee_count} คน
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {department.equipment_count} ชิ้น
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={department.is_active ? "default" : "secondary"}
                              className={department.is_active ? "bg-success/10 text-success border-success/20" : ""}
                            >
                              {department.is_active ? "ใช้งาน" : "ไม่ใช้งาน"}
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
                                  onClick={() => navigate(`/departments/${department.id}/equipment`)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  ดูครุภัณฑ์
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer"
                                  onClick={() => navigate(`/departments/edit/${department.id}`)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  แก้ไข
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer text-destructive"
                                  onClick={() => handleDelete(department.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  ลบ
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 