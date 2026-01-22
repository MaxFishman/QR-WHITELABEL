import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, TrendingUp, Award, Mail, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { AttendanceRecord, ClassSession } from '../types/database';

interface AttendanceWithSession extends AttendanceRecord {
  session: ClassSession;
}

export default function StudentPortal() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [studentName, setStudentName] = useState('');
  const [attendance, setAttendance] = useState<AttendanceWithSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchAttendance = async () => {
    if (!email.trim()) return;

    setLoading(true);
    setSearched(true);

    const { data: records } = await supabase
      .from('attendance_records')
      .select('*, class_sessions(*)')
      .eq('student_email', email.trim().toLowerCase())
      .order('checked_in_at', { ascending: false });

    if (records && records.length > 0) {
      setStudentName(records[0].student_name);
      setAttendance(
        records.map((record) => ({
          ...record,
          session: record.class_sessions as unknown as ClassSession
        }))
      );
    } else {
      setStudentName('');
      setAttendance([]);
    }

    setLoading(false);
  };

  const totalSessions = attendance.length;
  const totalPoints = attendance.reduce((sum, record) => sum + (record.points_earned || 0), 0);

  const getTotalPossibleSessions = async () => {
    const { count } = await supabase
      .from('class_sessions')
      .select('*', { count: 'exact', head: true });
    return count || 0;
  };

  const [totalPossible, setTotalPossible] = useState(0);

  const loadTotalSessions = async () => {
    const total = await getTotalPossibleSessions();
    setTotalPossible(total);
  };

  const attendancePercentage =
    totalPossible > 0 ? Math.round((totalSessions / totalPossible) * 100) : 0;

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  useState(() => {
    loadTotalSessions();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Student Portal</h1>
          <p className="text-slate-600">View your attendance history and points earned</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Enter Your Email
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchAttendance()}
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={searchAttendance}
              disabled={loading || !email.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="w-5 h-5" />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {searched && (
          <>
            {attendance.length > 0 ? (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">
                    Welcome, {studentName}!
                  </h2>
                  <p className="text-slate-600">Here's your attendance summary</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-slate-600 text-sm font-medium mb-1">
                          Sessions Attended
                        </p>
                        <p className="text-3xl font-bold text-slate-900">{totalSessions}</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-slate-600 text-sm font-medium mb-1">
                          Attendance Rate
                        </p>
                        <p className="text-3xl font-bold text-slate-900">
                          {attendancePercentage}%
                        </p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-amber-500">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-slate-600 text-sm font-medium mb-1">Total Points</p>
                        <p className="text-3xl font-bold text-slate-900">{totalPoints}</p>
                      </div>
                      <div className="p-3 bg-amber-100 rounded-lg">
                        <Award className="w-6 h-6 text-amber-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">
                    Attendance History
                  </h3>
                  <div className="space-y-3">
                    {attendance.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900 mb-1">
                            Week {record.session.week_number}: {record.session.chapter_title}
                          </div>
                          <div className="text-sm text-slate-600">
                            {formatDate(record.checked_in_at)} at{' '}
                            {formatTime(record.checked_in_at)}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-xs text-slate-500 mb-1">Points</div>
                            <div className="text-lg font-bold text-amber-600">
                              +{record.points_earned || 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center">
                <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-xl text-slate-600">No attendance records found</p>
                <p className="text-slate-500 mt-2">
                  Make sure you entered the correct email address
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
