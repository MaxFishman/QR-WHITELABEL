import { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { AttendanceRecord } from '../types/database';

interface AttendancePanelProps {
  sessionId: string;
  onClose: () => void;
}

export default function AttendancePanel({ sessionId, onClose }: AttendancePanelProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendance();

    const channel = supabase
      .channel(`attendance-panel-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance_records',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          setRecords((prev) => [payload.new as AttendanceRecord, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'attendance_records',
          filter: `session_id=eq.${sessionId}`
        },
        () => {
          loadAttendance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const loadAttendance = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('session_id', sessionId)
      .order('checked_in_at', { ascending: false });

    if (data) {
      setRecords(data);
    }
    setLoading(false);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="fixed right-4 top-20 bottom-4 w-96 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Live Attendance</h3>
          <p className="text-sm text-slate-400">{records.length} students checked in</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-800 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No students checked in yet
          </div>
        ) : (
          records.map((record) => (
            <div
              key={record.id}
              className="bg-slate-50 rounded-lg p-3 border border-slate-200 hover:border-blue-300 transition"
            >
              <div className="font-semibold text-slate-900">{record.student_name}</div>
              <div className="text-sm text-slate-600">{record.student_email}</div>
              {record.student_id && (
                <div className="text-sm text-slate-500">ID: {record.student_id}</div>
              )}
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <Clock className="w-3 h-3" />
                {formatTime(record.checked_in_at)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
