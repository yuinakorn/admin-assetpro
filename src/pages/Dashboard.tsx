import { 
  Monitor, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  Calendar
} from "lucide-react"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { EquipmentStatusChart, MonthlyTrendChart } from "@/components/dashboard/EquipmentChart"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const warningEquipment = [
  {
    id: "EQ001",
    name: "คอมพิวเตอร์ตั้งโต๊ะ Dell OptiPlex 7090",
    department: "แผนกคอมพิวเตอร์",
    warrantying: "15 วันข้างหน้า",
    status: "warning"
  },
  {
    id: "EQ015", 
    name: "เครื่องพิมพ์ HP LaserJet Pro 404dn",
    department: "แผนกบัญชี",
    warrantying: "7 วันข้างหน้า",
    status: "critical"
  },
  {
    id: "EQ032",
    name: "โน้ตบุ๊ค Lenovo ThinkPad E14",
    department: "แผนกบุคคล",
    warrantying: "1 เดือนข้างหน้า",
    status: "info"
  }
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            ภาพรวมระบบจัดการครุภัณฑ์คอมพิวเตอร์
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString('th-TH', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="ครุภัณฑ์ทั้งหมด"
          value="170"
          description="เครื่อง"
          icon={Monitor}
          trend={{ value: 5.2, isPositive: true }}
        />
        <StatsCard
          title="ใช้งานปกติ"
          value="145"
          description="85.3% ของทั้งหมด"
          icon={CheckCircle}
          trend={{ value: 2.1, isPositive: true }}
        />
        <StatsCard
          title="ต้องซ่อมบำรุง"
          value="20"
          description="11.8% ของทั้งหมด"
          icon={AlertTriangle}
          trend={{ value: 1.3, isPositive: false }}
        />
        <StatsCard
          title="หมดประกันในเดือนนี้"
          value="8"
          description="ต้องต่ออายุประกัน"
          icon={Clock}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <EquipmentStatusChart />
        <MonthlyTrendChart />
      </div>

      {/* Recent Activity and Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        
        {/* Warranty Warnings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              ครุภัณฑ์ใกล้หมดประกัน
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {warningEquipment.map((item) => (
              <div key={item.id} className="flex items-start justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-foreground">{item.id}</p>
                    <Badge 
                      variant={item.status === 'critical' ? 'destructive' : item.status === 'warning' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {item.status === 'critical' ? 'เร่งด่วน' : item.status === 'warning' ? 'เตือน' : 'ปกติ'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{item.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{item.department}</span>
                    <span>•</span>
                    <span className={item.status === 'critical' ? 'text-destructive font-medium' : ''}>
                      หมดประกันใน {item.warrantying}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}