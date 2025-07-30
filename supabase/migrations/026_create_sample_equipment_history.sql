-- ========================================
-- CREATE SAMPLE EQUIPMENT HISTORY DATA
-- ========================================

-- Create sample history records for existing equipment
INSERT INTO equipment_history (equipment_id, action_type, field_name, old_value, new_value, changed_by)
SELECT 
  e.id as equipment_id,
  'create' as action_type,
  NULL as field_name,
  NULL as old_value,
  e.name || ' (' || e.equipment_code || ')' as new_value,
  e.created_by as changed_by
FROM equipment e
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_history eh WHERE eh.equipment_id = e.id AND eh.action_type = 'create'
);

-- Create some sample update history for testing
INSERT INTO equipment_history (equipment_id, action_type, field_name, old_value, new_value, changed_by)
SELECT 
  e.id as equipment_id,
  'update' as action_type,
  'notes' as field_name,
  'ข้อมูลเก่า' as old_value,
  COALESCE(e.notes, 'ข้อมูลใหม่') as new_value,
  e.updated_by as changed_by
FROM equipment e
LIMIT 3; -- Only for first 3 equipment for testing