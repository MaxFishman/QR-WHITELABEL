/*
  # Fix Course Content Tables Schema

  1. Changes to course_resources
    - Add is_public column (using is_featured for now)
    - Add order_index column
    
  2. Changes to syllabus
    - Ensure all needed columns exist
    
  3. Changes to lesson_plans
    - Ensure all needed columns exist
    
  4. Add missing RLS policies
*/

-- Add missing columns to course_resources if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'course_resources' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE course_resources ADD COLUMN is_public boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'course_resources' AND column_name = 'order_index'
  ) THEN
    ALTER TABLE course_resources ADD COLUMN order_index integer DEFAULT 0;
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE course_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DO $$
BEGIN
  -- course_resources policies
  DROP POLICY IF EXISTS "Anyone can view public resources" ON course_resources;
  DROP POLICY IF EXISTS "Teachers can insert resources" ON course_resources;
  DROP POLICY IF EXISTS "Teachers can update resources" ON course_resources;
  DROP POLICY IF EXISTS "Teachers can delete resources" ON course_resources;
  
  -- syllabus policies
  DROP POLICY IF EXISTS "Anyone can view published syllabus" ON syllabus;
  DROP POLICY IF EXISTS "Teachers can insert syllabus" ON syllabus;
  DROP POLICY IF EXISTS "Teachers can update syllabus" ON syllabus;
  DROP POLICY IF EXISTS "Teachers can delete syllabus" ON syllabus;
  
  -- lesson_plans policies
  DROP POLICY IF EXISTS "Anyone can view lesson plans" ON lesson_plans;
  DROP POLICY IF EXISTS "Teachers can insert lesson plans" ON lesson_plans;
  DROP POLICY IF EXISTS "Teachers can update lesson plans" ON lesson_plans;
  DROP POLICY IF EXISTS "Teachers can delete lesson plans" ON lesson_plans;
END $$;

-- RLS Policies for course_resources
CREATE POLICY "Anyone can view public resources"
  ON course_resources FOR SELECT
  USING (is_public = true);

CREATE POLICY "Teachers can insert resources"
  ON course_resources FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Teachers can update resources"
  ON course_resources FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Teachers can delete resources"
  ON course_resources FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for syllabus
CREATE POLICY "Anyone can view published syllabus"
  ON syllabus FOR SELECT
  USING (is_published = true);

CREATE POLICY "Teachers can insert syllabus"
  ON syllabus FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Teachers can update syllabus"
  ON syllabus FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Teachers can delete syllabus"
  ON syllabus FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for lesson_plans
CREATE POLICY "Anyone can view lesson plans"
  ON lesson_plans FOR SELECT
  USING (true);

CREATE POLICY "Teachers can insert lesson plans"
  ON lesson_plans FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Teachers can update lesson plans"
  ON lesson_plans FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Teachers can delete lesson plans"
  ON lesson_plans FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_course_resources_week ON course_resources(week_number);
CREATE INDEX IF NOT EXISTS idx_course_resources_type ON course_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_course_resources_public ON course_resources(is_public);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_week ON lesson_plans(week_number);
CREATE INDEX IF NOT EXISTS idx_syllabus_published ON syllabus(is_published);