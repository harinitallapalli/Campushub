import { useState, useEffect } from 'react';
import { useApp } from '../../context';
import {
  listNotes,
  listCourses,
  createNote,
  updateNote,
  deleteNote,
} from '../../api';
import type { Note, Course } from '../../api';

export default function TeacherNotes() {
  const { teacherId } = useApp();
  const [notes, setNotes] = useState<Note[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    course_id: 0,
    title: '',
    content: '',
    resource_url: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    listCourses()
      .then(res => {
        setCourses(res);
        if (res.length > 0 && formData.course_id === 0) {
          setFormData(prev => ({ ...prev, course_id: res[0].id }));
        }
      })
      .catch(() => {});

    loadNotes();
  }, []);

  function loadNotes() {
    setLoading(true);
    listNotes()
      .then(setNotes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  function handleOpenCreate() {
    setEditingNote(null);
    setFormData({
      course_id: courses.length > 0 ? courses[0].id : 0,
      title: '',
      content: '',
      resource_url: '',
    });
    setShowModal(true);
  }

  function handleOpenEdit(note: Note) {
    setEditingNote(note);
    setFormData({
      course_id: note.course_id,
      title: note.title,
      content: note.content,
      resource_url: note.resource_url || '',
    });
    setShowModal(true);
  }

  async function handleDeleteNote(id: number) {
    if (!confirm('Are you sure you want to delete this lecture note?')) return;
    try {
      await deleteNote(id);
      setNotification('Note deleted successfully.');
      loadNotes();
    } catch {
      alert('Failed to delete note.');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    setSubmitting(true);
    try {
      if (editingNote) {
        await updateNote(editingNote.id, {
          course_id: formData.course_id,
          title: formData.title,
          content: formData.content,
          resource_url: formData.resource_url.trim() || undefined,
        });
        setNotification('Lecture note updated successfully!');
      } else {
        await createNote({
          teacher_id: teacherId || 1,
          course_id: formData.course_id,
          title: formData.title,
          content: formData.content,
          resource_url: formData.resource_url.trim() || undefined,
        });
        setNotification('New lecture note published to Student Portal!');
      }
      setShowModal(false);
      loadNotes();
    } catch {
      alert('Failed to save note. Please check fields.');
    } finally {
      setSubmitting(false);
    }
  }

  const filteredNotes = notes.filter(n => {
    if (selectedCourseFilter !== 'all' && n.course_id !== Number(selectedCourseFilter)) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.course_code.toLowerCase().includes(q)
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
            Author, edit, and publish curriculum notes visible to enrolled students.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn btn-primary"
          style={{ fontSize: '0.85rem', padding: '8px 16px' }}
          id="teacher-create-note-btn"
        >
          + Publish New Note
        </button>
      </div>

      {notification && (
        <div style={{ padding: '10px 14px', backgroundColor: '#dcfce7', border: '1px solid #86efac', color: '#15803d', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem' }}>
          {notification}
        </div>
      )}

      {/* ── Search & Filter ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', backgroundColor: 'var(--bg-surface)', padding: '14px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <input
            type="search"
            placeholder="Search authored notes by title or content..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
          />
        </div>

        <div style={{ minWidth: '180px' }}>
          <select
            value={selectedCourseFilter}
            onChange={e => setSelectedCourseFilter(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-surface)' }}
          >
            <option value="all">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Notes Table / Cards ───────────────────────────────────────────── */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading authored notes from SQLite database...
        </div>
      ) : filteredNotes.length === 0 ? (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No notes published yet. Click &quot;Publish New Note&quot; above to create one.
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
                    Published: {new Date(note.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                  {note.title}
                </h3>
                
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Author: {note.teacher_name} ({note.course_name})
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 14px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {note.content}
                </p>

                {note.resource_url && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '12px', wordBreak: 'break-all' }}>
                    🔗 Attached: <a href={note.resource_url} target="_blank" rel="noopener noreferrer">{note.resource_url}</a>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <button
                  onClick={() => handleOpenEdit(note)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                >
                  Edit Note
                </button>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="btn btn-sm"
                  style={{ fontSize: '0.78rem', padding: '4px 10px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Publish / Edit Modal ─────────────────────────────────────────── */}
      {showModal && (
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
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '100%',
              border: '1px solid var(--border-color)',
              padding: '24px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
                {editingNote ? 'Edit Lecture Note' : 'Publish New Lecture Note'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Subject / Course:
                </label>
                <select
                  value={formData.course_id}
                  onChange={e => setFormData({ ...formData, course_id: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-surface)' }}
                  required
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Note Title:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Normalization Quick Notes (1NF to BCNF)"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Content &amp; Description:
                </label>
                <textarea
                  rows={6}
                  placeholder="Summary of lecture concepts, algorithm walkthrough, or exam tips..."
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontFamily: 'inherit' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Attached External Resource URL (Optional):
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/reference-doc"
                  value={formData.resource_url}
                  onChange={e => setFormData({ ...formData, resource_url: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Saving...' : editingNote ? 'Update Note' : 'Publish Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
