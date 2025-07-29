-- ========================================
-- CLEANUP DUPLICATE USERS
-- ========================================

-- Delete duplicate users based on email (keep the one with earliest created_at)
DELETE FROM users 
WHERE id NOT IN (
  SELECT DISTINCT ON (email) id
  FROM users 
  ORDER BY email, created_at ASC
);

-- Delete duplicate users based on username (keep the one with earliest created_at)
DELETE FROM users 
WHERE id NOT IN (
  SELECT DISTINCT ON (username) id
  FROM users 
  ORDER BY username, created_at ASC
);

-- Note: Unique constraints already exist on email and username
-- This migration just cleans up existing duplicates