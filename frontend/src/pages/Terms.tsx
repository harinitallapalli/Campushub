export default function Terms() {
  const sections = [
    {
      title: 'Institutional Use Agreement',
      content: `By logging into and utilizing CampusHub, you agree to comply with university academic computing policies and the regulations set forth in this document. These terms govern all student and staff interactions with the system.`,
    },
    {
      title: 'Scope of Portal Operations',
      content: `CampusHub provides coursework deadline tracking, campus seminar registrations, academic resource indexing, and personal student record administration. The service is operated under university department guidelines.`,
    },
    {
      title: 'Student Accountability & Credentials',
      content: `• Registration must reflect verified enrollment information (legal name, official roll number, and department).
• Sharing credentials or impersonating other enrolled students is strictly prohibited.
• Submissions, tasks, and notes entered into the system are the responsibility of the account holder.`,
    },
    {
      title: 'Appropriate Academic Conduct',
      content: `Students are expected to adhere to institutional academic integrity standards. Any misuse of shared study materials, intentional disruption of portal services, or unauthorized access attempts will result in account review by the registrar.`,
    },
    {
      title: 'Data Preservation',
      content: `Coursework records are maintained locally. Students are encouraged to use the portal data export feature to preserve semester assignment records at the close of each academic term.`,
    },
  ];

  return (
    <div style={{ maxWidth: '760px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Terms of Portal Use</h1>
          <p className="page-description">Institutional guidelines for academic computing and record access.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.88rem' }}>
          Please review the following computing and user terms carefully. By accessing or submitting coursework data through the CampusHub student portal, you agree to abide by these guidelines.
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
          For inquiries regarding institutional computing terms, reach out to{' '}
          <span style={{ color: 'var(--primary)', fontWeight: 500 }}>academic-affairs@university.edu</span>
        </p>
      </div>
    </div>
  );
}
