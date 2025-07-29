-- ========================================
-- CREATE EQUIPMENT CATEGORIES TABLE
-- ========================================

-- Create equipment categories table
CREATE TABLE equipment_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50), -- Icon name for UI display
  color VARCHAR(20), -- Color code for UI display
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_equipment_categories_code ON equipment_categories(code);
CREATE INDEX idx_equipment_categories_active ON equipment_categories(is_active);
CREATE INDEX idx_equipment_categories_sort ON equipment_categories(sort_order);

-- Add trigger for updated_at
CREATE TRIGGER update_equipment_categories_updated_at 
  BEFORE UPDATE ON equipment_categories 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default equipment categories based on existing enum
INSERT INTO equipment_categories (name, code, description, icon, color, sort_order) VALUES
('คอมพิวเตอร์', 'COMPUTER', 'คอมพิวเตอร์ตั้งโต๊ะและเครื่องเซิร์ฟเวอร์', 'Monitor', '#3B82F6', 1),
('โน้ตบุ๊ค', 'LAPTOP', 'คอมพิวเตอร์พกพาและแท็บเล็ต', 'Laptop', '#10B981', 2),
('จอภาพ', 'MONITOR', 'จอภาพและจอแสดงผล', 'Monitor', '#8B5CF6', 3),
('เครื่องพิมพ์', 'PRINTER', 'เครื่องพิมพ์และเครื่องสแกนเนอร์', 'Printer', '#F59E0B', 4),
('UPS', 'UPS', 'เครื่องสำรองไฟและเครื่องปรับแรงดัน', 'Zap', '#EF4444', 5),
('อุปกรณ์เครือข่าย', 'NETWORK', 'Switch, Router, และอุปกรณ์เครือข่ายอื่นๆ', 'Network', '#6B7280', 6)
ON CONFLICT (code) DO NOTHING;

-- Add RLS policies
ALTER TABLE equipment_categories ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view categories
CREATE POLICY "Users can view equipment categories" ON equipment_categories
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admin and manager to manage categories
CREATE POLICY "Admin and manager can manage equipment categories" ON equipment_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );