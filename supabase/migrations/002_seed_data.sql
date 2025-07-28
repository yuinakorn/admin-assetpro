-- Migration: 002_seed_data.sql
-- Description: Seed initial data for Computer Equipment Asset Management System
-- Date: 2024-01-01
-- Author: System

-- Insert sample departments
INSERT INTO departments (name, code, description) VALUES
('แผนกคอมพิวเตอร์', 'IT', 'แผนกเทคโนโลยีสารสนเทศ'),
('แผนกบัญชี', 'ACC', 'แผนกบัญชีและการเงิน'),
('แผนกบุคคล', 'HR', 'แผนกทรัพยากรบุคคล'),
('แผนกธุรการ', 'ADMIN', 'แผนกธุรการและงานสารบรรณ');

-- Insert sample users (password_hash should be properly hashed in production)
INSERT INTO users (username, email, password_hash, first_name, last_name, role, department_id) VALUES
('admin', 'admin@company.com', '$2b$10$dummy.hash.for.demo', 'ผู้ดูแล', 'ระบบ', 'admin', (SELECT id FROM departments WHERE code = 'IT')),
('manager1', 'manager@company.com', '$2b$10$dummy.hash.for.demo', 'สมชาย', 'ใจดี', 'manager', (SELECT id FROM departments WHERE code = 'IT')),
('user1', 'user1@company.com', '$2b$10$dummy.hash.for.demo', 'มานี', 'สบายดี', 'user', (SELECT id FROM departments WHERE code = 'HR')),
('user2', 'user2@company.com', '$2b$10$dummy.hash.for.demo', 'ประยุทธ์', 'มั่นคง', 'user', (SELECT id FROM departments WHERE code = 'ACC')),
('user3', 'user3@company.com', '$2b$10$dummy.hash.for.demo', 'สุธิดา', 'เรียบร้อย', 'user', (SELECT id FROM departments WHERE code = 'ADMIN'));

-- Update department managers
UPDATE departments SET manager_id = (SELECT id FROM users WHERE username = 'manager1') WHERE code = 'IT';

