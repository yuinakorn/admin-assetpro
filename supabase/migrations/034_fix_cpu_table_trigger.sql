-- ========================================
-- FIX CPU TABLE TRIGGER
-- ========================================

-- Create a generic trigger function to update the updated_at column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists to avoid errors
DROP TRIGGER IF EXISTS handle_cpu_update ON public.cpu;

-- Create a trigger that calls the function before any update on the cpu table
CREATE TRIGGER handle_cpu_update
BEFORE UPDATE ON public.cpu
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
