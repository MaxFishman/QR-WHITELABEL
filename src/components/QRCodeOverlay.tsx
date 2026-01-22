import { QRCodeSVG } from 'qrcode.react';
import { X, ExternalLink } from 'lucide-react';
import AttendanceScoreboard from './AttendanceScoreboard';

interface QRCodeOverlayProps {
  sessionCode: string;
  sessionId: string;
  onClose: () => void;
  onPopOut?: () => void;
}

export default function QRCodeOverlay({ sessionCode, sessionId, onClose, onPopOut }: QRCodeOverlayProps) {
  const signInUrl = `${window.location.origin}/signin/${sessionCode}`;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl p-12 max-w-5xl w-full relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Student Sign-In</h2>
            <p className="text-slate-600 mb-8">Scan QR code to check in to class</p>

            <div className="bg-white p-6 rounded-xl border-4 border-slate-200 inline-block mb-6">
              <QRCodeSVG value={signInUrl} size={280} level="H" />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-slate-500">Session Code</p>
              <p className="text-4xl font-bold text-blue-600 font-mono tracking-wider">
                {sessionCode}
              </p>
            </div>

            <div className="mt-6 text-sm text-slate-500">
              <p>Or visit: <span className="font-mono text-blue-600 break-all">{signInUrl}</span></p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            {onPopOut && (
              <button
                onClick={onPopOut}
                className="mb-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold shadow-lg"
              >
                <ExternalLink className="w-4 h-4" />
                Pop Out Leaderboard
              </button>
            )}
            <AttendanceScoreboard sessionId={sessionId} />
          </div>
        </div>
      </div>
    </div>
  );
}
