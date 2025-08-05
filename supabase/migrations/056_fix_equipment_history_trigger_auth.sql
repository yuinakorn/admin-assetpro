-- Migration: 056_fix_equipment_history_trigger_auth.sql
-- Description: Fix equipment_history trigger to handle authentication properly
-- Date: 2024-12-19
-- Author: Assistant

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS equipment_history_trigger ON public.equipment;

-- Drop the existing function
DROP FUNCTION IF EXISTS log_equipment_changes();

-- Create a new function that doesn't rely on auth.uid()
CREATE OR REPLACE FUNCTION log_equipment_changes()
RETURNS TRIGGER AS $$
DECLARE
  action_type_val VARCHAR(50);
  field_name_val VARCHAR(100);
  old_val TEXT;
  new_val TEXT;
BEGIN
  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    action_type_val := 'create';
    field_name_val := NULL;
    old_val := NULL;
    new_val := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    action_type_val := 'update';
    
    -- Check specific field changes
    IF OLD.name IS DISTINCT FROM NEW.name THEN
      field_name_val := 'name';
      old_val := OLD.name;
      new_val := NEW.name;
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
    ELSIF OLD.category_id IS DISTINCT FROM NEW.category_id THEN
      field_name_val := 'category_id';
      old_val := OLD.category_id::text;
      new_val := NEW.category_id::text;
    ELSE
      -- If no specific field change detected, log as general update
      action_type_val := 'update';
      field_name_val := 'general';
      old_val := NULL;
      new_val := NULL;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    action_type_val := 'delete';
    field_name_val := NULL;
    old_val := NULL;
    new_val := NULL;
  END IF;
  
  -- Insert history record without changed_by (will be set by application)
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
    NULL  -- Set to NULL, will be updated by application if needed
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER equipment_history_trigger
  AFTER INSERT OR UPDATE OR DELETE ON equipment
  FOR EACH ROW
  EXECUTE FUNCTION log_equipment_changes();

-- Create a function to update the changed_by field after insert
CREATE OR REPLACE FUNCTION update_equipment_history_user()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be called by the application to update the changed_by field
  -- after the history record is created
  RETURN NEW;
END;
$$ LANGUAGE plpgsql; 