import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { QRCodeComponent } from "@/components/ui/qr-code"
import { Plus, Search, Edit, Trash2, Eye, CheckCircle, Wrench, XCircle, Clock, Package, Loader2, Filter, QrCode } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { EquipmentService, EquipmentWithDetails } from "@/services/equipmentService"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function EquipmentList() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [equipment, setEquipment] = useState<EquipmentWithDetails[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    normal: 0,
    maintenance: 0,
    damaged: 0,
    disposed: 0,
    borrowed: 0
  })

  // Load equipment on component mount
  useEffect(() => {
    loadEquipment()
    loadStats()
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

  const loadStats = async () => {
    try {
      const data = await EquipmentService.getEquipmentStats()
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  // Search equipment
  const handleSearch = async (query: string) => {
    setSearchTerm(query)
    
    if (!query.trim()) {
      loadEquipment()
      return
    }

    try {
      setSearchLoading(true)
      const results = await EquipmentService.searchEquipment(query)
      setEquipment(results)
    } catch (error) {
      console.error('Error searching equipment:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถค้นหาครุภัณฑ์ได้",
        variant: "destructive"
      })
    } finally {
      setSearchLoading(false)
    }
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
      loadEquipment() // Reload the list
      loadStats() // Reload stats
    } catch (error) {
      console.error('Error deleting equipment:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบครุภัณฑ์ได้",
        variant: "destructive"
      })
    }
  }

  // Filter equipment based on search term (client-side fallback)
  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.department_name && item.department_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.assigned_user_name && item.assigned_user_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'normal':
        return 'default'
      case 'maintenance':
        return 'outline'
      case 'damaged':
        return 'destructive'
      case 'retired':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'maintenance':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'damaged':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'retired':
        return 'bg-gray-50 text-gray-700 border-gray-200'
      default:
        return ''
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-4 h-4" />
      case 'maintenance':
        return <Wrench className="w-4 h-4" />
      case 'damaged':
        return <XCircle className="w-4 h-4" />
      case 'retired':
        return <Clock className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">จัดการครุภัณฑ์</h1>
            <p className="text-muted-foreground">
              จัดการข้อมูลครุภัณฑ์และอุปกรณ์ในระบบ
            </p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/equipment/add")}>
            <Plus className="w-4 h-4" />
            เพิ่มครุภัณฑ์ใหม่
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Package className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">ครุภัณฑ์ทั้งหมด</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">พร้อมใช้งาน</p>
                  <p className="text-2xl font-bold">{stats.normal}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Wrench className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">บำรุงรักษา</p>
                  <p className="text-2xl font-bold">{stats.maintenance}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <XCircle className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">ชำรุด</p>
                  <p className="text-2xl font-bold">{stats.damaged}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="w-8 h-8 text-gray-500" />
                <div>
                  <p className="text-sm text-muted-foreground">ปลดระวาง</p>
                  <p className="text-2xl font-bold">{stats.disposed}</p>
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
                  placeholder="ค้นหาชื่อ, ยี่ห้อ, รุ่น, เลขประจำเครื่อง, แผนก, หรือผู้รับผิดชอบ..." 
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

        {/* Equipment Table */}
        <Card>
          <CardHeader>
            <CardTitle>ครุภัณฑ์ทั้งหมด ({filteredEquipment.length} รายการ)</CardTitle>
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
                      <TableHead>QR Code</TableHead>
                      <TableHead>ชื่อครุภัณฑ์</TableHead>
                      <TableHead>ยี่ห้อ/รุ่น</TableHead>
                      <TableHead>เลขประจำเครื่อง</TableHead>
                      <TableHead>แผนก</TableHead>
                      <TableHead>ผู้รับผิดชอบ</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEquipment.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {searchTerm ? "ไม่พบครุภัณฑ์ที่ค้นหา" : "ไม่มีข้อมูลครุภัณฑ์"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEquipment.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex justify-center">
                              <div style={{ width: 60, height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <QRCodeComponent 
                                  value={item.equipment_code}
                                  size={45}
                                  className="!w-[45px] !h-[45px]"
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground font-mono">{item.equipment_code}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.brand}</p>
                              <p className="text-xs text-muted-foreground">{item.model}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{item.serial_number}</TableCell>
                          <TableCell>
                            {item.department_name ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {item.department_name}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.assigned_user_name ? (
                              <span className="text-sm">{item.assigned_user_name}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={getStatusBadgeVariant(item.status)}
                              className={`flex items-center gap-1 w-fit ${getStatusBadgeColor(item.status)}`}
                            >
                              {getStatusIcon(item.status)}
                              {item.status_text}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/equipment/detail/${item.id}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/equipment/edit/${item.id}`)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
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
                                      คุณต้องการลบครุภัณฑ์ "{item.name}" ใช่หรือไม่? 
                                      การดำเนินการนี้ไม่สามารถยกเลิกได้
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
                            </div>
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