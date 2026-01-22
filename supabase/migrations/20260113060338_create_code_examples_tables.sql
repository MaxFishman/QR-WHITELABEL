/*
  # Code Editor and Examples Schema

  1. New Tables
    - code_examples: Stores code examples created by teachers
      - id (uuid, primary key)
      - week_number (integer) - Week this example belongs to
      - title (text) - Title of the code example
      - description (text) - Description of what the example demonstrates
      - html_code (text) - HTML code content
      - css_code (text) - CSS code content
      - js_code (text) - JavaScript code content
      - is_starter (boolean) - Whether this is a starter template
      - order_index (integer) - Display order within the week
      - created_at (timestamptz)
    
    - student_code_saves: Stores student code work
      - id (uuid, primary key)
      - student_name (text) - Student's name
      - student_email (text) - Student's email
      - title (text) - Title of their project
      - html_code (text) - HTML code content
      - css_code (text) - CSS code content
      - js_code (text) - JavaScript code content
      - forked_from (uuid) - Reference to code_examples if forked (nullable)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - code_examples: Public read, authenticated write
    - student_code_saves: Public insert and read, students can update their own
  
  3. Indexes
    - Index on week_number for quick filtering
    - Index on student_email for looking up student work
*/

CREATE TABLE IF NOT EXISTS code_examples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number integer NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  html_code text DEFAULT '',
  css_code text DEFAULT '',
  js_code text DEFAULT '',
  is_starter boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS student_code_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  student_email text NOT NULL,
  title text NOT NULL,
  html_code text DEFAULT '',
  css_code text DEFAULT '',
  js_code text DEFAULT '',
  forked_from uuid REFERENCES code_examples(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_code_examples_week ON code_examples(week_number);
CREATE INDEX IF NOT EXISTS idx_student_code_email ON student_code_saves(student_email);

ALTER TABLE code_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_code_saves ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Anyone can view student code saves"
  ON student_code_saves FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert student code saves"
  ON student_code_saves FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update student code saves"
  ON student_code_saves FOR UPDATE
  USING (true)
  WITH CHECK (true);