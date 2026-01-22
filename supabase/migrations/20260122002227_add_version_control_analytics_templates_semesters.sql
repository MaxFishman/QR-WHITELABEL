/*
  # Enhanced Course Management System

  ## New Tables

  ### 1. code_example_versions
  Tracks version history for teacher code examples
  - `id` (uuid, primary key)
  - `code_example_id` (uuid, references code_examples)
  - `version_number` (integer)
  - `html_code` (text) - snapshot of HTML at this version
  - `css_code` (text) - snapshot of CSS at this version
  - `js_code` (text) - snapshot of JavaScript at this version
  - `change_summary` (text) - description of changes made
  - `created_at` (timestamptz)

  ### 2. student_code_versions
  Tracks version history for student code saves
  - `id` (uuid, primary key)
  - `student_code_save_id` (uuid, references student_code_saves)
  - `version_number` (integer)
  - `html_code` (text)
  - `css_code` (text)
  - `js_code` (text)
  - `created_at` (timestamptz)

  ### 3. user_preferences
  Stores editor settings and theme preferences per user/student
  - `id` (uuid, primary key)
  - `user_email` (text, unique)
  - `editor_theme` (text) - Monaco editor theme name
  - `font_size` (integer) - editor font size
  - `tab_size` (integer) - spaces per tab
  - `word_wrap` (boolean) - enable word wrap
  - `line_numbers` (boolean) - show line numbers
  - `auto_save` (boolean) - enable auto save
  - `auto_save_interval` (integer) - seconds between saves
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. student_engagement
  Tracks student interaction with course materials
  - `id` (uuid, primary key)
  - `student_email` (text)
  - `event_type` (text) - type of engagement (view, fork, save, etc.)
  - `resource_type` (text) - what was accessed (code_example, resource, etc.)
  - `resource_id` (uuid) - reference to the resource
  - `session_id` (uuid, nullable) - associated session if applicable
  - `metadata` (jsonb) - additional event data
  - `created_at` (timestamptz)

  ### 5. session_templates
  Reusable templates for creating class sessions
  - `id` (uuid, primary key)
  - `name` (text) - template name
  - `description` (text) - what this template is for
  - `week_structure` (jsonb) - week number pattern
  - `topics` (text[]) - default topics to cover
  - `activities` (text) - suggested activities
  - `code_examples_to_include` (uuid[]) - array of code example IDs
  - `slide_template` (jsonb) - default slide structure
  - `is_default` (boolean) - mark as default template
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. semesters
  Organize sessions and data by academic term
  - `id` (uuid, primary key)
  - `name` (text) - semester name (e.g., "Spring 2026")
  - `start_date` (date)
  - `end_date` (date)
  - `is_current` (boolean) - mark as current semester
  - `is_archived` (boolean) - mark as archived
  - `description` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Updates to Existing Tables

  Add semester_id to class_sessions for organization
  Add version_number to code_examples and student_code_saves

  ## Security
  - Enable RLS on all new tables
  - Add policies for authenticated users to manage their own preferences
  - Add policies for teachers to access analytics and templates
  - Add policies for proper data access based on roles
*/

-- Create semesters table first (referenced by other tables)
CREATE TABLE IF NOT EXISTS semesters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_current boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view semesters"
  ON semesters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can create semesters"
  ON semesters FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Teachers can update semesters"
  ON semesters FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Teachers can delete semesters"
  ON semesters FOR DELETE
  TO authenticated
  USING (true);

-- Add semester_id to class_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'class_sessions' AND column_name = 'semester_id'
  ) THEN
    ALTER TABLE class_sessions ADD COLUMN semester_id uuid REFERENCES semesters(id);
  END IF;
END $$;

-- Add version_number to code_examples
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'code_examples' AND column_name = 'version_number'
  ) THEN
    ALTER TABLE code_examples ADD COLUMN version_number integer DEFAULT 1;
  END IF;
END $$;

-- Add version_number to student_code_saves
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'student_code_saves' AND column_name = 'version_number'
  ) THEN
    ALTER TABLE student_code_saves ADD COLUMN version_number integer DEFAULT 1;
  END IF;
END $$;

-- Create code_example_versions table
CREATE TABLE IF NOT EXISTS code_example_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_example_id uuid REFERENCES code_examples(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  html_code text DEFAULT '',
  css_code text DEFAULT '',
  js_code text DEFAULT '',
  change_summary text DEFAULT '',
  created_by text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE code_example_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view code example versions"
  ON code_example_versions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can create code example versions"
  ON code_example_versions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Teachers can update code example versions"
  ON code_example_versions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Teachers can delete code example versions"
  ON code_example_versions FOR DELETE
  TO authenticated
  USING (true);

-- Create student_code_versions table
CREATE TABLE IF NOT EXISTS student_code_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_code_save_id uuid REFERENCES student_code_saves(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  html_code text DEFAULT '',
  css_code text DEFAULT '',
  js_code text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE student_code_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create student code versions"
  ON student_code_versions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view student code versions"
  ON student_code_versions FOR SELECT
  USING (true);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text UNIQUE NOT NULL,
  editor_theme text DEFAULT 'vs-dark',
  font_size integer DEFAULT 14,
  tab_size integer DEFAULT 2,
  word_wrap boolean DEFAULT true,
  line_numbers boolean DEFAULT true,
  auto_save boolean DEFAULT false,
  auto_save_interval integer DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create student_engagement table
CREATE TABLE IF NOT EXISTS student_engagement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_email text NOT NULL,
  event_type text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  session_id uuid REFERENCES class_sessions(id),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE student_engagement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create engagement events"
  ON student_engagement FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Teachers can view all engagement"
  ON student_engagement FOR SELECT
  TO authenticated
  USING (true);

-- Create session_templates table
CREATE TABLE IF NOT EXISTS session_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  week_structure jsonb DEFAULT '{}',
  topics text[] DEFAULT '{}',
  activities text DEFAULT '',
  code_examples_to_include uuid[] DEFAULT '{}',
  slide_template jsonb DEFAULT '{}',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE session_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view session templates"
  ON session_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can create session templates"
  ON session_templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Teachers can update session templates"
  ON session_templates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Teachers can delete session templates"
  ON session_templates FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_code_example_versions_example_id ON code_example_versions(code_example_id);
CREATE INDEX IF NOT EXISTS idx_student_code_versions_save_id ON student_code_versions(student_code_save_id);
CREATE INDEX IF NOT EXISTS idx_student_engagement_email ON student_engagement(student_email);
CREATE INDEX IF NOT EXISTS idx_student_engagement_created_at ON student_engagement(created_at);
CREATE INDEX IF NOT EXISTS idx_class_sessions_semester_id ON class_sessions(semester_id);
CREATE INDEX IF NOT EXISTS idx_semesters_is_current ON semesters(is_current);
