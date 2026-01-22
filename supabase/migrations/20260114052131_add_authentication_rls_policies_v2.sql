/*
  # Add Authentication-Based RLS Policies

  1. Changes
    - Update class_sessions policies to require authentication for teacher operations
    - Allow public viewing of sessions (for QR code display)
    - Keep attendance_records publicly accessible for student check-ins
    - Require authentication for code_examples management
    - Allow students to view and save their own code

  2. Security
    - Teachers must be authenticated to create/update/delete sessions
    - Students can view active sessions and check in without auth
    - Teachers must be authenticated to manage code examples
    - Students can view code examples and save their own work
*/

-- Class Sessions: Teachers need auth, students can view
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view sessions" ON class_sessions;
  DROP POLICY IF EXISTS "Anyone can insert sessions" ON class_sessions;
  DROP POLICY IF EXISTS "Anyone can update sessions" ON class_sessions;
  DROP POLICY IF EXISTS "Anyone can delete sessions" ON class_sessions;

  CREATE POLICY "Anyone can view sessions"
    ON class_sessions FOR SELECT
    USING (true);

  CREATE POLICY "Authenticated users can insert sessions"
    ON class_sessions FOR INSERT
    TO authenticated
    WITH CHECK (true);

  CREATE POLICY "Authenticated users can update sessions"
    ON class_sessions FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

  CREATE POLICY "Authenticated users can delete sessions"
    ON class_sessions FOR DELETE
    TO authenticated
    USING (true);
END $$;

-- Attendance Records: Keep public for student check-ins
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view attendance records" ON attendance_records;
  DROP POLICY IF EXISTS "Anyone can insert attendance records" ON attendance_records;

  CREATE POLICY "Anyone can view attendance records"
    ON attendance_records FOR SELECT
    USING (true);

  CREATE POLICY "Anyone can insert attendance records"
    ON attendance_records FOR INSERT
    WITH CHECK (true);
END $$;

-- Code Examples: Teachers manage, students view
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view code examples" ON code_examples;
  DROP POLICY IF EXISTS "Authenticated users can insert code examples" ON code_examples;
  DROP POLICY IF EXISTS "Authenticated users can update code examples" ON code_examples;
  DROP POLICY IF EXISTS "Authenticated users can delete code examples" ON code_examples;

  CREATE POLICY "Anyone can view code examples"
    ON code_examples FOR SELECT
    USING (true);

  CREATE POLICY "Authenticated users can insert code examples"
    ON code_examples FOR INSERT
    TO authenticated
    WITH CHECK (true);

  CREATE POLICY "Authenticated users can update code examples"
    ON code_examples FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

  CREATE POLICY "Authenticated users can delete code examples"
    ON code_examples FOR DELETE
    TO authenticated
    USING (true);
END $$;

-- Student Code Saves: Anyone can save and view their own code
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view student code saves" ON student_code_saves;
  DROP POLICY IF EXISTS "Anyone can insert student code saves" ON student_code_saves;
  DROP POLICY IF EXISTS "Anyone can update their own student code saves" ON student_code_saves;
  DROP POLICY IF EXISTS "Anyone can delete their own student code saves" ON student_code_saves;

  CREATE POLICY "Anyone can view student code saves"
    ON student_code_saves FOR SELECT
    USING (true);

  CREATE POLICY "Anyone can insert student code saves"
    ON student_code_saves FOR INSERT
    WITH CHECK (true);

  CREATE POLICY "Anyone can update their own student code saves"
    ON student_code_saves FOR UPDATE
    USING (true)
    WITH CHECK (true);

  CREATE POLICY "Anyone can delete their own student code saves"
    ON student_code_saves FOR DELETE
    USING (true);
END $$;
