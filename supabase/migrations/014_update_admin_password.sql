-- ========================================
-- UPDATE ADMIN USER PASSWORD
-- ========================================

-- Update the admin user's password hash to a working one
-- Password: admin123 (bcrypt hash)

UPDATE users 
SET 
  password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  updated_at = NOW()
WHERE email = 'admin@assetpro.local';

-- Also ensure the user is active
UPDATE users 
SET is_active = true 
WHERE email = 'admin@assetpro.local';