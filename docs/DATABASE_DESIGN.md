# Database Design Documentation
# ระบบจัดการครุภัณฑ์คอมพิวเตอร์

## Overview

This document describes the database design for the Computer Equipment Asset Management System (ระบบจัดการครุภัณฑ์คอมพิวเตอร์). The system is built with PostgreSQL and designed to manage computer equipment assets for organizations.

## Technology Stack

- **Database**: PostgreSQL 15+
- **Frontend**: React + TypeScript
- **Backend**: Supabase (PostgreSQL with real-time features)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage

## Database Schema

### Core Tables

#### 1. Users (ผู้ใช้งาน)
Manages system users and their roles.

```sql
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
```

**Key Features:**
- UUID primary keys for security
- Role-based access control (admin, manager, user)
- Department assignment
- Soft delete with `is_active` flag

#### 2. Departments (หน่วยงาน)
Organizational structure for equipment management.

```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. Equipment (ครุภัณฑ์)
Core table for computer equipment assets.

```sql
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
```

**Key Features:**
- Auto-generated equipment codes (EQ001, EQ002, etc.)
- Comprehensive computer specifications
- Network information tracking
- QR code support for mobile scanning
- Full audit trail with created_by/updated_by

### Supporting Tables

#### 4. Equipment Images (รูปภาพครุภัณฑ์)
Stores multiple images per equipment item.

```sql
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
```

#### 5. Equipment Activities (ประวัติครุภัณฑ์)
Complete audit trail of all equipment-related activities.

```sql
CREATE TABLE equipment_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  description TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  activity_data JSONB, -- Flexible storage for activity-specific data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 6. Borrow Records (บันทึกการยืม-คืน)
Tracks equipment borrowing and returns.

```sql
CREATE TABLE borrow_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  borrower_id UUID REFERENCES users(id),
  borrowed_by UUID REFERENCES users(id),
  returned_by UUID REFERENCES users(id),
  
  borrow_date TIMESTAMP WITH TIME ZONE NOT NULL,
  expected_return_date DATE NOT NULL,
  actual_return_date TIMESTAMP WITH TIME ZONE,
  
  borrow_notes TEXT,
  return_notes TEXT,
  
  status VARCHAR(20) DEFAULT 'borrowed', -- 'borrowed', 'returned', 'overdue'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 7. Maintenance Records (บันทึกการซ่อมบำรุง)
Tracks maintenance and repair activities.

```sql
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
```

#### 8. Warranty Alerts (การแจ้งเตือนประกัน)
Automated warranty expiration tracking.

```sql
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
```

## Enums

### Equipment Types
```sql
CREATE TYPE equipment_type AS ENUM (
  'computer',      -- คอมพิวเตอร์
  'laptop',        -- โน้ตบุ๊ค
  'monitor',       -- จอภาพ
  'printer',       -- เครื่องพิมพ์
  'ups',           -- UPS
  'network_device' -- Network Device
);
```

### Equipment Status
```sql
CREATE TYPE equipment_status AS ENUM (
  'normal',        -- ใช้งานปกติ
  'damaged',       -- ชำรุด
  'maintenance',   -- ซ่อมบำรุง
  'disposed',      -- จำหน่ายแล้ว
  'borrowed'       -- เบิกแล้ว
);
```

### Activity Types
```sql
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
```

### User Roles
```sql
CREATE TYPE user_role AS ENUM (
  'admin',         -- ผู้ดูแลระบบ
  'manager',       -- ผู้จัดการ
  'user'           -- ผู้ใช้งาน
);
```

## Database Views

### 1. Dashboard Statistics
```sql
CREATE VIEW dashboard_stats AS
SELECT 
    COUNT(*) as total_equipment,
    COUNT(CASE WHEN status = 'normal' THEN 1 END) as normal_equipment,
    COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance_equipment,
    COUNT(CASE WHEN status = 'damaged' THEN 1 END) as damaged_equipment,
    COUNT(CASE WHEN warranty_date <= CURRENT_DATE THEN 1 END) as expired_warranty,
    COUNT(CASE WHEN warranty_date <= (CURRENT_DATE + INTERVAL '30 days') AND warranty_date > CURRENT_DATE THEN 1 END) as expiring_warranty
FROM equipment;
```

### 2. Equipment Details
```sql
CREATE VIEW equipment_details AS
SELECT 
    e.*,
    d.name as department_name,
    d.code as department_code,
    u.first_name || ' ' || u.last_name as current_user_name,
    u.username as current_user_username
