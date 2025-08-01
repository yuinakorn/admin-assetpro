import { supabase } from '@/integrations/supabase/client'

export interface OS {
  id?: string
  os_name: string
  created_at?: string
  updated_at?: string
}

export const osService = {
  async getAllOS() {
    const { data, error } = await supabase
      .from('os')
      .select('*')
      .order('os_name', { ascending: true })

    if (error) throw error
    return data as OS[]
  },

  async getOSById(id: string) {
    const { data, error } = await supabase
      .from('os')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as OS
  },

  async createOS(osData: Pick<OS, 'os_name'>) {
    const { data, error } = await supabase
      .from('os')
      .insert([osData])
      .select()
      .single()

    if (error) throw error
    return data as OS
  },

  async updateOS(id: string, osData: Pick<OS, 'os_name'>) {
    const { data, error } = await supabase
      .from('os')
      .update(osData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as OS
  },

  async deleteOS(id: string) {
    const { error } = await supabase
      .from('os')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },
}
