import { useAuth } from '@/contexts/AuthContext'

export interface Permissions {
  // Equipment permissions
  canViewEquipment: boolean
  canAddEquipment: boolean
  canEditEquipment: boolean
  canDeleteEquipment: boolean
  
  // Department permissions
  canViewDepartments: boolean
  canAddDepartments: boolean
  canEditDepartments: boolean
  canDeleteDepartments: boolean
  
  // User permissions
  canViewUsers: boolean
  canAddUsers: boolean
  canEditUsers: boolean
  canDeleteUsers: boolean
  
  // Category permissions
  canViewCategories: boolean
  canAddCategories: boolean
  canEditCategories: boolean
  canDeleteCategories: boolean
  
  // Activity permissions
  canViewActivities: boolean
  canAddActivities: boolean
  canEditActivities: boolean
  canDeleteActivities: boolean
  
  // General permissions
  isAdmin: boolean
  isManager: boolean
  isUser: boolean
}

export function usePermissions(): Permissions {
  const { user } = useAuth()
  
  const role = user?.user_metadata?.role || 'user'
  
  const isAdmin = role === 'admin'
  const isManager = role === 'manager'
  const isUser = role === 'user'
  
  return {
    // Equipment permissions
    canViewEquipment: true, // All users can view equipment in their department
    canAddEquipment: isManager || isAdmin,
    canEditEquipment: isManager || isAdmin,
    canDeleteEquipment: isAdmin,
    
    // Department permissions
    canViewDepartments: true, // All users can view departments
    canAddDepartments: isAdmin,
    canEditDepartments: isAdmin,
    canDeleteDepartments: isAdmin,
    
    // User permissions
    canViewUsers: isAdmin,
    canAddUsers: isAdmin,
    canEditUsers: isAdmin,
    canDeleteUsers: isAdmin,
    
    // Category permissions
    canViewCategories: true, // All users can view categories
    canAddCategories: isManager || isAdmin,
    canEditCategories: isManager || isAdmin,
    canDeleteCategories: isAdmin,
    
    // Activity permissions
    canViewActivities: true, // All users can view activities in their department
    canAddActivities: true, // All users can add activities in their department
    canEditActivities: isAdmin,
    canDeleteActivities: isAdmin,
    
    // General permissions
    isAdmin,
    isManager,
    isUser
  }
}

// Helper functions for specific permission checks
export function useCanManageEquipment() {
  const { canAddEquipment, canEditEquipment, canDeleteEquipment } = usePermissions()
  return canAddEquipment || canEditEquipment || canDeleteEquipment
}

export function useCanManageDepartments() {
  const { canAddDepartments, canEditDepartments, canDeleteDepartments } = usePermissions()
  return canAddDepartments || canEditDepartments || canDeleteDepartments
}

export function useCanManageUsers() {
  const { canAddUsers, canEditUsers, canDeleteUsers } = usePermissions()
  return canAddUsers || canEditUsers || canDeleteUsers
}

export function useCanManageCategories() {
  const { canAddCategories, canEditCategories, canDeleteCategories } = usePermissions()
  return canAddCategories || canEditCategories || canDeleteCategories
}