FROM equipment e
LEFT JOIN departments d ON e.department_id = d.id
LEFT JOIN users u ON e.current_user_id = u.id;
```

### 3. Recent Activities
```sql
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
```

## Triggers and Functions

### 1. Auto-generate Equipment Codes
```sql
CREATE OR REPLACE FUNCTION generate_equipment_code()
RETURNS TRIGGER AS $$
DECLARE
    next_code VARCHAR(20);
    counter INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(equipment_code FROM 3) AS INTEGER)), 0) + 1
    INTO counter
    FROM equipment;
    
    next_code := 'EQ' || LPAD(counter::TEXT, 3, '0');
    NEW.equipment_code := next_code;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### 2. Warranty Alert Creation
```sql
CREATE OR REPLACE FUNCTION create_warranty_alerts()
RETURNS TRIGGER AS $$
BEGIN
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
```

## Indexes

### Performance Indexes
```sql
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
```

## Row Level Security (RLS)

### Security Policies
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrow_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

-- Basic policies
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Users can view equipment" ON equipment FOR SELECT USING (true);
CREATE POLICY "Admins can manage equipment" ON equipment FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
```

## Data Relationships

### Entity Relationship Diagram

```
Users (1) ←→ (N) Departments
Users (1) ←→ (N) Equipment (as current_user)
Users (1) ←→ (N) Equipment (as created_by)
Users (1) ←→ (N) Equipment (as updated_by)

Departments (1) ←→ (N) Equipment
Departments (1) ←→ (N) Users

Equipment (1) ←→ (N) Equipment_Images
Equipment (1) ←→ (N) Equipment_Activities
Equipment (1) ←→ (N) Borrow_Records
Equipment (1) ←→ (N) Maintenance_Records
Equipment (1) ←→ (N) Warranty_Alerts

Users (1) ←→ (N) Equipment_Activities
Users (1) ←→ (N) Borrow_Records (as borrower)
Users (1) ←→ (N) Maintenance_Records (as reported_by)
```

## Key Features

### 1. Equipment Tracking
- Unique equipment codes (EQ001, EQ002, etc.)
- Serial number tracking
- Asset number management
- QR code generation for mobile scanning

### 2. Status Management
- Real-time status tracking
- Status history through activities
- Automatic status updates based on borrow/maintenance

### 3. Warranty Management
- Automatic warranty expiration alerts
- 30-day advance warning system
- Warranty renewal tracking

### 4. Audit Trail
- Complete activity logging
- User action tracking
- Data change history
- JSONB storage for flexible activity data

### 5. Borrow/Return System
- Equipment lending tracking
- Due date management
- Overdue detection
- Return confirmation

### 6. Maintenance Tracking
- Issue reporting
- Assignment to technicians
- Cost tracking
- Vendor management
- Priority levels

### 7. Image Management
- Multiple images per equipment
- Image categorization
- File metadata tracking

## Performance Considerations

### 1. Indexing Strategy
- Composite indexes for common queries
- Partial indexes for filtered data
- Covering indexes for dashboard queries

### 2. Query Optimization
- Views for complex joins
- Materialized views for heavy analytics
- Partitioning for large datasets

### 3. Caching Strategy
- Redis for frequently accessed data
- Application-level caching
- Database query result caching

## Security Features

### 1. Authentication
- Supabase Auth integration
- JWT token management
- Session management

### 2. Authorization
- Role-based access control
- Row-level security policies
- Column-level permissions

### 3. Data Protection
- Encrypted sensitive data
- Audit logging
- Backup and recovery

## Migration Strategy

### 1. Version Control
- Database migrations in version control
- Rollback capabilities
- Environment-specific configurations

### 2. Data Migration
- Incremental data migration
- Data validation
- Rollback procedures

## Monitoring and Maintenance

### 1. Performance Monitoring
- Query performance tracking
- Index usage monitoring
- Connection pool management

### 2. Data Maintenance
- Regular data cleanup
- Archive old records
- Optimize table statistics

### 3. Backup Strategy
- Automated daily backups
- Point-in-time recovery
- Cross-region replication

## Future Enhancements

### 1. Advanced Features
- Barcode scanning integration
- Mobile app support
- API for third-party integrations
- Advanced reporting and analytics

### 2. Scalability
- Horizontal scaling
- Read replicas
- Microservices architecture

### 3. Integration
- ERP system integration
- Accounting system integration
- Email notification system
- SMS alerts

## Conclusion

This database design provides a robust foundation for the Computer Equipment Asset Management System. It supports all the features identified in the React application while maintaining data integrity, performance, and security. The design is scalable and can accommodate future enhancements and integrations. 