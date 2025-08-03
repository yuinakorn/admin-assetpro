-- Migration: 045_update_equipment_specs.sql
-- Description: Updates the equipment table to use a foreign key for CPU and adjusts spec columns.
-- Date: 2024-07-28
-- Author: Gemini

-- 1. Drop views and triggers that depend on the equipment table
DROP VIEW IF EXISTS equipment_details;
DROP VIEW IF EXISTS recent_activities;
DROP TRIGGER IF EXISTS equipment_history_trigger ON public.equipment;

-- 2. Remove the old 'cpu' column if it exists (only if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'equipment' 
    AND column_name = 'cpu'
  ) THEN
    ALTER TABLE public.equipment DROP COLUMN cpu;
  END IF;
END $$;

-- 2. Add the new 'cpu_id' column with a foreign key constraint to the 'cpu' table
ALTER TABLE public.equipment
ADD COLUMN cpu_id UUID REFERENCES public.cpu(id) ON DELETE SET NULL;

-- 3. Add the 'cpu_series' column for specific model details
ALTER TABLE public.equipment
ADD COLUMN cpu_series VARCHAR(100);

-- 4. Change the 'ram' column from VARCHAR to INTEGER
-- First, add a new temporary integer column
ALTER TABLE public.equipment
ADD COLUMN ram_gb INTEGER;

-- Next, update the new column with data from the old, converting it
-- This handles existing values like '8 GB', '16GB', etc. by extracting only numbers.
-- It sets non-numeric values to NULL.
UPDATE public.equipment
SET ram_gb = CAST(REGEXP_REPLACE(ram, '[^0-9]', '', 'g') AS INTEGER)
WHERE ram ~ '[0-9]';

-- Finally, drop the old 'ram' column and rename the new one (safely)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'equipment' 
    AND column_name = 'ram'
    AND data_type = 'character varying'
  ) THEN
    ALTER TABLE public.equipment DROP COLUMN ram;
  END IF;
END $$;

ALTER TABLE public.equipment
RENAME COLUMN ram_gb TO ram;

-- Add an index for the new foreign key for better performance
CREATE INDEX IF NOT EXISTS idx_equipment_cpu_id ON public.equipment(cpu_id);

-- Add comments for the new columns
COMMENT ON COLUMN public.equipment.cpu_id IS 'Foreign key to the CPU table.';
COMMENT ON COLUMN public.equipment.cpu_series IS 'Specific CPU series or model, e.g., "Core i5-8250U".';
COMMENT ON COLUMN public.equipment.ram IS 'RAM size in Gigabytes (GB).';

-- Recreate the equipment history trigger
CREATE TRIGGER equipment_history_trigger
  AFTER INSERT OR UPDATE OR DELETE ON equipment
  FOR EACH ROW
  EXECUTE FUNCTION log_equipment_changes();

-- Recreate views that depend on the equipment table
CREATE VIEW equipment_details AS
SELECT 
    e.id,
    e.equipment_code,
    e.name,
    e.type,
    e.brand,
    e.model,
    e.serial_number,
    e.asset_number,
    e.purchase_date,
    e.warranty_date,
    e.purchase_price,
    e.supplier,
    e.status,
    e.department_id,
    e.location,
    e.current_user_id,
    e.ram,
    e.storage,
    e.gpu,
    e.operating_system,
    e.product_key,
    e.ip_address,
    e.mac_address,
    e.hostname,
    e.notes,
    e.qr_code,
    e.created_by,
    e.updated_by,
    e.created_at,
    e.updated_at,
    d.name as department_name,
    d.code as department_code,
    u.first_name || ' ' || u.last_name as current_user_name,
    u.username as current_user_username
FROM equipment e
LEFT JOIN departments d ON e.department_id = d.id
LEFT JOIN users u ON e.current_user_id = u.id;

CREATE VIEW recent_activities AS
SELECT 
    ea.*,
    e.name as equipment_name,
    e.equipment_code,
    u.first_name || ' ' || u.last_name as user_name,
    u.username as user_username
FROM equipment_activities ea
JOIN equipment e ON ea.equipment_id = e.id
LEFT JOIN users u ON ea.user_id = u.id
ORDER BY ea.created_at DESC;

