import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { listStudents, listTeachers } from '../api';
import type { Student, Teacher } from '../api';

export default function Landing() {
  const { setRole, setStudentId, setTeacherId } = useApp();
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(1);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number>(1);

  useEffect(() => {
    listStudents()
      .then(res => {
        if (Array.isArray(res) && res.length > 0) {
          setStudents(res);
          setSelectedStudentId(res[0].id);
        }
      })
      .catch(() => {});

    listTeachers()
      .then(res => {
        if (Array.isArray(res) && res.length > 0) {
          setTeachers(res);
          setSelectedTeacherId(res[0].id);
        }
      })
      .catch(() => {});
  }, []);

  function handleContinueStudent() {
    setRole('student');
    setStudentId(selectedStudentId);
    navigate('/dashboard');
  }

  function handleContinueTeacher() {
    setRole('teacher');
    setTeacherId(selectedTeacherId);
    navigate('/teacher/dashboard');
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-page)', display: 'flex', flexDirection: 'column' }}>
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <header style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)', padding: '14px 32px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '30px', height: '30px', backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
              CH
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: 1.2 }}>CampusHub</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Student–Teacher Academic Management Portal</div>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Single Source of Truth • SQLite &amp; FastAPI
          </div>
        </div>
      </header>

      {/* ── Main Access Screen ───────────────────────────────────────────── */}
      <main style={{ flex: 1, maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'inline-block', backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)', border: '1px solid var(--primary-border)', padding: '3px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600, marginBottom: '12px' }}>
            Academic Portal Access
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
            Select Your Academic Role
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto' }}>
            Choose whether to access the portal as a Student to track eligibility and study notes, or as a Teacher to manage attendance, publish notes, and coordinate events.
          </p>
        </div>

        {/* ── Two Column Role Selector ────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          
          {/* STUDENT CARD */}
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '28px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                  </svg>
                </div>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>Student Portal</h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Learner &amp; Coursework Tracker</span>
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                Read-Only Attendance
              </span>
            </div>

            <ul style={{ margin: '0 0 20px 0', paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7, flex: 1 }}>
              <li>View real-time attendance &amp; 75% rule eligibility</li>
              <li>Read faculty-published notes &amp; course resources</li>
              <li>Register for campus workshops and hackathons</li>
              <li>Track personal coursework tasks and deadlines</li>
            </ul>

            <div style={{ marginBottom: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <label htmlFor="student-select" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: '6px' }}>
                Active Student Profile (Demo):
              </label>
              <select
                id="student-select"
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-surface)' }}
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.student_id} — {s.full_name} ({s.department})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-primary"
                onClick={handleContinueStudent}
                style={{ flex: 1, padding: '10px', fontSize: '0.9rem' }}
                id="continue-student-btn"
              >
                Continue as Student &rarr;
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/onboarding')}
                title="Create new student account"
                style={{ fontSize: '0.85rem', padding: '10px 14px' }}
              >
                New Profile
              </button>
            </div>
          </div>

          {/* TEACHER CARD */}
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '28px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '6px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                </div>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>Teacher Portal</h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Faculty Academic Management</span>
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                Record &amp; Author
              </span>
            </div>

            <ul style={{ margin: '0 0 20px 0', paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7, flex: 1 }}>
              <li>Record daily attendance per course &amp; date</li>
              <li>Publish and update revision notes with external links</li>
              <li>Create and schedule department campus events</li>
              <li>Share curated study resources with enrolled students</li>
            </ul>

            <div style={{ marginBottom: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <label htmlFor="teacher-select" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: '6px' }}>
                Active Teacher Profile (Demo):
              </label>
              <select
                id="teacher-select"
                value={selectedTeacherId}
                onChange={e => setSelectedTeacherId(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-surface)' }}
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.teacher_id} — {t.full_name} ({t.designation})
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleContinueTeacher}
              style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }}
              id="continue-teacher-btn"
            >
              Continue as Teacher &rarr;
            </button>
          </div>

        </div>

        {/* ── Architecture Note ────────────────────────────────────────────── */}
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '2px' }}>
              One Database • Synchronized Academic Flow
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Any attendance marked or note published by a teacher in the Teacher Portal immediately updates the corresponding Student Portal view.
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
            SQLite Backend Active
          </span>
        </div>
      </main>
    </div>
  );
}
