-- Migration: 057_remove_asset_number_unique_constraint.sql
-- Description: Removes the UNIQUE constraint from asset_number field in equipment table
-- Date: 2024-12-19
-- Author: Assistant

-- Remove the UNIQUE constraint from asset_number
ALTER TABLE public.equipment 
DROP CONSTRAINT IF EXISTS equipment_asset_number_key;

-- Add comment to document the change
COMMENT ON COLUMN public.equipment.asset_number IS 'เลขครุภัณฑ์ขององค์กร (ไม่จำเป็นต้องเป็น unique)';
