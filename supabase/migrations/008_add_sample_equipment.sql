-- ========================================
-- ADD SAMPLE EQUIPMENT DATA
-- ========================================

-- Insert sample equipment
INSERT INTO equipment (name, type, brand, model, serial_number, notes, purchase_date, warranty_date, purchase_price, department_id, current_user_id, status, location) VALUES
('คอมพิวเตอร์ตั้งโต๊ะ Dell OptiPlex 7090', 'computer', 'Dell', 'OptiPlex 7090', '7XKWN3J', 'คอมพิวเตอร์สำหรับงานทั่วไป', '2023-01-15', '2026-01-15', 25000.00, (SELECT id FROM departments WHERE code = 'IT' LIMIT 1), (SELECT id FROM users WHERE username = 'admin' LIMIT 1), 'normal', 'ห้อง 201 อาคาร A'),
('โน้ตบุ๊ค Lenovo ThinkPad E14', 'laptop', 'Lenovo', 'ThinkPad E14', 'PC1A2B3C', 'โน้ตบุ๊คสำหรับพนักงานขาย', '2023-03-20', '2026-03-20', 35000.00, (SELECT id FROM departments WHERE code = 'MKT' LIMIT 1), (SELECT id FROM users WHERE username = 'manager1' LIMIT 1), 'normal', 'แผนกการตลาด'),
('เครื่องพิมพ์ HP LaserJet Pro 404dn', 'printer', 'HP', 'LaserJet Pro 404dn', 'VNC8K12345', 'เครื่องพิมพ์เลเซอร์สีขาวดำ', '2022-11-10', '2025-11-10', 15000.00, (SELECT id FROM departments WHERE code = 'ACC' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1), 'maintenance', 'แผนกบัญชี'),
('จอภาพ Samsung 24นิ้ว', 'monitor', 'Samsung', 'S24F350FH', 'SM24F350', 'จอภาพ LED 24 นิ้ว', '2022-08-15', '2025-08-15', 8000.00, (SELECT id FROM departments WHERE code = 'ADMIN' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1), 'normal', 'คลังอุปกรณ์'),
('คอมพิวเตอร์ตั้งโต๊ะ HP EliteDesk 800 G8', 'computer', 'HP', 'EliteDesk 800 G8', 'HP800G8001', 'คอมพิวเตอร์สำหรับงานกราฟิก', '2023-06-10', '2026-06-10', 30000.00, (SELECT id FROM departments WHERE code = 'IT' LIMIT 1), (SELECT id FROM users WHERE username = 'manager2' LIMIT 1), 'normal', 'ห้อง 301 อาคาร B'),
('เครื่องสแกนเนอร์ Canon CanoScan Lide 400', 'printer', 'Canon', 'CanoScan Lide 400', 'CAN400001', 'เครื่องสแกนเนอร์เอกสาร', '2023-02-28', '2026-02-28', 5000.00, (SELECT id FROM departments WHERE code = 'HR' LIMIT 1), (SELECT id FROM users WHERE username = 'user3' LIMIT 1), 'normal', 'แผนกบุคคล'),
('โต๊ะทำงานไม้', 'computer', 'Office Pro', 'OP-Desk-001', 'OP001', 'โต๊ะทำงานไม้สวย', '2022-12-01', NULL, 12000.00, (SELECT id FROM departments WHERE code = 'ADMIN' LIMIT 1), NULL, 'normal', 'ห้อง 101 อาคาร A'),
('เก้าอี้สำนักงาน', 'computer', 'Office Pro', 'OP-Chair-001', 'OP002', 'เก้าอี้สำนักงานปรับระดับ', '2022-12-01', NULL, 8000.00, (SELECT id FROM departments WHERE code = 'ADMIN' LIMIT 1), NULL, 'normal', 'ห้อง 101 อาคาร A'),
('Switch Network 24-Port', 'network_device', 'Cisco', 'Catalyst 2960', 'CISCO001', 'Switch เครือข่าย 24 พอร์ต', '2022-05-15', '2027-05-15', 45000.00, (SELECT id FROM departments WHERE code = 'IT' LIMIT 1), (SELECT id FROM users WHERE username = 'admin' LIMIT 1), 'normal', 'ห้อง Server'),
('UPS APC 1500VA', 'ups', 'APC', 'Back-UPS 1500', 'APC001', 'UPS สำรองไฟ 1500VA', '2022-07-20', '2025-07-20', 12000.00, (SELECT id FROM departments WHERE code = 'IT' LIMIT 1), (SELECT id FROM users WHERE username = 'admin' LIMIT 1), 'normal', 'ห้อง Server')
ON CONFLICT (serial_number) DO NOTHING; 