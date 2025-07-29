import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { useEffect, useState } from "react"
import { DashboardService, EquipmentStatusData, MonthlyTrendData } from "@/services/dashboardService"

export function EquipmentStatusChart() {
  const [statusData, setStatusData] = useState<EquipmentStatusData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await DashboardService.getEquipmentStatusData()
        setStatusData(data)
      } catch (error) {
        console.error('Error fetching status data:', error)
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
          <CardTitle className="text-lg font-semibold">สถานะครุภัณฑ์</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <div className="text-muted-foreground">กำลังโหลด...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">สถานะครุภัณฑ์</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="count"
              label={({ status, count }) => `${status} ${count}`}
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [value, 'จำนวน']} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function MonthlyTrendChart() {
  const [monthlyData, setMonthlyData] = useState<MonthlyTrendData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await DashboardService.getMonthlyTrendData()
        setMonthlyData(data)
      } catch (error) {
        console.error('Error fetching monthly data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">แนวโน้มครุภัณฑ์รายเดือน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">กำลังโหลด...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">แนวโน้มครุภัณฑ์รายเดือน</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" name="ครุภัณฑ์ทั้งหมด" fill="hsl(var(--primary))" />
            <Bar dataKey="damaged" name="ชำรุด" fill="hsl(var(--destructive))" />
            <Bar dataKey="repaired" name="ซ่อมบำรุง" fill="hsl(var(--warning))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}