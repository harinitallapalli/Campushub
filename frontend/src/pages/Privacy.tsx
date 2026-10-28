export default function Privacy() {
  const sections = [
    {
      title: 'Information Collected',
      content: `CampusHub collects student information strictly for academic portal management:
• Enrollment Information: Full name, student ID / roll number, academic department, enrolled year, and semester.
• Contact Information: Email address, phone number, and city/residential address.
• Coursework Records: Tasks, due dates, course associations, and completion statuses entered by the student.
• Campus Activity: Registrations for campus events, workshops, and saved departmental study resources.`,
    },
    {
      title: 'Usage of Student Data',
      content: `Student records are utilized exclusively to support university academic administration:
• Maintaining verified course assignments and deadline trackers.
• Presenting upcoming workshop schedules and reserving workshop attendance.
• Displaying student records and facilitating local data backup.
• Student information is never sold, distributed to third parties, or monetized.`,
    },
    {
      title: 'Storage and Security',
      content: `• Portal data is stored in the local SQLite campus database.
• Access to records is restricted to authenticated student portal sessions.
• Data export in JSON format is available through the portal settings for student archival.`,
    },
    {
      title: 'Student Rights',
      content: `Students have the right to inspect, edit, or request purging of their academic portal records at any time through the Student Record settings or via the campus registrar.`,
    },
  ];

  return (
    <div style={{ maxWidth: '760px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Institutional Privacy Policy</h1>
          <p className="page-description">Last updated: Academic Year 2026–2027</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.88rem' }}>
          This policy defines the collection, storage, and retention parameters for student records maintained within the CampusHub Academic Information System. By registering a student profile, you acknowledge the terms outlined below.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
        {sections.map((s, i) => (
          <div key={i} className="card">
            <h2 style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '8px' }}>
              {i + 1}. {s.title}
            </h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {s.content}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ backgroundColor: 'var(--bg-subtle)' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center' }}>
          For privacy inquiries or record verification, contact the campus registrar at{' '}
          <span style={{ color: 'var(--primary)', fontWeight: 500 }}>privacy@university.edu</span>
        </p>
      </div>
    </div>
  );
}
