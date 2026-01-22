import { useState, useEffect } from 'react';
import { Trophy, Zap, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { AttendanceRecord } from '../types/database';

interface AttendanceScoreboardProps {
  sessionId: string;
}

export default function AttendanceScoreboard({ sessionId }: AttendanceScoreboardProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    loadAttendance();

    const channel = supabase
      .channel(`scoreboard-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance_records',
          filter: `session_id=eq.${sessionId}`
        },
        () => {
          loadAttendance();
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
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('session_id', sessionId)
      .order('points', { ascending: false });

    if (data) {
      setRecords(data);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getMedalEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return null;
  };

  const getPointsColor = (points: number) => {
    if (points >= 90) return 'text-yellow-600';
    if (points >= 70) return 'text-blue-600';
    if (points >= 50) return 'text-green-600';
    return 'text-slate-600';
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-8">
        <Zap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 text-lg">Waiting for students to check in...</p>
        <p className="text-slate-400 text-sm mt-1">Be the first to earn 100 points!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-yellow-600" />
        <h3 className="text-2xl font-bold text-slate-900">Live Leaderboard</h3>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {records.map((record, index) => {
          const medal = getMedalEmoji(index);
          const pointsColor = getPointsColor(record.points);

          return (
            <div
              key={record.id}
              className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                index < 3
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200'
                  : 'bg-slate-50 border-2 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-slate-200 font-bold text-lg">
                  {medal || `#${index + 1}`}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900 text-lg">
                    {record.student_name}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-3 h-3" />
                    {formatTime(record.checked_in_at)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className={`text-3xl font-bold ${pointsColor}`}>
                  {record.points}
                </div>
                <div className="text-xs text-slate-500 font-semibold">POINTS</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600">
          <span className="font-semibold">{records.length}</span> student{records.length !== 1 ? 's' : ''} checked in
        </p>
        <p className="text-xs text-slate-500 mt-1">
          First = 100 pts • Each additional = -10 pts • Min = 10 pts
        </p>
      </div>
    </div>
  );
}
