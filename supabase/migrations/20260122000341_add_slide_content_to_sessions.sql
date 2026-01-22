/*
  # Add Slide Content to Class Sessions
  
  1. Changes
    - Add `slide_content` column to `class_sessions` table
      - Type: jsonb (JSON data type for storing slide objects)
      - Nullable: true (existing sessions may not have slides)
      - Purpose: Store the slide deck for each session so different sessions can have different presentations
  
  2. Notes
    - This allows each session to have its own unique slide deck
    - Slides are stored as JSON array of slide objects
    - Existing sessions will have null slide_content until updated
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'class_sessions' AND column_name = 'slide_content'
  ) THEN
    ALTER TABLE class_sessions ADD COLUMN slide_content jsonb;
  END IF;
END $$;