import { useState, useEffect } from 'react';
import { exportToICS } from '../utils/calendarSync';

interface ClassSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string;
  endTime: string;
  courseCode: string;
  courseName: string;
  venue: string;
  instructor?: string;
  isLab?: boolean;
}

const DEFAULT_TIMETABLE: ClassSlot[] = [
  { id: '1', day: 'Monday', startTime: '09:00', endTime: '10:00', courseCode: 'CS301', courseName: 'Operating Systems', venue: 'Hall 204', instructor: 'Dr. Aris' },
  { id: '2', day: 'Monday', startTime: '10:15', endTime: '11:15', courseCode: 'CS302', courseName: 'Database Systems', venue: 'Hall 204', instructor: 'Prof. Mehta' },
  { id: '3', day: 'Monday', startTime: '14:00', endTime: '16:00', courseCode: 'CS305L', courseName: 'OS Systems Lab', venue: 'Computing Lab 3', instructor: 'Dr. Aris', isLab: true },
  
  { id: '4', day: 'Tuesday', startTime: '09:00', endTime: '10:00', courseCode: 'CS303', courseName: 'Computer Networks', venue: 'Hall 206', instructor: 'Prof. Reynolds' },
  { id: '5', day: 'Tuesday', startTime: '11:15', endTime: '12:15', courseCode: 'CS304', courseName: 'Algorithms Design', venue: 'Hall 204', instructor: 'Dr. Sharma' },
  { id: '6', day: 'Tuesday', startTime: '14:00', endTime: '15:00', courseCode: 'MA201', courseName: 'Discrete Mathematics', venue: 'Hall 102', instructor: 'Dr. Vance' },

  { id: '7', day: 'Wednesday', startTime: '09:00', endTime: '10:00', courseCode: 'CS301', courseName: 'Operating Systems', venue: 'Hall 204', instructor: 'Dr. Aris' },
  { id: '8', day: 'Wednesday', startTime: '10:15', endTime: '11:15', courseCode: 'CS302', courseName: 'Database Systems', venue: 'Hall 204', instructor: 'Prof. Mehta' },
  { id: '9', day: 'Wednesday', startTime: '14:00', endTime: '16:00', courseCode: 'CS306L', courseName: 'DBMS Lab', venue: 'Database Lab 1', instructor: 'Prof. Mehta', isLab: true },

  { id: '10', day: 'Thursday', startTime: '09:00', endTime: '10:00', courseCode: 'CS303', courseName: 'Computer Networks', venue: 'Hall 206', instructor: 'Prof. Reynolds' },
  { id: '11', day: 'Thursday', startTime: '11:15', endTime: '12:15', courseCode: 'CS304', courseName: 'Algorithms Design', venue: 'Hall 204', instructor: 'Dr. Sharma' },

  { id: '12', day: 'Friday', startTime: '10:00', endTime: '11:00', courseCode: 'CS307', courseName: 'Software Engineering', venue: 'Hall 105', instructor: 'Dr. Lin' },
  { id: '13', day: 'Friday', startTime: '14:00', endTime: '16:00', courseCode: 'CS308L', courseName: 'Networks Lab', venue: 'Network Lab 2', instructor: 'Prof. Reynolds', isLab: true },
];

const DAYS: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

