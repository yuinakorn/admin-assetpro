import { supabase } from '@/integrations/supabase/client'

export interface Harddisk {
  id?: string
  hdd_type: string
  created_at?: string
  updated_at?: string
}

export const harddiskService = {
  async getAllHarddisks() {
    const { data, error } = await supabase
      .from('harddisk')
      .select('*')
      .order('hdd_type', { ascending: true })

    if (error) throw error
    return data as Harddisk[]
  },

  async getHarddiskById(id: string) {
    const { data, error } = await supabase
      .from('harddisk')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Harddisk
  },

  async createHarddisk(harddiskData: Pick<Harddisk, 'hdd_type'>) {
    const { data, error } = await supabase
      .from('harddisk')
      .insert([harddiskData])
      .select()
      .single()

    if (error) throw error
    return data as Harddisk
  },

  async updateHarddisk(id: string, harddiskData: Pick<Harddisk, 'hdd_type'>) {
    const { data, error } = await supabase
      .from('harddisk')
      .update(harddiskData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Harddisk
  },

  async deleteHarddisk(id: string) {
    const { error } = await supabase
      .from('harddisk')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },
}
