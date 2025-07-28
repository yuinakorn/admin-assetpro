-- ========================================
-- ADD SAMPLE USER DATA
-- ========================================

-- Insert sample users
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role, is_active) VALUES
('admin', 'admin@example.com', 'admin123', 'ผู้ดูแล', 'ระบบ', '081-111-1111', 'admin', true),
('manager1', 'manager1@example.com', 'manager123', 'สมชาย', 'ใจดี', '081-222-2222', 'manager', true),
('manager2', 'manager2@example.com', 'manager123', 'มานี', 'สบายดี', '081-333-3333', 'manager', true),
('user1', 'user1@example.com', 'user123', 'ประยุทธ์', 'มั่นคง', '081-444-4444', 'user', true),
('user2', 'user2@example.com', 'user123', 'สุธิดา', 'เรียบร้อย', '081-555-5555', 'user', true),
('user3', 'user3@example.com', 'user123', 'วิชัย', 'รักดี', '081-666-6666', 'user', true),
('user4', 'user4@example.com', 'user123', 'นารี', 'สุขใจ', '081-777-7777', 'user', true),
('user5', 'user5@example.com', 'user123', 'สมศักดิ์', 'เจริญ', '081-888-8888', 'user', true)
ON CONFLICT (username) DO NOTHING; 