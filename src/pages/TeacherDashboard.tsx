import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Calendar, Users, History, Plus, Code, LogOut, BookOpen, FileText, Target, TrendingUp, Layers, Archive, Settings, UserCheck, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import AttendanceTrendsChart from '../components/AttendanceTrendsChart';
import type { ClassSession } from '../types/database';

interface DashboardStats {
  totalStudents: number;
  avgAttendance: number;
  totalSessions: number;
  mostAttendedSession: { title: string; count: number } | null;
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [activeSession, setActiveSession] = useState<ClassSession | null>(null);
  const [showNewSession, setShowNewSession] = useState(false);
  const [weekNumber, setWeekNumber] = useState(1);
  const [chapterTitle, setChapterTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    avgAttendance: 0,
    totalSessions: 0,
    mostAttendedSession: null
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  useEffect(() => {
    loadSessions();
    loadStats();
  }, []);

  const loadSessions = async () => {
    const { data: allSessions } = await supabase
      .from('class_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (allSessions) {
      setSessions(allSessions);
      const active = allSessions.find(s => s.is_active);
      setActiveSession(active || null);
    }
  };

  const loadStats = async () => {
    const { data: allSessions } = await supabase
      .from('class_sessions')
      .select('id, week_number, chapter_title');

    const { data: allAttendance } = await supabase
      .from('attendance_records')
      .select('student_name, class_session_id');

    if (allSessions && allAttendance) {
      const uniqueStudents = new Set(allAttendance.map(a => a.student_name));
      const totalStudents = uniqueStudents.size;

      const completedSessions = allSessions.length;
      const avgAttendance = completedSessions > 0
        ? allAttendance.length / completedSessions
        : 0;

      const sessionCounts = allAttendance.reduce((acc, record) => {
        acc[record.class_session_id] = (acc[record.class_session_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      let mostAttended = null;
      if (Object.keys(sessionCounts).length > 0) {
        const maxSessionId = Object.keys(sessionCounts).reduce((a, b) =>
          sessionCounts[a] > sessionCounts[b] ? a : b
        );
        const session = allSessions.find(s => s.id === maxSessionId);
        if (session) {
          mostAttended = {
            title: `Week ${session.week_number}: ${session.chapter_title}`,
            count: sessionCounts[maxSessionId]
          };
        }
      }

      setStats({
        totalStudents,
        avgAttendance: Math.round(avgAttendance * 10) / 10,
        totalSessions: completedSessions,
        mostAttendedSession: mostAttended
      });
    }
  };

  const generateSessionCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const createSession = async () => {
    if (!chapterTitle.trim()) return;

    setLoading(true);

    if (activeSession) {
      await supabase
        .from('class_sessions')
        .update({ is_active: false, end_time: new Date().toISOString() })
        .eq('id', activeSession.id);
    }

    const sessionCode = generateSessionCode();
    const { data, error } = await supabase
      .from('class_sessions')
      .insert({
        session_code: sessionCode,
        week_number: weekNumber,
        chapter_title: chapterTitle,
        is_active: true
      })
      .select()
      .single();

    if (data) {
      setShowNewSession(false);
      setWeekNumber(1);
      setChapterTitle('');
      loadSessions();
      loadStats();
      navigate(`/present/${data.id}`);
    }

    setLoading(false);
  };

  const endSession = async () => {
    if (!activeSession) return;

    await supabase
      .from('class_sessions')
      .update({ is_active: false, end_time: new Date().toISOString() })
      .eq('id', activeSession.id);

    loadSessions();
    loadStats();
  };

  const continueSession = () => {
    if (activeSession) {
      navigate(`/present/${activeSession.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Teacher Dashboard</h1>
            <p className="text-slate-600">Media and Web Development - ICOM-101 / MTEC-617</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Total Students</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalStudents}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Avg Attendance</p>
                <p className="text-3xl font-bold text-slate-900">{stats.avgAttendance}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-amber-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Total Sessions</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalSessions}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-rose-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Most Attended</p>
                {stats.mostAttendedSession ? (
                  <>
                    <p className="text-lg font-bold text-slate-900 line-clamp-1">{stats.mostAttendedSession.title}</p>
                    <p className="text-sm text-slate-600">{stats.mostAttendedSession.count} students</p>
                  </>
                ) : (
                  <p className="text-lg font-bold text-slate-400">No data</p>
                )}
              </div>
              <div className="p-3 bg-rose-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-rose-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <AttendanceTrendsChart />
        </div>

        {activeSession && (
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-8 mb-8 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-blue-200 text-sm font-semibold mb-2">Active Session</div>
                <h2 className="text-3xl font-bold mb-2">Week {activeSession.week_number}</h2>
                <p className="text-xl text-blue-100 mb-4">{activeSession.chapter_title}</p>
                <div className="flex items-center gap-4 text-blue-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(activeSession.start_time).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Session Code: {activeSession.session_code}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={continueSession}
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Continue
                </button>
                <button
                  onClick={endSession}
                  className="bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition"
                >
                  End Session
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Class Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => setShowNewSession(true)}
              className="bg-white p-8 rounded-xl shadow-sm border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition">
                  <Plus className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Start New Session</h3>
                  <p className="text-slate-600">Begin a new class session with QR code check-in</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/code-examples')}
              className="bg-white p-8 rounded-xl shadow-sm border-2 border-slate-200 hover:border-amber-500 hover:bg-amber-50 transition text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition">
                  <Code className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Code Examples</h3>
                  <p className="text-slate-600">Create and manage code examples for students</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/attendance-history')}
              className="bg-white p-8 rounded-xl shadow-sm border-2 border-slate-200 hover:border-green-500 hover:bg-green-50 transition text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-green-100 rounded-xl group-hover:bg-green-200 transition">
                  <History className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">View History</h3>
                  <p className="text-slate-600">Review past sessions and attendance records</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Course Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => navigate('/resources')}
              className="bg-white p-8 rounded-xl shadow-sm border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Resource Library</h3>
                  <p className="text-slate-600">Upload PDFs, videos, and course materials</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/syllabus')}
              className="bg-white p-8 rounded-xl shadow-sm border-2 border-slate-200 hover:border-rose-500 hover:bg-rose-50 transition text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-rose-100 rounded-xl group-hover:bg-rose-200 transition">
                  <FileText className="w-8 h-8 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Syllabus</h3>
                  <p className="text-slate-600">Manage course policies and information</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/lesson-plans')}
              className="bg-white p-8 rounded-xl shadow-sm border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition">
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Lesson Plans</h3>
                  <p className="text-slate-600">Plan learning objectives for each week</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Analytics & Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <button
              onClick={() => navigate('/analytics')}
              className="bg-white p-8 rounded-xl shadow-sm border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition">
                  <TrendingUp className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Analytics</h3>
                  <p className="text-slate-600">View student engagement and insights</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/session-templates')}
              className="bg-white p-8 rounded-xl shadow-sm border-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50 transition text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-teal-100 rounded-xl group-hover:bg-teal-200 transition">
                  <Layers className="w-8 h-8 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Templates</h3>
                  <p className="text-slate-600">Manage session templates</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/semesters')}
              className="bg-white p-8 rounded-xl shadow-sm border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-100 rounded-xl group-hover:bg-indigo-200 transition">
                  <Archive className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Semesters</h3>
                  <p className="text-slate-600">Archive and organize by term</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/settings')}
              className="bg-white p-8 rounded-xl shadow-sm border-2 border-slate-200 hover:border-slate-500 hover:bg-slate-50 transition text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-slate-100 rounded-xl group-hover:bg-slate-200 transition">
                  <Settings className="w-8 h-8 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Settings</h3>
                  <p className="text-slate-600">Customize editor preferences</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {showNewSession && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Start New Session</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Week Number
                  </label>
                  <input
                    type="number"
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Chapter Title
                  </label>
                  <input
                    type="text"
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                    placeholder="e.g., Introductions / Syllabus"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewSession(false)}
                  className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={createSession}
                  disabled={loading || !chapterTitle.trim()}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Start Session'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Recent Sessions</h3>
          <div className="space-y-3">
            {sessions.slice(0, 5).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
              >
                <div>
                  <div className="font-semibold text-slate-900">
                    Week {session.week_number}: {session.chapter_title}
                  </div>
                  <div className="text-sm text-slate-600">
                    {new Date(session.start_time).toLocaleDateString()} - Code: {session.session_code}
                  </div>
                </div>
                <div>
                  {session.is_active ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-sm font-semibold">
                      Ended
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
