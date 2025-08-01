import { supabase } from "@/integrations/supabase/client"
import type { Equipment, EquipmentInsert, EquipmentUpdate } from "@/types/database"

export interface EquipmentWithDetails extends Equipment {
  department_name?: string
  department_code?: string
  category_name?: string
  assigned_user_name?: string
  status_text?: string
}

export class EquipmentService {
  private static async mapEquipmentToDetails(equipment: Equipment[]): Promise<EquipmentWithDetails[]> {
    if (!equipment || equipment.length === 0) {
      return []
    }

    // Extract IDs for batch fetching
    const departmentIds = [...new Set(equipment.map(e => e.department_id).filter(Boolean))]
    const userIds = [...new Set(equipment.map(e => e.current_user_id).filter(Boolean))]

    // Batch fetch departments and users
    const { data: departments } = await supabase.from('departments').select('id, name, code').in('id', departmentIds)
    const { data: users } = await supabase.from('users').select('id, first_name, last_name').in('id', userIds)
    
    const departmentMap = new Map(departments?.map(d => [d.id, d]))
    const userMap = new Map(users?.map(u => [u.id, u]))

    return equipment.map(item => {
      const department = item.department_id ? departmentMap.get(item.department_id) : null
      const user = item.current_user_id ? userMap.get(item.current_user_id) : null
      
      return {
        ...item,
        department_name: department?.name,
        department_code: department?.code,
        assigned_user_name: user ? `${user.first_name} ${user.last_name}` : undefined,
        status_text: this.getStatusText(item.status),
        category_name: (item as any).equipment_categories?.name || 'N/A'
      }
    })
  }

  static async getEquipment(): Promise<EquipmentWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select(`*, equipment_categories (name)`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return this.mapEquipmentToDetails(data || [])
    } catch (error) {
      console.error('Error fetching equipment:', error)
      throw error
    }
  }

  static async getEquipmentById(id: string): Promise<Equipment | null> {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select(`*, equipment_categories (name)`)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching equipment by ID:', error)
      throw error
    }
  }

  static async createEquipment(equipment: Omit<EquipmentInsert, 'equipment_code' | 'created_by' | 'updated_by'>): Promise<Equipment> {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user
      const { data, error } = await supabase
        .from('equipment')
        .insert([{ 
          ...equipment,
          created_by: currentUser?.id,
          updated_by: currentUser?.id,
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating equipment:', error)
      throw error
    }
  }

  static async updateEquipment(id: string, updates: EquipmentUpdate): Promise<Equipment> {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user
      const { data, error } = await supabase
        .from('equipment')
        .update({
          ...updates,
          updated_by: currentUser?.id,
          updated_at: new Date().toISOString(),
        })
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

  static async deleteEquipment(id: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('delete_equipment_safely', { equipment_uuid: id })
      if (error) throw error
    } catch (error) {
      console.error('Error deleting equipment:', error)
      throw error
    }
  }

  // ... (Other methods like search, getByStatus, etc. would also need refactoring to use mapEquipmentToDetails)

  static async getDepartmentsForEquipment(): Promise<Array<{ id: string; name: string; code: string }>> {
    // This method is fine as is
    try {
      const { data, error } = await supabase.from('departments').select('id, name, code').eq('is_active', true).order('name')
      if (error) throw error
      return data || []
    } catch (error) { console.error(error); throw error }
  }

  static async getUsersForEquipment(): Promise<Array<{ id: string; name: string; role: string }>> {
    // This method is fine as is
    try {
      const { data, error } = await supabase.from('users').select('id, first_name, last_name, role').eq('is_active', true).order('first_name')
      if (error) throw error
      return data.map(u => ({ id: u.id, name: `${u.first_name} ${u.last_name}`, role: u.role }))
    } catch (error) { console.error(error); throw error }
  }

  static async checkSerialNumberExists(serialNumber: string, excludeId?: string): Promise<boolean> {
    // This method is fine as is
    try {
      let query = supabase.from('equipment').select('id').eq('serial_number', serialNumber)
      if (excludeId) {
        query = query.neq('id', excludeId)
      }
      const { data, error } = await query
      if (error) throw error
      return data && data.length > 0
    } catch (error) { console.error(error); throw error }
  }

  // ... (History and other helper methods)

  private static getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      normal: 'ใช้งานปกติ',
      maintenance: 'อยู่ระหว่างบำรุงรักษา',
      damaged: 'ชำรุด',
      disposed: 'จำหน่ายแล้ว',
      borrowed: 'เบิกแล้ว',
    }
    return statusMap[status] || status
  }
}
