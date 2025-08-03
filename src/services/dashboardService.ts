import { supabase } from "@/integrations/supabase/client"
import type { EquipmentStatus, ActivityType } from "@/types/database"

export interface DashboardStats {
  total_equipment: number
  normal_equipment: number
  maintenance_equipment: number
  damaged_equipment: number
  disposed_equipment: number
  borrowed_equipment: number
  total_users: number
  total_departments: number
  total_equipment_types: number
  expiring_warranty: number
  expired_warranty: number
}

export interface EquipmentStatusData {
  status: string
  count: number
  percentage: number
  color: string
}

export interface MonthlyTrendData {
  month: string
  total: number
  damaged: number
  repaired: number
}

export interface RecentActivityData {
  id: string
  type: string
  title: string
  description: string
  user: string
  time: string
  status: 'success' | 'warning' | 'error' | 'info'
  icon: string
}

export interface WarrantyWarningData {
  id: string
  name: string
  department: string
  warrantying: string
  status: 'critical' | 'warning' | 'info'
}

// Equipment type statistics interface
export interface EquipmentTypeData {
  type: string
  type_label: string
  count: number
  color: string
}

// Equipment by department interface
export interface EquipmentDepartmentData {
  department: string
  department_code: string
  count: number
  color: string
}

export class DashboardService {
  // Get dashboard statistics
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get equipment data
      const { data: equipment, error: equipmentError } = await supabase
        .from('equipment')
        .select('status, warranty_date, type')

      if (equipmentError) throw equipmentError

      // Get users count
      const { count: usersCount, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      if (usersError) {
        console.warn('Error counting users:', usersError)
      }

      // Get departments count
      const { count: departmentsCount, error: departmentsError } = await supabase
        .from('departments')
        .select('*', { count: 'exact', head: true })

      if (departmentsError) {
        console.warn('Error counting departments:', departmentsError)
      }

      // Get unique equipment types count
      const uniqueTypes = new Set(equipment.map(item => item.type))
      const totalEquipmentTypes = uniqueTypes.size

      const now = new Date()
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)

      const stats = {
        total_equipment: equipment.length,
        normal_equipment: equipment.filter(item => item.status === 'normal').length,
        maintenance_equipment: equipment.filter(item => item.status === 'maintenance').length,
        damaged_equipment: equipment.filter(item => item.status === 'damaged').length,
        disposed_equipment: equipment.filter(item => item.status === 'disposed').length,
        borrowed_equipment: equipment.filter(item => item.status === 'borrowed').length,
        total_users: usersCount || 0,
        total_departments: departmentsCount || 0,
        total_equipment_types: totalEquipmentTypes,
        expiring_warranty: equipment.filter(item => {
          if (!item.warranty_date) return false
          const warrantyDate = new Date(item.warranty_date)
          return warrantyDate > now && warrantyDate <= thirtyDaysFromNow
        }).length,
        expired_warranty: equipment.filter(item => {
          if (!item.warranty_date) return false
          const warrantyDate = new Date(item.warranty_date)
          return warrantyDate <= now
        }).length
      }

