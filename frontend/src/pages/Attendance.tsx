import { useState, useEffect } from 'react';
import { useApp } from '../context';
import { getStudentAttendance } from '../api';
import type { StudentCourseAttendanceSummary } from '../api';

export default function Attendance() {
  const { studentId } = useApp();
  const [summaries, setSummaries] = useState<StudentCourseAttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    getStudentAttendance(studentId)
      .then(res => {
        setSummaries(res);
        if (res.length > 0 && selectedCourseId === null) {
          setSelectedCourseId(res[0].course_id);
        }
      })
      .catch(() => {
        setError('Failed to load attendance records from backend.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [studentId]);

  const totalAttended = summaries.reduce((sum, s) => sum + s.attended, 0);
  const totalConducted = summaries.reduce((sum, s) => sum + s.total, 0);
  const aggregatePercentage =
    totalConducted > 0 ? Math.round((totalAttended / totalConducted) * 100) : 100;

  const lowAttendanceCount = summaries.filter(s => !s.is_eligible).length;

  const selectedCourse = summaries.find(s => s.course_id === selectedCourseId) || summaries[0];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '8px 0' }}>
      
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
            Course Attendance &amp; 75% Eligibility
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Read-only student view synchronized with teacher-recorded attendance records.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              padding: '4px 10px',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontWeight: 500,
            }}
          >
            Read-Only (Teacher Recorded)
          </span>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', border: '1px solid #f87171', color: '#991b1b', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* ── Metrics Cards ─────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Cumulative Attendance</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: aggregatePercentage >= 75 ? 'var(--primary)' : '#dc2626' }}>
            {aggregatePercentage}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {totalAttended} of {totalConducted} total class sessions attended
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Minimum 75% Requirement</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: lowAttendanceCount === 0 ? '#16a34a' : '#ea580c' }}>
            {lowAttendanceCount === 0 ? 'Compliant' : `${lowAttendanceCount} Critical`}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {lowAttendanceCount === 0 ? 'All subjects meet attendance criterion' : 'Immediate attention needed in marked courses'}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Active Courses</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {summaries.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Enrolled curriculum subjects
          </div>
        </div>

      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading attendance records from database...
        </div>
      ) : (
        <>
          {/* ── Subject Breakdown Table ───────────────────────────────────── */}
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
                Course-wise Eligibility Status
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Calculated dynamically from class logs
              </span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-page)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Course Code</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Course Name &amp; Faculty</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Attended / Total</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Percentage</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>75% Status</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Academic Guidance</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>Log</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map(s => (
                  <tr
                    key={s.course_id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      backgroundColor: selectedCourseId === s.course_id ? 'rgba(37, 99, 235, 0.03)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {s.course_code}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{s.course_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instructor: {s.teacher_name}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {s.attended} / {s.total} classes
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, color: s.is_eligible ? '#16a34a' : '#dc2626' }}>
                          {s.percentage}%
                        </span>
                        <div style={{ width: '60px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.min(s.percentage, 100)}%`,
                              height: '100%',
                              backgroundColor: s.is_eligible ? '#16a34a' : '#dc2626',
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          backgroundColor: s.is_eligible ? '#dcfce7' : '#fee2e2',
                          color: s.is_eligible ? '#15803d' : '#b91c1c',
                        }}
                      >
                        {s.is_eligible ? 'ELIGIBLE' : 'SHORTAGE'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {s.is_eligible ? (
                        s.classes_can_miss > 0 ? (
                          <span style={{ color: '#16a34a' }}>
                            You can safely miss <strong>{s.classes_can_miss}</strong> more class{s.classes_can_miss > 1 ? 'es' : ''}.
                          </span>
                        ) : (
                          <span style={{ color: '#ea580c' }}>
                            On border line: Do not miss upcoming classes.
                          </span>
                        )
                      ) : (
                        <span style={{ color: '#dc2626', fontWeight: 500 }}>
                          Must attend next <strong>{s.classes_needed}</strong> consecutive class{s.classes_needed > 1 ? 'es' : ''} to reach 75%.
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedCourseId(s.course_id)}
                        className={`btn btn-sm ${selectedCourseId === s.course_id ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                      >
                        {selectedCourseId === s.course_id ? 'Viewing' : 'View Log'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Real Attendance Date-wise Log ─────────────────────────────── */}
          {selectedCourse && (
            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 2px 0', color: 'var(--text-main)' }}>
                    Session Log: {selectedCourse.course_code} — {selectedCourse.course_name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Instructor: {selectedCourse.teacher_name} • {selectedCourse.records.length} conducted classes recorded
                  </div>
                </div>
              </div>

              {selectedCourse.records.length === 0 ? (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '16px 0' }}>
                  No individual class sessions recorded by teacher yet.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                  {selectedCourse.records.map(rec => (
                    <div
                      key={rec.id}
                      style={{
                        padding: '8px 10px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        backgroundColor: rec.status === 'present' ? 'rgba(22, 163, 74, 0.04)' : 'rgba(220, 38, 38, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rec.date}</span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: rec.status === 'present' ? '#16a34a' : '#dc2626',
                          textTransform: 'uppercase',
                        }}
                      >
                        {rec.status === 'present' ? '✓ Present' : '✗ Absent'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

    </div>
  );
}
