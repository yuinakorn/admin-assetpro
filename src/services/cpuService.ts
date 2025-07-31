import { supabase } from '@/integrations/supabase/client'

export interface CPU {
  id?: string
  cpu_name: string
  created_at?: string
  updated_at?: string
}

export const cpuService = {
  async getAllCPUs() {
    const { data, error } = await supabase
      .from('cpu')
      .select('*')
      .order('cpu_name', { ascending: true })

    if (error) throw error
    return data as CPU[]
  },

  async getCPUById(id: string) {
    const { data, error } = await supabase
      .from('cpu')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as CPU
  },

  async createCPU(cpuData: Pick<CPU, 'cpu_name'>) {
    const { data, error } = await supabase
      .from('cpu')
      .insert([cpuData])
      .select()
      .single()

    if (error) throw error
    return data as CPU
  },

  async updateCPU(id: string, cpuData: Pick<CPU, 'cpu_name'>) {
    const { data, error } = await supabase
      .from('cpu')
      .update(cpuData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as CPU
  },

  async deleteCPU(id: string) {
    const { error } = await supabase
      .from('cpu')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },
}
