// Database Types for Computer Equipment Asset Management System
// ระบบจัดการครุภัณฑ์คอมพิวเตอร์

// ========================================
// ENUMS
// ========================================

export type EquipmentType = 
  | 'computer'      // คอมพิวเตอร์
  | 'laptop'        // โน้ตบุ๊ค
  | 'monitor'       // จอภาพ
  | 'printer'       // เครื่องพิมพ์
  | 'ups'           // UPS
  | 'network_device'; // Network Device

export type EquipmentStatus = 
  | 'normal'        // ใช้งานปกติ
  | 'damaged'       // ชำรุด
  | 'maintenance'   // ซ่อมบำรุง
  | 'disposed'      // จำหน่ายแล้ว
  | 'borrowed';     // เบิกแล้ว

export type ActivityType = 
  | 'add'           // เพิ่มครุภัณฑ์
  | 'update'        // แก้ไขข้อมูล
  | 'delete'        // ลบครุภัณฑ์
  | 'borrow'        // ยืม
  | 'return'        // คืน
  | 'maintenance'   // แจ้งซ่อม
  | 'damage'        // แจ้งชำรุด
  | 'warranty_expired'; // หมดประกัน

export type UserRole = 
  | 'admin'         // ผู้ดูแลระบบ
  | 'manager'       // ผู้จัดการ
  | 'user';         // ผู้ใช้งาน

// ========================================
// BASE TABLES
// ========================================

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  department_id?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  manager_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: string;
  equipment_code: string; // EQ001, EQ002, etc.
  name: string;
  type: EquipmentType;
  brand: string;
  model: string;
  serial_number: string;
  asset_number?: string;
  
  // Purchase and warranty info
  purchase_date?: string;
  warranty_date?: string;
  purchase_price?: number;
  supplier?: string;
  
  // Current status and assignment
  status: EquipmentStatus;
  department_id?: string;
  location?: string;
  current_user_id?: string;
  
  // Computer-specific specifications
  cpu?: string;
  ram?: string;
  storage?: string;
  gpu?: string;
  operating_system?: string;
  product_key?: string;
  
  // Network information
  ip_address?: string;
  mac_address?: string;
  hostname?: string;
  
  // Additional info
  notes?: string;
  qr_code?: string; // QR code data or image URL
  
  // Metadata
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EquipmentImage {
  id: string;
  equipment_id: string;
  image_url: string;
  image_type?: string; // 'main', 'detail', 'damage', etc.
  file_name?: string;
  file_size?: number;
  uploaded_by?: string;
  created_at: string;
}

export interface EquipmentActivity {
  id: string;
  equipment_id: string;
  activity_type: ActivityType;
  description: string;
  
  // User involved in the activity
  user_id?: string;
  
  // Additional data for specific activities
  activity_data?: Record<string, any>; // Store additional data like borrow/return dates, maintenance details, etc.
  
  created_at: string;
}

export interface BorrowRecord {
  id: string;
  equipment_id: string;
  borrower_id: string;
  borrowed_by?: string; // Who processed the borrow
  returned_by?: string; // Who processed the return
  
  borrow_date: string;
  expected_return_date: string;
  actual_return_date?: string;
  
  borrow_notes?: string;
  return_notes?: string;
  
