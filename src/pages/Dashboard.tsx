import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Monitor, 
  Users, 
  Building2, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { DashboardService, DashboardStats } from "@/services/dashboardService"

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    total_equipment: 0,
    normal_equipment: 0,
    maintenance_equipment: 0,
    damaged_equipment: 0,
    disposed_equipment: 0,
    borrowed_equipment: 0,
    total_users: 0,
    total_departments: 0,
    expiring_warranty: 0,
    expired_warranty: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      const data = await DashboardService.getDashboardStats()
      setStats(data)
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0
    return Math.round((value / total) * 100)
  }

  const getUserDisplayName = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
    }
    return user?.email || 'ผู้ใช้งาน'
  }

  const getUserRole = () => {
    const role = user?.user_metadata?.role || 'user'
    const roleLabels = {
      'admin': 'ผู้ดูแลระบบ',
      'manager': 'ผู้จัดการ',
      'user': 'ผู้ใช้งาน'
    }
    return roleLabels[role as keyof typeof roleLabels] || 'ผู้ใช้งาน'
  }

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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              การดำเนินการด่วน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate("/equipment/add")}
              >
                <Plus className="w-6 h-6" />
                <span>เพิ่มครุภัณฑ์</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate("/equipment/list")}
              >
                <Monitor className="w-6 h-6" />
                <span>ดูครุภัณฑ์</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate("/users")}
              >
                <Users className="w-6 h-6" />
                <span>จัดการผู้ใช้</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate("/departments")}
              >
                <Building2 className="w-6 h-6" />
                <span>จัดการแผนก</span>
              </Button>
            </div>
          </CardContent>
        </Card>

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

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ผู้ใช้งาน</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
              <p className="text-xs text-muted-foreground">
                ผู้ใช้งานในระบบ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">แผนก</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_departments}</div>
              <p className="text-xs text-muted-foreground">
                แผนกในองค์กร
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ประเภทครุภัณฑ์</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">
                ประเภทครุภัณฑ์
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>กิจกรรมล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              ยังไม่มีกิจกรรมล่าสุด
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}