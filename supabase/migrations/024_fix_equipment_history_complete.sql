-- ========================================
-- COMPLETE FIX FOR EQUIPMENT HISTORY SYSTEM
-- ========================================

-- First, drop the existing trigger and function
DROP TRIGGER IF EXISTS equipment_history_trigger ON equipment;
DROP FUNCTION IF EXISTS log_equipment_changes();

-- Recreate the function with proper logic
CREATE OR REPLACE FUNCTION log_equipment_changes()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
  action_type_val VARCHAR(50);
  field_name_val VARCHAR(100);
  old_val TEXT;
  new_val TEXT;
BEGIN
  -- Get current user ID from auth.uid() first
  current_user_id := auth.uid();
  
  -- If auth.uid() is null or doesn't exist in users table, try to get from the record
  IF current_user_id IS NULL OR NOT EXISTS (SELECT 1 FROM users WHERE id = current_user_id) THEN
    IF TG_OP = 'INSERT' THEN
      current_user_id := NEW.created_by;
    ELSIF TG_OP = 'UPDATE' THEN 
      current_user_id := NEW.updated_by;
    ELSIF TG_OP = 'DELETE' THEN
      current_user_id := OLD.updated_by;
    END IF;
  END IF;
  
  -- If we still don't have a valid user ID, set to null
  IF current_user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM users WHERE id = current_user_id) THEN
    current_user_id := NULL;
  END IF;
  
  -- Determine action type and values
  IF TG_OP = 'INSERT' THEN
    action_type_val := 'create';
    field_name_val := NULL;
    old_val := NULL;
    new_val := NEW.name || ' (' || NEW.equipment_code || ')';
  ELSIF TG_OP = 'UPDATE' THEN
    action_type_val := 'update';
    
    -- Check specific field changes
    IF OLD.name IS DISTINCT FROM NEW.name THEN
      field_name_val := 'name';
      old_val := OLD.name;
      new_val := NEW.name;
    ELSIF OLD.type IS DISTINCT FROM NEW.type THEN
      field_name_val := 'type';
      old_val := OLD.type::text;
      new_val := NEW.type::text;
    ELSIF OLD.brand IS DISTINCT FROM NEW.brand THEN
      field_name_val := 'brand';
      old_val := OLD.brand;
      new_val := NEW.brand;
    ELSIF OLD.model IS DISTINCT FROM NEW.model THEN
      field_name_val := 'model';
      old_val := OLD.model;
      new_val := NEW.model;
    ELSIF OLD.serial_number IS DISTINCT FROM NEW.serial_number THEN
      field_name_val := 'serial_number';
      old_val := OLD.serial_number;
      new_val := NEW.serial_number;
    ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
      action_type_val := 'status_change';
      field_name_val := 'status';
      old_val := OLD.status::text;
      new_val := NEW.status::text;
    ELSIF OLD.department_id IS DISTINCT FROM NEW.department_id THEN
      action_type_val := 'assignment_change';
      field_name_val := 'department_id';
      old_val := OLD.department_id::text;
      new_val := NEW.department_id::text;
    ELSIF OLD.current_user_id IS DISTINCT FROM NEW.current_user_id THEN
      action_type_val := 'assignment_change';
      field_name_val := 'current_user_id';
      old_val := OLD.current_user_id::text;
      new_val := NEW.current_user_id::text;
    ELSIF OLD.location IS DISTINCT FROM NEW.location THEN
      field_name_val := 'location';
      old_val := OLD.location;
      new_val := NEW.location;
    ELSIF OLD.purchase_date IS DISTINCT FROM NEW.purchase_date THEN
      field_name_val := 'purchase_date';
      old_val := OLD.purchase_date::text;
      new_val := NEW.purchase_date::text;
    ELSIF OLD.warranty_date IS DISTINCT FROM NEW.warranty_date THEN
      field_name_val := 'warranty_date';
      old_val := OLD.warranty_date::text;
      new_val := NEW.warranty_date::text;
    ELSIF OLD.purchase_price IS DISTINCT FROM NEW.purchase_price THEN
      field_name_val := 'purchase_price';
      old_val := OLD.purchase_price::text;
      new_val := NEW.purchase_price::text;
    ELSIF OLD.notes IS DISTINCT FROM NEW.notes THEN
      field_name_val := 'notes';
      old_val := OLD.notes;
      new_val := NEW.notes;
    ELSE
      -- If no specific field change detected, skip logging
      RETURN COALESCE(NEW, OLD);
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    action_type_val := 'delete';
    field_name_val := NULL;
    old_val := OLD.name || ' (' || OLD.equipment_code || ')';
    new_val := NULL;
  END IF;
  
  -- Insert history record (allow null changed_by)
  INSERT INTO equipment_history (
    equipment_id,
    action_type,
    field_name,
    old_value,
    new_value,
    changed_by
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    action_type_val,
    field_name_val,
    old_val,
    new_val,
    current_user_id
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER equipment_history_trigger
  AFTER INSERT OR UPDATE OR DELETE ON equipment
  FOR EACH ROW
  EXECUTE FUNCTION log_equipment_changes();

-- Ensure equipment_history table allows NULL in changed_by
ALTER TABLE equipment_history ALTER COLUMN changed_by DROP NOT NULL;

-- Update the view to work properly
DROP VIEW IF EXISTS equipment_history_with_users;
CREATE VIEW equipment_history_with_users AS
SELECT 
  eh.id,
  eh.equipment_id,
  eh.action_type,
  eh.field_name,
  eh.old_value,
  eh.new_value,
  eh.change_reason,
  eh.created_at,
  u.first_name,
  u.last_name,
  u.username,
  u.role as user_role
FROM equipment_history eh
LEFT JOIN users u ON eh.changed_by = u.id
ORDER BY eh.created_at DESC; 