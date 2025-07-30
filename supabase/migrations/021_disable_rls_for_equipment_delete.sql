-- ========================================
-- TEMPORARILY DISABLE RLS FOR EQUIPMENT DELETE TESTING
-- ========================================

-- Disable RLS for equipment table
ALTER TABLE equipment DISABLE ROW LEVEL SECURITY;

-- Disable RLS for related tables that might be causing issues
ALTER TABLE equipment_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE borrow_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_alerts DISABLE ROW LEVEL SECURITY;

-- Note: This is for testing purposes only
-- Remember to re-enable RLS after testing with:
-- ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE equipment_images ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE equipment_activities ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE borrow_records ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE warranty_alerts ENABLE ROW LEVEL SECURITY; 