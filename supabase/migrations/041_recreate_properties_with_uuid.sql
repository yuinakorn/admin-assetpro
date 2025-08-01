-- supabase/migrations/041_recreate_properties_with_uuid.sql

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.harddisk;
DROP TABLE IF EXISTS public.os;
DROP TABLE IF EXISTS public.office;

-- ========================================
-- RECREATE HARDDISK TABLE WITH UUID
-- ========================================
CREATE TABLE public.harddisk (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hdd_type VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);
COMMENT ON TABLE public.harddisk IS 'Stores different types of hard disks available.';
ALTER TABLE public.harddisk ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER on_harddisk_update
  BEFORE UPDATE ON public.harddisk
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

CREATE POLICY "Allow authenticated users to read harddisk types" ON public.harddisk FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admins to insert harddisk types" ON public.harddisk FOR INSERT TO authenticated WITH CHECK (get_my_claim('role') = '"admin"'::jsonb);
CREATE POLICY "Allow admins to update harddisk types" ON public.harddisk FOR UPDATE TO authenticated USING (get_my_claim('role') = '"admin"'::jsonb) WITH CHECK (get_my_claim('role') = '"admin"'::jsonb);
CREATE POLICY "Allow admins to delete harddisk types" ON public.harddisk FOR DELETE TO authenticated USING (get_my_claim('role') = '"admin"'::jsonb);


-- ========================================
-- RECREATE OS TABLE WITH UUID
-- ========================================
CREATE TABLE public.os (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    os_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);
COMMENT ON TABLE public.os IS 'Stores different types of operating systems.';
ALTER TABLE public.os ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER on_os_update
  BEFORE UPDATE ON public.os
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

CREATE POLICY "Allow authenticated users to read os types" ON public.os FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admins to insert os types" ON public.os FOR INSERT TO authenticated WITH CHECK (get_my_claim('role') = '"admin"'::jsonb);
CREATE POLICY "Allow admins to update os types" ON public.os FOR UPDATE TO authenticated USING (get_my_claim('role') = '"admin"'::jsonb) WITH CHECK (get_my_claim('role') = '"admin"'::jsonb);
CREATE POLICY "Allow admins to delete os types" ON public.os FOR DELETE TO authenticated USING (get_my_claim('role') = '"admin"'::jsonb);


-- ========================================
-- RECREATE OFFICE TABLE WITH UUID
-- ========================================
CREATE TABLE public.office (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    office_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);
COMMENT ON TABLE public.office IS 'Stores different types of office software suites.';
ALTER TABLE public.office ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER on_office_update
  BEFORE UPDATE ON public.office
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

CREATE POLICY "Allow authenticated users to read office types" ON public.office FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admins to insert office types" ON public.office FOR INSERT TO authenticated WITH CHECK (get_my_claim('role') = '"admin"'::jsonb);
CREATE POLICY "Allow admins to update office types" ON public.office FOR UPDATE TO authenticated USING (get_my_claim('role') = '"admin"'::jsonb) WITH CHECK (get_my_claim('role') = '"admin"'::jsonb);
CREATE POLICY "Allow admins to delete office types" ON public.office FOR DELETE TO authenticated USING (get_my_claim('role') = '"admin"'::jsonb);
