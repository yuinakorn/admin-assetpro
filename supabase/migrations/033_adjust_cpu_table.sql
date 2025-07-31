-- ========================================
-- ADJUST CPU TABLE SCHEMA
-- ========================================

-- Drop the existing cpu table
DROP TABLE IF EXISTS cpu;

-- Recreate the cpu table with creator/updater fields
CREATE TABLE IF NOT EXISTS cpu (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cpu_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id)
);

-- ADD RLS POLICIES AGAIN
ALTER TABLE cpu ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view CPUs"
ON cpu
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow admin users to manage CPUs"
ON cpu
FOR ALL
TO authenticated
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);
