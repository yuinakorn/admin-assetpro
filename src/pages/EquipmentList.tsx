import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, Search, Edit, Trash2, Eye, Filter } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { EquipmentService } from "@/services/equipmentService"
import { useToast } from "@/hooks/use-toast"
import { usePermissions } from "@/hooks/usePermissions"

export default function EquipmentList() {
  const [equipment, setEquipment] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const { toast } = useToast()
  const navigate = useNavigate()
  const permissions = usePermissions()

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
      await EquipmentService.deleteEquipment(id)
      toast({
        title: "ลบครุภัณฑ์สำเร็จ",
        description: "ครุภัณฑ์ถูกลบออกจากระบบแล้ว",
      })
      loadEquipment()
    } catch (error) {
      console.error('Error deleting equipment:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบครุภัณฑ์ได้",
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

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.equipment_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === "all" || item.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">รายการครุภัณฑ์</h1>
            <p className="text-muted-foreground">
              จัดการครุภัณฑ์คอมพิวเตอร์ทั้งหมดในระบบ
            </p>
          </div>
          {permissions.canAddEquipment && (
            <Button onClick={() => navigate("/equipment/add")}>
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
            <div className="flex gap-4">
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

        {/* Equipment Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายการครุภัณฑ์ ({filteredEquipment.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสครุภัณฑ์</TableHead>
                  <TableHead>ชื่อครุภัณฑ์</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>แผนก</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>ผู้ใช้งาน</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.equipment_code}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.type}</TableCell>
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
                            onClick={() => navigate(`/equipment/${item.id}/edit`)}
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
            
            {filteredEquipment.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                ไม่พบครุภัณฑ์ที่ตรงกับเงื่อนไขการค้นหา
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}