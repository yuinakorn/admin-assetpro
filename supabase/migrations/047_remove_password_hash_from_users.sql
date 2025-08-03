-- Migration: 047_remove_password_hash_from_users.sql
-- Description: Removes the redundant password_hash column from the public.users table.
-- Authentication is handled by Supabase Auth, so this column is not needed and prevents the sign-up trigger from working.
-- Date: 2024-07-28
-- Author: Gemini

ALTER TABLE public.users
DROP COLUMN IF EXISTS password_hash;

COMMENT ON TABLE public.users IS 'ตารางผู้ใช้งานระบบ. รหัสผ่านถูกจัดการโดย Supabase Auth.';

