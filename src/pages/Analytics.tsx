import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Users, AlertTriangle, Code, Eye, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { AttendanceRecord, ClassSession, StudentEngagement } from '../types/database';

interface StudentStats {
  email: string;
  name: string;
  attendanceCount: number;
  totalSessions: number;
  attendanceRate: number;
  engagementEvents: number;
  lastActive: string;
  isAtRisk: boolean;
}

interface CodeExampleStats {
  id: string;
  title: string;
  views: number;
  forks: number;
  weekNumber: number;
}

export default function Analytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentStats, setStudentStats] = useState<StudentStats[]>([]);
  const [codeExampleStats, setCodeExampleStats] = useState<CodeExampleStats[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [averageAttendance, setAverageAttendance] = useState(0);
  const [atRiskStudents, setAtRiskStudents] = useState<StudentStats[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);

    const { data: sessions } = await supabase
      .from('class_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: attendance } = await supabase
      .from('attendance_records')
      .select('*');

    const { data: engagement } = await supabase
      .from('student_engagement')
      .select('*');

    if (sessions && attendance) {
      setTotalSessions(sessions.length);

      const studentMap = new Map<string, StudentStats>();

      attendance.forEach((record) => {
        const existing = studentMap.get(record.student_email);
        if (existing) {
          existing.attendanceCount++;
          if (record.checked_in_at > existing.lastActive) {
            existing.lastActive = record.checked_in_at;
          }
        } else {
          studentMap.set(record.student_email, {
            email: record.student_email,
            name: record.student_name,
            attendanceCount: 1,
            totalSessions: sessions.length,
            attendanceRate: 0,
            engagementEvents: 0,
            lastActive: record.checked_in_at,
            isAtRisk: false
          });
        }
      });

      if (engagement) {
        engagement.forEach((event) => {
          const existing = studentMap.get(event.student_email);
          if (existing) {
            existing.engagementEvents++;
          }
        });
      }

      const stats = Array.from(studentMap.values()).map(stat => ({
        ...stat,
        attendanceRate: sessions.length > 0 ? (stat.attendanceCount / sessions.length) * 100 : 0,
        isAtRisk: sessions.length > 0 && (stat.attendanceCount / sessions.length) < 0.6
      }));

      stats.sort((a, b) => b.attendanceCount - a.attendanceCount);
      setStudentStats(stats);

      const atRisk = stats.filter(s => s.isAtRisk);
      setAtRiskStudents(atRisk);

      const totalAttendanceRate = stats.reduce((sum, s) => sum + s.attendanceRate, 0);
      setAverageAttendance(stats.length > 0 ? totalAttendanceRate / stats.length : 0);
    }

    if (engagement) {
      const codeExampleMap = new Map<string, CodeExampleStats>();

      engagement.forEach((event) => {
        if (event.resource_type === 'code_example') {
          const existing = codeExampleMap.get(event.resource_id || '');
          if (existing) {
            if (event.event_type === 'view') existing.views++;
            if (event.event_type === 'fork') existing.forks++;
          } else if (event.resource_id) {
            codeExampleMap.set(event.resource_id, {
              id: event.resource_id,
              title: 'Code Example',
              views: event.event_type === 'view' ? 1 : 0,
              forks: event.event_type === 'fork' ? 1 : 0,
              weekNumber: 0
            });
          }
        }
      });

      const codeStats = Array.from(codeExampleMap.values());
      codeStats.sort((a, b) => b.views - a.views);
      setCodeExampleStats(codeStats);
    }

    setLoading(false);
  };

  const exportToCSV = () => {
    const headers = ['Student Name', 'Email', 'Attendance Count', 'Attendance Rate', 'Engagement Events', 'Last Active', 'At Risk'];
    const rows = studentStats.map((stat) => [
      stat.name,
      stat.email,
      stat.attendanceCount.toString(),
      `${stat.attendanceRate.toFixed(1)}%`,
      stat.engagementEvents.toString(),
      new Date(stat.lastActive).toLocaleDateString(),
      stat.isAtRisk ? 'Yes' : 'No'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-xl text-slate-600">Loading analytics...</div>
      </div>
    );
  }

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
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Analytics & Insights</h1>
            <p className="text-slate-600">Track student engagement and course performance</p>
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{studentStats.length}</div>
            <div className="text-sm text-slate-600">Total Students</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{averageAttendance.toFixed(1)}%</div>
            <div className="text-sm text-slate-600">Average Attendance</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-amber-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{atRiskStudents.length}</div>
            <div className="text-sm text-slate-600">At-Risk Students</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Code className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{totalSessions}</div>
            <div className="text-sm text-slate-600">Total Sessions</div>
          </div>
        </div>

        {atRiskStudents.length > 0 && (
          <div className="bg-amber-50 rounded-xl shadow-sm border-2 border-amber-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              <h2 className="text-2xl font-bold text-slate-900">At-Risk Alerts</h2>
            </div>
            <p className="text-slate-600 mb-4">
              These students have attendance below 60% and may need additional support
            </p>
            <div className="space-y-3">
              {atRiskStudents.map((student) => (
                <div
                  key={student.email}
                  className="bg-white rounded-lg p-4 border border-amber-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{student.name}</div>
                      <div className="text-sm text-slate-600">{student.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-amber-600">
                        {student.attendanceRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-slate-600">
                        {student.attendanceCount} / {student.totalSessions} sessions
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Student Engagement</h2>
            <div className="space-y-2">
              {studentStats.slice(0, 10).map((student, index) => (
                <div key={student.email} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{student.name}</div>
                    <div className="text-xs text-slate-500">{student.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">
                      {student.attendanceRate.toFixed(0)}%
                    </div>
                    <div className="text-xs text-slate-600">
                      {student.attendanceCount} sessions
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Popular Code Examples</h2>
            {codeExampleStats.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No code example data yet</p>
            ) : (
              <div className="space-y-3">
                {codeExampleStats.slice(0, 10).map((example, index) => (
                  <div key={example.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{example.title}</div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Eye className="w-4 h-4" />
                        {example.views}
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Code className="w-4 h-4" />
                        {example.forks}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">All Students</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Attendance</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Rate</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Engagement</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {studentStats.map((student) => (
                  <tr key={student.email} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{student.name}</td>
                    <td className="py-3 px-4 text-slate-600">{student.email}</td>
                    <td className="py-3 px-4 text-center text-slate-700">
                      {student.attendanceCount} / {student.totalSessions}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          student.attendanceRate >= 80
                            ? 'bg-green-100 text-green-700'
                            : student.attendanceRate >= 60
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {student.attendanceRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-700">
                      {student.engagementEvents}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600 text-sm">
                      {new Date(student.lastActive).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
