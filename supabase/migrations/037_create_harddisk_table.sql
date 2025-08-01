-- supabase/migrations/037_create_harddisk_table.sql

-- Custom functions to get user claims from JWT
-- See: https://supabase.com/docs/guides/auth/custom-claims-and-role-based-access-control-rbac

CREATE OR REPLACE FUNCTION public.get_my_claims()
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(
    current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata',
    '{}'::jsonb
  );
$$;

CREATE OR REPLACE FUNCTION public.get_my_claim(claim TEXT)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(
    current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' -> claim,
    'null'::jsonb
  );
$$;

-- Create the harddisk table
CREATE TABLE public.harddisk (
    id SERIAL PRIMARY KEY,
    hdd_type VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments to the table and columns
COMMENT ON TABLE public.harddisk IS 'Stores different types of hard disks available.';
COMMENT ON COLUMN public.harddisk.id IS 'Unique identifier for the hard disk type.';
COMMENT ON COLUMN public.harddisk.hdd_type IS 'The type or name of the hard disk (e.g., SSD, NVMe, HDD).';
COMMENT ON COLUMN public.harddisk.created_at IS 'Timestamp of when the record was created.';

-- Enable Row Level Security (RLS)
ALTER TABLE public.harddisk ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- 1. Allow authenticated users to read all hard disk types
CREATE POLICY "Allow authenticated users to read harddisk types"
ON public.harddisk
FOR SELECT
TO authenticated
USING (true);

-- 2. Allow users with 'admin' role to insert new hard disk types
CREATE POLICY "Allow admins to insert harddisk types"
ON public.harddisk
FOR INSERT
TO authenticated
WITH CHECK (
  get_my_claim('role') = '"admin"'::jsonb
);

-- 3. Allow users with 'admin' role to update hard disk types
CREATE POLICY "Allow admins to update harddisk types"
ON public.harddisk
FOR UPDATE
TO authenticated
USING (
  get_my_claim('role') = '"admin"'::jsonb
)
WITH CHECK (
  get_my_claim('role') = '"admin"'::jsonb
);

-- 4. Allow users with 'admin' role to delete hard disk types
CREATE POLICY "Allow admins to delete harddisk types"
ON public.harddisk
FOR DELETE
TO authenticated
USING (
  get_my_claim('role') = '"admin"'::jsonb
);
