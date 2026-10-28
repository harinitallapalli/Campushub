import { useState, useEffect, useCallback } from 'react';
import {
  listFacultyResources,
  createFacultyResource,
  updateFacultyResource,
  deleteFacultyResource,
  listCourses,
} from '../../api';
import type { FacultyResource, FacultyResourceCreate, ResourceType, Course } from '../../api';
import { useApp } from '../../context';
import { format, parseISO } from 'date-fns';

export default function TeacherResources() {
  const { user } = useApp();
  const [resources, setResources] = useState<FacultyResource[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState<FacultyResource | null>(null);

  const [form, setForm] = useState<FacultyResourceCreate>({
    title: '',
    course_id: undefined,
    resource_type: 'link',
    description: '',
    url: '',
  });

  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState<number | ''>('');
  const [typeFilter, setTypeFilter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const loadResources = useCallback(() => {
    setLoading(true);
    listFacultyResources({
      course_id: courseFilter !== '' ? Number(courseFilter) : undefined,
      resource_type: typeFilter || undefined,
      search: search || undefined,
    })
      .then(setResources)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseFilter, typeFilter, search]);

  useEffect(() => {
    listCourses().then(setCourses).catch(() => {});
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  function handleOpenCreate() {
    setEditingResource(null);
    setForm({
      title: '',
      course_id: courses.length > 0 ? courses[0].id : undefined,
      resource_type: 'link',
      description: '',
      url: '',
    });
    setShowModal(true);
  }

  function handleOpenEdit(r: FacultyResource) {
    setEditingResource(r);
    setForm({
      title: r.title,
      course_id: r.course_id,
      resource_type: r.resource_type,
      description: r.description || '',
      url: r.url || '',
    });
    setShowModal(true);
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this faculty resource?')) return;
    try {
      await deleteFacultyResource(id);
      setNotification('Faculty resource removed successfully.');
      loadResources();
      setTimeout(() => setNotification(null), 3000);
    } catch {
      alert('Failed to delete resource. Ensure you own this published resource.');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;

    setSubmitting(true);
    try {
      if (editingResource) {
        await updateFacultyResource(editingResource.id, form);
        setNotification('Faculty resource updated successfully!');
      } else {
        await createFacultyResource(form);
        setNotification('New academic resource published for students!');
      }
      setShowModal(false);
      loadResources();
      setTimeout(() => setNotification(null), 3000);
    } catch {
      alert('Failed to save resource.');
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = resources.filter(r => {
    if (search) {
      const q = search.toLowerCase();
      const match =
        r.title.toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (r.course_code || '').toLowerCase().includes(q) ||
        (r.course_name || '').toLowerCase().includes(q) ||
        (r.teacher_name || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    if (courseFilter !== '' && r.course_id !== Number(courseFilter)) return false;
    if (typeFilter && r.resource_type !== typeFilter) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '8px 0' }}>
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
            Faculty Shared Resources
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Publish official academic materials, lecture documentation, and external references for students.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn btn-primary"
          style={{ fontSize: '0.85rem', padding: '8px 16px' }}
          id="teacher-add-resource-btn"
        >
          + Add Resource
        </button>
      </div>

      {notification && (
        <div style={{ padding: '10px 14px', backgroundColor: '#dcfce7', border: '1px solid #86efac', color: '#15803d', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem' }}>
          {notification}
        </div>
      )}

      {/* ── Filter Bar ───────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="form-input"
            type="search"
            placeholder="Search faculty resources..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '240px', padding: '6px 10px' }}
            id="teacher-resource-search"
          />

          <select
            className="form-input"
            value={courseFilter}
            onChange={e => setCourseFilter(e.target.value ? Number(e.target.value) : '')}
            style={{ width: '220px', padding: '6px 10px' }}
            id="teacher-course-filter"
          >
            <option value="">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
            ))}
          </select>

          <select
            className="form-input"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            style={{ width: '170px', padding: '6px 10px' }}
            id="teacher-type-filter"
          >
            <option value="">All Types</option>
            <option value="link">Web References</option>
            <option value="document">Documentation / Books</option>
            <option value="note">Lecture Notes</option>
            <option value="file">Files / PDFs</option>
            <option value="video">Tutorial Videos</option>
            <option value="other">Other Material</option>
          </select>

          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {filtered.length} faculty resource{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Resources List ───────────────────────────────────────────────── */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
            Faculty Shared Resources ({filtered.length})
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Visible to enrolled students
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading faculty resources...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No faculty resources found. Click "+ Add Resource" to publish academic materials.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-page)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Resource Title</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Course</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Type</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Published By</th>
                <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const isOwner = user?.profile_id === r.teacher_id;
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{r.title}</div>
                      {r.description && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {r.description}
                        </div>
                      )}
                      {r.url && (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '4px' }}
                        >
                          Open Link &rarr;
                        </a>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {r.course_code ? (
                        <div>
                          <strong style={{ color: 'var(--text-main)' }}>{r.course_code}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.course_name}</div>
                        </div>
                      ) : (
                        'General'
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                        }}
                      >
                        {r.resource_type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      <div>{r.teacher_name || 'Faculty Member'}</div>
                      {r.created_at && (
                        <div style={{ fontSize: '0.72rem' }}>{format(parseISO(r.created_at), 'MMM d, yyyy')}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {isOwner ? (
                          <>
                            <button
                              onClick={() => handleOpenEdit(r)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(r.id)}
                              className="btn btn-sm"
                              style={{
                                fontSize: '0.75rem',
                                padding: '3px 8px',
                                backgroundColor: '#fee2e2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                              }}
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Read-Only
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal ────────────────────────────────────────────────────────── */}
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
            className="card"
            style={{ width: '100%', maxWidth: '520px', backgroundColor: 'var(--bg-surface)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="card-header">
              <h2 className="card-title">
                {editingResource ? 'Edit Faculty Resource' : 'Publish Academic Resource'}
              </h2>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="f-title">
                  Resource Title <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="f-title"
                  className="form-input"
                  type="text"
                  placeholder="e.g. Operating Systems — Process Scheduling Reference"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="f-course">
                    Course Association
                  </label>
                  <select
                    id="f-course"
                    className="form-input"
                    value={form.course_id || ''}
                    onChange={e => setForm(f => ({ ...f, course_id: e.target.value ? Number(e.target.value) : undefined }))}
                  >
                    <option value="">General (All Courses)</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="f-type">
                    Format / Resource Type
                  </label>
                  <select
                    id="f-type"
                    className="form-input"
                    value={form.resource_type}
                    onChange={e => setForm(f => ({ ...f, resource_type: e.target.value as ResourceType }))}
                  >
                    <option value="link">Web Link / Reference</option>
                    <option value="document">Documentation / Book</option>
                    <option value="note">Lecture Notes</option>
                    <option value="file">Document / PDF</option>
                    <option value="video">Tutorial / Video</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="f-url">
                  Resource URL
                </label>
                <input
                  id="f-url"
                  className="form-input"
                  type="url"
                  placeholder="https://..."
                  value={form.url || ''}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="f-desc">
                  Description / Study Objective
                </label>
                <textarea
                  id="f-desc"
                  className="form-input"
                  rows={3}
                  placeholder="Explain how students should utilize this academic resource..."
                  value={form.description || ''}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  id="teacher-save-resource-btn"
                >
                  {submitting ? 'Saving...' : editingResource ? 'Update Resource' : 'Publish Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
