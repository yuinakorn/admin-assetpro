-- Migration: 003_add_additional_indexes.sql
-- Description: Add additional performance indexes for better query performance
-- Date: 2024-01-01
-- Author: System

-- Composite indexes for common query patterns
CREATE INDEX idx_equipment_department_status ON equipment(department_id, status);
CREATE INDEX idx_equipment_type_status ON equipment(type, status);
CREATE INDEX idx_equipment_warranty_status ON equipment(warranty_date, status);

-- Indexes for date-based queries
CREATE INDEX idx_equipment_activities_date ON equipment_activities(created_at DESC);
CREATE INDEX idx_borrow_records_date ON borrow_records(borrow_date DESC);
CREATE INDEX idx_maintenance_records_date ON maintenance_records(reported_date DESC);

-- Indexes for search functionality (using english instead of thai)
CREATE INDEX idx_equipment_search ON equipment USING gin(to_tsvector('english', name || ' ' || brand || ' ' || model || ' ' || serial_number));
CREATE INDEX idx_users_search ON users USING gin(to_tsvector('english', first_name || ' ' || last_name || ' ' || username || ' ' || email));

-- Indexes for dashboard queries
CREATE INDEX idx_equipment_dashboard ON equipment(status, warranty_date, department_id);
CREATE INDEX idx_activities_recent ON equipment_activities(equipment_id, created_at DESC);

-- Indexes for borrow/return tracking
CREATE INDEX idx_borrow_records_overdue ON borrow_records(status, expected_return_date) WHERE status = 'borrowed';
CREATE INDEX idx_borrow_records_equipment_status ON borrow_records(equipment_id, status);

-- Indexes for maintenance tracking
CREATE INDEX idx_maintenance_records_status_priority ON maintenance_records(status, priority);
CREATE INDEX idx_maintenance_records_assigned ON maintenance_records(assigned_to, status);

-- Indexes for warranty alerts
CREATE INDEX idx_warranty_alerts_unacknowledged ON warranty_alerts(equipment_id, is_acknowledged) WHERE is_acknowledged = false;
CREATE INDEX idx_warranty_alerts_date ON warranty_alerts(alert_date, alert_type);

-- Indexes for equipment images
CREATE INDEX idx_equipment_images_type ON equipment_images(equipment_id, image_type);
CREATE INDEX idx_equipment_images_uploaded ON equipment_images(uploaded_by, created_at DESC); 