-- Insert sample equipment
INSERT INTO equipment (name, type, brand, model, serial_number, asset_number, department_id, current_user_id, status, warranty_date, purchase_date, purchase_price, supplier, cpu, ram, storage, operating_system, ip_address, mac_address, hostname, location, notes) VALUES
('คอมพิวเตอร์ตั้งโต๊ะ Dell OptiPlex 7090', 'computer', 'Dell', 'OptiPlex 7090', '7XKWN3J', 'PC001', (SELECT id FROM departments WHERE code = 'IT'), (SELECT id FROM users WHERE username = 'manager1'), 'normal', '2025-12-31', '2023-01-15', 45000.00, 'Dell Thailand', 'Intel Core i5-11500', '8GB DDR4', '256GB SSD', 'Windows 11 Pro', '192.168.1.100', '00:1B:44:11:3A:B7', 'IT-PC001', 'ห้อง 201 อาคาร A', 'คอมพิวเตอร์สำหรับงานพัฒนา'),
('โน้ตบุ๊ค Lenovo ThinkPad E14', 'laptop', 'Lenovo', 'ThinkPad E14', 'PC1A2B3C', 'NB001', (SELECT id FROM departments WHERE code = 'HR'), (SELECT id FROM users WHERE username = 'user1'), 'normal', '2024-08-15', '2022-06-20', 35000.00, 'Lenovo Thailand', 'Intel Core i5-1135G7', '16GB DDR4', '512GB SSD', 'Windows 11 Home', '192.168.1.101', '00:1B:44:11:3A:B8', 'HR-LAP001', 'ห้อง 301 อาคาร B', 'โน้ตบุ๊คสำหรับงานบุคคล'),
('เครื่องพิมพ์ HP LaserJet Pro 404dn', 'printer', 'HP', 'LaserJet Pro 404dn', 'VNC8K12345', 'PR001', (SELECT id FROM departments WHERE code = 'ACC'), (SELECT id FROM users WHERE username = 'user2'), 'maintenance', '2024-03-20', '2021-09-10', 15000.00, 'HP Thailand', NULL, NULL, NULL, NULL, '192.168.1.102', '00:1B:44:11:3A:B9', 'ACC-PRT001', 'ห้อง 401 อาคาร C', 'เครื่องพิมพ์สำหรับงานบัญชี'),
('จอภาพ Samsung 24นิ้ว', 'monitor', 'Samsung', 'S24F350FH', 'SM24F350', 'MN001', (SELECT id FROM departments WHERE code = 'ADMIN'), (SELECT id FROM users WHERE username = 'user3'), 'damaged', '2023-11-10', '2020-12-05', 8000.00, 'Samsung Thailand', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ห้อง 501 อาคาร D', 'จอภาพสำรอง'),
('คอมพิวเตอร์ตั้งโต๊ะ HP EliteDesk 800 G8', 'computer', 'HP', 'EliteDesk 800 G8', 'HP800G8001', 'PC002', (SELECT id FROM departments WHERE code = 'IT'), NULL, 'normal', '2026-01-15', '2023-03-20', 42000.00, 'HP Thailand', 'Intel Core i7-11700', '16GB DDR4', '512GB SSD', 'Windows 11 Pro', '192.168.1.103', '00:1B:44:11:3A:BA', 'IT-PC002', 'ห้อง 202 อาคาร A', 'คอมพิวเตอร์สำหรับงานกราฟิก');

-- Insert sample equipment activities
INSERT INTO equipment_activities (equipment_id, activity_type, description, user_id, activity_data) VALUES
((SELECT id FROM equipment WHERE equipment_code = 'EQ001'), 'add', 'เพิ่มครุภัณฑ์ใหม่: คอมพิวเตอร์ตั้งโต๊ะ Dell OptiPlex 7090', (SELECT id FROM users WHERE username = 'admin'), '{"action": "created", "department": "IT"}'),
((SELECT id FROM equipment WHERE equipment_code = 'EQ002'), 'add', 'เพิ่มครุภัณฑ์ใหม่: โน้ตบุ๊ค Lenovo ThinkPad E14', (SELECT id FROM users WHERE username = 'admin'), '{"action": "created", "department": "HR"}'),
((SELECT id FROM equipment WHERE equipment_code = 'EQ003'), 'add', 'เพิ่มครุภัณฑ์ใหม่: เครื่องพิมพ์ HP LaserJet Pro 404dn', (SELECT id FROM users WHERE username = 'admin'), '{"action": "created", "department": "ACC"}'),
((SELECT id FROM equipment WHERE equipment_code = 'EQ003'), 'maintenance', 'แจ้งซ่อม: เครื่องพิมพ์มีปัญหาในการพิมพ์', (SELECT id FROM users WHERE username = 'user2'), '{"issue": "printing_problem", "priority": "medium"}'),
((SELECT id FROM equipment WHERE equipment_code = 'EQ004'), 'damage', 'แจ้งชำรุด: จอภาพมีรอยแตก', (SELECT id FROM users WHERE username = 'user3'), '{"damage_type": "cracked_screen", "severity": "high"}');

-- Insert sample borrow records
INSERT INTO borrow_records (equipment_id, borrower_id, borrowed_by, borrow_date, expected_return_date, borrow_notes, status) VALUES
((SELECT id FROM equipment WHERE equipment_code = 'EQ001'), (SELECT id FROM users WHERE username = 'manager1'), (SELECT id FROM users WHERE username = 'admin'), NOW() - INTERVAL '2 days', CURRENT_DATE + INTERVAL '7 days', 'ยืมสำหรับงานพัฒนาโปรเจกต์ใหม่', 'borrowed'),
((SELECT id FROM equipment WHERE equipment_code = 'EQ002'), (SELECT id FROM users WHERE username = 'user1'), (SELECT id FROM users WHERE username = 'manager1'), NOW() - INTERVAL '5 days', CURRENT_DATE + INTERVAL '3 days', 'ยืมสำหรับงานสัมภาษณ์', 'borrowed');

-- Insert sample maintenance records
INSERT INTO maintenance_records (equipment_id, reported_by, assigned_to, issue_description, priority, status, reported_date) VALUES
((SELECT id FROM equipment WHERE equipment_code = 'EQ003'), (SELECT id FROM users WHERE username = 'user2'), (SELECT id FROM users WHERE username = 'manager1'), 'เครื่องพิมพ์ไม่สามารถพิมพ์ได้ มีข้อความ error ปรากฏ', 'high', 'in_progress', NOW() - INTERVAL '1 day');

-- Insert sample warranty alerts (these would normally be created by triggers)
INSERT INTO warranty_alerts (equipment_id, alert_type, alert_date, days_until_expiry, is_acknowledged) VALUES
((SELECT id FROM equipment WHERE equipment_code = 'EQ003'), 'expired', '2024-03-20', -30, false),
((SELECT id FROM equipment WHERE equipment_code = 'EQ002'), 'expiring_soon', '2024-08-15', 15, false); 