-- ============================================================
-- DATABASE SCHEMA CHANGES FOR HOD DASHBOARD UPDATE
-- Campus Events - HOD Feature Addition
-- 
-- INSTRUCTIONS:
-- 1. Backup your database first: pg_dump -U postgres campus_events > backup.sql
-- 2. Open pgAdmin and connect to your campus_events database
-- 3. Copy-paste ALL commands below in the Query Editor
-- 4. Run them in order (Step 1 → Step 2 → Step 3 → Step 4)
-- 5. Run the Verification section to confirm
-- ============================================================

-- ============================================================
-- STEP 1: UPDATE USERS TABLE ROLE CONSTRAINT
-- Problem: 'hod' role is not in the role check constraint
-- ============================================================

ALTER TABLE public.users DROP CONSTRAINT users_role_check;

ALTER TABLE public.users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('student', 'faculty', 'dean', 'hod', 'coordinator', 'volunteer', 'admin'));

COMMIT;

-- ============================================================
-- STEP 2: ADD BIO COLUMN TO USERS TABLE
-- Purpose: Store HOD profile biography (e.g., "Head of Department of Computer Engineering")
-- ============================================================

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS bio TEXT;

COMMIT;

-- ============================================================
-- STEP 3: ADD FACULTY_ID COLUMN TO EVENTS TABLE
-- Purpose: Track which HOD/faculty member created/manages the event
-- Foreign Key: References users(id), cascade delete on user removal
-- ============================================================

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS faculty_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL;

COMMIT;

-- ============================================================
-- STEP 4: CREATE INDEX FOR PERFORMANCE
-- Purpose: Speed up queries filtering events by faculty_id (used in HOD dashboard)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_events_faculty_id ON public.events(faculty_id);

COMMIT;

-- ============================================================
-- VERIFICATION SECTION
-- Run these after Step 1-4 to confirm all changes are applied
-- ============================================================

-- ✓ Check 1: Verify role constraint includes 'hod'
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE table_name = 'users' AND constraint_name = 'users_role_check';

-- ✓ Check 2: Verify bio column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'bio';

-- ✓ Check 3: Verify faculty_id column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'events' AND column_name = 'faculty_id';

-- ✓ Check 4: Verify index was created
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename = 'events' AND indexname = 'idx_events_faculty_id';

-- ============================================================
-- OPTIONAL: Add constraint index on users.role for faster role-based queries
-- (Recommended for performance if not already indexed)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role) 
  WHERE role = 'hod';

-- ============================================================
-- SUCCESS: If all verification checks returned rows, your database is ready!
-- The HOD Dashboard feature can now be deployed.
-- ============================================================
