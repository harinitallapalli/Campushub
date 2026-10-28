import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authRegisterStudent } from '../api';
import { useApp } from '../context';

const departments = [
  'Computer Science', 'Information Technology', 'Electronics & Communication',
  'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
  'Data Science & AI', 'Mathematics & Computing', 'Physics', 'Chemistry',
  'Economics', 'Business Administration',
];

const steps = ['Personal Info', 'Academic Details', 'Contact & Security'];

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useApp();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    student_id: '',
    department: '',
    year: 1,
    semester: 1,
    bio: '',
    phone: '',
    address: '',
  });

  function update(key: string, value: string | number) {
    setForm(prev => ({ ...prev, [key]: value }));
    setError('');
  }

  function validateStep(s: number): string {
    if (s === 0) {
      if (!form.full_name.trim()) return 'Full Name is required.';
      if (!form.email.trim() || !form.email.includes('@')) return 'A valid email is required.';
      if (!form.student_id.trim()) return 'Student ID / Roll Number is required.';
    }
    if (s === 1) {
      if (!form.department) return 'Please select your department.';
      if (form.year < 1 || form.year > 6) return 'Year must be between 1 and 6.';
      if (form.semester < 1 || form.semester > 12) return 'Semester must be between 1 and 12.';
    }
    if (s === 2) {
      if (!form.password) return 'Password is required.';
      if (form.password.length < 6) return 'Password must be at least 6 characters.';
      if (form.password !== form.confirm_password) return 'Passwords do not match.';
    }
    return '';
  }

  function handleNext() {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setStep(p => p + 1);
  }

  async function handleSubmit() {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setLoading(true);
    setError('');
    try {
      const result = await authRegisterStudent({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        student_id: form.student_id,
        department: form.department,
        year: form.year,
        semester: form.semester,
        bio: form.bio || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
      });
      setAuth(result.token, result.user);
      navigate('/dashboard');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string | Array<{ msg?: string }> } }; message?: string };
      const detail = err?.response?.data?.detail;
      if (typeof detail === 'string') setError(detail);
      else if (Array.isArray(detail) && detail[0]?.msg) setError(detail[0].msg);
      else if (err?.message?.includes('Network Error')) setError('Cannot connect to backend server.');
      else setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-page)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '44px', height: '44px',
            backgroundColor: 'var(--primary)',
            color: '#fff', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '1.2rem', margin: '0 auto 12px',
          }}>
            CH
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
            Create Student Account
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Join CampusHub to track your courses, attendance, and events.
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
          {steps.map((label, idx) => (
            <div
              key={label}
              style={{
                flex: 1, padding: '8px 4px', textAlign: 'center', fontSize: '0.78rem',
                fontWeight: idx === step ? 600 : 400,
                color: idx < step ? 'var(--success)' : idx === step ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: idx === step ? '2px solid var(--primary)' : idx < step ? '2px solid var(--success)' : '2px solid transparent',
              }}
            >
              {idx < step ? '✓ ' : ''}{label}
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '24px' }}>
          {error && (
            <div className="alert alert-danger" role="alert" style={{ marginBottom: '14px' }}>
              {error}
            </div>
          )}

          {step === 0 && (
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '14px', color: 'var(--text-main)' }}>
                Step 1: Personal Identification
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input id="reg-name" type="text" className="form-input" placeholder="e.g. Alex Johnson" value={form.full_name} onChange={e => update('full_name', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label" htmlFor="reg-email">Email Address <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input id="reg-email" type="email" className="form-input" placeholder="student@university.edu" value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label" htmlFor="reg-sid">Student ID / Roll Number <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input id="reg-sid" type="text" className="form-input" placeholder="e.g. CS-2024-102" value={form.student_id} onChange={e => update('student_id', e.target.value)} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '14px', color: 'var(--text-main)' }}>
                Step 2: Department &amp; Academic Status
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-dept">Department <span style={{ color: 'var(--danger)' }}>*</span></label>
                <select id="reg-dept" className="form-input" value={form.department} onChange={e => update('department', e.target.value)}>
                  <option value="">-- Select Department --</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-year">Year <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select id="reg-year" className="form-input" value={form.year} onChange={e => update('year', Number(e.target.value))}>
                    {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-sem">Semester <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select id="reg-sem" className="form-input" value={form.semester} onChange={e => update('semester', Number(e.target.value))}>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(s => <option key={s} value={s}>Sem {s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '14px', color: 'var(--text-main)' }}>
                Step 3: Contact &amp; Account Security
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-pwd">Password <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input id="reg-pwd" type="password" className="form-input" placeholder="At least 6 characters" value={form.password} onChange={e => update('password', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginTop: '10px' }}>
                <label className="form-label" htmlFor="reg-confirm-pwd">Confirm Password <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input id="reg-confirm-pwd" type="password" className="form-input" placeholder="Repeat your password" value={form.confirm_password} onChange={e => update('confirm_password', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginTop: '10px' }}>
                <label className="form-label" htmlFor="reg-phone">Phone <span style={{ color: 'var(--text-muted)' }}>(Optional)</span></label>
                <input id="reg-phone" type="tel" className="form-input" placeholder="e.g. 9022186759" value={form.phone} onChange={e => update('phone', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginTop: '10px' }}>
                <label className="form-label" htmlFor="reg-address">City / Address <span style={{ color: 'var(--text-muted)' }}>(Optional)</span></label>
                <input id="reg-address" type="text" className="form-input" placeholder="e.g. Hyderabad, India" value={form.address} onChange={e => update('address', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginTop: '10px' }}>
                <label className="form-label" htmlFor="reg-bio">Bio <span style={{ color: 'var(--text-muted)' }}>(Optional)</span></label>
                <textarea id="reg-bio" rows={2} className="form-input" placeholder="Short intro about yourself…" value={form.bio} onChange={e => update('bio', e.target.value)} style={{ resize: 'vertical' }} />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
            {step > 0 ? (
              <button type="button" className="btn btn-secondary" onClick={() => setStep(p => p - 1)} id="reg-back-btn">
                ← Back
              </button>
            ) : (
              <Link to="/login" style={{ alignSelf: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                Already have an account?
              </Link>
            )}

            {step < steps.length - 1 ? (
              <button type="button" className="btn btn-primary" onClick={handleNext} id="reg-next-btn">
                Next →
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading} id="reg-submit-btn">
                {loading ? 'Creating Account…' : 'Create Account'}
              </button>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Teachers are added by administrators. <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Go to login</Link>
        </div>
      </div>
    </div>
  );
}
