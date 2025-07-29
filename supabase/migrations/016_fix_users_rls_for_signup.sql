-- ========================================
-- FIX USERS RLS FOR SIGNUP
-- ========================================

-- Temporarily disable RLS for users table to allow signup
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Note: This is for development/testing purposes
-- In production, you should create proper RLS policies