      return stats
    } catch (error) {
      console.error('Error getting dashboard stats:', error)
      return {
        total_equipment: 0,
        normal_equipment: 0,
        maintenance_equipment: 0,
        damaged_equipment: 0,
        disposed_equipment: 0,
        borrowed_equipment: 0,
        total_users: 0,
        total_departments: 0,
        total_equipment_types: 0,
        expiring_warranty: 0,
        expired_warranty: 0
      }
    }
  }

  // Get equipment status chart data
  static async getEquipmentStatusData(): Promise<EquipmentStatusData[]> {
    try {
      const { data: equipment, error } = await supabase
        .from('equipment')
        .select('status')

      if (error) throw error

      const statusCounts = equipment.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const total = equipment.length
      const statusColors = {
        normal: 'hsl(var(--success))',
        maintenance: 'hsl(var(--warning))',
        damaged: 'hsl(var(--destructive))',
        disposed: 'hsl(var(--muted-foreground))',
        borrowed: 'hsl(var(--primary))'
      }

      const statusLabels = {
        normal: 'ใช้งานปกติ',
        maintenance: 'ซ่อมบำรุง',
        damaged: 'ชำรุด',
        disposed: 'จำหน่ายแล้ว',
        borrowed: 'เบิกแล้ว'
      }

      return Object.entries(statusCounts).map(([status, count]) => ({
        status: statusLabels[status as EquipmentStatus] || status,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: statusColors[status as EquipmentStatus] || 'hsl(var(--muted))'
      }))
    } catch (error) {
      console.error('Error getting equipment status data:', error)
      return []
    }
  }

  // Get monthly trend data
  static async getMonthlyTrendData(): Promise<MonthlyTrendData[]> {
    try {
      // Get equipment created in the last 6 months
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      const { data: equipment, error } = await supabase
        .from('equipment')
        .select('created_at, status')
        .gte('created_at', sixMonthsAgo.toISOString())

      if (error) throw error

      // Group by month
      const monthlyData: Record<string, { total: number; damaged: number; repaired: number }> = {}
      
      equipment.forEach(item => {
        const date = new Date(item.created_at)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { total: 0, damaged: 0, repaired: 0 }
        }
        
        monthlyData[monthKey].total++
        
        if (item.status === 'damaged') {
          monthlyData[monthKey].damaged++
        } else if (item.status === 'maintenance') {
          monthlyData[monthKey].repaired++
        }
      })

      // Convert to array and format
      const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
      
      return Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([monthKey, data]) => {
          const [year, month] = monthKey.split('-')
          const monthIndex = parseInt(month) - 1
          return {
            month: thaiMonths[monthIndex],
            total: data.total,
            damaged: data.damaged,
            repaired: data.repaired
          }
        })
    } catch (error) {
      console.error('Error getting monthly trend data:', error)
      return []
    }
  }

  // Get recent activities
  static async getRecentActivities(): Promise<RecentActivityData[]> {
    try {
      // For now, return sample data since the equipment_history table isn't properly typed
      // This can be implemented later when the database schema is properly set up
      console.log('Recent activities feature not yet implemented - equipment_history table not available')
      
      // Return sample data for demonstration
      return [
        {
          id: '1',
          type: 'add',
          title: 'เพิ่มครุภัณฑ์ใหม่',
          description: 'คอมพิวเตอร์ตั้งโต๊ะ Dell OptiPlex 7090',
          user: 'ผู้ดูแล ระบบ',
          time: '2 นาทีที่แล้ว',
          status: 'success' as const,
          icon: 'Monitor'
        },
        {
          id: '2',
          type: 'maintenance',
          title: 'แจ้งซ่อม',
          description: 'เครื่องพิมพ์ HP LaserJet Pro 404dn',
          user: 'มานี สบายดี',
          time: '15 นาทีที่แล้ว',
          status: 'warning' as const,
          icon: 'AlertTriangle'
        },
        {
          id: '3',
          type: 'update',
          title: 'แก้ไขข้อมูล',
          description: 'โน้ตบุ๊ค Lenovo ThinkPad E14',
          user: 'สมชาย ใจดี',
          time: '1 ชั่วโมงที่แล้ว',
          status: 'success' as const,
          icon: 'CheckCircle'
        }
      ]
    } catch (error) {
      console.error('Error getting recent activities:', error)
      return []
    }
  }

  // Get warranty warnings
  static async getWarrantyWarnings(): Promise<WarrantyWarningData[]> {
    try {
      const now = new Date()
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)

      const { data: equipment, error } = await supabase
        .from('equipment')
        .select(`
          id,
          name,
          warranty_date,
          department_id
        `)
        .not('warranty_date', 'is', null)
        .lte('warranty_date', sixtyDaysFromNow.toISOString())
        .order('warranty_date', { ascending: true })
        .limit(10)

      if (error) throw error

      // Get department names
      const departmentIds = [...new Set(equipment.map(item => item.department_id).filter(Boolean))]
      const { data: departments } = await supabase
        .from('departments')
        .select('id, name')
        .in('id', departmentIds)

      const departmentMap = new Map(departments?.map(dept => [dept.id, dept.name]) || [])

      return equipment.map(item => {
        const warrantyDate = new Date(item.warranty_date!)
        const daysUntilExpiry = Math.ceil((warrantyDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        let status: 'critical' | 'warning' | 'info' = 'info'
        let warrantying = ''

        if (daysUntilExpiry <= 0) {
          status = 'critical'
          warrantying = 'หมดประกันแล้ว'
        } else if (daysUntilExpiry <= 7) {
          status = 'critical'
          warrantying = `${daysUntilExpiry} วันข้างหน้า`
        } else if (daysUntilExpiry <= 30) {
          status = 'warning'
          warrantying = `${daysUntilExpiry} วันข้างหน้า`
        } else {
          status = 'info'
          warrantying = `${daysUntilExpiry} วันข้างหน้า`
        }

        return {
          id: item.id,
          name: item.name,
          department: departmentMap.get(item.department_id!) || 'ไม่ระบุ',
          warrantying,
          status
        }
      })
    } catch (error) {
      console.error('Error getting warranty warnings:', error)
      return []
    }
  }

  // Get equipment statistics by type for donut chart
  static async getEquipmentByType(): Promise<EquipmentTypeData[]> {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('type')
        .eq('status', 'normal') // Only count active equipment

      if (error) throw error

      // Count by type
      const typeCounts: Record<string, number> = {}
      data.forEach(item => {
        typeCounts[item.type] = (typeCounts[item.type] || 0) + 1
      })

      // Type labels and colors
      const typeConfig = {
        computer: { label: 'คอมพิวเตอร์', color: '#3B82F6' },
        laptop: { label: 'โน้ตบุ๊ค', color: '#10B981' },
        monitor: { label: 'จอภาพ', color: '#8B5CF6' },
        printer: { label: 'เครื่องพิมพ์', color: '#F59E0B' },
        ups: { label: 'UPS', color: '#EF4444' },
        network_device: { label: 'อุปกรณ์เครือข่าย', color: '#6B7280' }
      }

      return Object.entries(typeCounts).map(([type, count]) => ({
        type,
        type_label: typeConfig[type as keyof typeof typeConfig]?.label || type,
        count,
        color: typeConfig[type as keyof typeof typeConfig]?.color || '#94A3B8'
      }))

    } catch (error) {
      console.error('Error fetching equipment by type:', error)
      return []
    }
  }

  // Get equipment statistics by department for bar chart
  static async getEquipmentByDepartment(): Promise<EquipmentDepartmentData[]> {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select(`
          department_id,
          departments(name, code)
        `)

      if (error) throw error

      // Count by department
      const deptCounts: Record<string, { name: string; code: string; count: number }> = {}
      
      data.forEach(item => {
        if (item.departments) {
          const deptKey = item.departments.name
          if (!deptCounts[deptKey]) {
            deptCounts[deptKey] = {
              name: item.departments.name,
              code: item.departments.code,
              count: 0
            }
          }
          deptCounts[deptKey].count++
        }
      })

      // Generate colors
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280', '#EC4899', '#14B8A6']

      return Object.values(deptCounts).map((dept, index) => ({
        department: dept.name,
        department_code: dept.code,
        count: dept.count,
        color: colors[index % colors.length]
      }))

    } catch (error) {
      console.error('Error fetching equipment by department:', error)
      return []
    }
  }

  // Helper methods
  private static getActivityType(actionType: string, fieldName?: string): { type: string; title: string } {
    switch (actionType) {
      case 'create':
        return { type: 'add', title: 'เพิ่มครุภัณฑ์ใหม่' }
      case 'update':
        if (fieldName === 'status') {
          return { type: 'status_change', title: 'เปลี่ยนสถานะ' }
        } else if (fieldName === 'current_user_id') {
          return { type: 'assignment', title: 'มอบหมายครุภัณฑ์' }
        }
        return { type: 'update', title: 'แก้ไขข้อมูล' }
      case 'delete':
        return { type: 'delete', title: 'ลบครุภัณฑ์' }
      default:
        return { type: 'other', title: 'กิจกรรมอื่นๆ' }
    }
  }

  private static getActivityStatus(actionType: string): 'success' | 'warning' | 'error' | 'info' {
    switch (actionType) {
      case 'create':
      case 'update':
        return 'success'
      case 'delete':
        return 'error'
      default:
        return 'info'
    }
  }

  private static getActivityIcon(actionType: string): string {
    switch (actionType) {
      case 'create':
        return 'Monitor'
      case 'update':
        return 'CheckCircle'
      case 'delete':
        return 'XCircle'
      default:
        return 'Clock'
    }
  }

  private static getTimeAgo(dateString: string): string {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) {
      return 'เมื่อสักครู่'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} นาทีที่แล้ว`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} ชั่วโมงที่แล้ว`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days} วันที่แล้ว`
    }
  }
}