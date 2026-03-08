-- 1. Update the Role Constraints to allow new roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('student', 'faculty', 'dean', 'coordinator', 'volunteer', 'admin'));

-- 2. Add columns to track who promoted a student and when
ALTER TABLE users ADD COLUMN IF NOT EXISTS promoted_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS promotion_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 3. Ensure critical columns for the new logic are present and indexed
ALTER TABLE users ADD COLUMN IF NOT EXISTS designation VARCHAR(100);
CREATE INDEX IF NOT EXISTS idx_users_designation ON users(designation);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 4. Make 'name' nullable since your new logic uses first_name/last_name
ALTER TABLE users ALTER COLUMN name DROP NOT NULL;

-- 5. Optional: Clean up old test data to start fresh with the new roles
-- DELETE FROM users WHERE email LIKE '%test%';