import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Package, Edit, UserCheck, AlertTriangle, Trash2, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { EquipmentService } from "@/services/equipmentService"
import { useNavigate } from "react-router-dom"

interface ActivityItem {
  id: string
  equipment_id: string
  equipment_name: string
  equipment_code: string
  action_type: string
  field_name?: string
  old_value?: string
  new_value?: string
  created_at: string
  changed_by_name?: string
}

export function RecentActivity() {
  const navigate = useNavigate()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecentActivities()
  }, [])

  const loadRecentActivities = async () => {
    try {
      setLoading(true)
      const allHistory = await EquipmentService.getAllEquipmentHistory()
      // Get only the latest 5 activities
      setActivities(allHistory.slice(0, 5))
    } catch (error) {
      console.error('Error loading recent activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (actionType: string) => {
    switch (actionType) {
      case 'create':
        return <Plus className="w-4 h-4 text-green-600" />
      case 'update':
        return <Edit className="w-4 h-4 text-blue-600" />
      case 'status_change':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'assignment_change':
        return <UserCheck className="w-4 h-4 text-purple-600" />
      case 'delete':
        return <Trash2 className="w-4 h-4 text-red-600" />
      default:
        return <Package className="w-4 h-4 text-gray-600" />
    }
  }

  const getActivityBadge = (actionType: string) => {
    const config = {
      create: { variant: "default" as const, text: "สร้าง", color: "bg-green-50 text-green-700" },
      update: { variant: "outline" as const, text: "แก้ไข", color: "bg-blue-50 text-blue-700" },
      status_change: { variant: "outline" as const, text: "เปลี่ยนสถานะ", color: "bg-yellow-50 text-yellow-700" },
      assignment_change: { variant: "outline" as const, text: "มอบหมาย", color: "bg-purple-50 text-purple-700" },
      delete: { variant: "destructive" as const, text: "ลบ", color: "bg-red-50 text-red-700" }
    }

    const actionConfig = config[actionType as keyof typeof config] || config.update

    return (
      <Badge variant={actionConfig.variant} className={actionConfig.color}>
        {actionConfig.text}
      </Badge>
    )
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'เมื่อสักครู่'
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`
    return date.toLocaleDateString('th-TH')
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            กิจกรรมล่าสุด
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">กำลังโหลด...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          กิจกรรมล่าสุด
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm">ยังไม่มีกิจกรรมล่าสุด</p>
            <p className="text-xs mt-1">กิจกรรมจะแสดงเมื่อมีการใช้งาน</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/equipment/detail/${activity.equipment_id}`)}
              >
                <div className="mt-0.5">
                  {getActivityIcon(activity.action_type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getActivityBadge(activity.action_type)}
                      <span className="text-sm font-medium">
                        {activity.equipment_name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(activity.created_at)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    รหัส: {activity.equipment_code}
                    {activity.changed_by_name && (
                      <span> • โดย {activity.changed_by_name}</span>
                    )}
                  </div>
                  {activity.field_name && (
                    <div className="text-xs text-muted-foreground">
                      แก้ไข: {EquipmentService.getFieldDisplayName(activity.field_name)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => navigate("/history")}
              >
                ดูประวัติทั้งหมด
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}