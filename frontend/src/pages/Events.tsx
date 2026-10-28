import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { listEvents, registerEvent, unregisterEvent } from '../api';
import type { Event } from '../api';
import { format, parseISO } from 'date-fns';

export default function Events() {
  const { studentId } = useApp();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  async function fetchEvents() {
    setLoading(true);
    try {
      const data = await listEvents({
        student_id: studentId || undefined,
        category: filterCategory || undefined,
        upcoming: showUpcoming || undefined,
      });
      setEvents(data);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!studentId) {
      navigate('/');
      return;
    }
    fetchEvents();
  }, [studentId, navigate, filterCategory, showUpcoming]);

  async function handleRegister(eventId: number, isRegistered: boolean) {
    if (!studentId) return;
    setRegistering(eventId);
    try {
      if (isRegistered) {
        await unregisterEvent(eventId, studentId);
      } else {
        await registerEvent(eventId, studentId);
      }
      await fetchEvents();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      alert(err?.response?.data?.detail || 'Action failed');
    } finally {
      setRegistering(null);
    }
  }

  const filtered = events.filter(ev => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        ev.title.toLowerCase().includes(q) ||
        (ev.description || '').toLowerCase().includes(q) ||
        (ev.location || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categories = [
    { label: 'All Categories', value: '' },
    { label: 'Academic & Lectures', value: 'academic' },
    { label: 'Workshops & Labs', value: 'workshop' },
    { label: 'Seminars', value: 'seminar' },
    { label: 'Cultural', value: 'cultural' },
    { label: 'Sports', value: 'sports' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Campus Events &amp; Workshops</h1>
          <p className="page-description">
            Official department workshops, guest lectures, seminars, and student society activities.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="form-input"
            type="search"
            placeholder="Search events, venue, or topics..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '260px', padding: '6px 10px' }}
            id="event-search"
          />

          <select
            className="form-input"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            style={{ width: '180px', padding: '6px 10px' }}
            id="filter-category"
          >
            {categories.map(c => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showUpcoming}
              onChange={e => setShowUpcoming(e.target.checked)}
              id="upcoming-checkbox"
            />
            Upcoming dates only
          </label>

          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {filtered.length} event{filtered.length !== 1 ? 's' : ''} listed
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading campus schedule...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
            No campus events match your criteria
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Try clearing the search query or selecting "All Categories".
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filtered.map(ev => {
            const isReg = ev.is_registered;
            return (
              <div key={ev.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>
                      {ev.category}
                    </span>
                    {isReg && (
                      <span className="badge badge-green">
                        Registered
                      </span>
                    )}
                  </div>

                  <h2 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px', lineHeight: 1.3 }}>
                    {ev.title}
                  </h2>

                  {ev.description && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                      {ev.description}
                    </p>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '12px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                    Date: {format(parseISO(ev.event_date), 'EEEE, MMMM d, yyyy')}
                  </div>
                  {ev.event_time && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                      Time: {ev.event_time}
                    </div>
                  )}
                  {ev.location && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      Venue: {ev.location}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Seats: {ev.registration_count} / {ev.capacity || 'Open'}
                    </span>

                    <button
                      type="button"
                      className={`btn btn-sm ${isReg ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => handleRegister(ev.id, !!isReg)}
                      disabled={registering === ev.id}
                      id={`event-action-${ev.id}`}
                    >
                      {registering === ev.id
                        ? 'Updating...'
                        : isReg
                        ? 'Cancel Registration'
                        : 'Register Attendance'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
