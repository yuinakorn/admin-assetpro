-- Migration: 053_remove_type_column_and_enum.sql
-- Description: Remove the old 'type' column and equipment_type enum
-- Date: 2024-12-19
-- Author: Assistant

-- Drop the equipment_history_trigger first to avoid dependency issues
DROP TRIGGER IF EXISTS equipment_history_trigger ON public.equipment;

-- Drop views that depend on the type column
DROP VIEW IF EXISTS equipment_details;
DROP VIEW IF EXISTS recent_activities;

-- Drop the old 'type' column as it's now redundant
ALTER TABLE public.equipment
DROP COLUMN IF EXISTS type;

-- Drop the now-unused equipment_type enum
DROP TYPE IF EXISTS public.equipment_type;

-- Recreate views that depend on the equipment table (without type column)
CREATE VIEW equipment_details AS
SELECT 
    e.id,
    e.equipment_code,
    e.name,
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

-- The trigger will be recreated by migration 052_fix_equipment_history_function.sql 