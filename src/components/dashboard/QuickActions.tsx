import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, QrCode, FileText, Users, Settings, ArrowRightLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

const quickActions = [
  {
    title: "เพิ่มครุภัณฑ์",
    description: "เพิ่มครุภัณฑ์ใหม่เข้าสู่ระบบ",
    icon: Plus,
    color: "bg-primary hover:bg-primary/90",
    route: "/equipment/add",
  },
  {
    title: "สแกน QR Code",
    description: "สแกนรหัส QR เพื่อดูข้อมูลครุภัณฑ์",
    icon: QrCode,
    color: "bg-info hover:bg-info/90",
    route: "/scan",
  },
  {
    title: "บันทึกยืม-คืน",
    description: "บันทึกการยืม-คืนครุภัณฑ์",
    icon: ArrowRightLeft,
    color: "bg-success hover:bg-success/90",
    route: "/borrow-return",
  },
  {
    title: "สร้างรายงาน",
    description: "สร้างรายงานครุภัณฑ์",
    icon: FileText,
    color: "bg-warning hover:bg-warning/90",
    route: "/reports",
  },
]

export function QuickActions() {
  const navigate = useNavigate()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">การดำเนินการด่วน</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickActions.map((action, index) => {
          const IconComponent = action.icon
          return (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-3 hover:shadow-md transition-all"
              onClick={() => navigate(action.route)}
            >
              <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center text-white`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-foreground">{action.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
              </div>
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}