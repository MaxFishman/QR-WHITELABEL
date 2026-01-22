import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, QrCode, Users, Maximize, Minimize } from 'lucide-react';
import { chapter1Slides } from '../data/slides';
import SlideRenderer from './SlideRenderer';
import QRCodeOverlay from './QRCodeOverlay';
import AttendancePanel from './AttendancePanel';
import { supabase } from '../lib/supabase';
import type { ClassSession } from '../types/database';

export default function PresentationView() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showQR, setShowQR] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [session, setSession] = useState<ClassSession | null>(null);
  const [attendanceCount, setAttendanceCount] = useState(0);

  useEffect(() => {
    if (sessionId) {
      loadSession();
      subscribeToAttendance();
    }
  }, [sessionId]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'q' || e.key === 'Q') {
        setShowQR(!showQR);
      } else if (e.key === 'a' || e.key === 'A') {
        setShowAttendance(!showAttendance);
      } else if (e.key === 'Escape') {
        setShowQR(false);
        setShowAttendance(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, showQR, showAttendance]);

  const loadSession = async () => {
    const { data, error } = await supabase
      .from('class_sessions')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();

    if (data) setSession(data);
  };

  const subscribeToAttendance = () => {
    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance_records',
          filter: `session_id=eq.${sessionId}`
        },
        () => {
          updateAttendanceCount();
        }
      )
      .subscribe();

    updateAttendanceCount();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateAttendanceCount = async () => {
    const { count } = await supabase
      .from('attendance_records')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    setAttendanceCount(count || 0);
  };

  const nextSlide = () => {
    if (currentSlide < chapter1Slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full">
          <SlideRenderer slide={chapter1Slides[currentSlide]} />
        </div>
      </div>

      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => setShowAttendance(!showAttendance)}
          className="p-3 bg-slate-800/90 backdrop-blur-sm text-white rounded-lg hover:bg-slate-700 transition flex items-center gap-2"
        >
          <Users className="w-5 h-5" />
          <span className="font-semibold">{attendanceCount}</span>
        </button>

        <button
          onClick={() => setShowQR(!showQR)}
          className="p-3 bg-blue-600/90 backdrop-blur-sm text-white rounded-lg hover:bg-blue-700 transition"
        >
          <QrCode className="w-5 h-5" />
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-3 bg-slate-800/90 backdrop-blur-sm text-white rounded-lg hover:bg-slate-700 transition"
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>

        <button
          onClick={() => navigate('/teacher')}
          className="p-3 bg-red-600/90 backdrop-blur-sm text-white rounded-lg hover:bg-red-700 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {showQR && session && sessionId && (
        <QRCodeOverlay
          sessionCode={session.session_code}
          sessionId={sessionId}
          onClose={() => setShowQR(false)}
          onPopOut={() => {
            window.open(
              `/display/${sessionId}`,
              '_blank',
              'width=1400,height=900,menubar=no,toolbar=no,location=no,status=no'
            );
            setShowQR(false);
          }}
        />
      )}

      {showAttendance && sessionId && (
        <AttendancePanel
          sessionId={sessionId}
          onClose={() => setShowAttendance(false)}
        />
      )}
    </div>
  );
}
