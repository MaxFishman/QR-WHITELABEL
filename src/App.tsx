import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import PresentationView from './components/PresentationView';
import StudentSignIn from './pages/StudentSignIn';
import StudentPortal from './pages/StudentPortal';
import AttendanceHistory from './pages/AttendanceHistory';
import CodeExamplesManager from './pages/CodeExamplesManager';
import CodePlayground from './pages/CodePlayground';
import ResourceLibrary from './pages/ResourceLibrary';
import SyllabusManager from './pages/SyllabusManager';
import LessonPlans from './pages/LessonPlans';
import DisplayWindow from './pages/DisplayWindow';
import Analytics from './pages/Analytics';
import SessionTemplates from './pages/SessionTemplates';
import SemesterArchive from './pages/SemesterArchive';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/teacher"
            element={
              <ProtectedRoute>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/present/:sessionId"
            element={
              <ProtectedRoute>
                <PresentationView />
              </ProtectedRoute>
            }
          />
          <Route path="/signin/:sessionCode" element={<StudentSignIn />} />
          <Route path="/student-portal" element={<StudentPortal />} />
          <Route
            path="/attendance-history"
            element={
              <ProtectedRoute>
                <AttendanceHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/code-examples"
            element={
              <ProtectedRoute>
                <CodeExamplesManager />
              </ProtectedRoute>
            }
          />
          <Route path="/playground" element={<CodePlayground />} />
          <Route path="/resources" element={<ResourceLibrary />} />
          <Route
            path="/syllabus"
            element={
              <ProtectedRoute>
                <SyllabusManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lesson-plans"
            element={
              <ProtectedRoute>
                <LessonPlans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/session-templates"
            element={
              <ProtectedRoute>
                <SessionTemplates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/semesters"
            element={
              <ProtectedRoute>
                <SemesterArchive />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="/display/:sessionId" element={<DisplayWindow />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
