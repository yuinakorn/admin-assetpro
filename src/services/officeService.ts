import { supabase } from '@/integrations/supabase/client'

export interface Office {
  id?: string
  office_name: string
  created_at?: string
  updated_at?: string
}

export const officeService = {
  async getAllOffices() {
    const { data, error } = await supabase
      .from('office')
      .select('*')
      .order('office_name', { ascending: true })

    if (error) throw error
    return data as Office[]
  },

  async getOfficeById(id: string) {
    const { data, error } = await supabase
      .from('office')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Office
  },

  async createOffice(officeData: Pick<Office, 'office_name'>) {
    const { data, error } = await supabase
      .from('office')
      .insert([officeData])
      .select()
      .single()

    if (error) throw error
    return data as Office
  },

  async updateOffice(id: string, officeData: Pick<Office, 'office_name'>) {
    const { data, error } = await supabase
      .from('office')
      .update(officeData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Office
  },

  async deleteOffice(id: string) {
    const { error } = await supabase
      .from('office')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },
}
