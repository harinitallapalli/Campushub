import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { exportToICS } from '../utils/calendarSync';

interface HackathonItem {
  id: string;
  name: string;
  organizer: string;
  regDeadline: string; // YYYY-MM-DD
  eventDates: string;
  mode: 'Online' | 'In-Person' | 'Hybrid';
  location?: string;
  prizePool?: string;
  teamSize?: string;
  status: 'Interested' | 'Registered' | 'Team Formed' | 'Submitted';
  teamMembers?: string;
  projectIdea?: string;
  submissionUrl?: string;
  tracks?: string[];
}

const DEFAULT_HACKATHONS: HackathonItem[] = [
  {
    id: '1',
    name: 'Smart India Hackathon (SIH 2026)',
    organizer: 'Ministry of Education & AICTE',
    regDeadline: '2026-11-20',
    eventDates: 'Dec 18–20, 2026',
    mode: 'In-Person',
    location: 'Nodal Centers Across India',
    prizePool: '₹1,00,000 per problem statement',
    teamSize: '6 Members (Mandatory female lead)',
    status: 'Team Formed',
    teamMembers: 'Alex Johnson (Leader), Priya S., Rahul V., Tanvi M., Rohit K., Ananya D.',
    projectIdea: 'Smart Campus Resource Allocation and Class Attendance IoT Node',
    submissionUrl: 'https://github.com/alex-dev/sih-campus-iot',
    tracks: ['Smart Education', 'IoT & Embedded Systems', 'Disaster Management'],
  },
  {
    id: '2',
    name: 'ETHIndia 2026',
    organizer: 'Devfolio',
    regDeadline: '2026-11-10',
    eventDates: 'Dec 5–7, 2026',
    mode: 'In-Person',
    location: 'KTPO, Bengaluru',
    prizePool: '$100,000+ in bounties',
    teamSize: '2–4 Members',
    status: 'Registered',
    teamMembers: 'Alex Johnson, Dev P.',
    projectIdea: 'Decentralized Student Credentials & Transcript Verification on L2',
    submissionUrl: '',
    tracks: ['Web3 Infrastructure', 'Zero-Knowledge Proofs', 'DeFi'],
  },
  {
    id: '3',
    name: 'Google Solution Challenge 2026',
    organizer: 'Google Developer Student Clubs',
    regDeadline: '2027-01-25',
    eventDates: 'Jan – March 2027',
    mode: 'Online',
    prizePool: '$3,000 per finalist + Google Mentorship',
    teamSize: '1–4 Members',
    status: 'Interested',
    teamMembers: 'Solo or 2 members',
    projectIdea: 'UN SDG 4: Accessible Offline Learning Sync for Rural Students',
    submissionUrl: '',
    tracks: ['AI/ML', 'Cloud Run', 'Flutter Mobile'],
  },
  {
    id: '4',
    name: 'HackMIT 2026',
    organizer: 'MIT TechX',
    regDeadline: '2026-11-30',
    eventDates: 'Dec 12–13, 2026',
    mode: 'Hybrid',
    location: 'Cambridge, MA & Virtual',
    prizePool: '$25,000 in sponsor prizes',
    teamSize: '1–4 Members',
    status: 'Interested',
    tracks: ['Developer Tools', 'Systems & Security', 'HealthTech'],
  },
];

