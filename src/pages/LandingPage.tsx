import { useNavigate } from 'react-router-dom';
import { Calendar, Code2, Github, GraduationCap, Shield, UserCircle } from 'lucide-react';
import SpiderWebBackground from '../components/SpiderWebBackground';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6 relative">
      <SpiderWebBackground />
      <div className="max-w-5xl w-full relative z-10">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-8">
            <img
              src="https://i.imgur.com/2mBn1Ox.png"
              alt="Course Banner"
              className="max-w-md w-full h-auto rounded-lg shadow-2xl"
            />
          </div>
          <h1 className="text-6xl font-bold text-white mb-4">
            ICOM-101 / MTEC-617
          </h1>
          <h2 className="text-3xl text-blue-200 mb-6">
            Media and Web Development
          </h2>
          <p className="text-xl text-slate-300">
            Max Fishman | CalArts
          </p>
          <div className="mt-4 text-slate-400">
            <p className="text-sm">M/Th 10:00 AM - 11:50 AM</p>
            <p className="text-sm">3/16/2026 - 4/24/2026</p>
            <p className="text-sm">Main Building B214A</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto">
          <button
            onClick={() => navigate('/student-portal')}
            className="group bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl p-6 hover:bg-white/20 hover:border-white/30 transition transform hover:scale-105"
          >
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-600 transition">
                <UserCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1 text-center">Student Portal</h3>
              <p className="text-blue-200 text-xs text-center">
                View your attendance and points
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/playground')}
            className="group bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl p-6 hover:bg-white/20 hover:border-white/30 transition transform hover:scale-105"
          >
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-rose-500 rounded-full flex items-center justify-center mb-3 group-hover:bg-rose-600 transition">
                <Code2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1 text-center">Code Playground</h3>
              <p className="text-blue-200 text-xs text-center">
                Practice HTML, CSS, and JavaScript
              </p>
            </div>
          </button>

          <a
            href="https://calarts.instructure.com/courses/20999"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl p-6 hover:bg-white/20 hover:border-white/30 transition transform hover:scale-105"
          >
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center mb-3 group-hover:bg-orange-600 transition">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1 text-center">Canvas Course</h3>
              <p className="text-blue-200 text-xs text-center">
                Access course materials and assignments
              </p>
            </div>
          </a>

          <a
            href="https://github.com/MaxFishman/ICOM-SPRING-2026"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl p-6 hover:bg-white/20 hover:border-white/30 transition transform hover:scale-105"
          >
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-slate-700 rounded-full flex items-center justify-center mb-3 group-hover:bg-slate-600 transition">
                <Github className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1 text-center">GitHub Repository</h3>
              <p className="text-blue-200 text-xs text-center">
                View code examples and resources
              </p>
            </div>
          </a>
        </div>

        <div className="mt-8 max-w-3xl mx-auto">
          <a
            href="https://calendly.com/maxjfishman/30-min-zoom-call-with-max"
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full bg-blue-600 hover:bg-blue-700 border-2 border-blue-500 hover:border-blue-400 rounded-xl p-4 transition transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <Calendar className="w-6 h-6 text-white" />
            <span className="text-xl font-semibold text-white">Book Time with Instructor</span>
          </a>
        </div>

        <div className="mt-12 text-center text-slate-400">
          <p className="text-sm">
            Office Hours: Tuesdays 5-6:30PM + by 1-on-1 Zoom appointment
          </p>
          <p className="text-sm mt-1">
            mfishman@calarts.edu | (661) 554-2623
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate('/login')}
            className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-sm font-medium rounded-lg transition border border-white/10 hover:border-white/20"
            title="Teacher Login"
          >
            <Shield className="w-4 h-4" />
            <span>Teacher Login</span>
          </button>
        </div>
      </div>
    </div>
  );
}
