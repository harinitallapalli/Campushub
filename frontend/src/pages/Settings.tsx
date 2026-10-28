import { useState } from 'react';

interface ToggleProps {
  id: string;
  label: string;
  description?: string;
  defaultOn?: boolean;
}

function Toggle({ id, label, description, defaultOn = false }: ToggleProps) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 0',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <div>
        <p style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>{label}</p>
        {description && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        id={id}
        onClick={() => setOn(p => !p)}
        style={{
          width: '38px',
          height: '22px',
          borderRadius: '11px',
          backgroundColor: on ? 'var(--primary)' : 'var(--border-dark)',
          border: 'none',
          position: 'relative',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            display: 'block',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            position: 'absolute',
            top: '3px',
            left: on ? '19px' : '3px',
            transition: 'left 0.15s ease',
          }}
        />
      </button>
    </div>
  );
}

export default function Settings() {
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleExportData() {
    const studentData = {
      portal: 'CampusHub Academic System',
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(studentData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campushub_academic_data.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ maxWidth: '720px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Portal Preferences</h1>
          <p className="page-description">
            Configure coursework reminders, display density, and local data settings.
          </p>
        </div>
      </div>

      {saved && (
        <div className="alert alert-success" role="status">
          Preferences saved successfully.
        </div>
      )}

      {/* Coursework & Deadline Notifications */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2 className="card-title">Deadline &amp; Coursework Alerts</h2>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
          Choose when the portal flags upcoming coursework submissions.
        </p>
        <Toggle
          id="notif-tasks"
          label="24-Hour Assignment Reminders"
          description="Highlight coursework due within the next 24 hours on the dashboard."
          defaultOn={true}
        />
        <Toggle
          id="notif-overdue"
          label="Overdue Submission Warnings"
          description="Display priority alerts for tasks past their scheduled due date."
          defaultOn={true}
        />
        <Toggle
          id="notif-events"
          label="Registered Campus Event Reminders"
          description="Show alerts for workshops and seminars on the scheduled event day."
          defaultOn={true}
        />
      </div>

      {/* Display Density */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2 className="card-title">Display &amp; Interface</h2>
        </div>
        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label" htmlFor="density-select">
            Table &amp; List Density
          </label>
          <select id="density-select" className="form-input" defaultValue="standard" style={{ maxWidth: '240px' }}>
            <option value="compact">Compact (High data density)</option>
            <option value="standard">Standard (Default)</option>
            <option value="comfortable">Comfortable</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="default-landing">
            Default Section on Sign In
          </label>
          <select id="default-landing" className="form-input" defaultValue="dashboard" style={{ maxWidth: '240px' }}>
            <option value="dashboard">Academic Dashboard</option>
            <option value="tasks">Tasks &amp; Coursework</option>
            <option value="events">Campus Events</option>
            <option value="resources">Study Resources</option>
          </select>
        </div>
      </div>

      {/* Data Management */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2 className="card-title">Local Data &amp; Export</h2>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Export your stored coursework, events, and study materials in JSON format for offline backup.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportData}
            id="export-data-btn"
          >
            Export Academic Records
          </button>
        </div>
      </div>

      <button
        type="button"
        className="btn btn-primary"
        onClick={handleSave}
        id="save-settings-btn"
      >
        Save Preferences
      </button>
    </div>
  );
}
