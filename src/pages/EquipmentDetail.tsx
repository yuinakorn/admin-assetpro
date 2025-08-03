import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { QRCodeComponent } from "@/components/ui/qr-code"
import { ArrowLeft, Edit, Trash2, Calendar, MapPin, User, Building, Package, DollarSign, Shield, AlertTriangle, History, Clock, UserCheck, QrCode, Image as ImageIcon, ChevronLeft, ChevronRight, X } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { EquipmentService } from "@/services/equipmentService"
import type { EquipmentHistory } from "@/types/database"
import { ImageService } from "@/services/imageService"
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
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EquipmentDetail {
  id: string
  equipment_code: string
  name: string
  category_id?: string
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
  current_employee_name?: string
  cpu_id?: string
  cpu_series?: string
  ram?: number
  storage?: string
  gpu?: string
  operating_system?: string
  product_key?: string
  ip_address?: string
  mac_address?: string
  hostname?: string
  harddisk_id?: string
  os_id?: string
  office_id?: string
  created_at: string
  updated_at: string
  department_name?: string
  department_code?: string
  current_user_name?: string
  current_user_role?: string
  equipment_categories?: {
    name: string
  }
  cpu?: {
    cpu_name: string
  }
  harddisk?: {
    hdd_type: string
  }
  os?: {
    os_name: string
  }
  office?: {
    office_name: string
  }
}



