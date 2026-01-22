import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import AttendanceScoreboard from '../components/AttendanceScoreboard';
import { supabase } from '../lib/supabase';
import type { ClassSession } from '../types/database';

export default function DisplayWindow() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<ClassSession | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    const { data } = await supabase
      .from('class_sessions')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();

    if (data) setSession(data);
  };

  if (!session || !sessionId) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  const signInUrl = `${window.location.origin}/signin/${session.session_code}`;

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center">
            <h2 className="text-3xl font-bold text-white mb-4">Student Sign-In</h2>
            <p className="text-slate-400 mb-8">Scan QR code to check in to class</p>

            <div className="bg-white p-6 rounded-xl border-4 border-slate-700 inline-block mb-6">
              <QRCodeSVG value={signInUrl} size={280} level="H" />
            </div>

            <div className="space-y-2 text-center">
              <p className="text-sm text-slate-400">Session Code</p>
              <p className="text-4xl font-bold text-blue-400 font-mono tracking-wider">
                {session.session_code}
              </p>
            </div>

            <div className="mt-6 text-sm text-slate-400 text-center">
              <p>Or visit:</p>
              <p className="font-mono text-blue-400 break-all">{signInUrl}</p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-8">
            <AttendanceScoreboard sessionId={sessionId} />
          </div>
        </div>
      </div>
    </div>
  );
}
