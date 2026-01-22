import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Archive, CheckCircle, Calendar, Users, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Semester, ClassSession } from '../types/database';

interface SemesterWithStats extends Semester {
  sessionCount: number;
  totalAttendance: number;
}

export default function SemesterArchive() {
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState<SemesterWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    description: '',
    is_current: false
  });

  useEffect(() => {
    loadSemesters();
  }, []);

  const loadSemesters = async () => {
    setLoading(true);

    const { data: semesterData } = await supabase
      .from('semesters')
      .select('*')
      .order('start_date', { ascending: false });

    if (semesterData) {
      const semestersWithStats = await Promise.all(
        semesterData.map(async (semester) => {
          const { data: sessions } = await supabase
            .from('class_sessions')
            .select('id')
            .eq('semester_id', semester.id);

          let totalAttendance = 0;
          if (sessions) {
            for (const session of sessions) {
              const { count } = await supabase
                .from('attendance_records')
                .select('*', { count: 'exact', head: true })
                .eq('session_id', session.id);
              totalAttendance += count || 0;
            }
          }

          return {
            ...semester,
            sessionCount: sessions?.length || 0,
            totalAttendance
          };
        })
      );

      setSemesters(semestersWithStats);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.start_date || !formData.end_date) return;

    if (formData.is_current) {
      await supabase
        .from('semesters')
        .update({ is_current: false })
        .neq('id', editingSemester?.id || '');
    }

    const dataToSave = {
      ...formData,
      updated_at: new Date().toISOString()
    };

    if (editingSemester) {
      await supabase
        .from('semesters')
        .update(dataToSave)
        .eq('id', editingSemester.id);
    } else {
      await supabase.from('semesters').insert(dataToSave);
    }

    setShowEditor(false);
    setEditingSemester(null);
    resetForm();
    loadSemesters();
  };

  const handleEdit = (semester: Semester) => {
    setEditingSemester(semester);
    setFormData({
      name: semester.name,
      start_date: semester.start_date,
      end_date: semester.end_date,
      description: semester.description,
      is_current: semester.is_current
    });
    setShowEditor(true);
  };

  const handleToggleArchive = async (semester: Semester) => {
    await supabase
      .from('semesters')
      .update({ is_archived: !semester.is_archived })
      .eq('id', semester.id);
    loadSemesters();
  };

  const handleSetCurrent = async (semester: Semester) => {
    await supabase
      .from('semesters')
      .update({ is_current: false })
      .neq('id', semester.id);

    await supabase
      .from('semesters')
      .update({ is_current: true })
      .eq('id', semester.id);

    loadSemesters();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      start_date: '',
      end_date: '',
      description: '',
      is_current: false
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (showEditor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <button
            onClick={() => {
              setShowEditor(false);
              setEditingSemester(null);
              resetForm();
            }}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Semesters
          </button>

          <h1 className="text-4xl font-bold text-slate-900 mb-8">
            {editingSemester ? 'Edit Semester' : 'New Semester'}
          </h1>

          <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Semester Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="e.g., Spring 2026"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                rows={3}
                placeholder="Optional notes about this semester"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_current}
                  onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-slate-700">
                  Set as current semester
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowEditor(false);
                  setEditingSemester(null);
                  resetForm();
                }}
                className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name.trim() || !formData.start_date || !formData.end_date}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingSemester ? 'Update' : 'Create'} Semester
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentSemesters = semesters.filter(s => !s.is_archived);
  const archivedSemesters = semesters.filter(s => s.is_archived);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/teacher')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Semester Archive</h1>
            <p className="text-slate-600">Organize sessions and data by academic term</p>
          </div>

          <button
            onClick={() => setShowEditor(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            New Semester
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading semesters...</p>
          </div>
        ) : (
          <>
            {currentSemesters.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Current Semesters</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentSemesters.map((semester) => (
                    <div
                      key={semester.id}
                      className={`bg-white rounded-xl shadow-sm border-2 p-6 hover:border-blue-300 transition ${
                        semester.is_current ? 'border-blue-500' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                          {semester.name}
                          {semester.is_current && (
                            <CheckCircle className="w-5 h-5 text-blue-500 fill-blue-500" />
                          )}
                        </h3>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          <Calendar className="w-4 h-4" />
                          {formatDate(semester.start_date)} - {formatDate(semester.end_date)}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          <FileText className="w-4 h-4" />
                          {semester.sessionCount} session{semester.sessionCount !== 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          <Users className="w-4 h-4" />
                          {semester.totalAttendance} total attendance
                        </div>
                      </div>

                      {semester.description && (
                        <p className="text-slate-600 text-sm mb-4">{semester.description}</p>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(semester)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        {!semester.is_current && (
                          <button
                            onClick={() => handleSetCurrent(semester)}
                            className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition text-sm"
                            title="Set as current"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleArchive(semester)}
                          className="px-4 py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition text-sm"
                          title="Archive"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {archivedSemesters.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Archived Semesters</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {archivedSemesters.map((semester) => (
                    <div
                      key={semester.id}
                      className="bg-slate-50 rounded-xl shadow-sm border-2 border-slate-300 p-6 opacity-75 hover:opacity-100 transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                          {semester.name}
                          <Archive className="w-5 h-5 text-slate-500" />
                        </h3>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          <Calendar className="w-4 h-4" />
                          {formatDate(semester.start_date)} - {formatDate(semester.end_date)}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          <FileText className="w-4 h-4" />
                          {semester.sessionCount} session{semester.sessionCount !== 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          <Users className="w-4 h-4" />
                          {semester.totalAttendance} total attendance
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(semester)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-100 transition text-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleArchive(semester)}
                          className="px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-100 transition text-sm"
                          title="Unarchive"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {semesters.length === 0 && (
              <div className="bg-white rounded-xl p-12 text-center">
                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-xl text-slate-600">No semesters yet</p>
                <p className="text-slate-500 mt-2">Create your first semester to organize your sessions</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
