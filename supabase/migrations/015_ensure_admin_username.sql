-- ========================================
-- ENSURE ADMIN USER HAS USERNAME
-- ========================================

-- Only update admin user if username is missing
UPDATE users 
SET 
  username = 'admin',
  updated_at = NOW()
WHERE email = 'admin@assetpro.local' 
  AND (username IS NULL OR username = '' OR username != 'admin');