-- ========================================
-- ROLE-BASED ACCESS CONTROL (RBAC)
-- ========================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Anyone can view departments" ON departments;
DROP POLICY IF EXISTS "Admins and managers can insert departments" ON departments;
DROP POLICY IF EXISTS "Admins and managers can update departments" ON departments;
DROP POLICY IF EXISTS "Admins can delete departments" ON departments;
DROP POLICY IF EXISTS "Users can view equipment" ON equipment;
DROP POLICY IF EXISTS "Admins can manage equipment" ON equipment;

-- ========================================
-- USERS TABLE POLICIES
-- ========================================

-- Users can view their own data
CREATE POLICY "Users can view their own data" ON users 
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update their own data" ON users 
    FOR UPDATE USING (auth.uid() = id);

-- Admins can manage all users
CREATE POLICY "Admins can manage all users" ON users 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ========================================
-- DEPARTMENTS TABLE POLICIES
-- ========================================

-- Anyone can view departments
CREATE POLICY "Anyone can view departments" ON departments 
    FOR SELECT USING (true);

-- Only admins can insert departments
CREATE POLICY "Only admins can insert departments" ON departments 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can update departments
CREATE POLICY "Only admins can update departments" ON departments 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can delete departments
CREATE POLICY "Only admins can delete departments" ON departments 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ========================================
-- EQUIPMENT TABLE POLICIES
-- ========================================

-- Users can view equipment in their department
CREATE POLICY "Users can view equipment in their department" ON equipment 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR department_id = equipment.department_id)
        )
    );

-- Managers can insert equipment in their department
CREATE POLICY "Managers can insert equipment in their department" ON equipment 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'manager' 
            AND department_id = equipment.department_id
        )
        OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Managers can update equipment in their department (but not delete)
CREATE POLICY "Managers can update equipment in their department" ON equipment 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'manager' 
            AND department_id = equipment.department_id
        )
        OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can delete equipment
CREATE POLICY "Only admins can delete equipment" ON equipment 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ========================================
-- EQUIPMENT CATEGORIES TABLE POLICIES
-- ========================================

-- Anyone can view equipment categories
CREATE POLICY "Anyone can view equipment categories" ON equipment_categories 
    FOR SELECT USING (true);

-- Managers and admins can insert equipment categories
CREATE POLICY "Managers and admins can insert equipment categories" ON equipment_categories 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('manager', 'admin')
        )
    );

-- Managers and admins can update equipment categories
CREATE POLICY "Managers and admins can update equipment categories" ON equipment_categories 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('manager', 'admin')
        )
    );

-- Only admins can delete equipment categories
CREATE POLICY "Only admins can delete equipment categories" ON equipment_categories 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ========================================
-- EQUIPMENT ACTIVITIES TABLE POLICIES
-- ========================================

-- Users can view activities in their department
CREATE POLICY "Users can view activities in their department" ON equipment_activities 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN equipment e ON e.id = equipment_activities.equipment_id
            WHERE u.id = auth.uid() 
            AND (u.role = 'admin' OR u.department_id = e.department_id)
        )
    );

-- Users can insert activities for equipment in their department
CREATE POLICY "Users can insert activities in their department" ON equipment_activities 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u
            JOIN equipment e ON e.id = equipment_activities.equipment_id
            WHERE u.id = auth.uid() 
            AND (u.role = 'admin' OR u.department_id = e.department_id)
        )
    );

-- Only admins can update/delete activities
CREATE POLICY "Only admins can manage activities" ON equipment_activities 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ========================================
-- BORROW RECORDS TABLE POLICIES
-- ========================================

-- Users can view borrow records in their department
CREATE POLICY "Users can view borrow records in their department" ON borrow_records 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN equipment e ON e.id = borrow_records.equipment_id
            WHERE u.id = auth.uid() 
            AND (u.role = 'admin' OR u.department_id = e.department_id)
        )
    );

-- Users can insert borrow records for equipment in their department
CREATE POLICY "Users can insert borrow records in their department" ON borrow_records 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u
            JOIN equipment e ON e.id = borrow_records.equipment_id
            WHERE u.id = auth.uid() 
            AND (u.role = 'admin' OR u.department_id = e.department_id)
        )
    );

-- Only admins can update/delete borrow records
CREATE POLICY "Only admins can manage borrow records" ON borrow_records 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ========================================
-- MAINTENANCE RECORDS TABLE POLICIES
-- ========================================

-- Users can view maintenance records in their department
CREATE POLICY "Users can view maintenance records in their department" ON maintenance_records 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN equipment e ON e.id = maintenance_records.equipment_id
            WHERE u.id = auth.uid() 
            AND (u.role = 'admin' OR u.department_id = e.department_id)
        )
    );

-- Users can insert maintenance records for equipment in their department
CREATE POLICY "Users can insert maintenance records in their department" ON maintenance_records 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u
            JOIN equipment e ON e.id = maintenance_records.equipment_id
            WHERE u.id = auth.uid() 
            AND (u.role = 'admin' OR u.department_id = e.department_id)
        )
    );

-- Only admins can update/delete maintenance records
CREATE POLICY "Only admins can manage maintenance records" ON maintenance_records 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );