-- Migration: Allow Multiple Report Reasons
-- Purpose: Allow users to select multiple reasons when reporting content
-- Date: 2025-10-02
-- Run BEFORE deploying code changes

-- Remove CHECK constraint that restricts to single reasons
ALTER TABLE content_reports 
DROP CONSTRAINT IF EXISTS content_reports_reason_check;

-- Change reason column from VARCHAR(50) to TEXT to support comma-separated values
ALTER TABLE content_reports 
ALTER COLUMN reason TYPE TEXT;

-- Log success
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Migration 001 completed: Multiple report reasons enabled';
END $$; 