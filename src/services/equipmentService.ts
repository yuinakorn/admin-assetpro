import { supabase } from "@/integrations/supabase/client"
import type { Equipment, EquipmentInsert, EquipmentUpdate } from "@/types/database"

export interface EquipmentWithDetails extends Equipment {
  department_name?: string
  department_code?: string
  assigned_user_name?: string
  status_text?: string
  type_text?: string
}

export class EquipmentService {
  // Get all equipment with details
  static async getEquipment(): Promise<EquipmentWithDetails[]> {
    try {
      const { data: equipment, error } = await supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching equipment:', error)
        throw error
      }

      if (!equipment || equipment.length === 0) {
        console.log('No equipment found, returning empty array')
        return []
      }

      // Get additional details for each equipment
      const equipmentWithDetails = await Promise.all(
        equipment.map(async (item) => {
          let departmentName: string | undefined = undefined
          let departmentCode: string | undefined = undefined
          let assignedUserName: string | undefined = undefined

          // Get department info
          if (item.department_id) {
            try {
              const { data: departmentData } = await supabase
                .from('departments')
                .select('name, code')
                .eq('id', item.department_id)
                .single()
              
              if (departmentData) {
                departmentName = departmentData.name
                departmentCode = departmentData.code
              }
            } catch (departmentError) {
              console.warn('Could not fetch department data for equipment:', item.id, departmentError)
            }
          }

          // Get assigned user info
          if (item.current_user_id) {
            try {
              const { data: userData } = await supabase
                .from('users')
                .select('first_name, last_name')
                .eq('id', item.current_user_id)
                .single()
              
              if (userData) {
                assignedUserName = `${userData.first_name} ${userData.last_name}`
              }
            } catch (userError) {
              console.warn('Could not fetch user data for equipment:', item.id, userError)
            }
          }

          return {
            ...item,
            department_name: departmentName,
            department_code: departmentCode,
            assigned_user_name: assignedUserName,
            status_text: this.getStatusText(item.status),
            type_text: this.getTypeText(item.type)
          }
        })
      )

      return equipmentWithDetails
    } catch (error) {
      console.error('Error fetching equipment:', error)
      throw error
    }
  }

  // Get single equipment by ID
  static async getEquipmentById(id: string): Promise<Equipment | null> {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching equipment:', error)
      throw error
    }
  }

  // Generate unique equipment code
  static async generateEquipmentCode(): Promise<string> {
    try {
      // Get the latest equipment code to determine the next number
      const { data, error } = await supabase
        .from('equipment')
        .select('equipment_code')
        .order('equipment_code', { ascending: false })
        .limit(1)

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.warn('Error fetching equipment codes:', error)
      }

      let nextNumber = 1
      if (data && data.length > 0 && data[0].equipment_code) {
        // Extract number from equipment code (e.g., "EQ001" -> 1)
        const match = data[0].equipment_code.match(/^EQ(\d+)$/)
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1
        }
      }

      // Format with leading zeros (e.g., 1 -> "EQ001")
      return `EQ${nextNumber.toString().padStart(3, '0')}`
    } catch (error) {
      console.error('Error generating equipment code:', error)
      // Fallback: use timestamp-based code
      return `EQ${Date.now().toString().slice(-6)}`
    }
  }

  // Create new equipment
  static async createEquipment(equipment: EquipmentInsert): Promise<Equipment> {
    try {
      // Generate equipment code if not provided
      const equipmentCode = await this.generateEquipmentCode()
      
      // Get current user ID safely
      const currentUser = (await supabase.auth.getUser()).data.user
      let createdBy = null
      let updatedBy = null
      
      // Only set created_by/updated_by if we can verify the user exists in local DB
      if (currentUser?.id) {
        try {
          const { data: userExists } = await supabase
            .from('users')
            .select('id')
            .eq('id', currentUser.id)
            .single()
          
          if (userExists) {
            createdBy = currentUser.id
            updatedBy = currentUser.id
          }
        } catch (error) {
          console.warn('User not found in local database, proceeding without created_by/updated_by')
        }
      }
      
      const equipmentData = {
        ...equipment,
        equipment_code: equipmentCode,
        created_by: createdBy,
        updated_by: updatedBy,
      }

      const { data, error } = await supabase
        .from('equipment')
        .insert(equipmentData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating equipment:', error)
      throw error
    }
  }

  // Update equipment
  static async updateEquipment(id: string, updates: EquipmentUpdate): Promise<Equipment> {
    try {
      // Get current user ID safely
      const currentUser = (await supabase.auth.getUser()).data.user
      let updatedBy = null
      
      // Only set updated_by if we can verify the user exists in local DB
      if (currentUser?.id) {
        try {
          const { data: userExists } = await supabase
            .from('users')
            .select('id')
            .eq('id', currentUser.id)
            .single()
          
          if (userExists) {
            updatedBy = currentUser.id
          }
        } catch (error) {
          console.warn('User not found in local database for update')
        }
      }

      const updateData = {
        ...updates,
        updated_by: updatedBy,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('equipment')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating equipment:', error)
      throw error
    }
  }

  // Delete equipment (soft delete)
  static async deleteEquipment(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting equipment:', error)
      throw error
    }
  }

  // Search equipment
  static async searchEquipment(query: string): Promise<EquipmentWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%,model.ilike.%${query}%,serial_number.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (!data || data.length === 0) {
        return []
      }

      // Get additional details for search results
      const equipmentWithDetails = await Promise.all(
        data.map(async (item) => {
          let departmentName: string | undefined = undefined
          let departmentCode: string | undefined = undefined
          let assignedUserName: string | undefined = undefined

          // Get department info
          if (item.department_id) {
            try {
              const { data: departmentData } = await supabase
                .from('departments')
                .select('name, code')
                .eq('id', item.department_id)
                .single()
              
              if (departmentData) {
                departmentName = departmentData.name
                departmentCode = departmentData.code
              }
            } catch (departmentError) {
              console.warn('Could not fetch department data for equipment:', item.id, departmentError)
            }
          }

          // Get assigned user info
          if (item.current_user_id) {
            try {
              const { data: userData } = await supabase
                .from('users')
                .select('first_name, last_name')
                .eq('id', item.current_user_id)
                .single()
              
              if (userData) {
                assignedUserName = `${userData.first_name} ${userData.last_name}`
              }
            } catch (userError) {
              console.warn('Could not fetch user data for equipment:', item.id, userError)
            }
          }

          return {
            ...item,
            department_name: departmentName,
            department_code: departmentCode,
            assigned_user_name: assignedUserName,
            status_text: this.getStatusText(item.status),
            type_text: this.getTypeText(item.type)
          }
        })
      )

      return equipmentWithDetails
    } catch (error) {
      console.error('Error searching equipment:', error)
      throw error
    }
  }

  // Get equipment by status
  static async getEquipmentByStatus(status: string): Promise<EquipmentWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (!data || data.length === 0) {
        return []
      }

      // Get additional details
      const equipmentWithDetails = await Promise.all(
        data.map(async (item) => {
          let departmentName: string | undefined = undefined
          let departmentCode: string | undefined = undefined
          let assignedUserName: string | undefined = undefined

          if (item.department_id) {
            try {
              const { data: departmentData } = await supabase
                .from('departments')
                .select('name, code')
                .eq('id', item.department_id)
                .single()
              
              if (departmentData) {
                departmentName = departmentData.name
                departmentCode = departmentData.code
              }
            } catch (departmentError) {
              console.warn('Could not fetch department data for equipment:', item.id, departmentError)
            }
          }

          if (item.current_user_id) {
            try {
              const { data: userData } = await supabase
                .from('users')
                .select('first_name, last_name')
                .eq('id', item.current_user_id)
                .single()
              
              if (userData) {
                assignedUserName = `${userData.first_name} ${userData.last_name}`
              }
            } catch (userError) {
              console.warn('Could not fetch user data for equipment:', item.id, userError)
            }
          }

          return {
            ...item,
            department_name: departmentName,
            department_code: departmentCode,
            assigned_user_name: assignedUserName,
            status_text: this.getStatusText(item.status),
            type_text: this.getTypeText(item.type)
          }
        })
      )

      return equipmentWithDetails
    } catch (error) {
      console.error('Error fetching equipment by status:', error)
      throw error
    }
  }

  // Get all departments for equipment assignment
  static async getDepartmentsForEquipment(): Promise<Array<{ id: string; name: string; code: string }>> {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.warn('Error fetching departments for equipment:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching departments for equipment:', error)
      return []
    }
  }

  // Get all users for equipment assignment
  static async getUsersForEquipment(): Promise<Array<{ id: string; name: string; role: string }>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, role')
        .eq('is_active', true)
        .order('first_name')

      if (error) {
        console.warn('Error fetching users for equipment:', error)
        return []
      }

      return data.map(user => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role
      }))
    } catch (error) {
      console.error('Error fetching users for equipment:', error)
      return []
    }
  }

  // Check if serial number exists
  static async checkSerialNumberExists(serialNumber: string, excludeId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('equipment')
        .select('id')
        .eq('serial_number', serialNumber)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error checking serial number:', error)
        return false
      }

      return (data && data.length > 0)
    } catch (error) {
      console.error('Error checking serial number:', error)
      return false
    }
  }

  // Get equipment statistics
  static async getEquipmentStats(): Promise<{
    total: number
    normal: number
    maintenance: number
    damaged: number
    disposed: number
    borrowed: number
  }> {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('status')

      if (error) throw error

      const stats = {
        total: data.length,
        normal: data.filter(item => item.status === 'normal').length,
        maintenance: data.filter(item => item.status === 'maintenance').length,
        damaged: data.filter(item => item.status === 'damaged').length,
        disposed: data.filter(item => item.status === 'disposed').length,
        borrowed: data.filter(item => item.status === 'borrowed').length
      }

      return stats
    } catch (error) {
      console.error('Error getting equipment stats:', error)
      return {
        total: 0,
        normal: 0,
        maintenance: 0,
        damaged: 0,
        disposed: 0,
        borrowed: 0
      }
    }
  }

  // Get equipment history
  static async getEquipmentHistory(equipmentId: string): Promise<Array<{
    id: string
    action_type: string
    field_name?: string
    old_value?: string
    new_value?: string
    change_reason?: string
    created_at: string
    changed_by_name?: string
    changed_by_role?: string
  }>> {
    try {
      const { data, error } = await supabase
        .from('equipment_history')
        .select(`
          id,
          action_type,
          field_name,
          old_value,
          new_value,
          change_reason,
          created_at,
          changed_by,
          users!inner(first_name, last_name, role)
        `)
        .eq('equipment_id', equipmentId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Process the data to convert UUIDs to names for assignment fields  
      const processedData = await Promise.all(
        (data || []).map(async (item) => {
          let oldValue = item.old_value
          let newValue = item.new_value

          // Convert UUIDs to names for assignment fields
          if (item.field_name === 'current_user_id') {
            if (oldValue) {
              try {
                const { data: oldUser } = await supabase
                  .from('users')
                  .select('first_name, last_name')
                  .eq('id', oldValue)
                  .single()
                oldValue = oldUser ? `${oldUser.first_name} ${oldUser.last_name}` : 'ไม่ระบุ'
              } catch (error) {
                oldValue = 'ไม่ระบุ'
              }
            }

            if (newValue) {
              try {
                const { data: newUser } = await supabase
                  .from('users')
                  .select('first_name, last_name')
                  .eq('id', newValue)
                  .single()
                newValue = newUser ? `${newUser.first_name} ${newUser.last_name}` : 'ไม่ระบุ'
              } catch (error) {
                newValue = 'ไม่ระบุ'
              }
            }
          }

          // Convert UUIDs to department names
          if (item.field_name === 'department_id') {
            if (oldValue) {
              try {
                const { data: oldDept } = await supabase
                  .from('departments')
                  .select('name, code')
                  .eq('id', oldValue)
                  .single()
                oldValue = oldDept ? `${oldDept.name} (${oldDept.code})` : 'ไม่ระบุ'
              } catch (error) {
                oldValue = 'ไม่ระบุ'
              }
            }

            if (newValue) {
              try {
                const { data: newDept } = await supabase
                  .from('departments')
                  .select('name, code')
                  .eq('id', newValue)
                  .single()
                newValue = newDept ? `${newDept.name} (${newDept.code})` : 'ไม่ระบุ'
              } catch (error) {
                newValue = 'ไม่ระบุ'
              }
            }
          }

          return {
            id: item.id,
            action_type: item.action_type,
            field_name: item.field_name,
            old_value: oldValue,
            new_value: newValue,
            change_reason: item.change_reason,
            created_at: item.created_at,
            changed_by_name: item.users ? `${item.users.first_name} ${item.users.last_name}` : undefined,
            changed_by_role: item.users?.role
          }
        })
      )

      return processedData
    } catch (error) {
      console.error('Error getting equipment history:', error)
      return []
    }
  }

  // Get all equipment history (for history page)
  static async getAllEquipmentHistory(): Promise<Array<{
    id: string
    equipment_id: string
    equipment_name: string
    equipment_code: string
    action_type: string
    field_name?: string
    old_value?: string
    new_value?: string
    change_reason?: string
    created_at: string
    changed_by_name?: string
    changed_by_role?: string
  }>> {
    try {
      const { data, error } = await supabase
        .from('equipment_history')
        .select(`
          id,
          equipment_id,
          action_type,
          field_name,
          old_value,
          new_value,
          change_reason,
          created_at,
          changed_by,
          users!inner(first_name, last_name, role)
        `)
        .order('created_at', { ascending: false })
        .limit(1000) // Limit to prevent performance issues

      if (error) throw error

      // Get equipment details for all history items
      const equipmentIds = [...new Set((data || []).map(item => item.equipment_id))]
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('id, name, equipment_code')
        .in('id', equipmentIds)

      if (equipmentError) {
        console.warn('Could not fetch equipment details:', equipmentError)
      }

      const equipmentMap = new Map(
        (equipmentData || []).map(eq => [eq.id, { name: eq.name, code: eq.equipment_code }])
      )

      // Process the data to convert UUIDs to names for assignment fields
      const processedData = await Promise.all(
        (data || []).map(async (item) => {
          let oldValue = item.old_value
          let newValue = item.new_value

          // Convert UUIDs to names for assignment fields
          if (item.field_name === 'current_user_id') {
            if (oldValue) {
              try {
                const { data: oldUser } = await supabase
                  .from('users')
                  .select('first_name, last_name')
                  .eq('id', oldValue)
                  .single()
                oldValue = oldUser ? `${oldUser.first_name} ${oldUser.last_name}` : 'ไม่ระบุ'
              } catch (error) {
                oldValue = 'ไม่ระบุ'
              }
            }

            if (newValue) {
              try {
                const { data: newUser } = await supabase
                  .from('users')
                  .select('first_name, last_name')
                  .eq('id', newValue)
                  .single()
                newValue = newUser ? `${newUser.first_name} ${newUser.last_name}` : 'ไม่ระบุ'
              } catch (error) {
                newValue = 'ไม่ระบุ'
              }
            }
          }

          // Convert UUIDs to department names
          if (item.field_name === 'department_id') {
            if (oldValue) {
              try {
                const { data: oldDept } = await supabase
                  .from('departments')
                  .select('name, code')
                  .eq('id', oldValue)
                  .single()
                oldValue = oldDept ? `${oldDept.name} (${oldDept.code})` : 'ไม่ระบุ'
              } catch (error) {
                oldValue = 'ไม่ระบุ'
              }
            }

            if (newValue) {
              try {
                const { data: newDept } = await supabase
                  .from('departments')
                  .select('name, code')
                  .eq('id', newValue)
                  .single()
                newValue = newDept ? `${newDept.name} (${newDept.code})` : 'ไม่ระบุ'
              } catch (error) {
                newValue = 'ไม่ระบุ'
              }
            }
          }

          const equipment = equipmentMap.get(item.equipment_id)

          return {
            id: item.id,
            equipment_id: item.equipment_id,
            equipment_name: equipment?.name || 'ไม่ระบุ',
            equipment_code: equipment?.code || 'ไม่ระบุ',
            action_type: item.action_type,
            field_name: item.field_name,
            old_value: oldValue,
            new_value: newValue,
            change_reason: item.change_reason,
            created_at: item.created_at,
            changed_by_name: item.users ? `${item.users.first_name} ${item.users.last_name}` : undefined,
            changed_by_role: item.users?.role
          }
        })
      )

      return processedData
    } catch (error) {
      console.error('Error getting all equipment history:', error)
      return []
    }
  }

  // Helper method to get field display name
  static getFieldDisplayName(fieldName: string): string {
    const fieldMap: Record<string, string> = {
      name: 'ชื่อครุภัณฑ์',
      type: 'ประเภท',
      brand: 'ยี่ห้อ',
      model: 'รุ่น',
      serial_number: 'เลขประจำเครื่อง',
      status: 'สถานะ',
      department_id: 'แผนก',
      current_user_id: 'ผู้รับผิดชอบ',
      location: 'สถานที่ตั้ง',
      purchase_date: 'วันที่จัดซื้อ',
      warranty_date: 'วันหมดประกัน',
      purchase_price: 'ราคา',
      notes: 'หมายเหตุ',
      general: 'ข้อมูลทั่วไป'
    }
    return fieldMap[fieldName] || fieldName
  }

  // Helper method to get action type display name
  static getActionTypeDisplayName(actionType: string): string {
    const actionMap: Record<string, string> = {
      create: 'สร้างครุภัณฑ์',
      update: 'แก้ไขข้อมูล',
      delete: 'ลบครุภัณฑ์',
      status_change: 'เปลี่ยนสถานะ',
      assignment_change: 'เปลี่ยนการมอบหมาย'
    }
    return actionMap[actionType] || actionType
  }

  // Helper method to format value for display
  static formatValueForDisplay(fieldName: string, value: string): string {
    if (!value) return '-'
    
    switch (fieldName) {
      case 'type':
        return this.getTypeText(value)
      case 'status':
        return this.getStatusText(value)
      case 'purchase_date':
      case 'warranty_date':
        return new Date(value).toLocaleDateString('th-TH')
      case 'purchase_price':
        return new Intl.NumberFormat('th-TH', {
          style: 'currency',
          currency: 'THB'
        }).format(parseFloat(value))
      case 'current_user_id':
        // This should already be converted to name in getEquipmentHistory
        return value
      case 'department_id':
        // This should already be converted to name in getEquipmentHistory
        return value
      default:
        return value
    }
  }

  // Helper methods for text conversion
  private static getStatusText(status: string): string {
    switch (status) {
      case 'normal':
        return 'ใช้งานปกติ'
      case 'maintenance':
        return 'อยู่ระหว่างบำรุงรักษา'
      case 'damaged':
        return 'ชำรุด'
      case 'disposed':
        return 'จำหน่ายแล้ว'
      case 'borrowed':
        return 'เบิกแล้ว'
      default:
        return status
    }
  }

  private static getTypeText(type: string): string {
    switch (type) {
      case 'computer':
        return 'คอมพิวเตอร์'
      case 'laptop':
        return 'โน้ตบุ๊ค'
      case 'monitor':
        return 'จอภาพ'
      case 'printer':
        return 'เครื่องพิมพ์'
      case 'ups':
        return 'UPS'
      case 'network_device':
        return 'อุปกรณ์เครือข่าย'
      default:
        return type
    }
  }
}