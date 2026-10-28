import { useState, useEffect } from 'react';

interface CourseGrade {
  id: string;
  code: string;
  title: string;
  credits: number;
  grade: string;
}

const GRADE_POINTS_10: Record<string, number> = {
  'O (Outstanding)': 10,
  'A+ (Excellent)': 9,
  'A (Very Good)': 8,
  'B+ (Good)': 7,
  'B (Above Average)': 6,
  'C (Average)': 5,
  'P (Pass)': 4,
  'F (Fail)': 0,
};

const DEFAULT_COURSES: CourseGrade[] = [
  { id: '1', code: 'CS301', title: 'Operating Systems', credits: 4, grade: 'A+ (Excellent)' },
  { id: '2', code: 'CS302', title: 'Database Management Systems', credits: 4, grade: 'A (Very Good)' },
  { id: '3', code: 'CS303', title: 'Computer Networks', credits: 3, grade: 'B+ (Good)' },
  { id: '4', code: 'CS304', title: 'Algorithms Design', credits: 4, grade: 'O (Outstanding)' },
  { id: '5', code: 'CS305L', title: 'OS Systems Lab', credits: 2, grade: 'O (Outstanding)' },
  { id: '6', code: 'CS306L', title: 'DBMS Lab', credits: 2, grade: 'A+ (Excellent)' },
  { id: '7', code: 'MA201', title: 'Discrete Mathematics', credits: 3, grade: 'B+ (Good)' },
];

export default function Grades() {
  const [courses, setCourses] = useState<CourseGrade[]>(() => {
    const saved = localStorage.getItem('campushub_grades');
    return saved ? JSON.parse(saved) : DEFAULT_COURSES;
  });

  const [pastCGPA, setPastCGPA] = useState<number>(8.45);
  const [pastCredits, setPastCredits] = useState<number>(44);

  useEffect(() => {
    localStorage.setItem('campushub_grades', JSON.stringify(courses));
  }, [courses]);

  function updateGrade(id: string, grade: string) {
    setCourses(prev => prev.map(c => (c.id === id ? { ...c, grade } : c)));
  }

  function updateCredits(id: string, credits: number) {
    setCourses(prev => prev.map(c => (c.id === id ? { ...c, credits } : c)));
  }

  function handleAddCourse() {
    const newCourse: CourseGrade = {
      id: Date.now().toString(),
      code: `CS${310 + courses.length}`,
      title: 'Elective Course',
      credits: 3,
      grade: 'A (Very Good)',
    };
    setCourses(prev => [...prev, newCourse]);
  }

  function handleDelete(id: string) {
    if (courses.length <= 1) return;
    setCourses(prev => prev.filter(c => c.id !== id));
  }

  // Calculate SGPA
  const totalSemesterCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const totalPoints = courses.reduce(
    (sum, c) => sum + c.credits * (GRADE_POINTS_10[c.grade] ?? 0),
    0
  );
  const currentSGPA =
    totalSemesterCredits > 0 ? (totalPoints / totalSemesterCredits).toFixed(2) : '0.00';

  // Calculate projected CGPA
  const totalEarnedCredits = pastCredits + totalSemesterCredits;
  const projectedCGPA =
    totalEarnedCredits > 0
      ? (
          (pastCGPA * pastCredits + Number(currentSGPA) * totalSemesterCredits) /
          totalEarnedCredits
        ).toFixed(2)
      : currentSGPA;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">GPA &amp; Semester CGPA Simulator</h1>
          <p className="page-description">
            Credit-weighted grade point calculations, semester performance tracking, and cumulative projections.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAddCourse}
          id="add-grade-course-btn"
        >
          + Add Course
        </button>
      </div>

      {/* GPA Performance Summary Cards */}
      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-box-label">Semester SGPA</div>
          <div className="stat-box-value" style={{ color: 'var(--primary)' }}>
            {currentSGPA}
          </div>
          <div className="stat-box-note">
            Calculated across {totalSemesterCredits} credits
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-box-label">Projected Cumulative CGPA</div>
          <div className="stat-box-value">{projectedCGPA}</div>
          <div className="stat-box-note">
            Combined with past {pastCredits} credits
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-box-label">Grading System</div>
          <div className="stat-box-value" style={{ fontSize: '1.25rem', marginTop: '4px' }}>
            10.0 Scale
          </div>
          <div className="stat-box-note">UGC / AICTE Academic Standard</div>
        </div>

        <div className="stat-box">
          <div className="stat-box-label">Academic Status</div>
          <div className="stat-box-value" style={{ fontSize: '1.25rem', marginTop: '4px', color: 'var(--success)' }}>
            First Class Dist.
          </div>
          <div className="stat-box-note">CGPA &gt; 8.00 threshold</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* Semester Course Grades Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '14px 18px', margin: 0, backgroundColor: 'var(--bg-subtle)' }}>
            <h2 className="card-title">Enrolled Courses &amp; Grade Simulation</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Adjust credits and expected grades to simulate SGPA
            </span>
          </div>

          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>Code</th>
                  <th>Course Title</th>
                  <th style={{ width: '90px' }}>Credits</th>
                  <th style={{ width: '180px' }}>Grade / Points</th>
                  <th style={{ textAlign: 'right', width: '70px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>
                      {course.code}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                        {course.title}
                      </div>
                    </td>
                    <td>
                      <select
                        className="form-input"
                        style={{ padding: '4px 8px', fontSize: '0.82rem' }}
                        value={course.credits}
                        onChange={e => updateCredits(course.id, Number(e.target.value))}
                      >
                        {[1, 2, 3, 4, 5, 6].map(cr => (
                          <option key={cr} value={cr}>
                            {cr} Cr
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className="form-input"
                        style={{ padding: '4px 8px', fontSize: '0.82rem' }}
                        value={course.grade}
                        onChange={e => updateGrade(course.id, e.target.value)}
                      >
                        {Object.keys(GRADE_POINTS_10).map(g => (
                          <option key={g} value={g}>
                            {g} ({GRADE_POINTS_10[g]} pts)
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleDelete(course.id)}
                        style={{ color: 'var(--text-muted)', padding: '2px 6px' }}
                        title="Remove course"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cumulative History & Formula Reference */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Prior Semester Records</h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Enter accumulated credit data to project cumulative CGPA:
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="past-cgpa">Previous Cumulative CGPA</label>
              <input
                id="past-cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                className="form-input"
                value={pastCGPA}
                onChange={e => setPastCGPA(Number(e.target.value))}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="past-credits">Total Credits Completed</label>
              <input
                id="past-credits"
                type="number"
                min="0"
                className="form-input"
                value={pastCredits}
                onChange={e => setPastCredits(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="card" style={{ backgroundColor: 'var(--bg-subtle)' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              Official Grade Point Scale
            </h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              O = 10 • A+ = 9 • A = 8 • B+ = 7 • B = 6 • C = 5 • P = 4 • F = 0
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Formula: SGPA = Σ (Course Credits × Grade Points) / Σ Credits
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
