import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Attendance from './pages/Attendance';
import Notes from './pages/Notes';
import Events from './pages/Events';
import Resources from './pages/Resources';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Help from './pages/Help';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Timetable from './pages/Timetable';
import Grades from './pages/Grades';
import Exams from './pages/Exams';
import Hackathons from './pages/Hackathons';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherNotes from './pages/teacher/TeacherNotes';
import TeacherEvents from './pages/teacher/TeacherEvents';
import TeacherResources from './pages/teacher/TeacherResources';
import TeacherProfile from './pages/teacher/TeacherProfile';

function AppRoutes() {
  const { isAuthenticated, isLoading, role } = useApp();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-page)',
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
      }}>
        Loading CampusHub…
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to={role === 'teacher' ? '/teacher/dashboard' : '/dashboard'} replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to={isAuthenticated ? (role === 'teacher' ? '/teacher/dashboard' : '/dashboard') : '/login'} replace />} />

      {/* Protected app routes inside shared Layout */}
      <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}>
        {/* Student Portal Routes */}
        <Route path="/dashboard" element={role === 'student' ? <Dashboard /> : <Navigate to="/teacher/dashboard" replace />} />
        <Route path="/tasks" element={role === 'student' ? <Tasks /> : <Navigate to="/teacher/dashboard" replace />} />
        <Route path="/attendance" element={role === 'student' ? <Attendance /> : <Navigate to="/teacher/dashboard" replace />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/events" element={<Events />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/profile" element={<Profile />} />

        {/* Supplemental Academic Pages */}
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/grades" element={<Grades />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/hackathons" element={<Hackathons />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Teacher Portal Routes */}
        <Route path="/teacher/dashboard" element={role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/dashboard" replace />} />
        <Route path="/teacher/attendance" element={role === 'teacher' ? <TeacherAttendance /> : <Navigate to="/dashboard" replace />} />
        <Route path="/teacher/notes" element={role === 'teacher' ? <TeacherNotes /> : <Navigate to="/dashboard" replace />} />
        <Route path="/teacher/events" element={role === 'teacher' ? <TeacherEvents /> : <Navigate to="/dashboard" replace />} />
        <Route path="/teacher/resources" element={role === 'teacher' ? <TeacherResources /> : <Navigate to="/dashboard" replace />} />
        <Route path="/teacher/profile" element={role === 'teacher' ? <TeacherProfile /> : <Navigate to="/dashboard" replace />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