  status: 'borrowed' | 'returned' | 'overdue';
  
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRecord {
  id: string;
  equipment_id: string;
  reported_by: string;
  assigned_to?: string;
  
  issue_description: string;
  solution_description?: string;
  
  reported_date: string;
  start_date?: string;
  completed_date?: string;
  
  cost?: number;
  vendor?: string;
  
  status: 'reported' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  created_at: string;
  updated_at: string;
}

export interface WarrantyAlert {
  id: string;
  equipment_id: string;
  alert_type: 'expiring_soon' | 'expired' | 'renewed';
  alert_date: string;
  days_until_expiry?: number;
  is_acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  
  created_at: string;
}

export interface EquipmentHistory {
  id: string;
  equipment_id: string;
  action_type: string;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  change_reason?: string;
  changed_by?: string;
  created_at: string;
}

export interface EquipmentCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ========================================
// VIEWS
// ========================================

export interface DashboardStats {
  total_equipment: number;
  normal_equipment: number;
  maintenance_equipment: number;
  damaged_equipment: number;
  expired_warranty: number;
  expiring_warranty: number;
}

export interface EquipmentDetails extends Equipment {
  department_name?: string;
  department_code?: string;
  current_user_name?: string;
  current_user_username?: string;
}

export interface RecentActivity extends EquipmentActivity {
  equipment_name: string;
  equipment_code: string;
  user_name?: string;
  user_username?: string;
}

export interface EquipmentHistoryWithUsers {
  id: string;
  equipment_id: string;
  action_type: string;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  change_reason?: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  user_role?: string;
}

// ========================================
// INSERT/UPDATE TYPES
// ========================================

export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'>;
export type UserUpdate = Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;

export type DepartmentInsert = Omit<Department, 'id' | 'created_at' | 'updated_at'>;
export type DepartmentUpdate = Partial<Omit<Department, 'id' | 'created_at' | 'updated_at'>>;

export type EquipmentInsert = Omit<Equipment, 'id' | 'equipment_code' | 'created_at' | 'updated_at'>;
export type EquipmentUpdate = Partial<Omit<Equipment, 'id' | 'equipment_code' | 'created_at' | 'updated_at'>>;

export type EquipmentActivityInsert = Omit<EquipmentActivity, 'id' | 'created_at'>;
export type BorrowRecordInsert = Omit<BorrowRecord, 'id' | 'created_at' | 'updated_at'>;
export type MaintenanceRecordInsert = Omit<MaintenanceRecord, 'id' | 'created_at' | 'updated_at'>;

export type EquipmentCategoryInsert = Omit<EquipmentCategory, 'id' | 'created_at' | 'updated_at'>;
export type EquipmentCategoryUpdate = Partial<Omit<EquipmentCategory, 'id' | 'created_at' | 'updated_at'>>;

// ========================================
// API RESPONSE TYPES
// ========================================

export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ========================================
// FORM TYPES
// ========================================

export interface EquipmentFormData {
  name: string;
  type: EquipmentType;
  brand: string;
  model: string;
  serial_number: string;
  asset_number?: string;
  purchase_date?: string;
  warranty_date?: string;
  purchase_price?: number;
  supplier?: string;
  status: EquipmentStatus;
  department_id?: string;
  location?: string;
  current_user_id?: string;
  cpu?: string;
  ram?: string;
  storage?: string;
  gpu?: string;
  operating_system?: string;
  product_key?: string;
  ip_address?: string;
  mac_address?: string;
  hostname?: string;
  notes?: string;
}

export interface BorrowFormData {
  equipment_id: string;
  borrower_id: string;
  expected_return_date: string;
  borrow_notes?: string;
}

export interface MaintenanceFormData {
  equipment_id: string;
  issue_description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
}

// ========================================
// FILTER TYPES
// ========================================

export interface EquipmentFilters {
  search?: string;
  type?: EquipmentType;
  status?: EquipmentStatus;
  department_id?: string;
  warranty_expiring?: boolean;
  current_user_id?: string;
}

export interface ActivityFilters {
  equipment_id?: string;
  activity_type?: ActivityType;
  user_id?: string;
  date_from?: string;
  date_to?: string;
}

// ========================================
// CHART DATA TYPES
// ========================================

export interface EquipmentStatusChartData {
  status: EquipmentStatus;
  count: number;
  percentage: number;
}

export interface MonthlyTrendData {
  month: string;
  added: number;
  disposed: number;
  maintenance: number;
}

export interface WarrantyExpiryData {
  month: string;
  expiring_count: number;
  expired_count: number;
}

// ========================================
// CONSTANTS
// ========================================

export const EQUIPMENT_TYPE_LABELS: Record<EquipmentType, string> = {
  computer: 'คอมพิวเตอร์',
  laptop: 'โน้ตบุ๊ค',
  monitor: 'จอภาพ',
  printer: 'เครื่องพิมพ์',
  ups: 'UPS',
  network_device: 'Network Device'
};

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
  normal: 'ใช้งานปกติ',
  damaged: 'ชำรุด',
  maintenance: 'ซ่อมบำรุง',
  disposed: 'จำหน่ายแล้ว',
  borrowed: 'เบิกแล้ว'
};

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  add: 'เพิ่มครุภัณฑ์',
  update: 'แก้ไขข้อมูล',
  delete: 'ลบครุภัณฑ์',
  borrow: 'ยืม',
  return: 'คืน',
  maintenance: 'แจ้งซ่อม',
  damage: 'แจ้งชำรุด',
  warranty_expired: 'หมดประกัน'
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'ผู้ดูแลระบบ',
  manager: 'ผู้จัดการ',
  user: 'ผู้ใช้งาน'
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'ต่ำ',
  medium: 'ปานกลาง',
  high: 'สูง',
  urgent: 'เร่งด่วน'
};

// ========================================
// UTILITY TYPES
// ========================================

export type WithRelations<T, R extends Record<string, any>> = T & R;

export type EquipmentWithRelations = WithRelations<Equipment, {
  department?: Department;
  current_user?: User;
  created_by_user?: User;
  updated_by_user?: User;
  images?: EquipmentImage[];
  activities?: EquipmentActivity[];
  borrow_records?: BorrowRecord[];
  maintenance_records?: MaintenanceRecord[];
  warranty_alerts?: WarrantyAlert[];
}>;

export type UserWithRelations = WithRelations<User, {
  department?: Department;
  managed_department?: Department;
  current_equipment?: Equipment[];
  created_equipment?: Equipment[];
  activities?: EquipmentActivity[];
  borrow_records?: BorrowRecord[];
  maintenance_records?: MaintenanceRecord[];
}>;

export type DepartmentWithRelations = WithRelations<Department, {
  manager?: User;
  users?: User[];
  equipment?: Equipment[];
}>; 