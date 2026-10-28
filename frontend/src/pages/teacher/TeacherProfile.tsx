import { useState, useEffect } from 'react';
import { useApp } from '../../context';
import { getTeacher, listTeachers, listCourses } from '../../api';
import type { Teacher, Course } from '../../api';

export default function TeacherProfile() {
  const { teacherId, setTeacherId } = useApp();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacherId) return;
    setLoading(true);

    Promise.all([
      getTeacher(teacherId),
      listTeachers(),
      listCourses({ teacher_id: teacherId }),
    ])
      .then(([teacherRes, allTeachers, coursesRes]) => {
        setTeacher(teacherRes);
        setTeachers(allTeachers);
        setCourses(coursesRes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [teacherId]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '8px 0' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
          Faculty Profile &amp; Department Affiliation
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
          Manage your teacher credentials, assigned courses, and active session.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading teacher profile...
        </div>
      ) : !teacher ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Teacher not found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Card */}
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '8px', backgroundColor: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem' }}>
                {teacher.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                  {teacher.full_name}
                </h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {teacher.designation} • Department of {teacher.department}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '2px' }}>Faculty ID:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{teacher.teacher_id}</span>
              </div>
              <div>
                <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '2px' }}>Email:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{teacher.email}</span>
              </div>
              <div>
                <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '2px' }}>Department:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{teacher.department}</span>
              </div>
              <div>
                <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '2px' }}>Designation:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{teacher.designation}</span>
              </div>
            </div>

            {teacher.bio && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <strong>Academic Focus:</strong> {teacher.bio}
              </div>
            )}
          </div>

          {/* Assigned Courses */}
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 12px 0', color: 'var(--text-main)' }}>
              Assigned Courses Handled ({courses.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {courses.map(c => (
                <div key={c.id} style={{ padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-page)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.88rem' }}>{c.code}</span> — {c.name}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.department}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Switch Faculty Profile */}
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-main)' }}>
              Switch Demo Faculty Profile
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
              Select another instructor to test course assignment permissions and dashboard metrics.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {teachers.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTeacherId(t.id)}
                  className={`btn btn-sm ${teacherId === t.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.8rem' }}
                >
                  {t.full_name} ({t.teacher_id})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