export default function Hackathons() {
  const [hackathons, setHackathons] = useState<HackathonItem[]>(() => {
    const saved = localStorage.getItem('campushub_hackathons');
    return saved ? JSON.parse(saved) : DEFAULT_HACKATHONS;
  });

  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterMode, setFilterMode] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newHack, setNewHack] = useState({
    name: '',
    organizer: '',
    regDeadline: '',
    eventDates: '',
    mode: 'Online' as HackathonItem['mode'],
    location: '',
    prizePool: '',
    teamSize: '2–4 Members',
    status: 'Interested' as HackathonItem['status'],
    teamMembers: '',
    projectIdea: '',
    tracks: '',
  });

  useEffect(() => {
    localStorage.setItem('campushub_hackathons', JSON.stringify(hackathons));
  }, [hackathons]);

  function handleStatusChange(id: string, status: HackathonItem['status']) {
    setHackathons(prev => prev.map(h => (h.id === id ? { ...h, status } : h)));
  }

  function handleDelete(id: string) {
    if (confirm('Remove this hackathon entry?')) {
      setHackathons(prev => prev.filter(h => h.id !== id));
    }
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newHack.name || !newHack.regDeadline) return;

    const item: HackathonItem = {
      id: Date.now().toString(),
      name: newHack.name,
      organizer: newHack.organizer || 'Independent Hackathon',
      regDeadline: newHack.regDeadline,
      eventDates: newHack.eventDates || 'TBA',
      mode: newHack.mode,
      location: newHack.location,
      prizePool: newHack.prizePool,
      teamSize: newHack.teamSize,
      status: newHack.status,
      teamMembers: newHack.teamMembers,
      projectIdea: newHack.projectIdea,
      tracks: newHack.tracks
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
    };

    setHackathons(prev => [item, ...prev]);
    setShowAddModal(false);
    setNewHack({
      name: '',
      organizer: '',
      regDeadline: '',
      eventDates: '',
      mode: 'Online',
      location: '',
      prizePool: '',
      teamSize: '2–4 Members',
      status: 'Interested',
      teamMembers: '',
      projectIdea: '',
      tracks: '',
    });
  }

  function handleExportDeadlines() {
    const events = hackathons.map(h => ({
      id: h.id,
      title: `Registration Closes: ${h.name}`,
      description: `Organizer: ${h.organizer}\\nDates: ${h.eventDates}\\nStatus: ${h.status}`,
      startDate: h.regDeadline,
      location: h.location || h.mode,
    }));
    exportToICS(events, 'hackathon_deadlines.ics');
  }

  const filtered = hackathons.filter(h => {
    if (filterStatus && h.status !== filterStatus) return false;
    if (filterMode && h.mode !== filterMode) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        h.name.toLowerCase().includes(q) ||
        h.organizer.toLowerCase().includes(q) ||
        (h.projectIdea || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Hackathons &amp; Competitions</h1>
          <p className="page-description">
            Track student hackathons, team formation, project submissions, and registration deadlines.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportDeadlines}
            id="export-hackathons-ics"
          >
            Export Deadlines (.ics)
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
            id="add-hackathon-btn"
          >
            + Track New Hackathon
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="form-input"
            type="search"
            placeholder="Search hackathons, organizer, or tracks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '280px', padding: '6px 10px' }}
            id="hackathon-search"
          />

          <select
            className="form-input"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ width: '160px', padding: '6px 10px' }}
            id="filter-status"
          >
            <option value="">All Statuses</option>
            <option value="Interested">Interested</option>
            <option value="Registered">Registered</option>
            <option value="Team Formed">Team Formed</option>
            <option value="Submitted">Submitted</option>
          </select>

          <select
            className="form-input"
            value={filterMode}
            onChange={e => setFilterMode(e.target.value)}
            style={{ width: '140px', padding: '6px 10px' }}
            id="filter-mode"
          >
            <option value="">All Formats</option>
            <option value="Online">Online</option>
            <option value="In-Person">In-Person</option>
            <option value="Hybrid">Hybrid</option>
          </select>

          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {filtered.length} hackathon{filtered.length !== 1 ? 's' : ''} tracked
          </span>
        </div>
      </div>

      {/* Hackathons Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filtered.map(item => (
          <div key={item.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge badge-blue">{item.mode}</span>
                  {item.prizePool && <span className="badge badge-amber">{item.prizePool}</span>}
                  <span
                    className={`badge ${
                      item.status === 'Submitted'
                        ? 'badge-green'
                        : item.status === 'Team Formed'
                        ? 'badge-blue'
                        : item.status === 'Registered'
                        ? 'badge-amber'
                        : 'badge-gray'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                  {item.name}
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Organized by: {item.organizer} {item.location ? `• ${item.location}` : ''}
                </div>
              </div>

              {/* Status Update Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>My Status:</span>
                <select
                  className="form-input"
                  style={{ padding: '4px 8px', fontSize: '0.8rem', width: '130px' }}
                  value={item.status}
                  onChange={e => handleStatusChange(item.id, e.target.value as HackathonItem['status'])}
                >
                  <option value="Interested">Interested</option>
                  <option value="Registered">Registered</option>
                  <option value="Team Formed">Team Formed</option>
                  <option value="Submitted">Submitted</option>
                </select>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleDelete(item.id)}
                  style={{ color: 'var(--text-muted)', padding: '4px 8px' }}
                  title="Remove hackathon"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Dates & Team Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', padding: '10px 14px', backgroundColor: 'var(--bg-page)', borderRadius: '4px', marginBottom: '12px', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Reg. Deadline: </span>
                <strong style={{ color: 'var(--danger)' }}>
                  {format(parseISO(item.regDeadline), 'MMMM d, yyyy')}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Event Dates: </span>
                <strong>{item.eventDates}</strong>
              </div>
              {item.teamSize && (
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Team Requirement: </span>
                  <span>{item.teamSize}</span>
                </div>
              )}
            </div>

            {/* Project Idea & Team Details */}
            {item.projectIdea && (
              <div style={{ fontSize: '0.82rem', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Project Focus: </span>
                <span style={{ color: 'var(--text-secondary)' }}>{item.projectIdea}</span>
              </div>
            )}

            {item.teamMembers && (
              <div style={{ fontSize: '0.8rem', marginBottom: '8px', color: 'var(--text-muted)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Formed Team: </span>
                {item.teamMembers}
              </div>
            )}

            {/* Tracks */}
            {item.tracks && item.tracks.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                {item.tracks.map(t => (
                  <span key={t} className="badge badge-gray" style={{ fontSize: '0.72rem' }}>
                    {t}
                  </span>
                ))}
              </div>
            )}

            {item.submissionUrl && (
              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Submission Repository: </span>
                <a href={item.submissionUrl} target="_blank" rel="noreferrer">
                  {item.submissionUrl}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Hackathon Modal */}
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
            style={{ width: '100%', maxWidth: '520px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="card-header">
              <h2 className="card-title">Track New Hackathon</h2>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label" htmlFor="hack-name">Hackathon Name *</label>
                <input
                  id="hack-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Smart India Hackathon"
                  value={newHack.name}
                  onChange={e => setNewHack(p => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="hack-organizer">Host / Organization</label>
                  <input
                    id="hack-organizer"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Devfolio / MLH"
                    value={newHack.organizer}
                    onChange={e => setNewHack(p => ({ ...p, organizer: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="hack-mode">Format</label>
                  <select
                    id="hack-mode"
                    className="form-input"
                    value={newHack.mode}
                    onChange={e => setNewHack(p => ({ ...p, mode: e.target.value as HackathonItem['mode'] }))}
                  >
                    <option value="Online">Online</option>
                    <option value="In-Person">In-Person</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="hack-deadline">Registration Deadline *</label>
                  <input
                    id="hack-deadline"
                    type="date"
                    className="form-input"
                    value={newHack.regDeadline}
                    onChange={e => setNewHack(p => ({ ...p, regDeadline: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="hack-dates">Event Dates</label>
                  <input
                    id="hack-dates"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dec 18–20, 2026"
                    value={newHack.eventDates}
                    onChange={e => setNewHack(p => ({ ...p, eventDates: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="hack-prizes">Prize Pool / Bounties</label>
                  <input
                    id="hack-prizes"
                    type="text"
                    className="form-input"
                    placeholder="e.g. ₹50,000 or $10,000"
                    value={newHack.prizePool}
                    onChange={e => setNewHack(p => ({ ...p, prizePool: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="hack-status">Registration Status</label>
                  <select
                    id="hack-status"
                    className="form-input"
                    value={newHack.status}
                    onChange={e => setNewHack(p => ({ ...p, status: e.target.value as HackathonItem['status'] }))}
                  >
                    <option value="Interested">Interested</option>
                    <option value="Registered">Registered</option>
                    <option value="Team Formed">Team Formed</option>
                    <option value="Submitted">Submitted</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="hack-idea">Project Idea / Problem Statement</label>
                <input
                  id="hack-idea"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Decentralized attendance tracking with zero-knowledge proofs"
                  value={newHack.projectIdea}
                  onChange={e => setNewHack(p => ({ ...p, projectIdea: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="hack-tracks">Tracks (comma separated)</label>
                <input
                  id="hack-tracks"
                  type="text"
                  className="form-input"
                  placeholder="e.g. AI/ML, Web3, IoT, Education"
                  value={newHack.tracks}
                  onChange={e => setNewHack(p => ({ ...p, tracks: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="save-hack-btn">
                  Add to Tracker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
