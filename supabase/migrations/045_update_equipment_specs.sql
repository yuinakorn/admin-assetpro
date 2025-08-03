-- Migration: 045_update_equipment_specs.sql
-- Description: Updates the equipment table to use a foreign key for CPU and adjusts spec columns.
-- Date: 2024-07-28
-- Author: Gemini

-- 1. Remove the old 'cpu' column if it exists
ALTER TABLE public.equipment
DROP COLUMN IF EXISTS cpu;

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

-- Finally, drop the old 'ram' column and rename the new one
ALTER TABLE public.equipment
DROP COLUMN ram;

ALTER TABLE public.equipment
RENAME COLUMN ram_gb TO ram;

-- Add an index for the new foreign key for better performance
CREATE INDEX IF NOT EXISTS idx_equipment_cpu_id ON public.equipment(cpu_id);

-- Add comments for the new columns
COMMENT ON COLUMN public.equipment.cpu_id IS 'Foreign key to the CPU table.';
COMMENT ON COLUMN public.equipment.cpu_series IS 'Specific CPU series or model, e.g., "Core i5-8250U".';
COMMENT ON COLUMN public.equipment.ram IS 'RAM size in Gigabytes (GB).';

