-- Migration: 001_initial_schema.sql
-- Description: Initial database schema for Computer Equipment Asset Management System
-- Date: 2024-01-01
-- Author: System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- ENUMS
-- ========================================

-- Equipment types
CREATE TYPE equipment_type AS ENUM (
  'computer',      -- คอมพิวเตอร์
  'laptop',        -- โน้ตบุ๊ค
  'monitor',       -- จอภาพ
  'printer',       -- เครื่องพิมพ์
  'ups',           -- UPS
  'network_device' -- Network Device
);

-- Equipment status
CREATE TYPE equipment_status AS ENUM (
  'normal',        -- ใช้งานปกติ
  'damaged',       -- ชำรุด
  'maintenance',   -- ซ่อมบำรุง
  'disposed',      -- จำหน่ายแล้ว
  'borrowed'       -- เบิกแล้ว
);

-- Activity types
CREATE TYPE activity_type AS ENUM (
  'add',           -- เพิ่มครุภัณฑ์
  'update',        -- แก้ไขข้อมูล
  'delete',        -- ลบครุภัณฑ์
  'borrow',        -- ยืม
  'return',        -- คืน
  'maintenance',   -- แจ้งซ่อม
  'damage',        -- แจ้งชำรุด
  'warranty_expired' -- หมดประกัน
);

-- User roles
CREATE TYPE user_role AS ENUM (
  'admin',         -- ผู้ดูแลระบบ
  'manager',       -- ผู้จัดการ
  'user'           -- ผู้ใช้งาน
);

-- ========================================
-- TABLES
-- ========================================

-- Departments table (หน่วยงาน)
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  manager_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (ผู้ใช้งาน)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role user_role DEFAULT 'user',
  department_id UUID REFERENCES departments(id),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for departments manager_id
ALTER TABLE departments ADD CONSTRAINT fk_departments_manager 
  FOREIGN KEY (manager_id) REFERENCES users(id);

-- Equipment table (ครุภัณฑ์)
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_code VARCHAR(20) UNIQUE NOT NULL, -- EQ001, EQ002, etc.
  name VARCHAR(255) NOT NULL,
  type equipment_type NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  serial_number VARCHAR(100) UNIQUE NOT NULL,
  asset_number VARCHAR(50) UNIQUE,
  
  -- Purchase and warranty info
  purchase_date DATE,
  warranty_date DATE,
  purchase_price DECIMAL(12,2),
  supplier VARCHAR(255),
  
  -- Current status and assignment
  status equipment_status DEFAULT 'normal',
  department_id UUID REFERENCES departments(id),
  location VARCHAR(255),
  current_user_id UUID REFERENCES users(id),
  
  -- Computer-specific specifications
  cpu VARCHAR(100),
  ram VARCHAR(50),
  storage VARCHAR(100),
  gpu VARCHAR(100),
  operating_system VARCHAR(100),
  product_key VARCHAR(255),
  
  -- Network information
  ip_address INET,
  mac_address MACADDR,
  hostname VARCHAR(100),
  
  -- Additional info
  notes TEXT,
  qr_code TEXT, -- QR code data or image URL
  
  -- Metadata
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment images table (รูปภาพครุภัณฑ์)
CREATE TABLE equipment_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  image_type VARCHAR(50), -- 'main', 'detail', 'damage', etc.
  file_name VARCHAR(255),
  file_size INTEGER,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment history/activities table (ประวัติครุภัณฑ์)
CREATE TABLE equipment_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  description TEXT NOT NULL,
  
  -- User involved in the activity
  user_id UUID REFERENCES users(id),
  
  -- Additional data for specific activities
  activity_data JSONB, -- Store additional data like borrow/return dates, maintenance details, etc.
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Borrow/Return records table (บันทึกการยืม-คืน)
CREATE TABLE borrow_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  borrower_id UUID REFERENCES users(id),
  borrowed_by UUID REFERENCES users(id), -- Who processed the borrow
  returned_by UUID REFERENCES users(id), -- Who processed the return
  
  borrow_date TIMESTAMP WITH TIME ZONE NOT NULL,
  expected_return_date DATE NOT NULL,
  actual_return_date TIMESTAMP WITH TIME ZONE,
  
  borrow_notes TEXT,
  return_notes TEXT,
  
  status VARCHAR(20) DEFAULT 'borrowed', -- 'borrowed', 'returned', 'overdue'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance records table (บันทึกการซ่อมบำรุง)
