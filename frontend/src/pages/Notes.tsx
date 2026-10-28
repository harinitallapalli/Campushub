import { useState, useEffect } from 'react';
import { listNotes, listCourses } from '../api';
import type { Note, Course } from '../api';

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  useEffect(() => {
    listCourses()
      .then(setCourses)
      .catch(() => {});

    fetchNotes();
  }, []);

  function fetchNotes() {
    setLoading(true);
    listNotes()
      .then(setNotes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  const filteredNotes = notes.filter(n => {
    if (selectedCourseId !== 'all' && n.course_id !== Number(selectedCourseId)) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.course_name.toLowerCase().includes(q) ||
        n.course_code.toLowerCase().includes(q) ||
        n.teacher_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '8px 0' }}>
      
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
            Faculty Lecture &amp; Revision Notes
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Read official study notes, algorithms walkthroughs, and course references shared by teachers.
          </p>
        </div>
        <div style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
          Shared by Faculty
        </div>
      </div>

      {/* ── Filter Bar ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', backgroundColor: 'var(--bg-surface)', padding: '14px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <input
            type="search"
            placeholder="Search notes by title, topic, or keyword..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
          />
        </div>

        <div style={{ minWidth: '180px' }}>
          <select
            value={selectedCourseId}
            onChange={e => setSelectedCourseId(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-surface)' }}
          >
            <option value="all">All Subjects / Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Notes List ───────────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading teacher notes from database...
        </div>
      ) : filteredNotes.length === 0 ? (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No notes found matching your criteria.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredNotes.map(note => (
            <div
              key={note.id}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '3px',
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                      color: 'var(--primary)',
                      border: '1px solid rgba(37, 99, 235, 0.2)',
                    }}
                  >
                    {note.course_code}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {note.created_at ? new Date(note.created_at).toLocaleDateString() : ''}
                  </span>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 6px 0', lineHeight: 1.35 }}>
                  {note.title}
                </h3>
                
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Faculty: {note.teacher_name} • {note.course_name}
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {note.content}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <button
                  onClick={() => setActiveNote(note)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                >
                  Read Note Details
                </button>

                {note.resource_url && (
                  <a
                    href={note.resource_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm"
                    style={{ fontSize: '0.78rem', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    Open Link &rarr;
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Note Detail Modal ────────────────────────────────────────────── */}
      {activeNote && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setActiveNote(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '8px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              border: '1px solid var(--border-color)',
              padding: '28px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', backgroundColor: 'rgba(37, 99, 235, 0.08)', padding: '2px 8px', borderRadius: '4px' }}>
                {activeNote.course_code} — {activeNote.course_name}
              </span>
              <button
                onClick={() => setActiveNote(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                &times;
              </button>
            </div>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 8px 0' }}>
              {activeNote.title}
            </h2>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              Instructor: <strong>{activeNote.teacher_name}</strong> • Published: {new Date(activeNote.created_at).toLocaleDateString()}
            </div>

            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: '24px' }}>
              {activeNote.content}
            </div>

            {activeNote.resource_url && (
              <div style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px 16px', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Attached External Reference:
                </div>
                <a
                  href={activeNote.resource_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.85rem', color: 'var(--primary)', wordBreak: 'break-all' }}
                >
                  {activeNote.resource_url}
                </a>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setActiveNote(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
