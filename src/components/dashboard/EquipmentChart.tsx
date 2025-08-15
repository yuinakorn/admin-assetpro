import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList } from "recharts"
import { useEffect, useState } from "react"
import { DashboardService, EquipmentStatusData, MonthlyTrendData, EquipmentTypeData, EquipmentDepartmentData } from "@/services/dashboardService"
import { EquipmentWithDetails } from "@/services/equipmentService"
import { ChartFullscreen } from "@/components/ui/chart-fullscreen"

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

// Updated Equipment Type Chart that accepts filtered data
export function EquipmentTypeChart({ equipment }: { equipment?: EquipmentWithDetails[] }) {
  const [typeData, setTypeData] = useState<EquipmentTypeData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // If equipment data is provided, calculate from it, otherwise fetch from service
        if (equipment && equipment.length > 0) {
          // Calculate type data from filtered equipment
          const categoryCounts: Record<string, { name: string; code: string; count: number }> = {}
          
          equipment.forEach((item) => {
            if (item.category_name) {
              const categoryKey = item.category_name
              if (!categoryCounts[categoryKey]) {
                categoryCounts[categoryKey] = {
                  name: item.category_name,
                  code: item.category_name, // Use category_name as code if category_code is not available
                  count: 0
                }
              }
              categoryCounts[categoryKey].count++
            }
          })

          // Generate colors
          const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280', '#EC4899', '#14B8A6']

          const calculatedData = Object.values(categoryCounts).map((category, index) => ({
            type: category.code,
            type_label: category.name,
            count: category.count,
            color: colors[index % colors.length]
          }))

          setTypeData(calculatedData)
        } else {
          // Fallback to service data
          const data = await DashboardService.getEquipmentByType()
          setTypeData(data)
        }
      } catch (error) {
        console.error('Error fetching equipment type data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [equipment])

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

  if (typeData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">จำนวนครุภัณฑ์ตามประเภท</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">ไม่มีข้อมูล</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderChart = (height: number = 300) => (
    <>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={typeData}
            cx="50%"
            cy="50%"
            innerRadius={height > 300 ? 100 : 60}
            outerRadius={height > 300 ? 180 : 100}
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
      <div className={`grid ${height > 300 ? 'grid-cols-3' : 'grid-cols-2'} gap-2 mt-4`}>
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
    </>
  );

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">จำนวนครุภัณฑ์ตามประเภท</CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
        <ChartFullscreen title="จำนวนครุภัณฑ์ตามประเภท">
          {renderChart(600)}
        </ChartFullscreen>
      </CardContent>
    </Card>
  )
}

// Updated Equipment Department Chart that accepts filtered data
export function EquipmentDepartmentChart({ equipment }: { equipment?: EquipmentWithDetails[] }) {
  const [departmentData, setDepartmentData] = useState<EquipmentDepartmentData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // If equipment data is provided, calculate from it, otherwise fetch from service
        if (equipment && equipment.length > 0) {
          // Calculate department data from filtered equipment
          const deptCounts: Record<string, { name: string; code: string; count: number }> = {}
          
          equipment.forEach((item) => {
            if (item.department_name) {
              const deptKey = item.department_name
              if (!deptCounts[deptKey]) {
                deptCounts[deptKey] = {
                  name: item.department_name,
                  code: item.department_code || item.department_name,
                  count: 0
                }
              }
              deptCounts[deptKey].count++
            }
          })

          // Generate colors
          const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280', '#EC4899', '#14B8A6']

          const calculatedData = Object.values(deptCounts).map((dept, index) => ({
            department: dept.name,
            department_code: dept.code,
            count: dept.count,
            color: colors[index % colors.length]
          }))

          setDepartmentData(calculatedData)
        } else {
          // Fallback to service data
          const data = await DashboardService.getEquipmentByDepartment()
          setDepartmentData(data)
        }
      } catch (error) {
        console.error('Error fetching equipment department data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [equipment])

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

  if (departmentData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">จำนวนครุภัณฑ์ตามแผนก</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">ไม่มีข้อมูล</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderChart = (height: number = 300) => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={departmentData} margin={{ top: 20, right: 30, left: 20, bottom: height > 300 ? 10 : 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="department_code" 
          tick={{ fontSize: height > 300 ? 14 : 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis tick={{ fontSize: height > 300 ? 14 : 12 }} />
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
          <LabelList 
            dataKey="count" 
            position="top" 
            fill="#374151" 
            fontSize={height > 300 ? 13 : 11}
            formatter={(value) => `${value}`}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">จำนวนครุภัณฑ์ตามแผนก</CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
        <ChartFullscreen title="จำนวนครุภัณฑ์ตามแผนก">
          {renderChart(600)}
        </ChartFullscreen>
      </CardContent>
    </Card>
  )
}