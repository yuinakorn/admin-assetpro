-- ========================================
-- FIX EQUIPMENT HISTORY RLS ISSUES
-- ========================================

-- Disable RLS for equipment_history table for testing
ALTER TABLE equipment_history DISABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view equipment history" ON equipment_history;
DROP POLICY IF EXISTS "System can insert equipment history" ON equipment_history;

-- Note: This is for development/testing only
-- Remember to re-enable RLS and apply proper policies for production