import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context';
import { getTeacherDashboard } from '../../api';
import type { TeacherDashboardStats } from '../../api';

export default function TeacherDashboard() {
  const { teacherId } = useApp();
  const navigate = useNavigate();
  const [stats, setStats] = useState<TeacherDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacherId) return;
    setLoading(true);
    getTeacherDashboard(teacherId)
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [teacherId]);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '8px 0' }}>
      
      {/* ── Banner ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
            Faculty Dashboard
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Curriculum overview, attendance tracking, and student eligibility alerts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/teacher/attendance')}
            className="btn btn-primary btn-sm"
            style={{ fontSize: '0.85rem', padding: '7px 14px' }}
            id="dash-record-attendance-btn"
          >
            + Record Today's Attendance
          </button>
          <button
            onClick={() => navigate('/teacher/notes')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.85rem', padding: '7px 14px' }}
          >
            + Publish Note
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading dashboard metrics from database...
        </div>
      ) : !stats ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Could not load teacher dashboard.
        </div>
      ) : (
        <>
          {/* ── Metric Cards ────────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            
            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '18px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Courses Handled</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--primary)' }}>
                {stats.courses_handled}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {stats.courses.map(c => c.code).join(', ')}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '18px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Enrolled Students</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {stats.total_students}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Active learners across assigned subjects
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '18px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Students At Risk (&lt;75%)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: stats.students_at_risk.length > 0 ? '#dc2626' : '#16a34a' }}>
                {stats.students_at_risk.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Require attendance recovery
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '18px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Notes Published</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {stats.notes_published_count}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Revision &amp; reference guides shared
              </div>
            </div>

          </div>

          {/* ── Two Column Details ─────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '20px' }}>
            
            {/* Students Requiring Attendance Attention */}
            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
                  Students Requiring Attendance Attention (&lt; 75%)
                </h2>
                <span style={{ fontSize: '0.75rem', color: stats.students_at_risk.length > 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                  {stats.students_at_risk.length} Flagged
                </span>
              </div>

              {stats.students_at_risk.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#16a34a', fontSize: '0.85rem' }}>
                  ✓ All enrolled students currently satisfy the 75% attendance threshold.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-page)', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Roll No</th>
                      <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Student Name</th>
                      <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Course</th>
                      <th style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.students_at_risk.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {item.student_code}
                        </td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-main)' }}>
                          {item.full_name}
                        </td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                          {item.course_code}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                          <span style={{ fontWeight: 600, color: '#dc2626', backgroundColor: '#fee2e2', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>
                            {item.percentage}% ({item.attended}/{item.total})
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Courses Handled List */}
            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
                  Courses Handled This Semester
                </h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Active Syllabus
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stats.courses.map(course => (
                  <div
                    key={course.id}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'var(--bg-page)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        {course.code} — {course.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Department: {course.department}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/teacher/attendance?courseId=${course.id}`)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    >
                      Record &rarr;
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
