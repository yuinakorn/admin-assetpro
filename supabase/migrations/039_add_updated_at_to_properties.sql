-- supabase/migrations/039_add_updated_at_to_properties.sql

-- 1. Create a reusable function to handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Add updated_at column to harddisk table
ALTER TABLE public.harddisk
ADD COLUMN updated_at TIMESTAMPTZ NULL;

-- 3. Add trigger to harddisk table
CREATE TRIGGER on_harddisk_update
  BEFORE UPDATE ON public.harddisk
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- 4. Add updated_at column to os table
ALTER TABLE public.os
ADD COLUMN updated_at TIMESTAMPTZ NULL;

-- 5. Add trigger to os table
CREATE TRIGGER on_os_update
  BEFORE UPDATE ON public.os
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