export default function Timetable() {
  const [slots, setSlots] = useState<ClassSlot[]>(() => {
    const saved = localStorage.getItem('campushub_timetable');
    return saved ? JSON.parse(saved) : DEFAULT_TIMETABLE;
  });

  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSlot, setNewSlot] = useState<Omit<ClassSlot, 'id'>>({
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    courseCode: '',
    courseName: '',
    venue: '',
    instructor: '',
    isLab: false,
  });

  useEffect(() => {
    localStorage.setItem('campushub_timetable', JSON.stringify(slots));
  }, [slots]);

  function handleAddSlot(e: React.FormEvent) {
    e.preventDefault();
    if (!newSlot.courseCode || !newSlot.courseName) return;

    const slot: ClassSlot = {
      ...newSlot,
      id: Date.now().toString(),
    };

    setSlots(prev => [...prev, slot]);
    setShowAddModal(false);
    setNewSlot({
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      courseCode: '',
      courseName: '',
      venue: '',
      instructor: '',
      isLab: false,
    });
  }

  function handleDeleteSlot(id: string) {
    if (confirm('Remove this class slot from schedule?')) {
      setSlots(prev => prev.filter(s => s.id !== id));
    }
  }

  function handleExportCalendar() {
    const calendarEvents = slots.map(s => {
      // Pick next occurrence of the day
      const today = new Date();
      const dayOffset: Record<string, number> = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5 };
      const currentDay = today.getDay(); // 0 is Sunday
      const diff = (dayOffset[s.day] - currentDay + 7) % 7;
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + diff);

      return {
        id: s.id,
        title: `${s.courseCode}: ${s.courseName}`,
        description: `Instructor: ${s.instructor || 'TBD'}\\nVenue: ${s.venue}`,
        startDate: targetDate.toISOString().split('T')[0],
        location: s.venue,
      };
    });

    exportToICS(calendarEvents, 'academic_timetable.ics');
  }

  const daySlots = slots
    .filter(s => s.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Weekly Lecture &amp; Lab Timetable</h1>
          <p className="page-description">
            Enrolled class schedule, lecture hall venues, laboratory timings, and calendar sync.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportCalendar}
            id="export-timetable-ics"
          >
            Export to Calendar (.ics)
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
            id="add-class-btn"
          >
            + Add Class Slot
          </button>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="filter-tabs">
        {DAYS.map(day => {
          const count = slots.filter(s => s.day === day).length;
          return (
            <button
              key={day}
              type="button"
              className={`filter-tab ${selectedDay === day ? 'active' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              {day} ({count})
            </button>
          );
        })}
      </div>

      {/* Selected Day Schedule View */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ padding: '12px 18px', backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
            Schedule for {selectedDay}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {daySlots.length} sessions scheduled
          </span>
        </div>

        {daySlots.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No classes or labs scheduled on {selectedDay}.
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '140px' }}>Time Slot</th>
                  <th style={{ width: '100px' }}>Course Code</th>
                  <th>Course Title</th>
                  <th>Venue / Room</th>
                  <th>Instructor</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {daySlots.map(slot => (
                  <tr key={slot.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                      {slot.startTime} – {slot.endTime}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>
                      {slot.courseCode}
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                      {slot.courseName}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {slot.venue}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {slot.instructor || '—'}
                    </td>
                    <td>
                      <span className={`badge ${slot.isLab ? 'badge-amber' : 'badge-blue'}`}>
                        {slot.isLab ? 'Laboratory' : 'Lecture'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteSlot(slot.id)}
                        id={`delete-slot-${slot.id}`}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Week Overview Matrix */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Full Week Timetable Matrix</h2>
        </div>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '100px' }}>Day</th>
                <th>Scheduled Classes &amp; Labs</th>
              </tr>
            </thead>
            <tbody>
              {DAYS.map(day => {
                const dayItems = slots.filter(s => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
                return (
                  <tr key={day}>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{day}</td>
                    <td>
                      {dayItems.length === 0 ? (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No sessions</span>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {dayItems.map(item => (
                            <div
                              key={item.id}
                              style={{
                                padding: '4px 8px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                backgroundColor: item.isLab ? 'var(--warning-bg)' : 'var(--bg-subtle)',
                                fontSize: '0.78rem',
                              }}
                            >
                              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.startTime}</span> • {item.courseCode} ({item.venue})
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
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
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: '480px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="card-header">
              <h2 className="card-title">Add Class to Timetable</h2>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSlot}>
              <div className="form-group">
                <label className="form-label" htmlFor="slot-day">Day of Week</label>
                <select
                  id="slot-day"
                  className="form-input"
                  value={newSlot.day}
                  onChange={e => setNewSlot(p => ({ ...p, day: e.target.value as ClassSlot['day'] }))}
                >
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="start-time">Start Time</label>
                  <input
                    id="start-time"
                    type="time"
                    className="form-input"
                    value={newSlot.startTime}
                    onChange={e => setNewSlot(p => ({ ...p, startTime: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="end-time">End Time</label>
                  <input
                    id="end-time"
                    type="time"
                    className="form-input"
                    value={newSlot.endTime}
                    onChange={e => setNewSlot(p => ({ ...p, endTime: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="slot-code">Course Code</label>
                  <input
                    id="slot-code"
                    type="text"
                    className="form-input"
                    placeholder="e.g. CS301"
                    value={newSlot.courseCode}
                    onChange={e => setNewSlot(p => ({ ...p, courseCode: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="slot-name">Course Name</label>
                  <input
                    id="slot-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Operating Systems"
                    value={newSlot.courseName}
                    onChange={e => setNewSlot(p => ({ ...p, courseName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="slot-venue">Venue / Room</label>
                  <input
                    id="slot-venue"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Hall 204"
                    value={newSlot.venue}
                    onChange={e => setNewSlot(p => ({ ...p, venue: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="slot-instructor">Instructor</label>
                  <input
                    id="slot-instructor"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dr. Aris"
                    value={newSlot.instructor}
                    onChange={e => setNewSlot(p => ({ ...p, instructor: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={newSlot.isLab}
                    onChange={e => setNewSlot(p => ({ ...p, isLab: e.target.checked }))}
                  />
                  This session is a Laboratory / Practical class
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="save-class-btn">
                  Add to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
