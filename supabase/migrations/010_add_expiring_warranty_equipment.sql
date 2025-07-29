-- ========================================
-- ADD EQUIPMENT WITH EXPIRING WARRANTY FOR TESTING
-- ========================================

-- Insert equipment with warranty expiring soon for testing dashboard warnings
INSERT INTO equipment (name, type, brand, model, serial_number, notes, purchase_date, warranty_date, purchase_price, department_id, current_user_id, status, location) VALUES
('คอมพิวเตอร์ตั้งโต๊ะ HP ProDesk 600 G7', 'computer', 'HP', 'ProDesk 600 G7', 'HP600G7001', 'คอมพิวเตอร์สำหรับงานทั่วไป - ประกันใกล้หมด', '2022-01-15', '2024-12-20', 28000.00, (SELECT id FROM departments WHERE code = 'IT' LIMIT 1), (SELECT id FROM users WHERE username = 'admin' LIMIT 1), 'normal', 'ห้อง 201 อาคาร A'),
('เครื่องพิมพ์ Canon PIXMA TS8320', 'printer', 'Canon', 'PIXMA TS8320', 'CAN8320001', 'เครื่องพิมพ์อิงค์เจ็ทสี - ประกันหมดใน 7 วัน', '2022-12-25', '2024-12-25', 18000.00, (SELECT id FROM departments WHERE code = 'MKT' LIMIT 1), (SELECT id FROM users WHERE username = 'manager1' LIMIT 1), 'normal', 'แผนกการตลาด'),
('จอภาพ LG 27UL500-W', 'monitor', 'LG', '27UL500-W', 'LG27UL001', 'จอภาพ 4K 27 นิ้ว - ประกันหมดใน 15 วัน', '2022-11-10', '2024-12-30', 15000.00, (SELECT id FROM departments WHERE code = 'IT' LIMIT 1), (SELECT id FROM users WHERE username = 'manager2' LIMIT 1), 'normal', 'ห้อง 301 อาคาร B'),
('โน้ตบุ๊ค ASUS VivoBook S15', 'laptop', 'ASUS', 'VivoBook S15', 'ASUS15001', 'โน้ตบุ๊คสำหรับงานกราฟิก - ประกันหมดใน 30 วัน', '2022-06-15', '2025-01-15', 45000.00, (SELECT id FROM departments WHERE code = 'MKT' LIMIT 1), (SELECT id FROM users WHERE username = 'user1' LIMIT 1), 'normal', 'แผนกการตลาด'),
('เครื่องสแกนเนอร์ Epson Perfection V39', 'printer', 'Epson', 'Perfection V39', 'EPS39001', 'เครื่องสแกนเนอร์เอกสาร - ประกันหมดแล้ว', '2021-08-20', '2024-08-20', 8000.00, (SELECT id FROM departments WHERE code = 'ACC' LIMIT 1), (SELECT id FROM users WHERE username = 'user2' LIMIT 1), 'normal', 'แผนกบัญชี')
ON CONFLICT (serial_number) DO NOTHING;