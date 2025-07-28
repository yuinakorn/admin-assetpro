-- ========================================
-- TEMPORARILY DISABLE RLS FOR TESTING
-- ========================================

-- Disable RLS on all tables for testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE borrow_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_images DISABLE ROW LEVEL SECURITY;

-- Note: This is for development/testing only
-- Remember to re-enable RLS and apply proper policies for production 