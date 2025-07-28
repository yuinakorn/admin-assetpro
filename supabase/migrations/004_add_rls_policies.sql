-- ========================================
-- ROW LEVEL SECURITY POLICIES
-- ========================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can view departments" ON departments;
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

-- Admins and managers can insert departments
CREATE POLICY "Admins and managers can insert departments" ON departments 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Admins and managers can update departments
CREATE POLICY "Admins and managers can update departments" ON departments 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Admins can delete departments
CREATE POLICY "Admins can delete departments" ON departments 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ========================================
-- EQUIPMENT TABLE POLICIES
-- ========================================

-- Anyone can view equipment
CREATE POLICY "Anyone can view equipment" ON equipment 
    FOR SELECT USING (true);

-- Admins and managers can insert equipment
CREATE POLICY "Admins and managers can insert equipment" ON equipment 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Admins and managers can update equipment
CREATE POLICY "Admins and managers can update equipment" ON equipment 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Admins can delete equipment
CREATE POLICY "Admins can delete equipment" ON equipment 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ========================================
-- EQUIPMENT_ACTIVITIES TABLE POLICIES
-- ========================================

-- Anyone can view equipment activities
CREATE POLICY "Anyone can view equipment activities" ON equipment_activities 
    FOR SELECT USING (true);

-- Users can insert their own activities
CREATE POLICY "Users can insert equipment activities" ON equipment_activities 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins and managers can manage all activities
CREATE POLICY "Admins and managers can manage activities" ON equipment_activities 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- ========================================
-- BORROW_RECORDS TABLE POLICIES
-- ========================================

-- Users can view their own borrow records
CREATE POLICY "Users can view their own borrow records" ON borrow_records 
    FOR SELECT USING (auth.uid() = borrower_id);

-- Users can insert their own borrow records
CREATE POLICY "Users can insert their own borrow records" ON borrow_records 
    FOR INSERT WITH CHECK (auth.uid() = borrower_id);

-- Users can update their own borrow records
CREATE POLICY "Users can update their own borrow records" ON borrow_records 
    FOR UPDATE USING (auth.uid() = borrower_id);

-- Admins and managers can manage all borrow records
CREATE POLICY "Admins and managers can manage all borrow records" ON borrow_records 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- ========================================
-- MAINTENANCE_RECORDS TABLE POLICIES
-- ========================================

-- Anyone can view maintenance records
CREATE POLICY "Anyone can view maintenance records" ON maintenance_records 
    FOR SELECT USING (true);

-- Users can insert maintenance records they reported
CREATE POLICY "Users can insert maintenance records" ON maintenance_records 
    FOR INSERT WITH CHECK (auth.uid() = reported_by);

-- Admins and managers can manage all maintenance records
CREATE POLICY "Admins and managers can manage maintenance records" ON maintenance_records 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- ========================================
-- WARRANTY_ALERTS TABLE POLICIES
-- ========================================

-- Anyone can view warranty alerts
CREATE POLICY "Anyone can view warranty alerts" ON warranty_alerts 
    FOR SELECT USING (true);

-- Only system can insert warranty alerts (via triggers)
CREATE POLICY "System can insert warranty alerts" ON warranty_alerts 
    FOR INSERT WITH CHECK (false);

-- Admins and managers can manage warranty alerts
CREATE POLICY "Admins and managers can manage warranty alerts" ON warranty_alerts 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- ========================================
-- EQUIPMENT_IMAGES TABLE POLICIES
-- ========================================

-- Anyone can view equipment images
CREATE POLICY "Anyone can view equipment images" ON equipment_images 
    FOR SELECT USING (true);

-- Admins and managers can manage equipment images
CREATE POLICY "Admins and managers can manage equipment images" ON equipment_images 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    ); 