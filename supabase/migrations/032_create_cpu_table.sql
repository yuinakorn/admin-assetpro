-- ========================================
-- CREATE CPU TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS cpu (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT,
    cores INTEGER,
    threads INTEGER,
    base_clock REAL,
    boost_clock REAL,
    socket TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ADD RLS POLICIES
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
