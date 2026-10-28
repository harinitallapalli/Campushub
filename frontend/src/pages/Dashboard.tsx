import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import {
  getDashboard,
  listTasks,
  listEvents,
  updateTask,
  listFacultyResources,
  listMyPersonalResources,
} from '../api';
import type {
  DashboardStats,
  Task,
  Event,
  FacultyResource,
  PersonalResource,
} from '../api';
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';
import { exportToICS } from '../utils/calendarSync';

function formatDue(dateStr?: string) {
  if (!dateStr) return 'No due date';
  try {
    const d = parseISO(dateStr);
    if (isToday(d)) return 'Due Today';
    if (isTomorrow(d)) return 'Due Tomorrow';
    if (isPast(d)) return `Overdue (${format(d, 'MMM d')})`;
    return format(d, 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export default function Dashboard() {
  const { studentId, user } = useApp();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [facultyRes, setFacultyRes] = useState<FacultyResource[]>([]);
  const [personalRes, setPersonalRes] = useState<PersonalResource[]>([]);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const studentFirstName = user?.full_name?.split(' ')[0] || 'Alex';

  useEffect(() => {
    if (!studentId) {
      navigate('/');
      return;
    }
    setLoading(true);
    Promise.all([
      getDashboard(studentId),
      listTasks(studentId, { status: undefined }),
      listEvents({ upcoming: true }),
      listFacultyResources(),
      listMyPersonalResources(),
    ])
      .then(([s, t, e, fr, pr]) => {
        setStats(s);
        setTasks(t.slice(0, 6));
        setEvents(e.slice(0, 5));
        setFacultyRes(fr.slice(0, 3));
        setPersonalRes(pr.slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [studentId, navigate]);

  function handleExportCalendar() {
    const cal = tasks.map(t => ({
      id: t.id,
      title: `${t.subject || 'Task'}: ${t.title}`,
      description: t.description,
      startDate: t.due_date || new Date().toISOString().split('T')[0],
    }));
    exportToICS(cal, 'campus_coursework_deadlines.ics');
  }

  async function handleToggleTaskStatus(task: Task) {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const updated = await updateTask(task.id, { status: nextStatus });
      setTasks(prev => prev.map(t => (t.id === task.id ? updated : t)));
      if (studentId) {
        const newStats = await getDashboard(studentId);
        setStats(newStats);
      }
    } catch {}
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading student dashboard data...
      </div>
    );
  }

  return (
    <div>
      {/* ── Spendly-inspired Greeting & Actions ──────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: '0 0 4px 0' }}>
            Good{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {greetingTime}
            </span>
            , {studentFirstName}
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
            Here is your daily coursework progress, attendance health, and upcoming schedule.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportCalendar}
            id="dashboard-export-ics"
            style={{ borderRadius: '10px' }}
          >
            Export Deadlines (.ics)
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/tasks')}
            id="add-task-btn"
            style={{ borderRadius: '10px', padding: '8px 18px' }}
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* ── Motivational Tip Banner (Spendly-styled) ────────────────── */}
      <div
        style={{
          backgroundColor: '#fff7ed',
          border: '1px solid #fed7aa',
          borderRadius: '14px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          color: '#9a3412',
          fontSize: '0.88rem',
        }}
      >
        <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>💡</span>
        <div style={{ flex: 1, lineHeight: 1.4 }}>
          <strong>Academic Focus:</strong> Daily coursework tracking and 75%+ attendance ensure full semester exam eligibility. You are on track!
        </div>
      </div>

      {/* ── Spendly-inspired Gradient Hero Metric Banner ─────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 45%, #7c3aed 100%)',
          borderRadius: '18px',
          padding: '26px 30px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 25px -4px rgba(79, 70, 229, 0.35)',
          marginBottom: '22px',
        }}
      >
        {/* Decorative translucent background rings */}
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: '140px', bottom: '-70px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(255,255,255,0.85)', fontWeight: 700, marginBottom: '6px' }}>
            Overall Academic Attendance
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
              87.4%
            </div>
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.22)',
                backdropFilter: 'blur(6px)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#ffffff',
              }}
            >
              ✓ Safe Attendance Zone (&gt;75%)
            </span>
          </div>

          {/* Sub-metric Glass Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(8px)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Today's Classes</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '2px' }}>3 Lectures</div>
            </div>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(8px)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Pending Tasks</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '2px' }}>{stats?.pending_tasks ?? 2} Deadlines</div>
            </div>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(8px)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Active Courses</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '2px' }}>4 Subjects</div>
            </div>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(8px)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Term Target</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '2px' }}>Fall 2026</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Academic Toolkit Shortcuts ─────────────────────────────── */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/timetable')}
        >
          Weekly Timetable
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/attendance')}
        >
          Attendance (75% Tracker)
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/grades')}
        >
          GPA &amp; CGPA Simulator
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/exams')}
        >
          Exam Schedule &amp; Countdowns
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/hackathons')}
        >
          Hackathons &amp; Competitions
        </button>
      </div>

      {/* ── Practical Stat Summary Boxes ───────────────────────────── */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-box-label">Total Assigned Tasks</div>
            <div className="stat-box-value">{stats.total_tasks}</div>
            <div className="stat-box-note">{stats.completed_tasks} completed to date</div>
          </div>

          <div className="stat-box">
            <div className="stat-box-label">Pending Coursework</div>
            <div className="stat-box-value">{stats.pending_tasks}</div>
            <div className="stat-box-note">Awaiting submission</div>
          </div>

          <div className="stat-box">
            <div className="stat-box-label">In Progress</div>
            <div className="stat-box-value">{stats.in_progress_tasks}</div>
            <div className="stat-box-note">Currently being worked on</div>
          </div>

          <div className="stat-box" style={{ borderColor: stats.overdue_tasks > 0 ? 'var(--danger-border)' : 'var(--border-color)' }}>
            <div className="stat-box-label" style={{ color: stats.overdue_tasks > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
              Overdue Deadlines
            </div>
            <div className="stat-box-value" style={{ color: stats.overdue_tasks > 0 ? 'var(--danger)' : 'var(--text-main)' }}>
              {stats.overdue_tasks}
            </div>
            <div className="stat-box-note" style={{ color: stats.overdue_tasks > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
              Past submission date
            </div>
          </div>
        </div>
      )}

      {/* ── Main Two-Column Layout ──────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* Left Column: Tasks Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Current Coursework &amp; Assignments</h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Recent items tracked for your courses
              </div>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/tasks')}
              id="view-all-tasks-btn"
            >
              View All ({stats?.total_tasks || 0})
            </button>
          </div>

          {tasks.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No tasks currently tracked. Click "+ Add Task" to record an assignment.
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>Done</th>
                    <th>Task &amp; Description</th>
                    <th>Course</th>
                    <th>Priority</th>
                    <th>Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(t => {
                    const isDone = t.status === 'completed';
                    return (
                      <tr key={t.id} style={{ opacity: isDone ? 0.6 : 1 }}>
                        <td>
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => handleToggleTaskStatus(t)}
                            title="Toggle completion"
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', textDecoration: isDone ? 'line-through' : 'none' }}>
                            {t.title}
                          </div>
                          {t.description && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {t.description}
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {t.subject || 'General'}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              t.priority === 'high'
                                ? 'badge-red'
                                : t.priority === 'medium'
                                ? 'badge-amber'
                                : 'badge-green'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              color:
                                t.due_date && isPast(parseISO(t.due_date)) && !isDone
                                  ? 'var(--danger)'
                                  : 'var(--text-secondary)',
                            }}
                          >
                            {formatDue(t.due_date)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Events & Campus Schedule */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Campus Events</h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Upcoming academic events
              </div>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/events')}
              id="view-all-events-btn"
            >
              Calendar
            </button>
          </div>

          {events.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No upcoming events scheduled.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {events.map(e => (
                <div
                  key={e.id}
                  style={{
                    padding: '10px 12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-page)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                      {e.title}
                    </div>
                    <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>
                      {e.category}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                    Date: {e.event_date} {e.event_time ? `• ${e.event_time}` : ''}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Location: {e.location || 'Campus Auditorium'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Academic & Study Resources Section ─────────────────────── */}
      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 2px 0' }}>
              Academic &amp; Study Resources
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Faculty-published references and your private saved study vault
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/resources')}
            id="view-all-resources-btn"
          >
            Manage All Resources &rarr;
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {/* Recent Faculty Resources */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📋</span> Recent Faculty Resources
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Published for you</span>
            </div>

            {facultyRes.length === 0 ? (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '16px 0', textAlign: 'center' }}>
                No faculty resources published yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {facultyRes.map(fr => (
                  <div key={fr.id} style={{ padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-page)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ minWidth: 0, flex: 1, marginRight: '10px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.83rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {fr.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {fr.course_code ? `${fr.course_code} • ` : ''}Shared by {fr.teacher_name || 'Faculty'}
                      </div>
                    </div>
                    {fr.url && (
                      <a href={fr.url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                        Open
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Study Resources */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📚</span> My Study Resources
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Private to you</span>
            </div>

            {personalRes.length === 0 ? (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '16px 0', textAlign: 'center' }}>
                No personal study resources saved yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {personalRes.map(pr => (
                  <div key={pr.id} style={{ padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-page)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ minWidth: 0, flex: 1, marginRight: '10px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.83rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {pr.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {pr.subject || pr.resource_type}
                      </div>
                    </div>
                    {pr.url && (
                      <a href={pr.url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                        Open
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
