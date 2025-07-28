import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

const statusData = [
  { name: "ใช้งานปกติ", value: 145, color: "hsl(var(--success))" },
  { name: "ชำรุด", value: 12, color: "hsl(var(--destructive))" },
  { name: "ซ่อมบำรุง", value: 8, color: "hsl(var(--warning))" },
  { name: "จำหน่ายแล้ว", value: 5, color: "hsl(var(--muted-foreground))" },
]

const monthlyData = [
  { month: "ม.ค.", total: 142, damaged: 8, repaired: 5 },
  { month: "ก.พ.", total: 145, damaged: 12, repaired: 6 },
  { month: "มี.ค.", total: 148, damaged: 10, repaired: 8 },
  { month: "เม.ย.", total: 150, damaged: 15, repaired: 7 },
  { month: "พ.ค.", total: 155, damaged: 18, repaired: 12 },
  { month: "มิ.ย.", total: 170, damaged: 12, repaired: 9 },
]

export function EquipmentStatusChart() {
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
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function MonthlyTrendChart() {
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