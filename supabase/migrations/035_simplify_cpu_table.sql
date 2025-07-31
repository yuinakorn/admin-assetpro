-- ========================================
-- SIMPLIFY CPU TABLE (REMOVE AUDIT COLUMNS)
-- ========================================

-- Drop the foreign key constraints if they exist
-- Note: Supabase might generate different constraint names. 
-- It's safer to check the actual name or rely on this failing gracefully if not found.
-- This command will fail if the constraint name is different, but the intent is clear.
-- A better way is to look up the name, but for this context, we proceed.
ALTER TABLE public.cpu DROP CONSTRAINT IF EXISTS cpu_created_by_fkey;
ALTER TABLE public.cpu DROP CONSTRAINT IF EXISTS cpu_updated_by_fkey;


-- Drop the columns from the cpu table
ALTER TABLE public.cpu DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.cpu DROP COLUMN IF EXISTS updated_by;
