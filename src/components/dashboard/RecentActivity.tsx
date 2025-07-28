import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, Monitor, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

const recentActivities = [
  {
    id: 1,
    type: "borrow",
    title: "ยืมครุภัณฑ์",
    description: "คอมพิวเตอร์ตั้งโต๊ะ Dell OptiPlex 7090",
    user: "นายสมชาย ใจดี",
    time: "2 นาทีที่แล้ว",
    status: "success",
    icon: CheckCircle,
  },
  {
    id: 2,
    type: "maintenance",
    title: "แจ้งซ่อม",
    description: "เครื่องพิมพ์ HP LaserJet Pro 404dn",
    user: "นางสาวมานี สบายดี",
    time: "15 นาทีที่แล้ว",
    status: "warning",
    icon: AlertTriangle,
  },
  {
    id: 3,
    type: "return",
    title: "คืนครุภัณฑ์",
    description: "โน้ตบุ๊ค Lenovo ThinkPad E14",
    user: "นายประยุทธ์ มั่นคง",
    time: "1 ชั่วโมงที่แล้ว",
    status: "success",
    icon: CheckCircle,
  },
  {
    id: 4,
    type: "damage",
    title: "แจ้งชำรุด",
    description: "จอภาพ Samsung 24นิ้ว",
    user: "นางสุธิดา เรียบร้อย",
    time: "2 ชั่วโมงที่แล้ว",
    status: "error",
    icon: XCircle,
  },
  {
    id: 5,
    type: "add",
    title: "เพิ่มครุภัณฑ์ใหม่",
    description: "คอมพิวเตอร์ตั้งโต๊ะ HP EliteDesk 800 G8",
    user: "ระบบอัตโนมัติ",
    time: "3 ชั่วโมงที่แล้ว",
    status: "info",
    icon: Monitor,
  },
]

const statusColors = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-info/10 text-info border-info/20",
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          กิจกรรมล่าสุด
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentActivities.map((activity) => {
          const IconComponent = activity.icon
          return (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusColors[activity.status as keyof typeof statusColors]}`}>
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
        })}
      </CardContent>
    </Card>
  )
}