import { useState } from 'react';

const faqs = [
  {
    q: 'How do I record and organize a course task?',
    a: 'Navigate to Tasks from the sidebar and click "+ Add New Task". Enter your assignment title, subject/course name, due date, priority level (High, Medium, Low), and current status.',
  },
  {
    q: 'How does event registration work?',
    a: 'Under the Campus Events page, browse available workshops, guest lectures, and departmental seminars. Click "Register Attendance" to secure a seat. You can cancel your registration at any time.',
  },
  {
    q: 'Can I update my enrolled department or contact info?',
    a: 'Yes. Visit the Student Record page, click "Edit Record", update your details (email, phone, current year/semester, or academic bio), and click "Save Changes".',
  },
  {
    q: 'Where are study materials and reference links kept?',
    a: 'The Study Resources archive stores links, documents, lecture notes, and video materials categorized by course and format for exam preparation.',
  },
  {
    q: 'What triggers an overdue task warning?',
    a: 'Tasks whose submission date has passed the current calendar date and have not been marked as "Completed" are flagged as overdue.',
  },
];

export default function Help() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setSubject('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 4000);
  }

  return (
    <div style={{ maxWidth: '780px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Campus Support &amp; Knowledge Base</h1>
          <p className="page-description">
            Academic guidelines, portal documentation, and student helpdesk assistance.
          </p>
        </div>
      </div>

      {/* Support directory */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '4px' }}>
            Academic Registrar
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Course registration &amp; official records
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '8px' }}>
            registrar@university.edu
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '4px' }}>
            Campus IT Helpdesk
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Portal access, student ID &amp; network
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '8px' }}>
            it-support@university.edu
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '4px' }}>
            Department Coordinators
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Syllabus, lab schedules &amp; faculty
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '8px' }}>
            Mon–Fri, 9:00 AM – 5:00 PM
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="card" style={{ marginBottom: '24px', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div>
          {faqs.map((f, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} style={{ borderBottom: i < faqs.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <button
                  type="button"
                  id={`faq-${i}`}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '14px 20px',
                    background: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: 'var(--text-main)',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                  }}
                >
                  <span>{f.q}</span>
                  <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: '12px' }}>
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div style={{ padding: '0 20px 14px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Helpdesk Contact Form */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Submit Academic Support Ticket</h2>
        </div>

        {submitted && (
          <div className="alert alert-success" role="status">
            Support ticket submitted. The campus helpdesk will follow up via your registered email.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="ticket-subject">
              Subject / Inquiry Topic <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="ticket-subject"
              className="form-input"
              type="text"
              placeholder="e.g. Discrepancy in semester course schedule"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ticket-message">
              Message Details <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <textarea
              id="ticket-message"
              className="form-input"
              rows={4}
              placeholder="Describe your question or issue in detail..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              style={{ resize: 'vertical' }}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" id="submit-ticket-btn">
            Submit Support Inquiry
          </button>
        </form>
      </div>
    </div>
  );
}
