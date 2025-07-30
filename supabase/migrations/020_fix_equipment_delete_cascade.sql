-- ========================================
-- FIX EQUIPMENT DELETE CASCADE ISSUES
-- ========================================

-- Create a function to safely delete equipment and all related data
CREATE OR REPLACE FUNCTION delete_equipment_safely(equipment_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    equipment_exists BOOLEAN;
BEGIN
    -- Check if equipment exists
    SELECT EXISTS(SELECT 1 FROM equipment WHERE id = equipment_uuid) INTO equipment_exists;
    
    IF NOT equipment_exists THEN
        RAISE EXCEPTION 'Equipment with ID % does not exist', equipment_uuid;
    END IF;

    -- Delete related data in the correct order (child tables first)
    
    -- 1. Delete warranty alerts
    DELETE FROM warranty_alerts WHERE equipment_id = equipment_uuid;
    
    -- 2. Delete maintenance records
    DELETE FROM maintenance_records WHERE equipment_id = equipment_uuid;
    
    -- 3. Delete borrow records
    DELETE FROM borrow_records WHERE equipment_id = equipment_uuid;
    
    -- 4. Delete equipment activities
    DELETE FROM equipment_activities WHERE equipment_id = equipment_uuid;
    
    -- 5. Delete equipment images
    DELETE FROM equipment_images WHERE equipment_id = equipment_uuid;
    
    -- 6. Delete equipment history (if exists)
    DELETE FROM equipment_history WHERE equipment_id = equipment_uuid;
    
    -- 7. Finally delete the equipment
    DELETE FROM equipment WHERE id = equipment_uuid;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to delete equipment: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_equipment_safely(UUID) TO authenticated;

-- Create a view to show equipment with related data counts
CREATE OR REPLACE VIEW equipment_with_related_counts AS
SELECT 
    e.*,
    COALESCE(img_count.count, 0) as image_count,
    COALESCE(act_count.count, 0) as activity_count,
    COALESCE(borrow_count.count, 0) as borrow_count,
    COALESCE(maint_count.count, 0) as maintenance_count,
    COALESCE(warranty_count.count, 0) as warranty_count,
    (COALESCE(img_count.count, 0) + 
     COALESCE(act_count.count, 0) + 
     COALESCE(borrow_count.count, 0) + 
     COALESCE(maint_count.count, 0) + 
     COALESCE(warranty_count.count, 0)) as total_related_records
FROM equipment e
LEFT JOIN (
    SELECT equipment_id, COUNT(*) as count 
    FROM equipment_images 
    GROUP BY equipment_id
) img_count ON e.id = img_count.equipment_id
LEFT JOIN (
    SELECT equipment_id, COUNT(*) as count 
    FROM equipment_activities 
    GROUP BY equipment_id
) act_count ON e.id = act_count.equipment_id
LEFT JOIN (
    SELECT equipment_id, COUNT(*) as count 
    FROM borrow_records 
    GROUP BY equipment_id
) borrow_count ON e.id = borrow_count.equipment_id
LEFT JOIN (
    SELECT equipment_id, COUNT(*) as count 
    FROM maintenance_records 
    GROUP BY equipment_id
) maint_count ON e.id = maint_count.equipment_id
LEFT JOIN (
    SELECT equipment_id, COUNT(*) as count 
    FROM warranty_alerts 
    GROUP BY equipment_id
) warranty_count ON e.id = warranty_count.equipment_id;

-- Grant select permission on the view
GRANT SELECT ON equipment_with_related_counts TO authenticated; 