CREATE TABLE maintenance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  
  issue_description TEXT NOT NULL,
  solution_description TEXT,
  
  reported_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  start_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  
  cost DECIMAL(12,2),
  vendor VARCHAR(255),
  
  status VARCHAR(20) DEFAULT 'reported', -- 'reported', 'in_progress', 'completed', 'cancelled'
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Warranty alerts table (การแจ้งเตือนประกัน)
CREATE TABLE warranty_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  alert_type VARCHAR(20) NOT NULL, -- 'expiring_soon', 'expired', 'renewed'
  alert_date DATE NOT NULL,
  days_until_expiry INTEGER,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES
-- ========================================

-- Equipment indexes
CREATE INDEX idx_equipment_department ON equipment(department_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_type ON equipment(type);
CREATE INDEX idx_equipment_current_user ON equipment(current_user_id);
CREATE INDEX idx_equipment_warranty_date ON equipment(warranty_date);
CREATE INDEX idx_equipment_serial_number ON equipment(serial_number);
CREATE INDEX idx_equipment_asset_number ON equipment(asset_number);

-- Activity indexes
CREATE INDEX idx_equipment_activities_equipment ON equipment_activities(equipment_id);
CREATE INDEX idx_equipment_activities_type ON equipment_activities(activity_type);
CREATE INDEX idx_equipment_activities_created_at ON equipment_activities(created_at);

-- Borrow records indexes
CREATE INDEX idx_borrow_records_equipment ON borrow_records(equipment_id);
CREATE INDEX idx_borrow_records_borrower ON borrow_records(borrower_id);
CREATE INDEX idx_borrow_records_status ON borrow_records(status);
CREATE INDEX idx_borrow_records_expected_return ON borrow_records(expected_return_date);

-- Maintenance indexes
CREATE INDEX idx_maintenance_records_equipment ON maintenance_records(equipment_id);
CREATE INDEX idx_maintenance_records_status ON maintenance_records(status);
CREATE INDEX idx_maintenance_records_reported_by ON maintenance_records(reported_by);

-- User indexes
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_role ON users(role);

-- ========================================
-- TRIGGERS AND FUNCTIONS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_borrow_records_updated_at BEFORE UPDATE ON borrow_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_records_updated_at BEFORE UPDATE ON maintenance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate equipment code
CREATE OR REPLACE FUNCTION generate_equipment_code()
RETURNS TRIGGER AS $$
DECLARE
    next_code VARCHAR(20);
    counter INTEGER;
BEGIN
    -- Get the next available number
    SELECT COALESCE(MAX(CAST(SUBSTRING(equipment_code FROM 3) AS INTEGER)), 0) + 1
    INTO counter
    FROM equipment;
    
    -- Format as EQ001, EQ002, etc.
    next_code := 'EQ' || LPAD(counter::TEXT, 3, '0');
    
    NEW.equipment_code := next_code;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply equipment code generation trigger
CREATE TRIGGER generate_equipment_code_trigger 
    BEFORE INSERT ON equipment 
    FOR EACH ROW 
    WHEN (NEW.equipment_code IS NULL)
    EXECUTE FUNCTION generate_equipment_code();

-- Function to create warranty alerts
CREATE OR REPLACE FUNCTION create_warranty_alerts()
RETURNS TRIGGER AS $$
BEGIN
    -- Create alert for equipment expiring in 30 days
    IF NEW.warranty_date IS NOT NULL AND NEW.warranty_date <= (CURRENT_DATE + INTERVAL '30 days') THEN
        INSERT INTO warranty_alerts (equipment_id, alert_type, alert_date, days_until_expiry)
        VALUES (
            NEW.id,
            CASE 
                WHEN NEW.warranty_date <= CURRENT_DATE THEN 'expired'
                ELSE 'expiring_soon'
            END,
            NEW.warranty_date,
            NEW.warranty_date - CURRENT_DATE
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply warranty alert trigger
CREATE TRIGGER create_warranty_alerts_trigger 
    AFTER INSERT OR UPDATE ON equipment 
    FOR EACH ROW 
    EXECUTE FUNCTION create_warranty_alerts();

-- ========================================
-- VIEWS
-- ========================================

-- Dashboard statistics view
CREATE VIEW dashboard_stats AS
SELECT 
    COUNT(*) as total_equipment,
    COUNT(CASE WHEN status = 'normal' THEN 1 END) as normal_equipment,
    COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance_equipment,
    COUNT(CASE WHEN status = 'damaged' THEN 1 END) as damaged_equipment,
    COUNT(CASE WHEN warranty_date <= CURRENT_DATE THEN 1 END) as expired_warranty,
    COUNT(CASE WHEN warranty_date <= (CURRENT_DATE + INTERVAL '30 days') AND warranty_date > CURRENT_DATE THEN 1 END) as expiring_warranty
FROM equipment;

-- Equipment with user and department info
CREATE VIEW equipment_details AS
SELECT 
    e.id,
    e.equipment_code,
    e.name,
    e.type,
    e.brand,
    e.model,
    e.serial_number,
    e.asset_number,
    e.purchase_date,
    e.warranty_date,
    e.purchase_price,
    e.supplier,
    e.status,
    e.department_id,
    e.location,
    e.current_user_id,
    e.ram,
    e.storage,
    e.gpu,
    e.operating_system,
    e.product_key,
    e.ip_address,
    e.mac_address,
    e.hostname,
    e.notes,
    e.qr_code,
    e.created_by,
    e.updated_by,
    e.created_at,
    e.updated_at,
    d.name as department_name,
    d.code as department_code,
    u.first_name || ' ' || u.last_name as current_user_name,
    u.username as current_user_username
FROM equipment e
LEFT JOIN departments d ON e.department_id = d.id
LEFT JOIN users u ON e.current_user_id = u.id;

-- Recent activities with user info
CREATE VIEW recent_activities AS
SELECT 
    ea.*,
    e.name as equipment_name,
    e.equipment_code,
    u.first_name || ' ' || u.last_name as user_name,
    u.username as user_username
FROM equipment_activities ea
JOIN equipment e ON ea.equipment_id = e.id
LEFT JOIN users u ON ea.user_id = u.id
ORDER BY ea.created_at DESC;

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrow_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

-- Create policies (basic examples - customize based on your security requirements)
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Users can view equipment" ON equipment FOR SELECT USING (true);
CREATE POLICY "Admins can manage equipment" ON equipment FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE users IS 'ตารางผู้ใช้งานระบบ';
COMMENT ON TABLE departments IS 'ตารางหน่วยงาน';
COMMENT ON TABLE equipment IS 'ตารางครุภัณฑ์คอมพิวเตอร์';
COMMENT ON TABLE equipment_images IS 'ตารางรูปภาพครุภัณฑ์';
COMMENT ON TABLE equipment_activities IS 'ตารางประวัติกิจกรรมครุภัณฑ์';
COMMENT ON TABLE borrow_records IS 'ตารางบันทึกการยืม-คืนครุภัณฑ์';
COMMENT ON TABLE maintenance_records IS 'ตารางบันทึกการซ่อมบำรุง';
COMMENT ON TABLE warranty_alerts IS 'ตารางการแจ้งเตือนประกัน';

COMMENT ON COLUMN equipment.equipment_code IS 'รหัสครุภัณฑ์ (EQ001, EQ002, ...)';
COMMENT ON COLUMN equipment.serial_number IS 'Serial Number ของครุภัณฑ์';
COMMENT ON COLUMN equipment.asset_number IS 'เลขครุภัณฑ์ขององค์กร';
COMMENT ON COLUMN equipment.qr_code IS 'ข้อมูล QR Code สำหรับสแกน';
COMMENT ON COLUMN equipment_activities.activity_data IS 'ข้อมูลเพิ่มเติมของกิจกรรมในรูปแบบ JSON'; 