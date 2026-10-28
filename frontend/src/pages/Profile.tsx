import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { getStudent, updateStudent } from '../api';
import type { Student, StudentUpdate } from '../api';
import { format, parseISO } from 'date-fns';

const departments = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Data Science & AI',
  'Mathematics & Computing',
  'Physics',
  'Chemistry',
  'Economics',
  'Business Administration',
];

export default function Profile() {
  const { studentId } = useApp();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<StudentUpdate>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!studentId) {
      navigate('/');
      return;
    }
    getStudent(studentId)
      .then(s => {
        setStudent(s);
        setForm({
          full_name: s.full_name,
          email: s.email,
          department: s.department,
          year: s.year,
          semester: s.semester,
          bio: s.bio || '',
          phone: s.phone || '',
          address: s.address || '',
        });
      })
      .catch(() => navigate('/'));
  }, [studentId, navigate]);

  async function handleSave() {
    if (!studentId) return;
    setSaving(true);
    setError('');
    try {
      const updated = await updateStudent(studentId, form);
      setStudent(updated);
      setEditing(false);
      setSaveMsg('Student record updated successfully.');
      setTimeout(() => setSaveMsg(''), 4000);
    } catch {
      setError('Failed to update student profile. Please verify all entries.');
    } finally {
      setSaving(false);
    }
  }

  if (!student) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading student record...
      </div>
    );
  }

  const initials = student.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Academic Record</h1>
          <p className="page-description">
            Official enrollment details, contact data, and degree information.
          </p>
        </div>
        {!editing && (
          <button
            className="btn btn-secondary"
            onClick={() => setEditing(true)}
            id="edit-profile-btn"
          >
            Edit Record
          </button>
        )}
      </div>

      {saveMsg && (
        <div className="alert alert-success" role="status">
          {saveMsg}
        </div>
      )}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Record Identification Header Card */}
      <div className="card" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--primary-subtle)',
            border: '1px solid var(--primary-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1.2rem',
            color: 'var(--primary)',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            {student.full_name}
          </h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Roll Number: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{student.student_id}</span> • {student.department}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enrolled Date</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 500 }}>
            {format(parseISO(student.created_at), 'MMMM yyyy')}
          </div>
        </div>
      </div>

      {/* Profile Details Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Enrollment &amp; Contact Details</h3>
        </div>

        {editing ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="prof-name">
                  Full Name
                </label>
                <input
                  id="prof-name"
                  className="form-input"
                  type="text"
                  value={form.full_name || ''}
                  onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-email">
                  University Email
                </label>
                <input
                  id="prof-email"
                  className="form-input"
                  type="email"
                  value={form.email || ''}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-dept">
                  Department
                </label>
                <select
                  id="prof-dept"
                  className="form-input"
                  value={form.department || ''}
                  onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                >
                  {departments.map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-phone">
                  Phone Number
                </label>
                <input
                  id="prof-phone"
                  className="form-input"
                  type="tel"
                  value={form.phone || ''}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-year">
                  Academic Year
                </label>
                <select
                  id="prof-year"
                  className="form-input"
                  value={form.year || 1}
                  onChange={e => setForm(p => ({ ...p, year: parseInt(e.target.value) }))}
                >
                  {[1, 2, 3, 4, 5, 6].map(y => (
                    <option key={y} value={y}>
                      Year {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-sem">
                  Current Semester
                </label>
                <select
                  id="prof-sem"
                  className="form-input"
                  value={form.semester || 1}
                  onChange={e => setForm(p => ({ ...p, semester: parseInt(e.target.value) }))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(s => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prof-address">
                Residential Location / City
              </label>
              <input
                id="prof-address"
                className="form-input"
                type="text"
                value={form.address || ''}
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prof-bio">
                Academic Interests &amp; Notes
              </label>
              <textarea
                id="prof-bio"
                className="form-input"
                rows={3}
                value={form.bio || ''}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditing(false)}
                id="cancel-edit-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
                id="save-profile-btn"
              >
                {saving ? 'Updating Record...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>
                  Full Legal Name
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>
                  {student.full_name}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>
                  Official Email
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  {student.email}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>
                  Department / Major
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  {student.department}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>
                  Academic Standing
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  Year {student.year}, Semester {student.semester}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>
                  Contact Phone
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  {student.phone || 'Not recorded'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>
                  Current City / Address
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  {student.address || 'Not recorded'}
                </div>
              </div>
            </div>

            {student.bio && (
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Academic Interests &amp; Focus
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {student.bio}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
