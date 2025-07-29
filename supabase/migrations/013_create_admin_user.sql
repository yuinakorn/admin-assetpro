-- ========================================
-- CREATE ADMIN USER
-- ========================================

-- Insert admin user into users table with password hash
-- Password: admin123 (bcrypt hash)

INSERT INTO users (
  id,
  first_name,
  last_name,
  username,
  email,
  password_hash,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ผู้ดูแล',
  'ระบบ',
  'admin',
  'admin@assetpro.local',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123
  'admin',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;