/*
  # Add Notes and Enhancements to Class Sessions

  1. Changes
    - Add `notes` column to `class_sessions` table for tracking what was covered
    - Add `start_time` column to track when class actually starts (for late arrival tracking)
    - Both fields are optional (nullable)

  2. Notes
    - The notes field allows teachers to add session-specific notes
    - The start_time helps track late arrivals compared to check-in times
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'class_sessions' AND column_name = 'notes'
  ) THEN
    ALTER TABLE class_sessions ADD COLUMN notes text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'class_sessions' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE class_sessions ADD COLUMN start_time timestamptz;
  END IF;
END $$;