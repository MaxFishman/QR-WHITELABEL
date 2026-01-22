import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, BookOpen, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Syllabus } from '../types/database';

export default function SyllabusManager() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [form, setForm] = useState({
    course_name: 'Media and Web Development',
    course_code: 'ICOM-101 / MTEC-617',
    instructor_name: '',
    instructor_email: '',
    office_hours: '',
    course_description: '',
    learning_objectives: '',
    grading_policy: '',
    course_policies: '',
    required_materials: '',
    course_schedule: '',
    important_dates: '',
    is_published: false,
  });

  useEffect(() => {
    loadSyllabus();
  }, []);

  const loadSyllabus = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('syllabus')
      .select('*')
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setSyllabus(data);
      setForm({
        course_name: data.course_name,
        course_code: data.course_code,
        instructor_name: data.instructor_name,
        instructor_email: data.instructor_email,
        office_hours: data.office_hours,
        course_description: data.course_description,
        learning_objectives: data.learning_objectives,
        grading_policy: data.grading_policy,
        course_policies: data.course_policies,
        required_materials: data.required_materials,
        course_schedule: data.course_schedule,
        important_dates: data.important_dates,
        is_published: data.is_published,
      });
    }
    setLoading(false);
  };

  const handleSave = async (publish = false) => {
    setSaving(true);

    try {
      const syllabusData = {
        ...form,
        is_published: publish,
        version: syllabus ? syllabus.version + 1 : 1,
      };

      if (syllabus) {
        const { error } = await supabase
          .from('syllabus')
          .update(syllabusData)
          .eq('id', syllabus.id);

        if (!error) {
          await loadSyllabus();
        }
      } else {
        const { error } = await supabase
          .from('syllabus')
          .insert(syllabusData);

        if (!error) {
          await loadSyllabus();
        }
      }
    } catch (error) {
      console.error('Error saving syllabus:', error);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading syllabus...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <button
            onClick={() => navigate('/teacher')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Course Syllabus</h1>
              <p className="text-slate-600">Manage course policies and information</p>
            </div>
            <div className="flex items-center gap-3">
              {form.is_published && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                  <Globe className="w-4 h-4" />
                  Published
                </div>
              )}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold transition"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Edit' : 'Preview'}
              </button>
            </div>
          </div>
        </div>

        {showPreview ? (
          <div className="bg-white rounded-xl shadow-lg p-8 prose max-w-none">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{form.course_name}</h1>
              <p className="text-xl text-slate-600">{form.course_code}</p>
            </div>

            {form.instructor_name && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">Instructor Information</h3>
                <p className="mb-1"><strong>Name:</strong> {form.instructor_name}</p>
                {form.instructor_email && <p className="mb-1"><strong>Email:</strong> {form.instructor_email}</p>}
                {form.office_hours && <p><strong>Office Hours:</strong> {form.office_hours}</p>}
              </div>
            )}

            {form.course_description && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Course Description</h2>
                <p className="text-slate-700 whitespace-pre-wrap">{form.course_description}</p>
              </div>
            )}

            {form.learning_objectives && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Learning Objectives</h2>
                <p className="text-slate-700 whitespace-pre-wrap">{form.learning_objectives}</p>
              </div>
            )}

            {form.grading_policy && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Grading Policy</h2>
                <p className="text-slate-700 whitespace-pre-wrap">{form.grading_policy}</p>
              </div>
            )}

            {form.course_policies && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Course Policies</h2>
                <p className="text-slate-700 whitespace-pre-wrap">{form.course_policies}</p>
              </div>
            )}

            {form.required_materials && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Required Materials</h2>
                <p className="text-slate-700 whitespace-pre-wrap">{form.required_materials}</p>
              </div>
            )}

            {form.course_schedule && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Course Schedule</h2>
                <p className="text-slate-700 whitespace-pre-wrap">{form.course_schedule}</p>
              </div>
            )}

            {form.important_dates && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Important Dates</h2>
                <p className="text-slate-700 whitespace-pre-wrap">{form.important_dates}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Course Name
                  </label>
                  <input
                    type="text"
                    value={form.course_name}
                    onChange={(e) => setForm({ ...form, course_name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={form.course_code}
                    onChange={(e) => setForm({ ...form, course_code: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Instructor Name
                  </label>
                  <input
                    type="text"
                    value={form.instructor_name}
                    onChange={(e) => setForm({ ...form, instructor_name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Instructor Email
                  </label>
                  <input
                    type="email"
                    value={form.instructor_email}
                    onChange={(e) => setForm({ ...form, instructor_email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Office Hours
                </label>
                <input
                  type="text"
                  value={form.office_hours}
                  onChange={(e) => setForm({ ...form, office_hours: e.target.value })}
                  placeholder="e.g., Monday & Wednesday 2:00-4:00 PM"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Course Description
                </label>
                <textarea
                  value={form.course_description}
                  onChange={(e) => setForm({ ...form, course_description: e.target.value })}
                  rows={4}
                  placeholder="Describe the course..."
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Learning Objectives
                </label>
                <textarea
                  value={form.learning_objectives}
                  onChange={(e) => setForm({ ...form, learning_objectives: e.target.value })}
                  rows={4}
                  placeholder="What will students learn?"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Grading Policy
                </label>
                <textarea
                  value={form.grading_policy}
                  onChange={(e) => setForm({ ...form, grading_policy: e.target.value })}
                  rows={4}
                  placeholder="How will students be graded?"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Course Policies
                </label>
                <textarea
                  value={form.course_policies}
                  onChange={(e) => setForm({ ...form, course_policies: e.target.value })}
                  rows={4}
                  placeholder="Attendance, late work, academic integrity, etc."
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Required Materials
                </label>
                <textarea
                  value={form.required_materials}
                  onChange={(e) => setForm({ ...form, required_materials: e.target.value })}
                  rows={3}
                  placeholder="Textbooks, software, supplies, etc."
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Course Schedule
                </label>
                <textarea
                  value={form.course_schedule}
                  onChange={(e) => setForm({ ...form, course_schedule: e.target.value })}
                  rows={6}
                  placeholder="Weekly topics and schedule..."
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Important Dates
                </label>
                <textarea
                  value={form.important_dates}
                  onChange={(e) => setForm({ ...form, important_dates: e.target.value })}
                  rows={3}
                  placeholder="Exam dates, project deadlines, holidays, etc."
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Globe className="w-4 h-4" />
                {saving ? 'Publishing...' : 'Save & Publish'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
