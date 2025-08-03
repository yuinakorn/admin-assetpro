-- Migration: 053_remove_type_column_and_enum.sql
-- Description: Remove the old 'type' column and equipment_type enum
-- Date: 2024-12-19
-- Author: Assistant

-- Drop the equipment_history_trigger first to avoid dependency issues
DROP TRIGGER IF EXISTS equipment_history_trigger ON public.equipment;

-- Drop the old 'type' column as it's now redundant
ALTER TABLE public.equipment
DROP COLUMN IF EXISTS type;

-- Drop the now-unused equipment_type enum
DROP TYPE IF EXISTS public.equipment_type;

-- The trigger will be recreated by migration 052_fix_equipment_history_function.sql 