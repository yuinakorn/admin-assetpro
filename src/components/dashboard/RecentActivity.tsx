import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, Monitor, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { DashboardService, RecentActivityData } from "@/services/dashboardService"

const statusColors = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-info/10 text-info border-info/20",
}

const iconMap = {
  Monitor,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
}

export function RecentActivity() {
  const [activities, setActivities] = useState<RecentActivityData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await DashboardService.getRecentActivities()
        setActivities(data)
      } catch (error) {
        console.error('Error fetching recent activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            กิจกรรมล่าสุด
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <div className="text-muted-foreground">กำลังโหลด...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          กิจกรรมล่าสุด
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">ไม่มีกิจกรรมล่าสุด</div>
          </div>
        ) : (
          activities.map((activity) => {
            const IconComponent = iconMap[activity.icon as keyof typeof iconMap] || Clock
            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusColors[activity.status]}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                    <Badge variant="secondary" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{activity.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Avatar className="w-4 h-4">
                      <AvatarFallback className="text-xs bg-muted">
                        {activity.user.split(' ')[1]?.[0] || activity.user[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>{activity.user}</span>
                    <span>•</span>
                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}