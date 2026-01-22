/*
  # Add Points System to Attendance

  1. Changes
    - Add `points` column to attendance_records table
      - Points are awarded based on check-in order
      - First to sign in gets more points
      - Integer type with default value of 0
    
  2. Notes
    - Points will be calculated at check-in time based on existing check-ins
    - Higher points = faster check-in
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'attendance_records' AND column_name = 'points'
  ) THEN
    ALTER TABLE attendance_records ADD COLUMN points integer DEFAULT 0;
  END IF;
END $$;
