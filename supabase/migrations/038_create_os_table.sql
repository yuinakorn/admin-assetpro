-- supabase/migrations/038_create_os_table.sql

-- Create the os table
CREATE TABLE public.os (
    id SERIAL PRIMARY KEY,
    os_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments to the table and columns
COMMENT ON TABLE public.os IS 'Stores different types of operating systems.';
COMMENT ON COLUMN public.os.id IS 'Unique identifier for the OS type.';
COMMENT ON COLUMN public.os.os_name IS 'The name of the operating system (e.g., Windows 11, macOS Sonoma, Ubuntu 22.04).';
COMMENT ON COLUMN public.os.created_at IS 'Timestamp of when the record was created.';

-- Enable Row Level Security (RLS)
ALTER TABLE public.os ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Note: These policies assume the custom claim functions (get_my_claim) from the previous migration exist.

-- 1. Allow authenticated users to read all OS types
CREATE POLICY "Allow authenticated users to read os types"
ON public.os
FOR SELECT
TO authenticated
USING (true);

-- 2. Allow users with 'admin' role to insert new OS types
CREATE POLICY "Allow admins to insert os types"
ON public.os
FOR INSERT
TO authenticated
WITH CHECK (
  get_my_claim('role') = '"admin"'::jsonb
);

-- 3. Allow users with 'admin' role to update OS types
CREATE POLICY "Allow admins to update os types"
ON public.os
FOR UPDATE
TO authenticated
USING (
  get_my_claim('role') = '"admin"'::jsonb
)
WITH CHECK (
  get_my_claim('role') = '"admin"'::jsonb
);

-- 4. Allow users with 'admin' role to delete OS types
CREATE POLICY "Allow admins to delete os types"
ON public.os
FOR DELETE
TO authenticated
USING (
  get_my_claim('role') = '"admin"'::jsonb
);
