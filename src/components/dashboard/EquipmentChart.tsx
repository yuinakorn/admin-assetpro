import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { useEffect, useState } from "react"
import { DashboardService, EquipmentStatusData, MonthlyTrendData, EquipmentTypeData, EquipmentDepartmentData } from "@/services/dashboardService"

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

// New Donut Chart for Equipment Types
export function EquipmentTypeChart() {
  const [typeData, setTypeData] = useState<EquipmentTypeData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await DashboardService.getEquipmentByType()
        setTypeData(data)
      } catch (error) {
        console.error('Error fetching equipment type data:', error)
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
          <CardTitle className="text-lg font-semibold">จำนวนครุภัณฑ์ตามประเภท</CardTitle>
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">จำนวนครุภัณฑ์ตามประเภท</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={typeData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="count"
              label={({ type_label, count, percent }) => 
                `${type_label}: ${count} (${(percent * 100).toFixed(0)}%)`
              }
              labelLine={false}
            >
              {typeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [value, 'จำนวน']}
              labelFormatter={(label) => {
                const entry = typeData.find(item => item.type_label === label)
                return entry ? entry.type_label : label
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {typeData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">
                {item.type_label} ({item.count})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// New Bar Chart for Equipment by Department
export function EquipmentDepartmentChart() {
  const [departmentData, setDepartmentData] = useState<EquipmentDepartmentData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await DashboardService.getEquipmentByDepartment()
        setDepartmentData(data)
      } catch (error) {
        console.error('Error fetching equipment department data:', error)
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
          <CardTitle className="text-lg font-semibold">จำนวนครุภัณฑ์ตามแผนก</CardTitle>
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">จำนวนครุภัณฑ์ตามแผนก</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={departmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="department_code" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value) => [value, 'จำนวนครุภัณฑ์']}
              labelFormatter={(label) => {
                const dept = departmentData.find(item => item.department_code === label)
                return dept ? `${dept.department} (${dept.department_code})` : label
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {departmentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}