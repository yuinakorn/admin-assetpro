-- Migration: 050_add_equipment_property_foreign_keys.sql
-- Description: Adds foreign key columns for harddisk_id, os_id, and office_id to the equipment table
-- Date: 2024-12-19
-- Author: Assistant

-- Add harddisk_id foreign key column
ALTER TABLE public.equipment
ADD COLUMN harddisk_id UUID REFERENCES public.harddisk(id) ON DELETE SET NULL;

-- Add os_id foreign key column
ALTER TABLE public.equipment
ADD COLUMN os_id UUID REFERENCES public.os(id) ON DELETE SET NULL;

-- Add office_id foreign key column
ALTER TABLE public.equipment
ADD COLUMN office_id UUID REFERENCES public.office(id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_equipment_harddisk_id ON public.equipment(harddisk_id);
CREATE INDEX IF NOT EXISTS idx_equipment_os_id ON public.equipment(os_id);
CREATE INDEX IF NOT EXISTS idx_equipment_office_id ON public.equipment(office_id);

-- Add comments for the new columns
COMMENT ON COLUMN public.equipment.harddisk_id IS 'Foreign key to the harddisk table.';
COMMENT ON COLUMN public.equipment.os_id IS 'Foreign key to the os table.';
COMMENT ON COLUMN public.equipment.office_id IS 'Foreign key to the office table.'; 