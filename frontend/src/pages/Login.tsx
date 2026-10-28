import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authLogin } from '../api';
import { useApp } from '../context';

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await authLogin(email.trim().toLowerCase(), password);
      setAuth(result.token, result.user);
      navigate(result.role === 'teacher' ? '/teacher/dashboard' : '/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      const detail = e?.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (e?.message?.includes('Network Error')) {
        setError('Cannot reach CampusHub server. Make sure the backend is running on port 8000.');
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(email: string, password: string) {
    setEmail(email);
    setPassword(password);
    setError('');
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
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo + Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '48px', height: '48px',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.3rem',
            margin: '0 auto 12px',
          }}>
            CH
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Sign in to your CampusHub account
          </p>
        </div>

        {/* Login Card */}
        <div className="card" style={{ padding: '28px' }}>
          {error && (
            <div className="alert alert-danger" role="alert" style={{ marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="your@email.edu"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="form-group" style={{ marginTop: '12px' }}>
              <label className="form-label" htmlFor="login-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  autoComplete="current-password"
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    padding: '2px', display: 'flex', alignItems: 'center',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '11px', marginTop: '20px', fontSize: '0.95rem' }}
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
            New student?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
              Create an account
            </Link>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="card" style={{ marginTop: '16px', padding: '16px 18px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Demo Accounts (password: campus123)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { label: '🎓 Student — Alex Johnson', email: 'alex.johnson@university.edu' },
              { label: '🎓 Student — Ananya Reddy', email: 'ananya.reddy@university.edu' },
              { label: '📋 Teacher — Dr. K. Sharma', email: 'sharma@university.edu' },
              { label: '📋 Teacher — Prof. Priya Nair', email: 'priya.nair@university.edu' },
            ].map(acc => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemo(acc.email, 'campus123')}
                style={{
                  background: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '5px',
                  padding: '7px 10px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-color)')}
              >
                {acc.label}
                <span style={{ float: 'right', color: 'var(--text-muted)', fontSize: '0.73rem' }}>{acc.email}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
