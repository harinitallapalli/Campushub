import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import type { UserRole } from '../context';

interface SidebarProps {
  userName?: string;
  userSub?: string;
  role: UserRole;
}

export default function Sidebar({ userName, userSub, role }: SidebarProps) {
  const { signOut } = useApp();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate('/login');
  }

  const initials = userName
    ? userName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : role === 'teacher'
    ? 'TS'
    : 'AJ';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand-mark">CH</div>
        <div>
          <div className="sidebar-brand-title">CampusHub</div>
          <div className="sidebar-brand-sub">
            {role === 'teacher' ? 'Teacher Portal' : 'Academic Portal'}
          </div>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Portal Navigation">
        {role === 'student' ? (
          <>
            {/* ── ACADEMIC MANAGEMENT ── */}
            <div className="sidebar-label">Academic Management</div>
            
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Dashboard
            </NavLink>

            <NavLink
              to="/tasks"
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              Tasks &amp; Deadlines
            </NavLink>

            <NavLink
              to="/timetable"
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Weekly Timetable
            </NavLink>

            <NavLink
              to="/attendance"
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Attendance (75%)
            </NavLink>

            <NavLink
              to="/grades"
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              GPA &amp; CGPA Simulator
            </NavLink>

            <NavLink
              to="/exams"
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Exam Schedule
            </NavLink>

            {/* ── CAMPUS & CAREER ── */}
            <div className="sidebar-label" style={{ marginTop: '12px' }}>Campus &amp; Career</div>

            <NavLink
              to="/hackathons"
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
              Hackathons
            </NavLink>

            <NavLink
              to="/events"
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Campus Events
            </NavLink>

            <NavLink
              to="/resources"
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              Study &amp; Code Vault
            </NavLink>

            {/* ── ACCOUNT & INFO ── */}
            <div className="sidebar-label" style={{ marginTop: '12px' }}>Account &amp; Info</div>

            <NavLink
              to="/profile"
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Student Record
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              Preferences
            </NavLink>

            <NavLink
              to="/help"
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Help &amp; Support
            </NavLink>

            <div style={{ marginTop: 'auto', paddingTop: '14px' }}>
              <NavLink to="/privacy" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`} style={{ fontSize: '0.78rem' }}>
                Privacy Policy
              </NavLink>
              <NavLink to="/terms" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`} style={{ fontSize: '0.78rem' }}>
                Terms of Use
              </NavLink>
            </div>
          </>
        ) : (
          <>
            {/* ── TEACHER WORKSPACE ── */}
            <div className="sidebar-label">Faculty Workspace</div>

            <NavLink
              to="/teacher/dashboard"
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Dashboard
            </NavLink>

            <NavLink
              to="/teacher/attendance"
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              Attendance (Mark/Edit)
            </NavLink>

            <NavLink
              to="/teacher/events"
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Campus Events (Manage)
            </NavLink>

            <NavLink
              to="/teacher/resources"
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              Study Vault &amp; Notes
            </NavLink>

            <NavLink
              to="/teacher/profile"
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Faculty Profile
            </NavLink>
          </>
        )}

      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-block">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-details">
            <div className="sidebar-user-name">
              {userName || (role === 'teacher' ? 'Faculty Member' : 'Alex Johnson')}
            </div>
            <div className="sidebar-user-id">
              {userSub || (role === 'teacher' ? 'Faculty' : 'Computer Science')}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="btn btn-secondary btn-sm"
            title="Sign out"
            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
