import { supabase } from "@/integrations/supabase/client"
import type { User, UserInsert, UserUpdate } from "@/types/database"

export interface UserWithDepartment extends User {
  department_name?: string
  department_code?: string
}

export class UserService {
  // Get all users with department info
  static async getUsers(): Promise<UserWithDepartment[]> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('first_name')

      if (error) {
        console.error('Error fetching users:', error)
        throw error
      }

      if (!users || users.length === 0) {
        console.log('No users found, returning empty array')
        return []
      }

      // Get department info for each user
      const usersWithDepartment = await Promise.all(
        users.map(async (user) => {
          let departmentName: string | undefined = undefined
          let departmentCode: string | undefined = undefined

          if (user.department_id) {
            try {
              const { data: departmentData } = await supabase
                .from('departments')
                .select('name, code')
                .eq('id', user.department_id)
                .single()
              
              if (departmentData) {
                departmentName = departmentData.name
                departmentCode = departmentData.code
              }
            } catch (departmentError) {
              console.warn('Could not fetch department data for user:', user.id, departmentError)
            }
          }

          return {
            ...user,
            department_name: departmentName,
            department_code: departmentCode
          }
        })
      )

      return usersWithDepartment
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  }

  // Get single user by ID
  static async getUser(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    }
  }

  // Create new user
  static async createUser(user: UserInsert): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(user)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  // Update user
  static async updateUser(id: string, updates: UserUpdate): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  // Delete user (soft delete)
  static async deleteUser(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }

  // Search users
  static async searchUsers(query: string): Promise<UserWithDepartment[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,username.ilike.%${query}%,email.ilike.%${query}%`)
        .order('first_name')

      if (error) throw error

      if (!data || data.length === 0) {
        return []
      }

      // Get department info for search results
      const usersWithDepartment = await Promise.all(
        data.map(async (user) => {
          let departmentName: string | undefined = undefined
          let departmentCode: string | undefined = undefined

          if (user.department_id) {
            try {
              const { data: departmentData } = await supabase
                .from('departments')
                .select('name, code')
                .eq('id', user.department_id)
                .single()
              
              if (departmentData) {
                departmentName = departmentData.name
                departmentCode = departmentData.code
              }
            } catch (departmentError) {
              console.warn('Could not fetch department data for user:', user.id, departmentError)
            }
          }

          return {
            ...user,
            department_name: departmentName,
            department_code: departmentCode
          }
        })
      )

      return usersWithDepartment
    } catch (error) {
      console.error('Error searching users:', error)
      throw error
    }
  }

  // Get all departments for user assignment
  static async getDepartmentsForUser(): Promise<Array<{ id: string; name: string; code: string }>> {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.warn('Error fetching departments for user:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching departments for user:', error)
      return []
    }
  }

  // Check if username exists
  static async checkUsernameExists(username: string, excludeId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('users')
        .select('id')
        .eq('username', username)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error checking username:', error)
        return false
      }

      return (data && data.length > 0)
    } catch (error) {
      console.error('Error checking username:', error)
      return false
    }
  }

  // Check if email exists
  static async checkEmailExists(email: string, excludeId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('users')
        .select('id')
        .eq('email', email)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error checking email:', error)
        return false
      }

      return (data && data.length > 0)
    } catch (error) {
      console.error('Error checking email:', error)
      return false
    }
  }

  // Get users by role
  static async getUsersByRole(role: 'admin' | 'manager' | 'user'): Promise<UserWithDepartment[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', role)
        .eq('is_active', true)
        .order('first_name')

      if (error) throw error

      if (!data || data.length === 0) {
        return []
      }

      // Get department info
      const usersWithDepartment = await Promise.all(
        data.map(async (user) => {
          let departmentName: string | undefined = undefined
          let departmentCode: string | undefined = undefined

          if (user.department_id) {
            try {
              const { data: departmentData } = await supabase
                .from('departments')
                .select('name, code')
                .eq('id', user.department_id)
                .single()
              
              if (departmentData) {
                departmentName = departmentData.name
                departmentCode = departmentData.code
              }
            } catch (departmentError) {
              console.warn('Could not fetch department data for user:', user.id, departmentError)
            }
          }

          return {
            ...user,
            department_name: departmentName,
            department_code: departmentCode
          }
        })
      )

      return usersWithDepartment
    } catch (error) {
      console.error('Error fetching users by role:', error)
      throw error
    }
  }

  // Get equipment count for user
  static async getEquipmentCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true })
        .eq('current_user_id', userId)

      if (error) {
        console.warn('Error getting equipment count for user:', userId, error)
        return 0
      }
      return count || 0
    } catch (error) {
      console.warn('Error getting equipment count for user:', userId, error)
      return 0
    }
  }

  // Get borrow records count for user
  static async getBorrowCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true })
        .eq('current_user_id', userId)
        .eq('status', 'borrowed')

      if (error) {
        console.warn('Error getting borrow count for user:', userId, error)
        return 0
      }
      return count || 0
    } catch (error) {
      console.warn('Error getting borrow count for user:', userId, error)
      return 0
    }
  }

  // Get maintenance records count for user
  static async getMaintenanceCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true })
        .eq('current_user_id', userId)
        .eq('status', 'maintenance')

      if (error) {
        console.warn('Error getting maintenance count for user:', userId, error)
        return 0
      }
      return count || 0
    } catch (error) {
      console.warn('Error getting maintenance count for user:', userId, error)
      return 0
    }
  }

  // Get equipment assigned to a specific user
  static async getEquipmentByUser(userId: string): Promise<Array<{
    id: string
    equipment_code: string
    name: string
    type: string
    brand: string
    model: string
    serial_number: string
    status: string
    location?: string
    department_name?: string
    department_code?: string
  }>> {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select(`
          id,
          equipment_code,
          name,
          type,
          brand,
          model,
          serial_number,
          status,
          location,
          departments!inner(name, code)
        `)
        .eq('current_user_id', userId)
        .order('name')

      if (error) throw error

      return data.map(item => ({
        id: item.id,
        equipment_code: item.equipment_code,
        name: item.name,
        type: item.type,
        brand: item.brand,
        model: item.model,
        serial_number: item.serial_number,
        status: item.status,
        location: item.location,
        department_name: item.departments?.name,
        department_code: item.departments?.code
      }))
    } catch (error) {
      console.error('Error getting equipment by user:', error)
      return []
    }
  }
} 