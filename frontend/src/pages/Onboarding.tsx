import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStudent, listStudents } from '../api';
import type { StudentCreate, Student } from '../api';
import { useApp } from '../context';

const steps = ['1. Personal Info', '2. Academic Details', '3. Contact & Bio'];

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

export default function Onboarding() {
  const navigate = useNavigate();
  const { setStudentId } = useApp();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingStudents, setExistingStudents] = useState<Student[]>([]);
  const [selectedExistingId, setSelectedExistingId] = useState<string>('');

  const [form, setForm] = useState<StudentCreate>({
    full_name: '',
    email: '',
    student_id: '',
    department: '',
    year: 1,
    semester: 1,
    bio: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    listStudents()
      .then(res => {
        if (Array.isArray(res) && res.length > 0) {
          setExistingStudents(res);
          setSelectedExistingId(String(res[0].id));
        }
      })
      .catch(() => {});
  }, []);

  function update(key: keyof StudentCreate, value: string | number) {
    setForm(prev => ({ ...prev, [key]: value }));
    setError('');
  }

  function validateStep(s: number): string {
    if (s === 0) {
      if (!form.full_name.trim()) return 'Full Name is required.';
      if (!form.email.trim() || !form.email.includes('@')) return 'A valid university or personal email is required.';
      if (!form.student_id.trim()) return 'Student ID / Roll Number is required.';
    }
    if (s === 1) {
      if (!form.department) return 'Please select your department.';
      if (form.year < 1 || form.year > 6) return 'Year must be between 1 and 6.';
      if (form.semester < 1 || form.semester > 12) return 'Semester must be between 1 and 12.';
    }
    return '';
  }

  function handleNext() {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setStep(prev => prev + 1);
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      const student = await createStudent(form);
      setStudentId(student.id);
      navigate('/dashboard');
    } catch (e: unknown) {
      const err = e as {
        response?: {
          data?: {
            detail?: string | Array<{ msg?: string; loc?: string[] }>;
          };
        };
        message?: string;
      };

      const detail = err?.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail) && detail.length > 0 && detail[0].msg) {
        setError(detail[0].msg);
      } else if (err?.message && err.message.includes('Network Error')) {
        setError('Cannot connect to API backend server (port 8000). Please ensure FastAPI is running.');
      } else {
        setError('Failed to create profile. Please check that email and student ID are not already used.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSignInExisting() {
    if (selectedExistingId) {
      setStudentId(Number(selectedExistingId));
      navigate('/dashboard');
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-page)', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '580px' }}>
        
        {/* Academic portal branding header */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
            CampusHub Student Registration
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Complete your student profile to access assignments, department announcements, and campus resources.
          </p>
        </div>

        {/* Existing account quick selector */}
        {existingStudents.length > 0 && (
          <div className="card" style={{ marginBottom: '20px', padding: '14px 18px', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Already registered in database? Sign in directly:
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                className="form-input"
                style={{ flex: 1, padding: '6px 10px', fontSize: '0.82rem' }}
                value={selectedExistingId}
                onChange={e => setSelectedExistingId(e.target.value)}
                id="existing-student-select"
              >
                {existingStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.student_id}) — {s.department}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleSignInExisting}
                id="sign-in-existing-btn"
              >
                Open Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Multi-step progress bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
          {steps.map((label, idx) => (
            <div
              key={label}
              style={{
                flex: 1,
                padding: '10px 4px',
                textAlign: 'center',
                fontSize: '0.8rem',
                fontWeight: idx === step ? 600 : 400,
                color: idx === step ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: idx === step ? '2px solid var(--primary)' : '2px solid transparent',
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Registration form card */}
        <div className="card">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {step === 0 && (
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-main)' }}>
                Step 1: Personal Identification
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="full_name">
                  Full Name <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="full_name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alex Johnson"
                  value={form.full_name}
                  onChange={e => update('full_name', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  University / Contact Email <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="e.g. student@university.edu"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                />
                <div className="form-hint">Used for assignment notifications and course alerts.</div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="student_id">
                  Student ID / Roll Number <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="student_id"
                  type="text"
                  className="form-input"
                  placeholder="e.g. CS-2024-102"
                  value={form.student_id}
                  onChange={e => update('student_id', e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-main)' }}>
                Step 2: Department &amp; Academic Status
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="department">
                  Department / Major <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  id="department"
                  className="form-input"
                  value={form.department}
                  onChange={e => update('department', e.target.value)}
                >
                  <option value="">-- Select Academic Department --</option>
                  {departments.map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="year">
                    Academic Year <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <select
                    id="year"
                    className="form-input"
                    value={form.year}
                    onChange={e => update('year', Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6].map(y => (
                      <option key={y} value={y}>
                        Year {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="semester">
                    Current Semester <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <select
                    id="semester"
                    className="form-input"
                    value={form.semester}
                    onChange={e => update('semester', Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(s => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-main)' }}>
                Step 3: Contact &amp; Background
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  Phone Number <span style={{ color: 'var(--text-muted)' }}>(Optional)</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 9022186759"
                  value={form.phone || ''}
                  onChange={e => update('phone', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="address">
                  Location / City <span style={{ color: 'var(--text-muted)' }}>(Optional)</span>
                </label>
                <input
                  id="address"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Hyderabad, India"
                  value={form.address || ''}
                  onChange={e => update('address', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="bio">
                  Academic Focus &amp; Interests <span style={{ color: 'var(--text-muted)' }}>(Optional)</span>
                </label>
                <textarea
                  id="bio"
                  rows={3}
                  className="form-input"
                  placeholder="e.g. Second year B.Tech student focusing on computer systems and distributed algorithms."
                  value={form.bio || ''}
                  onChange={e => update('bio', e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            {step > 0 ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep(prev => prev - 1)}
                id="back-btn"
              >
                Previous Step
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/')}
                id="cancel-btn"
              >
                Back to Home
              </button>
            )}

            {step < steps.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNext}
                id="next-btn"
              >
                Next Step
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
                id="submit-profile-btn"
              >
                {loading ? 'Creating Record...' : 'Complete Registration'}
              </button>
            )}
          </div>
        </div>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          By creating a profile, your information is stored locally in the student portal database.
        </div>
      </div>
    </div>
  );
}
