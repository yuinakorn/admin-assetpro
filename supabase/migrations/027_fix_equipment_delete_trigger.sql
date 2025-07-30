-- ========================================
-- FIX EQUIPMENT DELETE TRIGGER ISSUE
-- ========================================

-- Temporarily disable the equipment history trigger during deletion
CREATE OR REPLACE FUNCTION disable_equipment_history_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log history for INSERT and UPDATE, not DELETE
  IF TG_OP = 'DELETE' THEN
    -- For DELETE operations, just return OLD without logging
    RETURN OLD;
  END IF;
  
  -- For INSERT and UPDATE, use the existing logic
  RETURN log_equipment_changes();
END;
$$ LANGUAGE plpgsql;

-- Replace the trigger with the new function
DROP TRIGGER IF EXISTS equipment_history_trigger ON equipment;
CREATE TRIGGER equipment_history_trigger
  AFTER INSERT OR UPDATE ON equipment
  FOR EACH ROW
  EXECUTE FUNCTION log_equipment_changes();

-- Create a separate trigger for DELETE that doesn't log to history
CREATE OR REPLACE FUNCTION log_equipment_deletion()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get current user ID safely
  current_user_id := auth.uid();
  
  -- If auth.uid() is null, try to get from the record
  IF current_user_id IS NULL THEN
    current_user_id := OLD.updated_by;
  END IF;
  
  -- Log deletion to a separate table or just return without logging
  -- to avoid foreign key constraint issues
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create deletion trigger that runs BEFORE delete
CREATE TRIGGER equipment_deletion_trigger
  BEFORE DELETE ON equipment
  FOR EACH ROW
  EXECUTE FUNCTION log_equipment_deletion();

-- Update the delete function to properly handle history
CREATE OR REPLACE FUNCTION delete_equipment_safely(equipment_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    equipment_exists BOOLEAN;
    equipment_record RECORD;
BEGIN
    -- Check if equipment exists and get its details
    SELECT * INTO equipment_record FROM equipment WHERE id = equipment_uuid;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Equipment with ID % does not exist', equipment_uuid;
    END IF;

    -- Log the deletion to history BEFORE deleting the equipment
    INSERT INTO equipment_history (
        equipment_id,
        action_type,
        field_name,
        old_value,
        new_value,
        changed_by
    ) VALUES (
        equipment_uuid,
        'delete',
        NULL,
        equipment_record.name || ' (' || equipment_record.equipment_code || ')',
        NULL,
        auth.uid()
    );

    -- Delete related data in the correct order (child tables first)
    
    -- Delete warranty alerts
    DELETE FROM warranty_alerts WHERE equipment_id = equipment_uuid;
    
    -- Delete maintenance records
    DELETE FROM maintenance_records WHERE equipment_id = equipment_uuid;
    
    -- Delete borrow records
    DELETE FROM borrow_records WHERE equipment_id = equipment_uuid;
    
    -- Delete equipment activities
    DELETE FROM equipment_activities WHERE equipment_id = equipment_uuid;
    
    -- Delete equipment images
    DELETE FROM equipment_images WHERE equipment_id = equipment_uuid;
    
    -- Finally delete the equipment (this will not trigger history logging due to our trigger change)
    DELETE FROM equipment WHERE id = equipment_uuid;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to delete equipment: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;