export default function EquipmentDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [equipment, setEquipment] = useState<EquipmentDetail | null>(null)
  const [history, setHistory] = useState<(EquipmentHistory & { changed_by_name?: string; changed_by_role?: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [images, setImages] = useState<any[]>([])
  const [imagesLoading, setImagesLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [galleryOpen, setGalleryOpen] = useState(false)

  useEffect(() => {
    if (id) {
      loadEquipmentDetail(id)
      loadEquipmentHistory(id)
      loadEquipmentImages(id)
    }
  }, [id])

  const loadEquipmentImages = async (equipmentId: string) => {
    try {
      setImagesLoading(true)
      const imageData = await ImageService.getEquipmentImages(equipmentId)
      setImages(imageData)
    } catch (error) {
      console.error('Error loading equipment images:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดรูปภาพได้",
        variant: "destructive"
      })
    } finally {
      setImagesLoading(false)
    }
  }

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
      
      let errorMessage = "ไม่สามารถลบครุภัณฑ์ได้"
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      toast({
        title: "เกิดข้อผิดพลาด",
        description: errorMessage,
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

  const handleImageClick = (index: number) => {
    setSelectedImage(index)
    setGalleryOpen(true)
  }

  const handlePrevImage = useCallback(() => {
    if (selectedImage === null || !images.length) return
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev! - 1))
  }, [selectedImage, images.length])

  const handleNextImage = useCallback(() => {
    if (selectedImage === null || !images.length) return
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev! + 1))
  }, [selectedImage, images.length])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') handlePrevImage()
    else if (event.key === 'ArrowRight') handleNextImage()
    else if (event.key === 'Escape') setGalleryOpen(false)
  }, [handlePrevImage, handleNextImage])

  useEffect(() => {
    if (galleryOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [galleryOpen, handleKeyDown])

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
                    <p className="text-sm">{equipment.equipment_categories?.name || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">สถานะ</Label>
                    <div className="mt-1">
                      {getStatusBadge(equipment.status)}
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">ยี่ห้อ</Label>
                    <p className="text-sm">{equipment.brand || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">รุ่น</Label>
                    <p className="text-sm">{equipment.model || '-'}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">เลขประจำเครื่อง</Label>
                    <p className="text-sm font-mono">{equipment.serial_number || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">เลขครุภัณฑ์</Label>
                    <p className="text-sm font-mono">{equipment.asset_number || '-'}</p>
                  </div>
                </div>
                {equipment.notes && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">หมายเหตุ</Label>
                      <p className="text-sm mt-1">{equipment.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Computer Specifications (if applicable) */}
            {(equipment.cpu_id || equipment.cpu_series || equipment.ram || equipment.storage || equipment.harddisk_id || equipment.os_id || equipment.office_id) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    คุณสมบัติเฉพาะ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {equipment.cpu && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">CPU</Label>
                        <p className="text-sm">{equipment.cpu.cpu_name}</p>
                      </div>
                    )}
                    {equipment.cpu_series && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">CPU Series</Label>
                        <p className="text-sm">{equipment.cpu_series}</p>
                      </div>
                    )}
                    {equipment.ram && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">RAM</Label>
                        <p className="text-sm">{equipment.ram} GB</p>
                      </div>
                    )}
                    {equipment.storage && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Storage</Label>
                        <p className="text-sm">{equipment.storage}</p>
                      </div>
                    )}
                    {equipment.harddisk && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Harddisk Type</Label>
                        <p className="text-sm">{equipment.harddisk.hdd_type}</p>
                      </div>
                    )}
                    {equipment.os && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Operating System</Label>
                        <p className="text-sm">{equipment.os.os_name}</p>
                      </div>
                    )}
                    {equipment.office && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Office</Label>
                        <p className="text-sm">{equipment.office.office_name}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Purchase Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  ข้อมูลการจัดซื้อ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">วันที่ซื้อ</Label>
                    <p className="text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {formatDate(equipment.purchase_date)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">วันที่หมดประกัน</Label>
                    <p className="text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {formatDate(equipment.warranty_date)}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">ราคาซื้อ</Label>
                    <p className="text-sm">{formatPrice(equipment.purchase_price)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">ผู้จัดจำหน่าย</Label>
                    <p className="text-sm">{equipment.supplier || '-'}</p>
                  </div>
                </div>
                {(isWarrantyExpired(equipment.warranty_date) || isWarrantyExpiringSoon(equipment.warranty_date)) && (
                  <>
                    <Separator />
                    <div className="p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <p className="text-sm text-yellow-800">
                          {isWarrantyExpired(equipment.warranty_date) 
                            ? "ประกันหมดอายุแล้ว" 
                            : "ประกันจะหมดอายุในอีก 30 วัน"
                          }
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Assignment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  การมอบหมาย
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">ผู้รับผิดชอบ</Label>
                    <p className="text-sm flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      {equipment.current_user_name || 'ยังไม่ได้มอบหมาย'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">แผนก</Label>
                    <p className="text-sm flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      {equipment.department_name ? 
                        `${equipment.department_name} (${equipment.department_code})` : 
                        'ยังไม่ได้กำหนด'
                      }
                    </p>
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">ชื่อเจ้าของเครื่อง</Label>
                  <p className="text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    {equipment.current_employee_name || 'ยังไม่ได้กำหนด'}
                  </p>
                </div>
                <Separator />
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">สถานที่ตั้ง</Label>
                  <p className="text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    {equipment.location || 'ยังไม่ได้กำหนด'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* History */}
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
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">กำลังโหลดประวัติ...</span>
                      </div>
                    ) : history.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <History className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
                        <p>ยังไม่มีประวัติการแก้ไข</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {history.map((item) => (
                          <div key={item.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getHistoryActionIcon(item.action_type)}
                                {getHistoryActionBadge(item.action_type)}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatDateTime(item.created_at)}
                              </span>
                            </div>
                            {item.field_name && (
                              <div className="text-sm">
                                <span className="font-medium">ฟิลด์:</span> {EquipmentService.getFieldDisplayName(item.field_name)}
                              </div>
                            )}
                            {(item.old_value || item.new_value) && (
                              <div className="text-sm mt-1">
                                <span className="font-medium">การเปลี่ยนแปลง:</span>
                                <div className="mt-1 space-y-1">
                                  {item.old_value && (
                                    <div className="text-red-600">
                                      <span className="font-medium">เดิม:</span> {EquipmentService.formatValueForDisplay(item.field_name || '', item.old_value)}
                                    </div>
                                  )}
                                  {item.new_value && (
                                    <div className="text-green-600">
                                      <span className="font-medium">ใหม่:</span> {EquipmentService.formatValueForDisplay(item.field_name || '', item.new_value)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            {item.change_reason && (
                              <div className="text-sm mt-2">
                                <span className="font-medium">เหตุผล:</span> {item.change_reason}
                              </div>
                            )}
                            {item.changed_by_name && (
                              <div className="text-sm mt-2 text-muted-foreground">
                                <span className="font-medium">แก้ไขโดย:</span> {item.changed_by_name} ({item.changed_by_role})
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="create" className="space-y-4">
                    {history.filter(item => item.action_type === 'create').map((item) => (
                      <div key={item.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getHistoryActionIcon(item.action_type)}
                            {getHistoryActionBadge(item.action_type)}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(item.created_at)}
                          </span>
                        </div>
                        {item.changed_by_name && (
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">สร้างโดย:</span> {item.changed_by_name} ({item.changed_by_role})
                          </div>
                        )}
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="update" className="space-y-4">
                    {history.filter(item => item.action_type === 'update').map((item) => (
                      <div key={item.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getHistoryActionIcon(item.action_type)}
                            {getHistoryActionBadge(item.action_type)}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(item.created_at)}
                          </span>
                        </div>
                        {item.field_name && (
                          <div className="text-sm">
                            <span className="font-medium">ฟิลด์:</span> {EquipmentService.getFieldDisplayName(item.field_name)}
                          </div>
                        )}
                        {(item.old_value || item.new_value) && (
                          <div className="text-sm mt-1">
                            <span className="font-medium">การเปลี่ยนแปลง:</span>
                            <div className="mt-1 space-y-1">
                              {item.old_value && (
                                <div className="text-red-600">
                                  <span className="font-medium">เดิม:</span> {EquipmentService.formatValueForDisplay(item.field_name || '', item.old_value)}
                                </div>
                              )}
                              {item.new_value && (
                                <div className="text-green-600">
                                  <span className="font-medium">ใหม่:</span> {EquipmentService.formatValueForDisplay(item.field_name || '', item.new_value)}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        {item.changed_by_name && (
                          <div className="text-sm mt-2 text-muted-foreground">
                            <span className="font-medium">แก้ไขโดย:</span> {item.changed_by_name} ({item.changed_by_role})
                          </div>
                        )}
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="status" className="space-y-4">
                    {history.filter(item => item.action_type === 'status_change').map((item) => (
                      <div key={item.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getHistoryActionIcon(item.action_type)}
                            {getHistoryActionBadge(item.action_type)}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(item.created_at)}
                          </span>
                        </div>
                        {(item.old_value || item.new_value) && (
                          <div className="text-sm mt-1">
                            <span className="font-medium">การเปลี่ยนแปลงสถานะ:</span>
                            <div className="mt-1 space-y-1">
                              {item.old_value && (
                                <div className="text-red-600">
                                  <span className="font-medium">เดิม:</span> {EquipmentService.formatValueForDisplay('status', item.old_value)}
                                </div>
                              )}
                              {item.new_value && (
                                <div className="text-green-600">
                                  <span className="font-medium">ใหม่:</span> {EquipmentService.formatValueForDisplay('status', item.new_value)}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        {item.changed_by_name && (
                          <div className="text-sm mt-2 text-muted-foreground">
                            <span className="font-medium">แก้ไขโดย:</span> {item.changed_by_name} ({item.changed_by_role})
                          </div>
                        )}
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Equipment Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  รูปภาพครุภัณฑ์
                </CardTitle>
              </CardHeader>
              <CardContent>
                {imagesLoading ? (
                  <div className="text-center py-4 text-muted-foreground">กำลังโหลดรูปภาพ...</div>
                ) : images.length > 0 ? (
                  <div className="space-y-4">
                    {images.find(img => img.is_primary) && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground mb-2 block">รูปหลัก</Label>
                        <div
                          className="aspect-video w-full rounded-lg overflow-hidden cursor-pointer group relative"
                          onClick={() => handleImageClick(images.findIndex(img => img.is_primary))}
                        >
                          <img
                            src={images.find(img => img.is_primary)?.image_url}
                            alt="Primary equipment"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>
                    )}
                    {images.filter(img => !img.is_primary).length > 0 && (
                       <div>
                        <Label className="text-sm font-medium text-muted-foreground mb-2 block">รูปอื่นๆ</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {images.filter(img => !img.is_primary).map(image => {
                            const imageIndex = images.findIndex(img => img.id === image.id);
                            return (
                              <div
                                key={image.id}
                                className="aspect-square w-full rounded-lg overflow-hidden cursor-pointer group relative"
                                onClick={() => handleImageClick(imageIndex)}
                              >
                                <img
                                  src={image.image_url}
                                  alt={image.image_name || "Equipment"}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </div>
                            )
                          })}
                        </div>
                       </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">ไม่มีรูปภาพ</div>
                )}
              </CardContent>
            </Card>

            {/* QR Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  QR Code
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <QRCodeComponent 
                  value={equipment.equipment_code}
                  size={200}
                  title="รหัสครุภัณฑ์"
                />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>การดำเนินการ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/equipment/edit/${equipment.id}`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  แก้ไขข้อมูล
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(equipment.equipment_code)
                    toast({
                      title: "คัดลอกแล้ว",
                      description: "รหัสครุภัณฑ์ถูกคัดลอกไปยังคลิปบอร์ดแล้ว",
                    })
                  }}
                >
                  <Package className="w-4 h-4 mr-2" />
                  คัดลอกรหัส
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-4xl p-0">
          <div className="relative aspect-video">
            {selectedImage !== null && images[selectedImage] && (
               <img
                  src={images[selectedImage].image_url}
                  alt={images[selectedImage].image_name || "Equipment"}
                  className="w-full h-full object-contain"
                />
            )}
             <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 rounded-full bg-black/20 hover:bg-black/40 text-white"
              onClick={() => setGalleryOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/20 hover:bg-black/40 text-white"
              onClick={handlePrevImage}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/20 hover:bg-black/40 text-white"
              onClick={handleNextImage}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>
           {images.length > 1 && (
             <div className="p-4 bg-background/80 backdrop-blur-sm">
                <div className="grid grid-cols-8 gap-2">
                  {images.map((image, index) => (
                    <div
                      key={image.id}
                      className={`aspect-square w-full rounded-md overflow-hidden cursor-pointer border-2 ${selectedImage === index ? 'border-primary' : 'border-transparent'}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={image.image_url}
                        alt={image.image_name || "Thumbnail"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
