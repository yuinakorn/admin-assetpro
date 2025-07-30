-- ========================================
-- FIX FOREIGN KEY CONSTRAINTS FOR SAFE DELETION
-- ========================================

-- Drop existing foreign key constraints that don't have proper ON DELETE behavior
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_department_id_fkey;
ALTER TABLE departments DROP CONSTRAINT IF EXISTS fk_departments_manager;
ALTER TABLE equipment DROP CONSTRAINT IF EXISTS equipment_department_id_fkey;
ALTER TABLE equipment DROP CONSTRAINT IF EXISTS equipment_current_user_id_fkey;
ALTER TABLE equipment DROP CONSTRAINT IF EXISTS equipment_created_by_fkey;
ALTER TABLE equipment DROP CONSTRAINT IF EXISTS equipment_updated_by_fkey;

-- Recreate foreign key constraints with proper ON DELETE behavior

-- Users -> Departments: SET NULL when department is deleted
ALTER TABLE users ADD CONSTRAINT users_department_id_fkey 
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- Departments -> Users (manager): SET NULL when manager is deleted
ALTER TABLE departments ADD CONSTRAINT fk_departments_manager 
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;

-- Equipment -> Departments: SET NULL when department is deleted
ALTER TABLE equipment ADD CONSTRAINT equipment_department_id_fkey 
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- Equipment -> Users (current_user): SET NULL when user is deleted
ALTER TABLE equipment ADD CONSTRAINT equipment_current_user_id_fkey 
  FOREIGN KEY (current_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Equipment -> Users (created_by): SET NULL when user is deleted
ALTER TABLE equipment ADD CONSTRAINT equipment_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Equipment -> Users (updated_by): SET NULL when user is deleted
ALTER TABLE equipment ADD CONSTRAINT equipment_updated_by_fkey 
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Note: Equipment-related tables already have ON DELETE CASCADE
-- equipment_images, equipment_activities, borrow_records, 
-- maintenance_records, warranty_alerts all have ON DELETE CASCADE
-- which means they will be automatically deleted when equipment is deleted 