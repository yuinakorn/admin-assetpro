-- ========================================
-- ADD EQUIPMENT HISTORY TRACKING
-- ========================================

-- Create equipment_history table to track changes
CREATE TABLE equipment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'status_change', 'assignment_change'
  field_name VARCHAR(100), -- specific field that was changed (for updates)
  old_value TEXT, -- previous value
  new_value TEXT, -- new value
  changed_by UUID REFERENCES users(id), -- who made the change
  change_reason TEXT, -- optional reason for the change
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_equipment_history_equipment_id ON equipment_history(equipment_id);
CREATE INDEX idx_equipment_history_created_at ON equipment_history(created_at);
CREATE INDEX idx_equipment_history_action_type ON equipment_history(action_type);

-- Create function to automatically log equipment changes
CREATE OR REPLACE FUNCTION log_equipment_changes()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
  action_type_val VARCHAR(50);
  field_name_val VARCHAR(100);
  old_val TEXT;
  new_val TEXT;
BEGIN
  -- Get current user ID (you might need to adjust this based on your auth setup)
  current_user_id := auth.uid();
  
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
  
  -- Insert history record
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

-- Create trigger to automatically log changes
CREATE TRIGGER equipment_history_trigger
  AFTER INSERT OR UPDATE OR DELETE ON equipment
  FOR EACH ROW
  EXECUTE FUNCTION log_equipment_changes();

-- Add RLS policies for equipment_history
ALTER TABLE equipment_history ENABLE ROW LEVEL SECURITY;

-- Allow users to view history for equipment they have access to
CREATE POLICY "Users can view equipment history" ON equipment_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM equipment e
      WHERE e.id = equipment_history.equipment_id
      AND (
        e.department_id IN (
          SELECT department_id FROM users WHERE id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() 
          AND role IN ('admin', 'manager')
        )
      )
    )
  );

-- Allow users to insert history records (for the trigger)
CREATE POLICY "System can insert equipment history" ON equipment_history
  FOR INSERT WITH CHECK (true);

-- Create view for easier querying of equipment history with user details
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