-- ========================================
-- ADD EMPLOYEE NAME AND IMAGES SUPPORT
-- ========================================

-- Add current_employee_name field to equipment table
ALTER TABLE equipment 
ADD COLUMN current_employee_name TEXT;

-- Create equipment_images table for multiple images
CREATE TABLE IF NOT EXISTS equipment_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_name TEXT,
    file_size INTEGER,
    mime_type TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_equipment_images_equipment_id ON equipment_images(equipment_id);

-- Add RLS policies for equipment_images
ALTER TABLE equipment_images ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view images for equipment they have access to
CREATE POLICY "Users can view equipment images" ON equipment_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM equipment e
            WHERE e.id = equipment_images.equipment_id
            AND (
                e.created_by = auth.uid() OR
                e.current_user_id = auth.uid()
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
                e.current_user_id = auth.uid()
            )
        )
    );

-- Policy: Users can update images they uploaded
CREATE POLICY "Users can update equipment images" ON equipment_images
    FOR UPDATE USING (
        uploaded_by = auth.uid()
    );

-- Policy: Users can delete images they uploaded
CREATE POLICY "Users can delete equipment images" ON equipment_images
    FOR DELETE USING (
        uploaded_by = auth.uid()
    );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_equipment_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER equipment_images_updated_at_trigger
    BEFORE UPDATE ON equipment_images
    FOR EACH ROW
    EXECUTE FUNCTION update_equipment_images_updated_at();

-- Add comment for documentation
COMMENT ON COLUMN equipment.current_employee_name IS 'ชื่อเจ้าของเครื่องปัจจุบัน';
COMMENT ON TABLE equipment_images IS 'ตารางเก็บรูปภาพของครุภัณฑ์'; 