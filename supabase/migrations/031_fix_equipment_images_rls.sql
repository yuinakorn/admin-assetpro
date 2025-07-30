-- ========================================
-- FIX EQUIPMENT IMAGES RLS POLICIES
-- ========================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view equipment images" ON equipment_images;
DROP POLICY IF EXISTS "Users can insert equipment images" ON equipment_images;
DROP POLICY IF EXISTS "Users can update equipment images" ON equipment_images;
DROP POLICY IF EXISTS "Users can delete equipment images" ON equipment_images;

-- Temporarily disable RLS for testing
ALTER TABLE equipment_images DISABLE ROW LEVEL SECURITY;

-- Note: This is for development/testing only
-- For production, you should create proper RLS policies based on your security requirements
-- Example of proper RLS policies (uncomment when ready for production):

/*
-- Policy: Users can view images for equipment they have access to
CREATE POLICY "Users can view equipment images" ON equipment_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM equipment e
            WHERE e.id = equipment_images.equipment_id
            AND (
                e.created_by = auth.uid() OR
                e.current_user_id = auth.uid() OR
                auth.uid() IN (
                    SELECT id FROM users WHERE role = 'admin'
                )
            )
        )
    );

-- Policy: Users can insert images for equipment they can edit
CREATE POLICY "Users can insert equipment images" ON equipment_images
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM equipment e
            WHERE e.id = equipment_images.equipment_id
            AND (
                e.created_by = auth.uid() OR
                e.current_user_id = auth.uid() OR
                auth.uid() IN (
                    SELECT id FROM users WHERE role = 'admin'
                )
            )
        )
    );

-- Policy: Users can update images they uploaded
CREATE POLICY "Users can update equipment images" ON equipment_images
    FOR UPDATE USING (
        uploaded_by = auth.uid() OR
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'admin'
        )
    );

-- Policy: Users can delete images they uploaded
CREATE POLICY "Users can delete equipment images" ON equipment_images
    FOR DELETE USING (
        uploaded_by = auth.uid() OR
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'admin'
        )
    );
*/ 