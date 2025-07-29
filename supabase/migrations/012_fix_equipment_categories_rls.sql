-- ========================================
-- FIX EQUIPMENT CATEGORIES RLS POLICIES
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view equipment categories" ON equipment_categories;
DROP POLICY IF EXISTS "Admin and manager can manage equipment categories" ON equipment_categories;

-- Disable RLS temporarily for testing
ALTER TABLE equipment_categories DISABLE ROW LEVEL SECURITY;

-- Alternative: Create more permissive policies for development
-- ALTER TABLE equipment_categories ENABLE ROW LEVEL SECURITY;
-- 
-- -- Allow all users to view categories (for development)
-- CREATE POLICY "Allow all users to view equipment categories" ON equipment_categories
--   FOR SELECT USING (true);
-- 
-- -- Allow all users to manage categories (for development)
-- CREATE POLICY "Allow all users to manage equipment categories" ON equipment_categories
--   FOR ALL USING (true);