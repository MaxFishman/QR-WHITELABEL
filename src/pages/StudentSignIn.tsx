import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, User, Mail, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ClassSession } from '../types/database';

export default function StudentSignIn() {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const [session, setSession] = useState<ClassSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: ''
  });

  useEffect(() => {
    loadSession();
  }, [sessionCode]);

  const loadSession = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('class_sessions')
      .select('*')
      .eq('session_code', sessionCode)
      .eq('is_active', true)
      .maybeSingle();

    if (data) {
      setSession(data);
    } else {
      setError('Invalid or expired session code');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    setError('');

    const { data: existing } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('session_id', session.id)
      .eq('student_email', formData.email.toLowerCase())
      .maybeSingle();

    if (existing) {
      setAlreadyCheckedIn(true);
      setSubmitting(false);
      return;
    }

    const { count } = await supabase
      .from('attendance_records')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', session.id);

    const currentCount = count || 0;
    const points = Math.max(100 - (currentCount * 10), 10);

    const { error: insertError } = await supabase
      .from('attendance_records')
      .insert({
        session_id: session.id,
        student_name: formData.name.trim(),
        student_email: formData.email.toLowerCase().trim(),
        student_id: formData.studentId.trim() || null,
        points: points
      });

    if (insertError) {
      setError('Failed to check in. Please try again.');
      setSubmitting(false);
    } else {
      setSuccess(true);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-xl text-blue-600">Loading...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-12 max-w-md w-full text-center shadow-xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Successfully Checked In!
          </h1>
          <p className="text-lg text-slate-600 mb-2">Welcome, {formData.name}</p>
          <p className="text-slate-500">
            You're all set for today's class
          </p>
          <div className="mt-8 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-1">Session</p>
            <p className="font-semibold text-slate-900">
              Week {session?.week_number}: {session?.chapter_title}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (alreadyCheckedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-12 max-w-md w-full text-center shadow-xl">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Already Checked In
          </h1>
          <p className="text-lg text-slate-600">
            You've already checked in to this session
          </p>
          <div className="mt-8 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-1">Session</p>
            <p className="font-semibold text-slate-900">
              Week {session?.week_number}: {session?.chapter_title}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-12 max-w-md w-full text-center shadow-xl">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Invalid Session
          </h1>
          <p className="text-lg text-slate-600">
            {error || 'This session code is invalid or has expired'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Check In to Class</h1>
          <div className="inline-block bg-blue-100 px-4 py-2 rounded-lg">
            <p className="text-sm text-blue-600 font-semibold">Week {session.week_number}</p>
            <p className="text-lg text-blue-900 font-bold">{session.chapter_title}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john.doe@calarts.edu"
                className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Student ID (Optional)
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="123456"
                className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Checking In...' : 'Check In'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Media and Web Development - ICOM-101 / MTEC-617
        </p>
      </div>
    </div>
  );
}
