import { supabase } from "@/integrations/supabase/client"
import type { Department, DepartmentInsert, DepartmentUpdate } from "@/types/database"

export interface DepartmentWithStats extends Department {
  employee_count: number
  equipment_count: number
  manager_name?: string
}

export class DepartmentService {
  // Get all departments with stats
  static async getDepartments(): Promise<DepartmentWithStats[]> {
    try {
      // First, try to get departments without join to see if basic query works
      const { data: departments, error } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Error fetching departments:', error)
        throw error
      }

      if (!departments || departments.length === 0) {
        console.log('No departments found, returning empty array')
        return []
      }

      // Get employee and equipment counts for each department
      const departmentsWithStats = await Promise.all(
        departments.map(async (dept) => {
          const [employeeCount, equipmentCount] = await Promise.all([
            this.getEmployeeCount(dept.id),
            this.getEquipmentCount(dept.id)
          ])

          // Try to get manager name if manager_id exists
          let managerName: string | undefined = undefined
          if (dept.manager_id) {
            try {
              const { data: managerData } = await supabase
                .from('users')
                .select('first_name, last_name')
                .eq('id', dept.manager_id)
                .single()
              
              if (managerData) {
                managerName = `${managerData.first_name} ${managerData.last_name}`
              }
            } catch (managerError) {
              console.warn('Could not fetch manager data for department:', dept.id, managerError)
            }
          }

          return {
            ...dept,
            employee_count: employeeCount,
            equipment_count: equipmentCount,
            manager_name: managerName
          }
        })
      )

      return departmentsWithStats
    } catch (error) {
      console.error('Error fetching departments:', error)
      throw error
    }
  }

  // Get single department by ID
  static async getDepartment(id: string): Promise<Department | null> {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching department:', error)
      throw error
    }
  }

  // Create new department
  static async createDepartment(department: DepartmentInsert): Promise<Department> {
    try {
      const { data, error } = await supabase
        .from('departments')
        .insert(department)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating department:', error)
      throw error
    }
  }

  // Update department
  static async updateDepartment(id: string, updates: DepartmentUpdate): Promise<Department> {
    try {
      const { data, error } = await supabase
        .from('departments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating department:', error)
      throw error
    }
  }

  // Delete department (soft delete)
  static async deleteDepartment(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('departments')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting department:', error)
      throw error
    }
  }

  // Get employee count for department
  private static async getEmployeeCount(departmentId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('department_id', departmentId)
        .eq('is_active', true)

      if (error) {
        console.warn('Error getting employee count for department:', departmentId, error)
        return 0
      }
      return count || 0
    } catch (error) {
      console.warn('Error getting employee count for department:', departmentId, error)
      return 0
    }
  }

  // Get equipment count for department
  private static async getEquipmentCount(departmentId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true })
        .eq('department_id', departmentId)

      if (error) {
        console.warn('Error getting equipment count for department:', departmentId, error)
        return 0
      }
      return count || 0
    } catch (error) {
      console.warn('Error getting equipment count for department:', departmentId, error)
      return 0
    }
  }

  // Get all users for manager selection
  static async getUsersForManager(): Promise<Array<{ id: string; name: string; role: string }>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, role')
        .eq('is_active', true)
        .in('role', ['admin', 'manager'])
        .order('first_name')

      if (error) {
        console.warn('Error fetching users for manager:', error)
        return []
      }

      return data.map(user => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role
      }))
    } catch (error) {
      console.error('Error fetching users for manager:', error)
      return []
    }
  }

  // Search departments
  static async searchDepartments(query: string): Promise<DepartmentWithStats[]> {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
        .eq('is_active', true)
        .order('name')

      if (error) throw error

      if (!data || data.length === 0) {
        return []
      }

      // Get stats for search results
      const departmentsWithStats = await Promise.all(
        data.map(async (dept) => {
          const [employeeCount, equipmentCount] = await Promise.all([
            this.getEmployeeCount(dept.id),
            this.getEquipmentCount(dept.id)
          ])

          // Try to get manager name if manager_id exists
          let managerName: string | undefined = undefined
          if (dept.manager_id) {
            try {
              const { data: managerData } = await supabase
                .from('users')
                .select('first_name, last_name')
                .eq('id', dept.manager_id)
                .single()
              
              if (managerData) {
                managerName = `${managerData.first_name} ${managerData.last_name}`
              }
            } catch (managerError) {
              console.warn('Could not fetch manager data for department:', dept.id, managerError)
            }
          }

          return {
            ...dept,
            employee_count: employeeCount,
            equipment_count: equipmentCount,
            manager_name: managerName
          }
        })
      )

      return departmentsWithStats
    } catch (error) {
      console.error('Error searching departments:', error)
      throw error
    }
  }
} 