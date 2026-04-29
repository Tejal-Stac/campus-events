-- Phase 2: Coordinator Approval & Student Verification System
-- This migration adds columns for the delegated governance workflow

-- 0. Add coordinator_type to users table (if not present)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS coordinator_type VARCHAR(100) DEFAULT 'none' CHECK (coordinator_type IN ('Hackathon', 'Seminar', 'Workshop', 'Cultural', 'Sports', 'Technical', 'none'));

-- 1. Add columns to events table for coordinator remarks and event closure
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS coordinator_remarks TEXT,
  ADD COLUMN IF NOT EXISTS is_closed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS coordinator_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'));

-- 2. Add columns to registrations table for payment proof and student verification
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS receipt_image_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected'));

-- 3. Create index for faster coordinator pending event queries
CREATE INDEX IF NOT EXISTS idx_events_coordinator ON public.events(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_registrations_verification ON public.registrations(verification_status);

-- 4. Ensure faculty_id exists (created in events table)
-- Already exists from createEvent function, no need to add

-- Verify the schema changes
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name='events' ORDER BY ordinal_position;
