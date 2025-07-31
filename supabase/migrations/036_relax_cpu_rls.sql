-- ========================================
-- RELAX CPU RLS POLICY
-- ========================================

-- Drop the restrictive admin-only policy first to avoid conflicts
DROP POLICY IF EXISTS "Allow admin users to manage CPUs" ON public.cpu;

-- Create a new, more permissive policy that allows any authenticated user to manage CPUs.
-- This is suitable for development environments.
CREATE POLICY "Allow authenticated users to manage CPUs"
ON public.cpu
FOR ALL -- This covers INSERT, UPDATE, and DELETE
TO authenticated
USING (true)
WITH CHECK (true);
