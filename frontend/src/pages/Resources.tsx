import { useEffect, useState, useCallback } from 'react';
import {
  listMyPersonalResources,
  createMyPersonalResource,
  updateMyPersonalResource,
  deleteMyPersonalResource,
  listFacultyResources,
  listCourses,
} from '../api';
import type {
  PersonalResource,
  PersonalResourceCreate,
  FacultyResource,
  ResourceType,
  Course,
} from '../api';
import { format, parseISO } from 'date-fns';

function PersonalResourceModal({
  resource,
  onClose,
  onSave,
}: {
  resource?: PersonalResource;
  onClose: () => void;
  onSave: (data: PersonalResourceCreate, id?: number) => void;
}) {
  const [form, setForm] = useState<PersonalResourceCreate>({
    title: resource?.title || '',
    subject: resource?.subject || '',
    resource_type: resource?.resource_type || 'link',
    description: resource?.description || '',
    url: resource?.url || '',
  });

  function update<K extends keyof PersonalResourceCreate>(key: K, val: PersonalResourceCreate[K]) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: '100%', maxWidth: '520px', backgroundColor: 'var(--bg-surface)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="card-header">
          <h2 className="card-title">
            {resource ? 'Edit Study Resource' : 'Add Personal Study Resource'}
          </h2>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <form onSubmit={e => { e.preventDefault(); onSave(form, resource?.id); }}>
          <div className="form-group">
            <label className="form-label" htmlFor="res-title">
              Resource Title <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="res-title"
              className="form-input"
              type="text"
              placeholder="e.g. My Python Practice or Dijkstra Algorithm Notes"
              value={form.title}
              onChange={e => update('title', e.target.value)}
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="res-type">
                Format / Type
              </label>
              <select
                id="res-type"
                className="form-input"
                value={form.resource_type}
                onChange={e => update('resource_type', e.target.value as ResourceType)}
              >
                <option value="link">Web Link / Repository</option>
                <option value="note">Personal Note / Summary</option>
                <option value="file">Document / PDF</option>
                <option value="video">Tutorial / Video</option>
                <option value="other">Other Material</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="res-subject">
                Subject / Topic
              </label>
              <input
                id="res-subject"
                className="form-input"
                type="text"
                placeholder="e.g. Python / CS301"
                value={form.subject || ''}
                onChange={e => update('subject', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="res-url">
              Resource URL / Website Link
            </label>
            <input
              id="res-url"
              className="form-input"
              type="url"
              placeholder="https://leetcode.com, https://youtube.com/..."
              value={form.url || ''}
              onChange={e => update('url', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="res-desc">
              Short Description / Notes
            </label>
            <textarea
              id="res-desc"
              className="form-input"
              rows={3}
              placeholder="Add key notes, chapters to review, or reason for saving..."
              value={form.description || ''}
              onChange={e => update('description', e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} id="cancel-resource-btn">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="save-resource-btn">
              {resource ? 'Update Resource' : 'Save Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Resources() {
  const [activeTab, setActiveTab] = useState<'personal' | 'faculty'>('personal');

  // Personal Resources State
  const [personalResources, setPersonalResources] = useState<PersonalResource[]>([]);
  const [personalLoading, setPersonalLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPersonalResource, setEditPersonalResource] = useState<PersonalResource | undefined>();
  const [personalSearch, setPersonalSearch] = useState('');
  const [personalSubjectFilter, setPersonalSubjectFilter] = useState('');
  const [personalTypeFilter, setPersonalTypeFilter] = useState('');

  // Faculty Resources State
  const [facultyResources, setFacultyResources] = useState<FacultyResource[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [facultyLoading, setFacultyLoading] = useState(true);
  const [facultySearch, setFacultySearch] = useState('');
  const [facultyCourseFilter, setFacultyCourseFilter] = useState<number | ''>('');
  const [facultyTypeFilter, setFacultyTypeFilter] = useState('');

  // Fetch Personal Resources
  const fetchPersonalResources = useCallback(() => {
    setPersonalLoading(true);
    listMyPersonalResources({
      resource_type: personalTypeFilter || undefined,
      subject: personalSubjectFilter || undefined,
      search: personalSearch || undefined,
    })
      .then(setPersonalResources)
      .catch(() => {})
      .finally(() => setPersonalLoading(false));
  }, [personalTypeFilter, personalSubjectFilter, personalSearch]);

  // Fetch Faculty Resources
  const fetchFacultyResources = useCallback(() => {
    setFacultyLoading(true);
    listFacultyResources({
      resource_type: facultyTypeFilter || undefined,
      course_id: facultyCourseFilter !== '' ? Number(facultyCourseFilter) : undefined,
      search: facultySearch || undefined,
    })
      .then(setFacultyResources)
      .catch(() => {})
      .finally(() => setFacultyLoading(false));
  }, [facultyTypeFilter, facultyCourseFilter, facultySearch]);

  useEffect(() => {
    fetchPersonalResources();
  }, [fetchPersonalResources]);

  useEffect(() => {
    fetchFacultyResources();
    listCourses().then(setCourses).catch(() => {});
  }, [fetchFacultyResources]);

  // Personal Resource Handlers
  async function handleSavePersonal(data: PersonalResourceCreate, id?: number) {
    if (id) {
      await updateMyPersonalResource(id, data);
    } else {
      await createMyPersonalResource(data);
    }
    setShowModal(false);
    setEditPersonalResource(undefined);
    fetchPersonalResources();
  }

  async function handleDeletePersonal(id: number) {
    if (!confirm('Are you sure you want to delete this study resource?')) return;
    try {
      await deleteMyPersonalResource(id);
      fetchPersonalResources();
    } catch {
      alert('Could not delete resource.');
    }
  }

  // Filtered Personal Resources
  const filteredPersonal = personalResources.filter(r => {
    if (personalSearch) {
      const q = personalSearch.toLowerCase();
      const match =
        r.title.toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (r.subject || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    if (personalSubjectFilter && !(r.subject || '').toLowerCase().includes(personalSubjectFilter.toLowerCase())) {
      return false;
    }
    if (personalTypeFilter && r.resource_type !== personalTypeFilter) {
      return false;
    }
    return true;
  });

  // Filtered Faculty Resources
  const filteredFaculty = facultyResources.filter(r => {
    if (facultySearch) {
      const q = facultySearch.toLowerCase();
      const match =
        r.title.toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (r.course_code || '').toLowerCase().includes(q) ||
        (r.course_name || '').toLowerCase().includes(q) ||
        (r.teacher_name || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    if (facultyCourseFilter !== '' && r.course_id !== Number(facultyCourseFilter)) {
      return false;
    }
    if (facultyTypeFilter && r.resource_type !== facultyTypeFilter) {
      return false;
    }
    return true;
  });

  const uniquePersonalSubjects = Array.from(
    new Set(personalResources.map(r => r.subject).filter(Boolean))
  ) as string[];

  return (
    <div>
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="page-header" style={{ marginBottom: '18px' }}>
        <div>
          <h1 className="page-title">Academic &amp; Study Resources</h1>
          <p className="page-description">
            Access faculty-published learning materials and manage your private study vault.
          </p>
        </div>
        {activeTab === 'personal' && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditPersonalResource(undefined);
              setShowModal(true);
            }}
            id="add-personal-resource-btn"
          >
            + Add Resource
          </button>
        )}
      </div>

      {/* ── Navigation Tabs ──────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '20px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          id="tab-my-resources"
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'personal' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'personal' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'personal' ? 600 : 500,
            fontSize: '0.95rem',
            padding: '10px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          My Study Resources
          <span
            style={{
              fontSize: '0.75rem',
              backgroundColor: activeTab === 'personal' ? 'var(--primary-subtle)' : 'var(--bg-page)',
              color: activeTab === 'personal' ? 'var(--primary)' : 'var(--text-muted)',
              padding: '1px 7px',
              borderRadius: '10px',
            }}
          >
            {personalResources.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('faculty')}
          id="tab-faculty-resources"
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'faculty' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'faculty' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'faculty' ? 600 : 500,
            fontSize: '0.95rem',
            padding: '10px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          Faculty Resources
          <span
            style={{
              fontSize: '0.75rem',
              backgroundColor: activeTab === 'faculty' ? 'var(--primary-subtle)' : 'var(--bg-page)',
              color: activeTab === 'faculty' ? 'var(--primary)' : 'var(--text-muted)',
              padding: '1px 7px',
              borderRadius: '10px',
            }}
          >
            {facultyResources.length}
          </span>
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 1: MY STUDY RESOURCES (Student Personal) ────────────────────── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'personal' && (
        <div>
          <div style={{ marginBottom: '14px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Save useful links and study material for yourself.
          </div>

          {/* Filter Bar */}
          <div className="card" style={{ padding: '12px 16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                className="form-input"
                type="search"
                placeholder="Search personal resources..."
                value={personalSearch}
                onChange={e => setPersonalSearch(e.target.value)}
                style={{ width: '240px', padding: '6px 10px' }}
                id="personal-search"
              />

              <select
                className="form-input"
                value={personalSubjectFilter}
                onChange={e => setPersonalSubjectFilter(e.target.value)}
                style={{ width: '180px', padding: '6px 10px' }}
                id="personal-subject-filter"
              >
                <option value="">All Subjects</option>
                {uniquePersonalSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>

              <select
                className="form-input"
                value={personalTypeFilter}
                onChange={e => setPersonalTypeFilter(e.target.value)}
                style={{ width: '170px', padding: '6px 10px' }}
                id="personal-type-filter"
              >
                <option value="">All Types</option>
                <option value="link">Web Links</option>
                <option value="note">Study Notes</option>
                <option value="file">Documents / PDFs</option>
                <option value="video">Tutorial Videos</option>
                <option value="other">Other Material</option>
              </select>

              <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                {filteredPersonal.length} saved item{filteredPersonal.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {personalLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading your study resources...
            </div>
          ) : filteredPersonal.length === 0 ? (
            <div className="card" style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>📚</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                No personal study resources found
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 16px' }}>
                Save articles, coding practice links, YouTube tutorials, and notes for your personal studies.
              </p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setEditPersonalResource(undefined);
                  setShowModal(true);
                }}
              >
                + Add First Resource
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {filteredPersonal.map(res => (
                <div key={res.id} className="card" style={{ padding: '18px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--primary-subtle)',
                        color: 'var(--primary)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {res.resource_type}
                    </span>
                    {res.subject && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {res.subject}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                    {res.title}
                  </h3>

                  {res.description && (
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '14px', flex: 1 }}>
                      {res.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                    {res.url ? (
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}
                      >
                        Open
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Saved Note
                      </span>
                    )}

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => {
                          setEditPersonalResource(res);
                          setShowModal(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        title="Edit resource"
                        style={{ padding: '3px 8px', fontSize: '0.78rem' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePersonal(res.id)}
                        className="btn btn-secondary btn-sm"
                        title="Delete resource"
                        style={{ padding: '3px 8px', fontSize: '0.78rem', color: 'var(--danger)' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 2: FACULTY RESOURCES (Teacher Published / Read-Only for Student) */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'faculty' && (
        <div>
          <div style={{ marginBottom: '14px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Official course materials, documentation, and reference links published by faculty.
          </div>

          {/* Filter Bar */}
          <div className="card" style={{ padding: '12px 16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                className="form-input"
                type="search"
                placeholder="Search faculty resources..."
                value={facultySearch}
                onChange={e => setFacultySearch(e.target.value)}
                style={{ width: '240px', padding: '6px 10px' }}
                id="faculty-search"
              />

              <select
                className="form-input"
                value={facultyCourseFilter}
                onChange={e => setFacultyCourseFilter(e.target.value ? Number(e.target.value) : '')}
                style={{ width: '220px', padding: '6px 10px' }}
                id="faculty-course-filter"
              >
                <option value="">All Courses</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                ))}
              </select>

              <select
                className="form-input"
                value={facultyTypeFilter}
                onChange={e => setFacultyTypeFilter(e.target.value)}
                style={{ width: '170px', padding: '6px 10px' }}
                id="faculty-type-filter"
              >
                <option value="">All Material Types</option>
                <option value="link">Web References</option>
                <option value="document">Documentation / Books</option>
                <option value="note">Lecture Notes</option>
                <option value="file">Files / PDFs</option>
                <option value="video">Lectures / Videos</option>
              </select>

              <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                {filteredFaculty.length} published resource{filteredFaculty.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {facultyLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading faculty resources...
            </div>
          ) : filteredFaculty.length === 0 ? (
            <div className="card" style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>📋</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                No faculty resources found
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
                Course materials published by your instructors will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '16px' }}>
              {filteredFaculty.map(res => (
                <div key={res.id} className="card" style={{ padding: '18px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(37, 99, 235, 0.08)',
                        color: 'var(--primary)',
                        fontWeight: 600,
                        border: '1px solid rgba(37, 99, 235, 0.15)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {res.resource_type}
                    </span>
                    {res.course_code && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {res.course_code}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {res.title}
                  </h3>

                  {res.course_name && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {res.course_name}
                    </div>
                  )}

                  {res.description && (
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '14px', flex: 1 }}>
                      {res.description}
                    </p>
                  )}

                  <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Shared by: <strong style={{ color: 'var(--text-main)' }}>{res.teacher_name || 'Faculty Member'}</strong></span>
                      {res.created_at && (
                        <span>{format(parseISO(res.created_at), 'MMM d, yyyy')}</span>
                      )}
                    </div>

                    {res.url ? (
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.82rem' }}
                      >
                        Open Resource
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    ) : (
                      <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', padding: '6px' }}>
                        Academic Material
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal for adding/editing personal resource */}
      {showModal && (
        <PersonalResourceModal
          resource={editPersonalResource}
          onClose={() => {
            setShowModal(false);
            setEditPersonalResource(undefined);
          }}
          onSave={handleSavePersonal}
        />
      )}
    </div>
  );
}
