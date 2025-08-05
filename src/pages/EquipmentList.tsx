import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Plus, Search, Edit, Trash2, Eye, Filter, ArrowUpDown, ArrowUp, ArrowDown, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { EquipmentService } from "@/services/equipmentService"
import { useToast } from "@/hooks/use-toast"
import { usePermissions } from "@/hooks/usePermissions"
import { useAuth } from "@/contexts/AuthContext"

type SortField = 'equipment_code' | 'name' | 'category_name' | 'department_name' | 'status' | 'current_user_name'
type SortDirection = 'asc' | 'desc'

interface SortConfig {
  field: SortField
  direction: SortDirection
}

interface Equipment {
  id: string
  equipment_code: string
  name: string
  category_name?: string
  department_name?: string
  status: string
  current_user_name?: string
  serial_number?: string
}

export default function EquipmentList() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'equipment_code', direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const { toast } = useToast()
  const navigate = useNavigate()
  const permissions = usePermissions()
  const { user } = useAuth()

  useEffect(() => {
    loadEquipment()
  }, [])

  const loadEquipment = async () => {
    try {
      setLoading(true)
      const data = await EquipmentService.getEquipment()
      setEquipment(data)
    } catch (error) {
      console.error('Error loading equipment:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลครุภัณฑ์ได้",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      console.log('Attempting to delete equipment:', id)
      console.log('Current user role:', user?.user_metadata?.role)
      
      await EquipmentService.deleteEquipment(id)
      toast({
        title: "ลบครุภัณฑ์สำเร็จ",
        description: "ครุภัณฑ์ถูกลบออกจากระบบแล้ว",
      })
      loadEquipment()
    } catch (error: unknown) {
      console.error('Error deleting equipment:', error)
      
      let errorMessage = 'ข้อผิดพลาดที่ไม่ทราบสาเหตุ'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      toast({
        title: "เกิดข้อผิดพลาด",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      normal: { label: "ใช้งานปกติ", variant: "default" as const },
      maintenance: { label: "ซ่อมบำรุง", variant: "secondary" as const },
      damaged: { label: "ชำรุด", variant: "destructive" as const },
      disposed: { label: "จำหน่ายแล้ว", variant: "outline" as const },
      borrowed: { label: "เบิกแล้ว", variant: "secondary" as const }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.normal
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
    setCurrentPage(1) // Reset to first page when sorting
  }

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.equipment_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.serial_number && item.serial_number.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = filterStatus === "all" || item.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const sortedEquipment = [...filteredEquipment].sort((a, b) => {
    const aValue = a[sortConfig.field] || ''
    const bValue = b[sortConfig.field] || ''
    
    if (sortConfig.direction === 'asc') {
      return aValue.toString().localeCompare(bValue.toString(), 'th')
    } else {
      return bValue.toString().localeCompare(aValue.toString(), 'th')
    }
  })

  const totalPages = Math.ceil(sortedEquipment.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentEquipment = sortedEquipment.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const renderPaginationItems = () => {
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

  // Mobile card component for equipment items
  const EquipmentCard = ({ item }: { item: Equipment }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.equipment_code}</p>
            </div>
            <div className="flex items-center gap-1 ml-2">
              {permissions.canViewEquipment && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/equipment/${item.id}`)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              {permissions.canEditEquipment && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/equipment/edit/${item.id}`)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {permissions.canDeleteEquipment && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                      <AlertDialogDescription>
                        คุณต้องการลบครุภัณฑ์ "{item.name}" ใช่หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(item.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        ลบ
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">ประเภท:</span>
              <p className="font-medium">{item.category_name || '-'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">แผนก:</span>
              <p className="font-medium">{item.department_name || '-'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">สถานะ:</span>
              <div className="mt-1">{getStatusBadge(item.status)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">ผู้ใช้งาน:</span>
              <p className="font-medium">{item.current_user_name || '-'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">กำลังโหลดข้อมูล...</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
    <div className="container mx-auto p-4 space-y-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">รายการครุภัณฑ์</h1>
            <p className="text-muted-foreground">
              จัดการครุภัณฑ์คอมพิวเตอร์ทั้งหมดในระบบ
            </p>
          </div>
          {permissions.canAddEquipment && (
            <Button onClick={() => navigate("/equipment/add")} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มครุภัณฑ์
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              กรองข้อมูล
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="ค้นหาครุภัณฑ์..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">สถานะทั้งหมด</option>
                <option value="normal">ใช้งานปกติ</option>
                <option value="maintenance">ซ่อมบำรุง</option>
                <option value="damaged">ชำรุด</option>
                <option value="disposed">จำหน่ายแล้ว</option>
                <option value="borrowed">เบิกแล้ว</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Equipment List - Mobile View */}
        <div className="block lg:hidden">
          <Card>
            <CardHeader>
              <CardTitle>รายการครุภัณฑ์ ({filteredEquipment.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {currentEquipment.length > 0 ? (
                <div className="space-y-4">
                  {currentEquipment.map((item) => (
                    <EquipmentCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  ไม่พบครุภัณฑ์ที่ตรงกับเงื่อนไขการค้นหา
                </div>
              )}

              {/* Pagination for Mobile */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                  <div className="text-sm text-muted-foreground text-center sm:text-left">
                    แสดง {startIndex + 1} ถึง {Math.min(endIndex, filteredEquipment.length)} จาก {filteredEquipment.length} รายการ
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
        </div>

        {/* Equipment Table - Desktop View */}
        <div className="hidden lg:block">
          <Card>
            <CardHeader>
              <CardTitle>รายการครุภัณฑ์ ({filteredEquipment.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
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
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('name')}
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                        >
                          ชื่อครุภัณฑ์
                          {getSortIcon('name')}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('category_name')}
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                        >
                          ประเภท
                          {getSortIcon('category_name')}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('department_name')}
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                        >
                          แผนก
                          {getSortIcon('department_name')}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('status')}
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                        >
                          สถานะ
                          {getSortIcon('status')}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('current_user_name')}
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                        >
                          ผู้ใช้งาน
                          {getSortIcon('current_user_name')}
                        </Button>
                      </TableHead>
                      <TableHead>การดำเนินการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentEquipment.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.equipment_code}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category_name || '-'}</TableCell>
                        <TableCell>{item.department_name || '-'}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>{item.current_user_name || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/equipment/${item.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {permissions.canEditEquipment && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/equipment/edit/${item.id}`)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            {permissions.canDeleteEquipment && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      คุณต้องการลบครุภัณฑ์ "{item.name}" ใช่หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(item.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      ลบ
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
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

              {/* Pagination for Desktop */}
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
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </DashboardLayout>
    
  )
}