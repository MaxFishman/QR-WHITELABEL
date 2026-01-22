import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Calendar, Users, ChevronDown, ChevronUp, Trash2, Search, Filter, X, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ClassSession, AttendanceRecord } from '../types/database';

interface SessionWithAttendance extends ClassSession {
  attendance: AttendanceRecord[];
}

export default function AttendanceHistory() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionWithAttendance[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<SessionWithAttendance[]>([]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minAttendance, setMinAttendance] = useState('');
  const [maxAttendance, setMaxAttendance] = useState('');

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sessions, searchQuery, dateFrom, dateTo, minAttendance, maxAttendance]);

  const loadSessions = async () => {
    setLoading(true);

    const { data: sessionData } = await supabase
      .from('class_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (sessionData) {
      const sessionsWithAttendance = await Promise.all(
        sessionData.map(async (session) => {
          const { data: attendance } = await supabase
            .from('attendance_records')
            .select('*')
            .eq('session_id', session.id)
            .order('checked_in_at', { ascending: true });

          return {
            ...session,
            attendance: attendance || []
          };
        })
      );

      setSessions(sessionsWithAttendance);
    }

    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...sessions];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (session) =>
          session.week_number.toString().includes(query) ||
          session.chapter_title.toLowerCase().includes(query)
      );
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(
        (session) => new Date(session.date) >= fromDate
      );
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      filtered = filtered.filter(
        (session) => new Date(session.date) <= toDate
      );
    }

    if (minAttendance) {
      const min = parseInt(minAttendance);
      filtered = filtered.filter(
        (session) => session.attendance.length >= min
      );
    }

    if (maxAttendance) {
      const max = parseInt(maxAttendance);
      filtered = filtered.filter(
        (session) => session.attendance.length <= max
      );
    }

    setFilteredSessions(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setMinAttendance('');
    setMaxAttendance('');
  };

  const hasActiveFilters = searchQuery || dateFrom || dateTo || minAttendance || maxAttendance;

  const exportToCSV = (session: SessionWithAttendance) => {
    const headers = ['Name', 'Email', 'Student ID', 'Check-in Time'];
    const rows = session.attendance.map((record) => [
      record.student_name,
      record.student_email,
      record.student_id || '',
      new Date(record.checked_in_at).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-week-${session.week_number}-${session.date}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportAllToCSV = () => {
    const headers = ['Week', 'Chapter', 'Date', 'Name', 'Email', 'Student ID', 'Check-in Time'];
    const rows: string[][] = [];

    const sessionsToExport = hasActiveFilters ? filteredSessions : sessions;

    sessionsToExport.forEach((session) => {
      session.attendance.forEach((record) => {
        rows.push([
          session.week_number.toString(),
          session.chapter_title,
          new Date(session.date).toLocaleDateString(),
          record.student_name,
          record.student_email,
          record.student_id || '',
          new Date(record.checked_in_at).toLocaleString()
        ]);
      });
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-attendance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleSession = (sessionId: string) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  const handleDelete = async (sessionId: string, sessionTitle: string) => {
    if (confirm(`Are you sure you want to delete this session?\n\n"${sessionTitle}"\n\nThis will permanently delete the session and all associated attendance records. This action cannot be undone.`)) {
      await supabase
        .from('attendance_records')
        .delete()
        .eq('session_id', sessionId);

      await supabase
        .from('class_sessions')
        .delete()
        .eq('id', sessionId);

      loadSessions();
    }
  };

  const duplicateSession = async (session: SessionWithAttendance) => {
    const generateSessionCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    const newSessionCode = generateSessionCode();

    const { data, error } = await supabase
      .from('class_sessions')
      .insert({
        session_code: newSessionCode,
        week_number: session.week_number + 1,
        chapter_title: session.chapter_title,
        notes: session.notes,
        is_active: false
      })
      .select()
      .single();

    if (data && !error) {
      alert(`Session duplicated successfully!\n\nNew session code: ${newSessionCode}\nWeek number: ${data.week_number}`);
      loadSessions();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-xl text-slate-600">Loading attendance history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <button
                onClick={() => navigate('/teacher')}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </button>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Attendance History</h1>
              <p className="text-slate-600">View and export attendance records for all sessions</p>
            </div>
            {sessions.length > 0 && (
              <button
                onClick={exportAllToCSV}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
              >
                <Download className="w-5 h-5" />
                Export All to CSV
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by week number or chapter title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                  showFilters
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                <Filter className="w-5 h-5" />
                Filters
                {hasActiveFilters && (
                  <span className="px-2 py-0.5 bg-white text-blue-600 rounded-full text-xs">
                    Active
                  </span>
                )}
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition"
                >
                  <X className="w-5 h-5" />
                  Clear
                </button>
              )}
            </div>

            {showFilters && (
              <div className="mt-6 pt-6 border-t-2 border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Date From
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Date To
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Min Attendance
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 10"
                    value={minAttendance}
                    onChange={(e) => setMinAttendance(e.target.value)}
                    min="0"
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Max Attendance
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 50"
                    value={maxAttendance}
                    onChange={(e) => setMaxAttendance(e.target.value)}
                    min="0"
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <div className="mb-4 text-sm text-slate-600">
              Showing {filteredSessions.length} of {sessions.length} sessions
            </div>
          )}
        </div>

        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-xl text-slate-600">No sessions yet</p>
              <p className="text-slate-500 mt-2">Create a session to start tracking attendance</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-xl text-slate-600">No sessions match your filters</p>
              <p className="text-slate-500 mt-2">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden border-2 border-slate-200"
              >
                <div
                  onClick={() => toggleSession(session.id)}
                  className="p-6 cursor-pointer hover:bg-slate-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-2xl font-bold text-slate-900">
                          Week {session.week_number}
                        </h3>
                        {session.is_active && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-lg text-slate-700 mb-3">{session.chapter_title}</p>
                      <div className="flex items-center gap-6 text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(session.date)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {session.attendance.length} students
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateSession(session);
                        }}
                        className="p-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
                        title="Duplicate Session"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportToCSV(session);
                        }}
                        className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        title="Export to CSV"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(session.id, `Week ${session.week_number}: ${session.chapter_title}`);
                        }}
                        className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        title="Delete Session"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      {expandedSession === session.id ? (
                        <ChevronUp className="w-6 h-6 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedSession === session.id && (
                  <div className="border-t-2 border-slate-200 bg-slate-50 p-6">
                    {session.attendance.length === 0 ? (
                      <p className="text-center text-slate-500 py-8">
                        No students checked in for this session
                      </p>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b-2 border-slate-200">
                          <div className="bg-white rounded-lg p-4 border border-slate-200">
                            <div className="text-xs text-slate-500 mb-1">Average Check-in Time</div>
                            <div className="text-xl font-bold text-slate-900">
                              {(() => {
                                const times = session.attendance.map(r => new Date(r.checked_in_at).getTime());
                                const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
                                return formatTime(new Date(avgTime).toISOString());
                              })()}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-slate-200">
                            <div className="text-xs text-slate-500 mb-1">First Check-in</div>
                            <div className="text-xl font-bold text-slate-900">
                              {formatTime(session.attendance[session.attendance.length - 1].checked_in_at)}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-slate-200">
                            <div className="text-xs text-slate-500 mb-1">Last Check-in</div>
                            <div className="text-xl font-bold text-slate-900">
                              {formatTime(session.attendance[0].checked_in_at)}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {session.attendance.map((record) => (
                            <div
                              key={record.id}
                              className="bg-white rounded-lg p-4 border border-slate-200"
                            >
                              <div className="font-semibold text-slate-900 mb-1">
                                {record.student_name}
                              </div>
                              <div className="text-sm text-slate-600 mb-1">
                                {record.student_email}
                              </div>
                              {record.student_id && (
                                <div className="text-sm text-slate-500 mb-1">
                                  ID: {record.student_id}
                                </div>
                              )}
                              <div className="text-xs text-slate-500 mt-2">
                                Checked in at {formatTime(record.checked_in_at)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
