export interface Database {
  public: {
    Tables: {
      class_sessions: {
        Row: {
          id: string;
          session_code: string;
          week_number: number;
          chapter_title: string;
          date: string;
          start_time: string;
          end_time: string | null;
          is_active: boolean;
          created_at: string;
          semester_id: string | null;
        };
        Insert: {
          id?: string;
          session_code: string;
          week_number: number;
          chapter_title: string;
          date?: string;
          start_time?: string;
          end_time?: string | null;
          is_active?: boolean;
          created_at?: string;
          semester_id?: string | null;
        };
        Update: {
          id?: string;
          session_code?: string;
          week_number?: number;
          chapter_title?: string;
          date?: string;
          start_time?: string;
          end_time?: string | null;
          is_active?: boolean;
          created_at?: string;
          semester_id?: string | null;
        };
      };
      attendance_records: {
        Row: {
          id: string;
          session_id: string;
          student_name: string;
          student_email: string;
          student_id: string | null;
          checked_in_at: string;
          created_at: string;
          points: number;
        };
        Insert: {
          id?: string;
          session_id: string;
          student_name: string;
          student_email: string;
          student_id?: string | null;
          checked_in_at?: string;
          created_at?: string;
          points?: number;
        };
        Update: {
          id?: string;
          session_id?: string;
          student_name?: string;
          student_email?: string;
          student_id?: string | null;
          checked_in_at?: string;
          created_at?: string;
          points?: number;
        };
      };
      code_examples: {
        Row: {
          id: string;
          week_number: number;
          title: string;
          description: string;
          html_code: string;
          css_code: string;
          js_code: string;
          is_starter: boolean;
          order_index: number;
          created_at: string;
          version_number: number;
        };
        Insert: {
          id?: string;
          week_number: number;
          title: string;
          description?: string;
          html_code?: string;
          css_code?: string;
          js_code?: string;
          is_starter?: boolean;
          order_index?: number;
          created_at?: string;
          version_number?: number;
        };
        Update: {
          id?: string;
          week_number?: number;
          title?: string;
          description?: string;
          html_code?: string;
          css_code?: string;
          js_code?: string;
          is_starter?: boolean;
          order_index?: number;
          created_at?: string;
          version_number?: number;
        };
      };
      student_code_saves: {
        Row: {
          id: string;
          student_name: string;
          student_email: string;
          title: string;
          html_code: string;
          css_code: string;
          js_code: string;
          forked_from: string | null;
          created_at: string;
          updated_at: string;
          version_number: number;
        };
        Insert: {
          id?: string;
          student_name: string;
          student_email: string;
          title: string;
          html_code?: string;
          css_code?: string;
          js_code?: string;
          forked_from?: string | null;
          created_at?: string;
          updated_at?: string;
          version_number?: number;
        };
        Update: {
          id?: string;
          student_name?: string;
          student_email?: string;
          title?: string;
          html_code?: string;
          css_code?: string;
          js_code?: string;
          forked_from?: string | null;
          created_at?: string;
          updated_at?: string;
          version_number?: number;
        };
      };
      course_resources: {
        Row: {
          id: string;
          week_number: number;
          title: string;
          description: string;
          resource_type: string;
          file_url: string;
          file_size: number;
          duration: number;
          thumbnail_url: string;
          tags: string[];
          is_public: boolean;
          order_index: number;
          uploaded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          week_number?: number;
          title: string;
          description?: string;
          resource_type?: string;
          file_url: string;
          file_size?: number;
          duration?: number;
          thumbnail_url?: string;
          tags?: string[];
          is_public?: boolean;
          order_index?: number;
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          week_number?: number;
          title?: string;
          description?: string;
          resource_type?: string;
          file_url?: string;
          file_size?: number;
          duration?: number;
          thumbnail_url?: string;
          tags?: string[];
          is_public?: boolean;
          order_index?: number;
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      syllabus: {
        Row: {
          id: string;
          course_name: string;
          course_code: string;
          instructor_name: string;
          instructor_email: string;
          office_hours: string;
          course_description: string;
          learning_objectives: string;
          grading_policy: string;
          course_policies: string;
          required_materials: string;
          course_schedule: string;
          important_dates: string;
          version: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_name?: string;
          course_code?: string;
          instructor_name?: string;
          instructor_email?: string;
          office_hours?: string;
          course_description?: string;
          learning_objectives?: string;
          grading_policy?: string;
          course_policies?: string;
          required_materials?: string;
          course_schedule?: string;
          important_dates?: string;
          version?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_name?: string;
          course_code?: string;
          instructor_name?: string;
          instructor_email?: string;
          office_hours?: string;
          course_description?: string;
          learning_objectives?: string;
          grading_policy?: string;
          course_policies?: string;
          required_materials?: string;
          course_schedule?: string;
          important_dates?: string;
          version?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      lesson_plans: {
        Row: {
          id: string;
          week_number: number;
          title: string;
          learning_objectives: string[];
          topics_covered: string[];
          activities: string;
          homework: string;
          required_readings: string;
          notes: string;
          duration_minutes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          week_number: number;
          title: string;
          learning_objectives?: string[];
          topics_covered?: string[];
          activities?: string;
          homework?: string;
          required_readings?: string;
          notes?: string;
          duration_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          week_number?: number;
          title?: string;
          learning_objectives?: string[];
          topics_covered?: string[];
          activities?: string;
          homework?: string;
          required_readings?: string;
          notes?: string;
          duration_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      semesters: {
        Row: {
          id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_current: boolean;
          is_archived: boolean;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          start_date: string;
          end_date: string;
          is_current?: boolean;
          is_archived?: boolean;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          start_date?: string;
          end_date?: string;
          is_current?: boolean;
          is_archived?: boolean;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      code_example_versions: {
        Row: {
          id: string;
          code_example_id: string;
          version_number: number;
          html_code: string;
          css_code: string;
          js_code: string;
          change_summary: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          code_example_id: string;
          version_number: number;
          html_code?: string;
          css_code?: string;
          js_code?: string;
          change_summary?: string;
          created_by?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          code_example_id?: string;
          version_number?: number;
          html_code?: string;
          css_code?: string;
          js_code?: string;
          change_summary?: string;
          created_by?: string;
          created_at?: string;
        };
      };
      student_code_versions: {
        Row: {
          id: string;
          student_code_save_id: string;
          version_number: number;
          html_code: string;
          css_code: string;
          js_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_code_save_id: string;
          version_number: number;
          html_code?: string;
          css_code?: string;
          js_code?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_code_save_id?: string;
          version_number?: number;
          html_code?: string;
          css_code?: string;
          js_code?: string;
          created_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_email: string;
          editor_theme: string;
          font_size: number;
          tab_size: number;
          word_wrap: boolean;
          line_numbers: boolean;
          auto_save: boolean;
          auto_save_interval: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_email: string;
          editor_theme?: string;
          font_size?: number;
          tab_size?: number;
          word_wrap?: boolean;
          line_numbers?: boolean;
          auto_save?: boolean;
          auto_save_interval?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_email?: string;
          editor_theme?: string;
          font_size?: number;
          tab_size?: number;
          word_wrap?: boolean;
          line_numbers?: boolean;
          auto_save?: boolean;
          auto_save_interval?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      student_engagement: {
        Row: {
          id: string;
          student_email: string;
          event_type: string;
          resource_type: string;
          resource_id: string | null;
          session_id: string | null;
          metadata: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_email: string;
          event_type: string;
          resource_type: string;
          resource_id?: string | null;
          session_id?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_email?: string;
          event_type?: string;
          resource_type?: string;
          resource_id?: string | null;
          session_id?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
        };
      };
      session_templates: {
        Row: {
          id: string;
          name: string;
          description: string;
          week_structure: Record<string, any>;
          topics: string[];
          activities: string;
          code_examples_to_include: string[];
          slide_template: Record<string, any>;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          week_structure?: Record<string, any>;
          topics?: string[];
          activities?: string;
          code_examples_to_include?: string[];
          slide_template?: Record<string, any>;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          week_structure?: Record<string, any>;
          topics?: string[];
          activities?: string;
          code_examples_to_include?: string[];
          slide_template?: Record<string, any>;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type ClassSession = Database['public']['Tables']['class_sessions']['Row'];
export type AttendanceRecord = Database['public']['Tables']['attendance_records']['Row'];
export type CodeExample = Database['public']['Tables']['code_examples']['Row'];
export type StudentCodeSave = Database['public']['Tables']['student_code_saves']['Row'];
export type CourseResource = Database['public']['Tables']['course_resources']['Row'];
export type Syllabus = Database['public']['Tables']['syllabus']['Row'];
export type LessonPlan = Database['public']['Tables']['lesson_plans']['Row'];
export type Semester = Database['public']['Tables']['semesters']['Row'];
export type CodeExampleVersion = Database['public']['Tables']['code_example_versions']['Row'];
export type StudentCodeVersion = Database['public']['Tables']['student_code_versions']['Row'];
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row'];
export type StudentEngagement = Database['public']['Tables']['student_engagement']['Row'];
export type SessionTemplate = Database['public']['Tables']['session_templates']['Row'];
