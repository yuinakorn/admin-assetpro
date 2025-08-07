import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { EquipmentWithDetails } from "@/services/equipmentService"

interface ChartData {
  name: string
  count: number
  color: string
}

interface DepartmentEquipmentChartsProps {
  equipment: EquipmentWithDetails[]
}

// Helper function to generate colors
const generateColors = (count: number): string[] => {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
    '#14B8A6', '#F43F5E', '#A855F7', '#0EA5E9', '#22C55E'
  ]
  return colors.slice(0, count)
}

// Category Chart
export function CategoryChart({ equipment }: DepartmentEquipmentChartsProps) {
  const categoryData = equipment.reduce((acc, item) => {
    const category = item.category_name || 'ไม่ระบุ'
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData: ChartData[] = Object.entries(categoryData).map(([name, count], index) => ({
    name,
    count,
    color: generateColors(Object.keys(categoryData).length)[index]
  }))

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">ครุภัณฑ์ตามประเภท</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <div className="text-muted-foreground">ไม่มีข้อมูล</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">ครุภัณฑ์ตามประเภท</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="count"
              label={({ name, count, percent }) => 
                `${name}: ${count} (${(percent * 100).toFixed(0)}%)`
              }
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value, 'จำนวน']} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="grid grid-cols-1 gap-1 mt-4">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">
                {item.name} ({item.count})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Brand Chart
export function BrandChart({ equipment }: DepartmentEquipmentChartsProps) {
  const brandData = equipment.reduce((acc, item) => {
    const brand = item.brand || 'ไม่ระบุ'
    acc[brand] = (acc[brand] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData: ChartData[] = Object.entries(brandData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10) // Top 10 brands
    .map(([name, count], index) => ({
      name,
      count,
      color: generateColors(10)[index]
    }))

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">ครุภัณฑ์ตามยี่ห้อ (Top 10)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <div className="text-muted-foreground">ไม่มีข้อมูล</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">ครุภัณฑ์ตามยี่ห้อ (Top 10)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
              type="category"
            />
            <YAxis tick={{ fontSize: 12 }} type="number" />
            <Tooltip formatter={(value) => [value, 'จำนวน']} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#3B82F6">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// CPU Chart
export function CPUChart({ equipment }: DepartmentEquipmentChartsProps) {
  const cpuData = equipment.reduce((acc, item) => {
    const cpu = item.cpu_name || item.cpu_series || 'ไม่ระบุ'
    acc[cpu] = (acc[cpu] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData: ChartData[] = Object.entries(cpuData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8) // Top 8 CPUs
    .map(([name, count], index) => ({
      name: name.length > 20 ? name.substring(0, 20) + '...' : name,
      count,
      color: generateColors(8)[index]
    }))

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">CPU ที่ใช้ (Top 8)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <div className="text-muted-foreground">ไม่มีข้อมูล</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">CPU ที่ใช้ (Top 8)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={80}
              type="category"
            />
            <YAxis tick={{ fontSize: 12 }} type="number" />
            <Tooltip formatter={(value) => [value, 'จำนวน']} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#10B981">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// RAM Chart
export function RAMChart({ equipment }: DepartmentEquipmentChartsProps) {
  const ramData = equipment.reduce((acc, item) => {
    const ram = item.ram ? `${item.ram} GB` : 'ไม่ระบุ'
    acc[ram] = (acc[ram] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData: ChartData[] = Object.entries(ramData)
    .sort(([a], [b]) => {
      const aNum = parseInt(a) || 0
      const bNum = parseInt(b) || 0
      return aNum - bNum
    })
    .map(([name, count], index) => ({
      name,
      count,
      color: generateColors(Object.keys(ramData).length)[index]
    }))

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">RAM ที่ใช้</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <div className="text-muted-foreground">ไม่มีข้อมูล</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">RAM ที่ใช้</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="count"
              label={({ name, count, percent }) => 
                `${name}: ${count} (${(percent * 100).toFixed(0)}%)`
              }
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value, 'จำนวน']} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="grid grid-cols-2 gap-1 mt-4">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">
                {item.name} ({item.count})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// OS Chart
export function OSChart({ equipment }: DepartmentEquipmentChartsProps) {
  const osData = equipment.reduce((acc, item) => {
    const os = item.os_name || item.operating_system || 'ไม่ระบุ'
    acc[os] = (acc[os] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData: ChartData[] = Object.entries(osData)
    .sort(([,a], [,b]) => b - a)
    .map(([name, count], index) => ({
      name,
      count,
      color: generateColors(Object.keys(osData).length)[index]
    }))

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">ระบบปฏิบัติการ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <div className="text-muted-foreground">ไม่มีข้อมูล</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">ระบบปฏิบัติการ</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="count"
              label={({ name, count, percent }) => 
                `${name}: ${count} (${(percent * 100).toFixed(0)}%)`
              }
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value, 'จำนวน']} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="grid grid-cols-1 gap-1 mt-4">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">
                {item.name} ({item.count})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Office Chart
export function OfficeChart({ equipment }: DepartmentEquipmentChartsProps) {
  const officeData = equipment.reduce((acc, item) => {
    const office = item.office_name || 'ไม่ระบุ'
    acc[office] = (acc[office] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData: ChartData[] = Object.entries(officeData)
    .sort(([,a], [,b]) => b - a)
    .map(([name, count], index) => ({
      name,
      count,
      color: generateColors(Object.keys(officeData).length)[index]
    }))

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Office Software</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <div className="text-muted-foreground">ไม่มีข้อมูล</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Office Software</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
              type="category"
            />
            <YAxis tick={{ fontSize: 12 }} type="number" />
            <Tooltip formatter={(value) => [value, 'จำนวน']} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#8B5CF6">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Purchase Year Chart
export function PurchaseYearChart({ equipment }: DepartmentEquipmentChartsProps) {
  const yearData = equipment.reduce((acc, item) => {
    if (item.purchase_date) {
      const year = new Date(item.purchase_date).getFullYear().toString()
      acc[year] = (acc[year] || 0) + 1
    } else {
      acc['ไม่ระบุ'] = (acc['ไม่ระบุ'] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const chartData: ChartData[] = Object.entries(yearData)
    .sort(([a], [b]) => {
      if (a === 'ไม่ระบุ') return 1
      if (b === 'ไม่ระบุ') return -1
      return parseInt(a) - parseInt(b)
    })
    .map(([name, count], index) => ({
      name,
      count,
      color: name === 'ไม่ระบุ' ? '#9CA3AF' : generateColors(Object.keys(yearData).length)[index]
    }))

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">ครุภัณฑ์ตามปีที่ซื้อ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <div className="text-muted-foreground">ไม่มีข้อมูล</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">ครุภัณฑ์ตามปีที่ซื้อ</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
              type="category"
            />
            <YAxis tick={{ fontSize: 12 }} type="number" />
            <Tooltip formatter={(value) => [value, 'จำนวน']} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#F59E0B">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
} 