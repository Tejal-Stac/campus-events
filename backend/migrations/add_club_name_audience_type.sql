-- Migration: Add club_name and audience_type columns to events table
-- Run this once against your PostgreSQL database

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS club_name      TEXT,
  ADD COLUMN IF NOT EXISTS audience_type  TEXT DEFAULT 'All';

-- Backfill existing rows: use organising_club as club_name if available
UPDATE public.events
  SET club_name = organising_club
  WHERE club_name IS NULL AND organising_club IS NOT NULL;

-- Confirm
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'events'
  AND column_name IN ('club_name', 'audience_type');
