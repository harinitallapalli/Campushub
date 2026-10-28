import { useState, useEffect } from 'react';
import { listEvents, createEvent, updateEvent, deleteEvent } from '../../api';
import type { Event, EventCreate } from '../../api';

const CATEGORIES = ['Workshop', 'Seminar', 'Hackathon', 'Technical', 'Cultural', 'Academic'];

export default function TeacherEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const [form, setForm] = useState<EventCreate>({
    title: '',
    description: '',
    category: 'Workshop',
    event_date: new Date().toISOString().split('T')[0],
    event_time: '10:00 AM',
    location: '',
    organizer: '',
    capacity: 60,
  });

  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  function loadEvents() {
    setLoading(true);
    listEvents()
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  function handleOpenCreate() {
    setEditingEvent(null);
    setForm({
      title: '',
      description: '',
      category: 'Workshop',
      event_date: new Date().toISOString().split('T')[0],
      event_time: '10:00 AM',
      location: '',
      organizer: '',
      capacity: 60,
    });
    setShowModal(true);
  }

  function handleOpenEdit(ev: Event) {
    setEditingEvent(ev);
    setForm({
      title: ev.title,
      description: ev.description || '',
      category: ev.category || 'Workshop',
      event_date: ev.event_date,
      event_time: ev.event_time || '10:00 AM',
      location: ev.location || '',
      organizer: ev.organizer || '',
      capacity: ev.capacity || 60,
    });
    setShowModal(true);
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteEvent(id);
      setNotification('Event deleted successfully.');
      loadEvents();
    } catch {
      alert('Failed to delete event.');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.event_date) return;

    setSubmitting(true);
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, form);
        setNotification('Event updated successfully!');
      } else {
        await createEvent({
          ...form,
          created_by: 'Faculty Board',
        });
        setNotification('New campus event published! Students can now view & register.');
      }
      setShowModal(false);
      loadEvents();
    } catch {
      alert('Failed to save event.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '8px 0' }}>
      
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
            Campus &amp; Department Event Coordinator
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Schedule academic seminars, hackathons, and technical workshops.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn btn-primary"
          style={{ fontSize: '0.85rem', padding: '8px 16px' }}
          id="teacher-create-event-btn"
        >
          + Create New Event
        </button>
      </div>

      {notification && (
        <div style={{ padding: '10px 14px', backgroundColor: '#dcfce7', border: '1px solid #86efac', color: '#15803d', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem' }}>
          {notification}
        </div>
      )}

      {/* ── Event List Table ─────────────────────────────────────────────── */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
            Scheduled Events ({events.length})
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Shared database source with Student Portal
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading events from SQLite...
          </div>
        ) : events.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No events scheduled yet.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-page)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Event Title</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Category</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Schedule</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Venue</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Registrations</th>
                <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{ev.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Organizer: {ev.organizer || 'Faculty'}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {ev.category || 'General'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                    <div>{ev.event_date}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ev.event_time}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                    {ev.location || 'Campus'}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-main)' }}>
                    <strong>{ev.registration_count}</strong> {ev.capacity ? `/ ${ev.capacity}` : 'enrolled'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => handleOpenEdit(ev)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ev.id)}
                        className="btn btn-sm"
                        style={{ fontSize: '0.75rem', padding: '3px 8px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '8px',
              maxWidth: '560px',
              width: '100%',
              border: '1px solid var(--border-color)',
              padding: '24px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
                {editingEvent ? 'Edit Campus Event' : 'Create Campus Event'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Event Title:
                </label>
                <input
                  type="text"
                  placeholder="e.g. CS Department Hackathon 2026"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Category:
                  </label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-surface)' }}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Max Capacity:
                  </label>
                  <input
                    type="number"
                    value={form.capacity || 50}
                    onChange={e => setForm({ ...form, capacity: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Date:
                  </label>
                  <input
                    type="date"
                    value={form.event_date}
                    onChange={e => setForm({ ...form, event_date: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Time:
                  </label>
                  <input
                    type="text"
                    placeholder="10:00 AM"
                    value={form.event_time || ''}
                    onChange={e => setForm({ ...form, event_time: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Venue / Location:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lab 204 or Main Auditorium"
                    value={form.location || ''}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Organizer:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS Department"
                    value={form.organizer || ''}
                    onChange={e => setForm({ ...form, organizer: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Description:
                </label>
                <textarea
                  rows={3}
                  placeholder="Details about workshop topics, rules, or requirements..."
                  value={form.description || ''}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontFamily: 'inherit' }}
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
                  {submitting ? 'Saving...' : editingEvent ? 'Save Changes' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
