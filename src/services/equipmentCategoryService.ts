import { supabase } from "@/integrations/supabase/client"
import type { EquipmentCategory, EquipmentCategoryInsert, EquipmentCategoryUpdate } from "@/types/database"

export interface EquipmentCategoryWithStats extends EquipmentCategory {
  equipment_count: number
}

export class EquipmentCategoryService {
  // Get all equipment categories
  static async getCategories(): Promise<EquipmentCategory[]> {
    try {
      const { data, error } = await supabase
        .from('equipment_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching equipment categories:', error)
      throw error
    }
  }

  // Get all equipment categories with equipment count
  static async getCategoriesWithStats(): Promise<EquipmentCategoryWithStats[]> {
    try {
      const { data, error } = await supabase
        .from('equipment_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error

      // Get equipment count for each category
      const categoriesWithStats = await Promise.all(
        (data || []).map(async (category) => {
          const { count, error: countError } = await supabase
            .from('equipment')
            .select('*', { count: 'exact', head: true })
            .eq('type', this.mapCategoryCodeToType(category.code))

          if (countError) {
            console.warn('Error counting equipment for category:', category.code, countError)
          }

          return {
            ...category,
            equipment_count: count || 0
          }
        })
      )

      return categoriesWithStats
    } catch (error) {
      console.error('Error fetching equipment categories with stats:', error)
      throw error
    }
  }

  // Get single category by ID
  static async getCategoryById(id: string): Promise<EquipmentCategory | null> {
    try {
      const { data, error } = await supabase
        .from('equipment_categories')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching equipment category:', error)
      throw error
    }
  }

  // Create new category
  static async createCategory(category: EquipmentCategoryInsert): Promise<EquipmentCategory> {
    try {
      const { data, error } = await supabase
        .from('equipment_categories')
        .insert(category)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating equipment category:', error)
      throw error
    }
  }

  // Update category
  static async updateCategory(id: string, updates: EquipmentCategoryUpdate): Promise<EquipmentCategory> {
    try {
      const { data, error } = await supabase
        .from('equipment_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating equipment category:', error)
      throw error
    }
  }

  // Delete category (soft delete)
  static async deleteCategory(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('equipment_categories')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting equipment category:', error)
      throw error
    }
  }

  // Check if code exists
  static async checkCodeExists(code: string, excludeId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('equipment_categories')
        .select('id')
        .eq('code', code)
        .eq('is_active', true)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error checking category code:', error)
        return false
      }

      return (data && data.length > 0)
    } catch (error) {
      console.error('Error checking category code:', error)
      return false
    }
  }

  // Get categories for equipment form
  static async getCategoriesForEquipment(): Promise<Array<{ id: string; name: string; code: string }>> {
    try {
      const { data, error } = await supabase
        .from('equipment_categories')
        .select('id, name, code')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

      if (error) {
        console.warn('Error fetching categories for equipment:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching categories for equipment:', error)
      return []
    }
  }

  // Helper method to map category code to equipment type
  private static mapCategoryCodeToType(code: string): string {
    const codeMap: Record<string, string> = {
      'COMPUTER': 'computer',
      'LAPTOP': 'laptop',
      'MONITOR': 'monitor',
      'PRINTER': 'printer',
      'UPS': 'ups',
      'NETWORK': 'network_device'
    }
    return codeMap[code] || 'computer'
  }

  // Helper method to get icon component name
  static getIconComponent(iconName: string): string {
    const iconMap: Record<string, string> = {
      'Monitor': 'Monitor',
      'Laptop': 'Laptop',
      'Printer': 'Printer',
      'Zap': 'Zap',
      'Network': 'Network',
      'Desktop': 'Monitor',
      'Tablet': 'Tablet',
      'Server': 'Server',
      'Router': 'Router',
      'Switch': 'Network'
    }
    return iconMap[iconName] || 'Package'
  }

  // Helper method to get default color
  static getDefaultColor(): string {
    const colors = [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#8B5CF6', // Purple
      '#F59E0B', // Yellow
      '#EF4444', // Red
      '#6B7280', // Gray
      '#EC4899', // Pink
      '#14B8A6', // Teal
      '#F97316', // Orange
      '#84CC16'  // Lime
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }
}