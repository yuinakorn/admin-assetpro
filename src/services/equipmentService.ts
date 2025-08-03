import { supabase } from "@/integrations/supabase/client"
import type { Equipment, EquipmentInsert, EquipmentUpdate, EquipmentStatus, EquipmentHistory } from "@/types/database"

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
      .select(`
        *,
        equipment_categories (name),
        cpu (cpu_name),
        harddisk (hdd_type),
        os (os_name),
        office (office_name)
      `)
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
  },

  async getEquipmentHistory(equipmentId: string): Promise<(EquipmentHistory & { changed_by_name?: string; changed_by_role?: string })[]> {
    const { data, error } = await supabase
      .from('equipment_history')
      .select(`
        *,
        users!equipment_history_changed_by_fkey (
          first_name,
          last_name,
          role
        )
      `)
      .eq('equipment_id', equipmentId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching equipment history:', error)
      throw error
    }

    return (data || []).map(history => ({
      ...history,
      changed_by_name: history.users ? `${history.users.first_name ?? ''} ${history.users.last_name ?? ''}`.trim() : undefined,
      changed_by_role: history.users?.role
    })) as (EquipmentHistory & { changed_by_name?: string; changed_by_role?: string })[]
  },

  getFieldDisplayName(fieldName: string): string {
    const fieldMap: Record<string, string> = {
      name: 'ชื่อครุภัณฑ์',
      type: 'ประเภท',
      brand: 'ยี่ห้อ',
      model: 'รุ่น',
      serial_number: 'เลขประจำเครื่อง',
      status: 'สถานะ',
      department_id: 'แผนก',
      current_user_id: 'ผู้ใช้งาน',
      location: 'สถานที่',
      purchase_date: 'วันที่ซื้อ',
      warranty_date: 'วันหมดประกัน',
      purchase_price: 'ราคาซื้อ',
      notes: 'หมายเหตุ',
      asset_number: 'เลขครุภัณฑ์'
    }
    return fieldMap[fieldName] || fieldName
  },

  formatValueForDisplay(fieldName: string, value: string): string {
    if (!value) return '-'
    
    // Handle status values
    if (fieldName === 'status') {
      const statusMap: Record<string, string> = {
        normal: 'ใช้งานปกติ',
        maintenance: 'อยู่ระหว่างบำรุงรักษา',
        damaged: 'ชำรุด',
        disposed: 'จำหน่ายแล้ว',
        borrowed: 'เบิกแล้ว'
      }
      return statusMap[value] || value
    }

    // Handle type values
    if (fieldName === 'type') {
      const typeMap: Record<string, string> = {
        computer: 'คอมพิวเตอร์',
        laptop: 'โน้ตบุ๊ค',
        monitor: 'จอภาพ',
        printer: 'เครื่องพิมพ์',
        ups: 'UPS',
        network_device: 'อุปกรณ์เครือข่าย'
      }
      return typeMap[value] || value
    }

    // Handle date values
    if (fieldName === 'purchase_date' || fieldName === 'warranty_date') {
      try {
        return new Date(value).toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      } catch {
        return value
      }
    }

    // Handle price values
    if (fieldName === 'purchase_price') {
      try {
        const numValue = parseFloat(value)
        return new Intl.NumberFormat('th-TH', {
          style: 'currency',
          currency: 'THB'
        }).format(numValue)
      } catch {
        return value
      }
    }

    // Handle department_id and current_user_id (these might be UUIDs, so we'll show as is for now)
    if (fieldName === 'department_id' || fieldName === 'current_user_id') {
      return value // In a real app, you might want to resolve these to names
    }

    return value
  }
}
