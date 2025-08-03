import { supabase } from "@/integrations/supabase/client"
import type { Equipment, EquipmentInsert, EquipmentUpdate, EquipmentStatus } from "@/types/database"

export type { EquipmentInsert, EquipmentUpdate }

export interface EquipmentWithDetails extends Equipment {
  department_name?: string
  department_code?: string
  category_name?: string
  assigned_user_name?: string
  status_text?: string
}

const getStatusText = (status: EquipmentStatus): string => {
  const statusMap: Record<EquipmentStatus, string> = {
    normal: 'ใช้งานปกติ',
    maintenance: 'อยู่ระหว่างบำรุงรักษา',
    damaged: 'ชำรุด',
    disposed: 'จำหน่ายแล้ว',
    borrowed: 'เบิกแล้ว',
  }
  return statusMap[status] || status
}

const mapEquipmentToDetails = async (equipment: Equipment[]): Promise<EquipmentWithDetails[]> => {
  if (!equipment || equipment.length === 0) {
    return []
  }

  const departmentIds = [...new Set(equipment.map(e => e.department_id).filter(Boolean))]
  const userIds = [...new Set(equipment.map(e => e.current_user_id).filter(Boolean))]

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
      assigned_user_name: user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : undefined,
      status_text: getStatusText(item.status),
      category_name: (item as any).equipment_categories?.name || 'N/A'
    }
  })
}

export const EquipmentService = {
  async getEquipment(): Promise<EquipmentWithDetails[]> {
    const { data, error } = await supabase
      .from('equipment')
      .select(`*, equipment_categories (name)`)
      .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching equipment:', error)
        throw error
    }
    return mapEquipmentToDetails(data as unknown as Equipment[] || [])
  },

  async getEquipmentById(id: string): Promise<Equipment | null> {
    const { data, error } = await supabase
      .from('equipment')
      .select(`*, equipment_categories (name)`)
      .eq('id', id)
      .single()

    if (error) {
        console.error('Error fetching equipment by ID:', error)
        throw error
    }
    return data as unknown as Equipment | null
  },

  async createEquipment(equipment: EquipmentInsert): Promise<Equipment> {
    const currentUser = (await supabase.auth.getUser()).data.user
    const equipmentToInsert = {
      ...equipment,
      created_by: currentUser?.id,
      updated_by: currentUser?.id,
    }
    
    const { data, error } = await supabase
      .from('equipment')
      .insert(equipmentToInsert)
      .select()
      .single()

    if (error) {
        console.error('Error creating equipment:', error)
        throw error
    }
    return data as unknown as Equipment
  },

  async updateEquipment(id: string, updates: EquipmentUpdate): Promise<Equipment> {
    const currentUser = (await supabase.auth.getUser()).data.user
    const { data, error } = await supabase
      .from('equipment')
      .update({
          ...updates,
          updated_by: currentUser?.id,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
        console.error('Error updating equipment:', error)
        throw error
    }
    return data as unknown as Equipment
  },

  async deleteEquipment(id: string): Promise<void> {
    const { error } = await supabase.rpc('delete_equipment_safely', { equipment_uuid: id })
    if (error) {
        console.error('Error deleting equipment:', error)
        throw error
    }
  },

  async getDepartmentsForEquipment(): Promise<Array<{ id: string; name: string; code: string }>> {
    const { data, error } = await supabase.from('departments').select('id, name, code').eq('is_active', true).order('name')
    if (error) {
        console.error('Error fetching departments:', error)
        throw error
    }
    return data || []
  },

  async getUsersForEquipment(): Promise<Array<{ id: string; name: string; role: string }>> {
    const { data, error } = await supabase.from('users').select('id, first_name, last_name, role').eq('is_active', true).order('first_name')
    if (error) {
        console.error('Error fetching users:', error)
        throw error
    }
    return data.map(u => ({ id: u.id, name: `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim(), role: u.role }))
  },

  async checkSerialNumberExists(serialNumber: string, excludeId?: string): Promise<boolean> {
    let query = supabase.from('equipment').select('id', { count: 'exact' }).eq('serial_number', serialNumber)
    if (excludeId) {
      query = query.neq('id', excludeId)
    }
    const { error, count } = await query
    if (error) {
        console.error('Error checking serial number:', error)
        throw error
    }
    return (count ?? 0) > 0
  }
}
