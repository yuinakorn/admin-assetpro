import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Trash2, Calendar, MapPin, User, Building, Package, DollarSign, Shield, AlertTriangle, History, Clock, UserCheck } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { EquipmentService } from "@/services/equipmentService"
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
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EquipmentDetail {
  id: string
  equipment_code: string
  name: string
  type: string
  brand: string
  model: string
  serial_number: string
  asset_number?: string
  notes?: string
  purchase_date?: string
  warranty_date?: string
  purchase_price?: number
  supplier?: string
  status: string
  department_id?: string
  location?: string
  current_user_id?: string
  cpu?: string
  ram?: string
  storage?: string
  created_at: string
  updated_at: string
  department_name?: string
  department_code?: string
  current_user_name?: string
  current_user_role?: string
}

interface EquipmentHistory {
  id: string
  action_type: string
  field_name?: string
  old_value?: string
  new_value?: string
  change_reason?: string
  created_at: string
  changed_by_name?: string
  changed_by_role?: string
}

export default function EquipmentDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [equipment, setEquipment] = useState<EquipmentDetail | null>(null)
  const [history, setHistory] = useState<EquipmentHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (id) {
      loadEquipmentDetail(id)
      loadEquipmentHistory(id)
    }
  }, [id])

  const loadEquipmentDetail = async (equipmentId: string) => {
    try {
      setLoading(true)
      const equipmentData = await EquipmentService.getEquipmentById(equipmentId)
      
      if (!equipmentData) {
        toast({
          title: "ไม่พบข้อมูล",
          description: "ไม่พบข้อมูลครุภัณฑ์นี้",
          variant: "destructive"
        })
        navigate("/equipment/list")
        return
      }

      setEquipment(equipmentData)
    } catch (error) {
      console.error('Error loading equipment detail:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลครุภัณฑ์ได้",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadEquipmentHistory = async (equipmentId: string) => {
    try {
      setHistoryLoading(true)
      const historyData = await EquipmentService.getEquipmentHistory(equipmentId)
      setHistory(historyData)
    } catch (error) {
      console.error('Error loading equipment history:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดประวัติการแก้ไขได้",
        variant: "destructive"
      })
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!equipment) return
    
    try {
      setDeleting(true)
      await EquipmentService.deleteEquipment(equipment.id)
      
      toast({
        title: "สำเร็จ",
        description: "ลบครุภัณฑ์เรียบร้อยแล้ว"
      })
      
      navigate("/equipment/list")
    } catch (error) {
      console.error("Error deleting equipment:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบครุภัณฑ์ได้",
        variant: "destructive"
      })
    } finally {
      setDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      normal: { variant: "default" as const, text: "ใช้งานปกติ", color: "bg-green-50 text-green-700 border-green-200" },
      maintenance: { variant: "outline" as const, text: "อยู่ระหว่างบำรุงรักษา", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      damaged: { variant: "destructive" as const, text: "ชำรุด", color: "bg-red-50 text-red-700 border-red-200" },
      disposed: { variant: "outline" as const, text: "จำหน่ายแล้ว", color: "bg-gray-50 text-gray-700 border-gray-200" },
      borrowed: { variant: "outline" as const, text: "เบิกแล้ว", color: "bg-blue-50 text-blue-700 border-blue-200" }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.normal

    return (
      <Badge variant={config.variant} className={config.color}>
        {config.text}
      </Badge>
    )
  }

  const getTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      computer: "คอมพิวเตอร์",
      laptop: "โน้ตบุ๊ค",
      monitor: "จอภาพ",
      printer: "เครื่องพิมพ์",
      ups: "UPS",
      network_device: "อุปกรณ์เครือข่าย"
    }
    return typeMap[type] || type
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price?: number) => {
    if (!price) return "-"
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price)
  }

  const getHistoryActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'create':
        return <Package className="w-4 h-4 text-green-600" />
      case 'update':
        return <Edit className="w-4 h-4 text-blue-600" />
      case 'status_change':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'assignment_change':
        return <UserCheck className="w-4 h-4 text-purple-600" />
      case 'delete':
        return <Trash2 className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getHistoryActionBadge = (actionType: string) => {
    const config = {
      create: { variant: "default" as const, text: "สร้างครุภัณฑ์", color: "bg-green-50 text-green-700 border-green-200" },
      update: { variant: "outline" as const, text: "แก้ไขข้อมูล", color: "bg-blue-50 text-blue-700 border-blue-200" },
      status_change: { variant: "outline" as const, text: "เปลี่ยนสถานะ", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      assignment_change: { variant: "outline" as const, text: "เปลี่ยนการมอบหมาย", color: "bg-purple-50 text-purple-700 border-purple-200" },
      delete: { variant: "destructive" as const, text: "ลบครุภัณฑ์", color: "bg-red-50 text-red-700 border-red-200" }
    }

    const actionConfig = config[actionType as keyof typeof config] || config.update

    return (
      <Badge variant={actionConfig.variant} className={actionConfig.color}>
        {actionConfig.text}
      </Badge>
    )
  }

  const isWarrantyExpired = (warrantyDate?: string) => {
    if (!warrantyDate) return false
    return new Date(warrantyDate) < new Date()
  }

  const isWarrantyExpiringSoon = (warrantyDate?: string) => {
    if (!warrantyDate) return false
    const warranty = new Date(warrantyDate)
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    return warranty <= thirtyDaysFromNow && warranty > now
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">กำลังโหลดข้อมูล...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (!equipment) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">ไม่พบข้อมูลครุภัณฑ์</p>
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
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/equipment/list")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{equipment.name}</h1>
              <p className="text-muted-foreground">
                รหัส: {equipment.equipment_code} | เลขประจำเครื่อง: {equipment.serial_number}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/equipment/edit/${equipment.id}`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              แก้ไข
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  ลบ
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                  <AlertDialogDescription>
                    คุณต้องการลบครุภัณฑ์ "{equipment.name}" ใช่หรือไม่? 
                    การดำเนินการนี้ไม่สามารถยกเลิกได้
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? "กำลังลบ..." : "ลบ"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  ข้อมูลพื้นฐาน
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">ประเภท</Label>
                    <p className="text-sm">{getTypeText(equipment.type)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">สถานะ</Label>
                    <div className="mt-1">
                      {getStatusBadge(equipment.status)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">ยี่ห้อ</Label>
                    <p className="text-sm">{equipment.brand}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">รุ่น</Label>
                    <p className="text-sm">{equipment.model}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">เลขประจำเครื่อง</Label>
                    <p className="text-sm font-mono">{equipment.serial_number}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">เลขครุภัณฑ์</Label>
                    <p className="text-sm font-mono">{equipment.asset_number || "-"}</p>
                  </div>
                </div>
                {equipment.notes && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">หมายเหตุ</Label>
                    <p className="text-sm mt-1">{equipment.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Purchase Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  ข้อมูลการจัดซื้อ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">วันที่จัดซื้อ</Label>
                    <p className="text-sm">{formatDate(equipment.purchase_date)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">วันหมดประกัน</Label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm">{formatDate(equipment.warranty_date)}</p>
                      {equipment.warranty_date && (
                        <>
                          {isWarrantyExpired(equipment.warranty_date) && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                          {isWarrantyExpiringSoon(equipment.warranty_date) && (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">ราคา</Label>
                    <p className="text-sm">{formatPrice(equipment.purchase_price)}</p>
                  </div>
                </div>
                {equipment.supplier && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">ผู้จัดจำหน่าย</Label>
                    <p className="text-sm">{equipment.supplier}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assignment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  การมอบหมาย
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">แผนก</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm">
                        {equipment.department_name ? `${equipment.department_name} (${equipment.department_code})` : "-"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">ผู้รับผิดชอบ</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm">
                        {equipment.current_user_name ? `${equipment.current_user_name} (${equipment.current_user_role})` : "-"}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">สถานที่ตั้ง</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">{equipment.location || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Computer Specifications (if applicable) */}
            {(equipment.cpu || equipment.ram || equipment.storage) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    ข้อมูลจำเพาะ (คอมพิวเตอร์)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {equipment.cpu && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">CPU</Label>
                        <p className="text-sm">{equipment.cpu}</p>
                      </div>
                    )}
                    {equipment.ram && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">RAM</Label>
                        <p className="text-sm">{equipment.ram}</p>
                      </div>
                    )}
                    {equipment.storage && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">พื้นที่จัดเก็บ</Label>
                        <p className="text-sm">{equipment.storage}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* History Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  ประวัติการแก้ไข
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
                    <TabsTrigger value="create">สร้าง</TabsTrigger>
                    <TabsTrigger value="update">แก้ไข</TabsTrigger>
                    <TabsTrigger value="status">สถานะ</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-4">
                    {historyLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2">กำลังโหลดประวัติ...</span>
                      </div>
                    ) : history.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p>ไม่พบประวัติการแก้ไข</p>
                        <p className="text-sm">ประวัติจะปรากฏเมื่อมีการแก้ไขข้อมูลครุภัณฑ์</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {history.map((item, index) => (
                          <div key={item.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                            <div className="flex-shrink-0 mt-1">
                              {getHistoryActionIcon(item.action_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {getHistoryActionBadge(item.action_type)}
                                <span className="text-xs text-muted-foreground">
                                  โดย {item.changed_by_name || 'ระบบ'} 
                                  {item.changed_by_role && ` (${item.changed_by_role})`}
                                </span>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {formatDateTime(item.created_at)}
                                </span>
                              </div>
                              {item.field_name && item.field_name !== 'general' && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">เปลี่ยน</span>{' '}
                                  <span className="font-medium">
                                    {EquipmentService.getFieldDisplayName(item.field_name)}
                                  </span>{' '}
                                  <span className="text-muted-foreground">จาก</span>{' '}
                                  <span className="font-mono text-sm bg-background px-1 rounded">
                                    {EquipmentService.formatValueForDisplay(item.field_name, item.old_value || '')}
                                  </span>{' '}
                                  <span className="text-muted-foreground">เป็น</span>{' '}
                                  <span className="font-mono text-sm bg-background px-1 rounded">
                                    {EquipmentService.formatValueForDisplay(item.field_name, item.new_value || '')}
                                  </span>
                                </div>
                              )}
                              {item.change_reason && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  <span className="font-medium">เหตุผล:</span> {item.change_reason}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="create" className="space-y-4">
                    {historyLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2">กำลังโหลดประวัติ...</span>
                      </div>
                    ) : history.filter(item => item.action_type === 'create').length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p>ไม่พบประวัติการสร้าง</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {history.filter(item => item.action_type === 'create').map(item => (
                          <div key={item.id} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex-shrink-0 mt-1">
                              <Package className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">
                                  สร้างครุภัณฑ์
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  โดย {item.changed_by_name || 'ระบบ'} 
                                  {item.changed_by_role && ` (${item.changed_by_role})`}
                                </span>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {formatDateTime(item.created_at)}
                                </span>
                              </div>
                              <div className="text-sm text-green-700">
                                ครุภัณฑ์ถูกสร้างขึ้นในระบบ
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="update" className="space-y-4">
                    {historyLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2">กำลังโหลดประวัติ...</span>
                      </div>
                    ) : history.filter(item => item.action_type === 'update').length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Edit className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p>ไม่พบประวัติการแก้ไข</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {history.filter(item => item.action_type === 'update').map(item => (
                          <div key={item.id} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex-shrink-0 mt-1">
                              <Edit className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  แก้ไขข้อมูล
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  โดย {item.changed_by_name || 'ระบบ'} 
                                  {item.changed_by_role && ` (${item.changed_by_role})`}
                                </span>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {formatDateTime(item.created_at)}
                                </span>
                              </div>
                              {item.field_name && item.field_name !== 'general' && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">เปลี่ยน</span>{' '}
                                  <span className="font-medium">
                                    {EquipmentService.getFieldDisplayName(item.field_name)}
                                  </span>{' '}
                                  <span className="text-muted-foreground">จาก</span>{' '}
                                  <span className="font-mono text-sm bg-background px-1 rounded">
                                    {EquipmentService.formatValueForDisplay(item.field_name, item.old_value || '')}
                                  </span>{' '}
                                  <span className="text-muted-foreground">เป็น</span>{' '}
                                  <span className="font-mono text-sm bg-background px-1 rounded">
                                    {EquipmentService.formatValueForDisplay(item.field_name, item.new_value || '')}
                                  </span>
                                </div>
                              )}
                              {item.change_reason && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  <span className="font-medium">เหตุผล:</span> {item.change_reason}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="status" className="space-y-4">
                    {historyLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2">กำลังโหลดประวัติ...</span>
                      </div>
                    ) : history.filter(item => item.action_type === 'status_change').length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p>ไม่พบประวัติการเปลี่ยนสถานะ</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {history.filter(item => item.action_type === 'status_change').map(item => (
                          <div key={item.id} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex-shrink-0 mt-1">
                              <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                  เปลี่ยนสถานะ
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  โดย {item.changed_by_name || 'ระบบ'} 
                                  {item.changed_by_role && ` (${item.changed_by_role})`}
                                </span>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {formatDateTime(item.created_at)}
                                </span>
                              </div>
                              {item.field_name && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">เปลี่ยนสถานะจาก</span>{' '}
                                  <span className="font-mono text-sm bg-background px-1 rounded">
                                    {EquipmentService.formatValueForDisplay(item.field_name, item.old_value || '')}
                                  </span>{' '}
                                  <span className="text-muted-foreground">เป็น</span>{' '}
                                  <span className="font-mono text-sm bg-background px-1 rounded">
                                    {EquipmentService.formatValueForDisplay(item.field_name, item.new_value || '')}
                                  </span>
                                </div>
                              )}
                              {item.change_reason && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  <span className="font-medium">เหตุผล:</span> {item.change_reason}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Warranty Alert */}
            {equipment.warranty_date && (
              <Card className={isWarrantyExpired(equipment.warranty_date) ? "border-red-200 bg-red-50" : 
                              isWarrantyExpiringSoon(equipment.warranty_date) ? "border-yellow-200 bg-yellow-50" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4" />
                    สถานะประกัน
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isWarrantyExpired(equipment.warranty_date) ? (
                    <div className="text-red-700">
                      <p className="text-sm font-medium">หมดประกันแล้ว</p>
                      <p className="text-xs">หมดประกันเมื่อ: {formatDate(equipment.warranty_date)}</p>
                    </div>
                  ) : isWarrantyExpiringSoon(equipment.warranty_date) ? (
                    <div className="text-yellow-700">
                      <p className="text-sm font-medium">ประกันใกล้หมด</p>
                      <p className="text-xs">หมดประกันเมื่อ: {formatDate(equipment.warranty_date)}</p>
                    </div>
                  ) : (
                    <div className="text-green-700">
                      <p className="text-sm font-medium">ประกันยังไม่หมด</p>
                      <p className="text-xs">หมดประกันเมื่อ: {formatDate(equipment.warranty_date)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">ข้อมูลระบบ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">สร้างเมื่อ</Label>
                  <p className="text-xs">{formatDate(equipment.created_at)}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">อัปเดตล่าสุด</Label>
                  <p className="text-xs">{formatDate(equipment.updated_at)}</p>
                </div>
              </CardContent>
            </Card>

            
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 