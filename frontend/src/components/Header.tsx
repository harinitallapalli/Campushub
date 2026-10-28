import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserRole } from '../context';

interface HeaderProps {
  pageTitle?: string;
  role?: UserRole;
  userName?: string;
}

export default function Header({ pageTitle, role = 'student', userName }: HeaderProps) {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      if (role === 'teacher') {
        navigate(`/teacher/notes?search=${encodeURIComponent(search.trim())}`);
      } else {
        navigate(`/notes?search=${encodeURIComponent(search.trim())}`);
      }
      setSearch('');
    }
  }

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
          {pageTitle || (role === 'teacher' ? 'Teacher Academic Portal' : 'Student Academic Portal')}
        </h2>
        {userName && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            ({userName})
          </span>
        )}
        <span
          style={{
            fontSize: '0.72rem',
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: role === 'teacher' ? 'rgba(37, 99, 235, 0.08)' : 'rgba(16, 185, 129, 0.08)',
            color: role === 'teacher' ? 'var(--primary)' : '#059669',
            border: `1px solid ${role === 'teacher' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
            fontWeight: 600,
          }}
        >
          {role === 'teacher' ? 'Teacher Mode' : 'Student Mode'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <form className="header-search" onSubmit={handleSearch} role="search">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: '8px' }}
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            id="global-search"
            type="search"
            placeholder={role === 'teacher' ? "Search notes, resources..." : "Search coursework, notes..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Global search"
          />
        </form>

        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
          Term: Fall 2026
        </span>
      </div>
    </header>
  );
}
