-- supabase/migrations/040_create_office_table.sql

-- Create the office table
CREATE TABLE public.office (
    id SERIAL PRIMARY KEY,
    office_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Add comments to the table and columns
COMMENT ON TABLE public.office IS 'Stores different types of office software suites.';
COMMENT ON COLUMN public.office.id IS 'Unique identifier for the office suite.';
COMMENT ON COLUMN public.office.office_name IS 'The name of the office suite (e.g., Microsoft 365, Google Workspace).';
COMMENT ON COLUMN public.office.created_at IS 'Timestamp of when the record was created.';
COMMENT ON COLUMN public.office.updated_at IS 'Timestamp of when the record was last updated.';

-- Enable Row Level Security (RLS)
ALTER TABLE public.office ENABLE ROW LEVEL SECURITY;

-- Add trigger to office table to handle updated_at
-- This assumes the handle_updated_at function from migration 039 exists.
CREATE TRIGGER on_office_update
  BEFORE UPDATE ON public.office
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Create RLS policies
-- These policies assume the custom claim functions (get_my_claim) from a previous migration exist.

-- 1. Allow authenticated users to read all office types
CREATE POLICY "Allow authenticated users to read office types"
ON public.office
FOR SELECT
TO authenticated
USING (true);

-- 2. Allow users with 'admin' role to insert new office types
CREATE POLICY "Allow admins to insert office types"
ON public.office
FOR INSERT
TO authenticated
WITH CHECK (
  get_my_claim('role') = '"admin"'::jsonb
);

-- 3. Allow users with 'admin' role to update office types
CREATE POLICY "Allow admins to update office types"
ON public.office
FOR UPDATE
TO authenticated
USING (
  get_my_claim('role') = '"admin"'::jsonb
)
WITH CHECK (
  get_my_claim('role') = '"admin"'::jsonb
);

-- 4. Allow users with 'admin' role to delete office types
CREATE POLICY "Allow admins to delete office types"
ON public.office
FOR DELETE
TO authenticated
USING (
  get_my_claim('role') = '"admin"'::jsonb
);
