import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Package, CheckCircle, Wrench, XCircle, Clock, Eye, User, Mail, Phone, Building, Activity, Shield, Calendar, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { UserService } from "@/services/userService"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface UserDetail {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
  department_id?: string
  phone?: string
  is_active: boolean
  created_at: string
  updated_at: string
  department_name?: string
  department_code?: string
}

interface UserEquipment {
  id: string
  equipment_code: string
  name: string
  type: string
  brand: string
  model: string
  serial_number: string
  status: string
  location?: string
  department_name?: string
  department_code?: string
}

export default function UserDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [userEquipment, setUserEquipment] = useState<UserEquipment[]>([])
  const [loading, setLoading] = useState(true)
  const [equipmentLoading, setEquipmentLoading] = useState(false)
  const [stats, setStats] = useState({
    equipmentCount: 0,
    borrowCount: 0,
    maintenanceCount: 0
  })

  useEffect(() => {
    if (id) {
      loadUserData(id)
      loadUserEquipment(id)
    }
  }, [id])

  const loadUserData = async (userId: string) => {
    try {
      setLoading(true)
      const userData = await UserService.getUser(userId)
      
      if (!userData) {
        toast({
          title: "ไม่พบข้อมูล",
          description: "ไม่พบข้อมูลผู้ใช้งานนี้",
          variant: "destructive"
        })
        navigate("/users")
        return
      }

      // Get department name
      let departmentName = ""
      let departmentCode = ""
      if (userData.department_id) {
        try {
          const { data: deptData } = await supabase
            .from('departments')
            .select('name, code')
            .eq('id', userData.department_id)
            .single()
          departmentName = deptData?.name || ""
          departmentCode = deptData?.code || ""
        } catch (error) {
          console.warn('Could not fetch department data:', error)
        }
      }

      const userWithDept: UserDetail = {
        ...userData,
        department_name: departmentName,
        department_code: departmentCode
      }

      setUser(userWithDept)

      // Load user statistics
      const equipmentCount = await UserService.getEquipmentCount(userId)
      const borrowCount = await UserService.getBorrowCount(userId)
      const maintenanceCount = await UserService.getMaintenanceCount(userId)

      setStats({
        equipmentCount,
        borrowCount,
        maintenanceCount
      })
    } catch (error) {
      console.error('Error loading user data:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadUserEquipment = async (userId: string) => {
    try {
      setEquipmentLoading(true)
      const equipmentData = await UserService.getEquipmentByUser(userId)
      setUserEquipment(equipmentData)
    } catch (error) {
      console.error('Error loading user equipment:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลครุภัณฑ์ได้",
        variant: "destructive"
      })
    } finally {
      setEquipmentLoading(false)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default'
      case 'manager':
        return 'secondary'
      case 'user':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'manager':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'user':
        return 'bg-green-50 text-green-700 border-green-200'
      default:
        return ''
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'ผู้ดูแลระบบ'
      case 'manager':
        return 'ผู้จัดการ'
      case 'user':
        return 'ผู้ใช้งาน'
      default:
        return role
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

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">ไม่พบข้อมูลผู้ใช้งาน</p>
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
              onClick={() => navigate("/users")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">รายละเอียดผู้ใช้งาน</h1>
              <p className="text-muted-foreground">
                ข้อมูลและสถิติของผู้ใช้งาน
              </p>
            </div>
          </div>
          <Button 
            className="gap-2"
            onClick={() => navigate(`/users/edit/${user.id}`)}
          >
            <Edit className="w-4 h-4" />
            แก้ไขข้อมูล
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  ข้อมูลส่วนตัว
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ชื่อ-นามสกุล</p>
                    <p className="text-lg font-semibold">{user.first_name} {user.last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Username</p>
                    <p className="text-lg font-mono">{user.username}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">อีเมล</p>
                    <p className="text-lg flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">เบอร์โทรศัพท์</p>
                    <p className="text-lg flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {user.phone || 'ไม่มีข้อมูล'}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">บทบาท</p>
                    <Badge 
                      variant={getRoleBadgeVariant(user.role)}
                      className={`mt-1 ${getRoleBadgeColor(user.role)}`}
                    >
                      {getRoleText(user.role)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">สถานะ</p>
                    <div className="flex items-center gap-2 mt-1">
                      {user.is_active ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <Badge 
                        variant={user.is_active ? "default" : "secondary"}
                        className={user.is_active ? "bg-success/10 text-success border-success/20" : ""}
                      >
                        {user.is_active ? "ใช้งาน" : "ไม่ใช้งาน"}
                      </Badge>
                    </div>
                  </div>
                </div>
                {user.department_name && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">แผนก</p>
                      <p className="text-lg flex items-center gap-2 mt-1">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        {user.department_name} ({user.department_code})
                      </p>
                    </div>
                  </>
                )}
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">วันที่สร้าง</p>
                    <p className="text-lg flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {formatDate(user.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">อัปเดตล่าสุด</p>
                    <p className="text-lg flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {formatDate(user.updated_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  สถิติการใช้งาน
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Package className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">{stats.equipmentCount}</p>
                    <p className="text-sm text-muted-foreground">ครุภัณฑ์ที่รับผิดชอบ</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">{stats.borrowCount}</p>
                    <p className="text-sm text-muted-foreground">การยืม-คืน</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Shield className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                    <p className="text-2xl font-bold">{stats.maintenanceCount}</p>
                    <p className="text-sm text-muted-foreground">การบำรุงรักษา</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Equipment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  ครุภัณฑ์ที่รับผิดชอบ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>รหัสครุภัณฑ์</TableHead>
                      <TableHead>ชื่อครุภัณฑ์</TableHead>
                      <TableHead>ประเภท</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead>แผนก</TableHead>
                      <TableHead className="text-right">การดำเนินการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipmentLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                          <span className="ml-2">กำลังโหลดข้อมูลครุภัณฑ์...</span>
                        </TableCell>
                      </TableRow>
                    ) : userEquipment.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          <Package className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
                          <p>ผู้ใช้งานนี้ยังไม่มีครุภัณฑ์ที่รับผิดชอบ</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      userEquipment.map((equipment) => (
                        <TableRow key={equipment.id}>
                          <TableCell className="font-mono">{equipment.equipment_code}</TableCell>
                          <TableCell className="font-medium">{equipment.name}</TableCell>
                          <TableCell>{getTypeText(equipment.type)}</TableCell>
                          <TableCell>{getStatusBadge(equipment.status)}</TableCell>
                          <TableCell>
                            {equipment.department_name ? 
                              `${equipment.department_name} (${equipment.department_code})` : 
                              '-'
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/equipment/detail/${equipment.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              ดูรายละเอียด
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>การดำเนินการ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => navigate(`/users/edit/${user.id}`)}
                >
                  <Edit className="w-4 h-4" />
                  แก้ไขข้อมูล
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => navigate(`/equipment/list?user=${user.id}`)}
                >
                  <Package className="w-4 h-4" />
                  ดูครุภัณฑ์
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => navigate(`/borrow-return?user=${user.id}`)}
                >
                  <Activity className="w-4 h-4" />
                  ประวัติการยืม-คืน
                </Button>
              </CardContent>
            </Card>

            {/* User Status */}
            <Card>
              <CardHeader>
                <CardTitle>สถานะผู้ใช้งาน</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">สถานะการใช้งาน</span>
                  <Badge 
                    variant={user.is_active ? "default" : "secondary"}
                    className={user.is_active ? "bg-success/10 text-success border-success/20" : ""}
                  >
                    {user.is_active ? "ใช้งาน" : "ไม่ใช้งาน"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">บทบาท</span>
                  <Badge 
                    variant={getRoleBadgeVariant(user.role)}
                    className={getRoleBadgeColor(user.role)}
                  >
                    {getRoleText(user.role)}
                  </Badge>
                </div>
                {user.department_name && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">แผนก</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {user.department_name}
                    </Badge>
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