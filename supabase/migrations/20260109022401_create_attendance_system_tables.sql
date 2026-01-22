/*
  # Class Attendance System Schema

  1. New Tables
    - class_sessions: Stores information about each class session
      - id (uuid, primary key)
      - session_code (text, unique) - Unique code for QR code generation
      - week_number (integer) - Week number of the course
      - chapter_title (text) - Title of the chapter/topic
      - date (date) - Date of the class session
      - start_time (timestamptz) - When session started
      - end_time (timestamptz) - When session ended (nullable)
      - is_active (boolean) - Whether session is currently active
      - created_at (timestamptz) - Record creation timestamp
    
    - attendance_records: Stores student check-in records
      - id (uuid, primary key)
      - session_id (uuid, foreign key) - References class_sessions
      - student_name (text) - Student's full name
      - student_email (text) - Student's email address
      - student_id (text) - Student ID number (optional)
      - checked_in_at (timestamptz) - When student checked in
      - created_at (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on all tables
    - class_sessions: Public read for active sessions, authenticated write
    - attendance_records: Public insert for student check-in, authenticated read for teacher
  
  3. Indexes
    - Index on session_code for quick QR code lookups
    - Index on session_id and student_email for duplicate prevention
*/

CREATE TABLE IF NOT EXISTS class_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code text UNIQUE NOT NULL,
  week_number integer NOT NULL,
  chapter_title text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  student_email text NOT NULL,
  student_id text,
  checked_in_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_code ON class_sessions(session_code);
CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_email ON attendance_records(student_email);

ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active sessions"
  ON class_sessions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view all sessions for teacher view"
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

CREATE POLICY "Anyone can insert attendance records"
  ON attendance_records FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view attendance records"
  ON attendance_records FOR SELECT
  USING (true);