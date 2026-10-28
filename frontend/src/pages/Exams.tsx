import { useState, useEffect } from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { exportToICS } from '../utils/calendarSync';

interface ExamItem {
  id: string;
  courseCode: string;
  courseName: string;
  examDate: string; // YYYY-MM-DD
  examTime: string;
  venue: string;
  examType: 'Mid-Term' | 'End-Semester' | 'Practical / Viva';
  units: { name: string; completed: boolean }[];
}

const DEFAULT_EXAMS: ExamItem[] = [
  {
    id: '1',
    courseCode: 'CS301',
    courseName: 'Operating Systems',
    examDate: '2026-11-15',
    examTime: '09:30 AM – 12:30 PM',
    venue: 'Exam Hall A (Building 3)',
    examType: 'End-Semester',
    units: [
      { name: 'Unit 1: Process Scheduling & Threads', completed: true },
      { name: 'Unit 2: Interprocess Communication & Semaphores', completed: true },
      { name: 'Unit 3: Memory Management & Paging', completed: false },
      { name: 'Unit 4: File Systems & Disk I/O', completed: false },
      { name: 'Unit 5: Deadlock Avoidance (Banker’s Algorithm)', completed: false },
    ],
  },
  {
    id: '2',
    courseCode: 'CS302',
    courseName: 'Database Management Systems',
    examDate: '2026-11-18',
    examTime: '09:30 AM – 12:30 PM',
    venue: 'Exam Hall B (Building 3)',
    examType: 'End-Semester',
    units: [
      { name: 'Unit 1: ER Modeling & Relational Algebra', completed: true },
      { name: 'Unit 2: SQL & Complex Joins', completed: true },
      { name: 'Unit 3: Normalization (1NF to BCNF)', completed: false },
      { name: 'Unit 4: Transaction Processing & ACID', completed: false },
      { name: 'Unit 5: Concurrency Control & Indexing (B+ Trees)', completed: false },
    ],
  },
  {
    id: '3',
    courseCode: 'CS304',
    courseName: 'Design & Analysis of Algorithms',
    examDate: '2026-11-22',
    examTime: '02:00 PM – 05:00 PM',
    venue: 'Auditorium North',
    examType: 'End-Semester',
    units: [
      { name: 'Unit 1: Asymptotic Notations & Recurrences', completed: true },
      { name: 'Unit 2: Divide & Conquer (Merge/Quick Sort)', completed: true },
      { name: 'Unit 3: Greedy Approach (MST, Huffman)', completed: true },
      { name: 'Unit 4: Dynamic Programming (0/1 Knapsack, LCS)', completed: false },
      { name: 'Unit 5: NP-Completeness & Approximation', completed: false },
    ],
  },
  {
    id: '4',
    courseCode: 'CS305L',
    courseName: 'OS Systems Lab Practical & Viva',
    examDate: '2026-11-10',
    examTime: '10:00 AM – 01:00 PM',
    venue: 'Computing Lab 3',
    examType: 'Practical / Viva',
    units: [
      { name: 'POSIX Fork and Pipe Execution', completed: true },
      { name: 'Multi-threaded Producer-Consumer Implementation', completed: true },
      { name: 'Shell Scripting & System Call Tracing', completed: false },
    ],
  },
];

export default function Exams() {
  const [exams, setExams] = useState<ExamItem[]>(() => {
    const saved = localStorage.getItem('campushub_exams');
    return saved ? JSON.parse(saved) : DEFAULT_EXAMS;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newExam, setNewExam] = useState({
    courseCode: '',
    courseName: '',
    examDate: '',
    examTime: '09:30 AM – 12:30 PM',
    venue: '',
    examType: 'End-Semester' as ExamItem['examType'],
    unitsText: '',
  });

  useEffect(() => {
    localStorage.setItem('campushub_exams', JSON.stringify(exams));
  }, [exams]);

  function toggleUnit(examId: string, unitIndex: number) {
    setExams(prev =>
      prev.map(e => {
        if (e.id !== examId) return e;
        const newUnits = [...e.units];
        newUnits[unitIndex].completed = !newUnits[unitIndex].completed;
        return { ...e, units: newUnits };
      })
    );
  }

  function handleDelete(id: string) {
    if (confirm('Delete this exam entry?')) {
      setExams(prev => prev.filter(e => e.id !== id));
    }
  }

  function handleAddExam(e: React.FormEvent) {
    e.preventDefault();
    if (!newExam.courseCode || !newExam.courseName || !newExam.examDate) return;

    const units = newExam.unitsText
      .split('\n')
      .map(u => u.trim())
      .filter(Boolean)
      .map(name => ({ name, completed: false }));

    const item: ExamItem = {
      id: Date.now().toString(),
      courseCode: newExam.courseCode,
      courseName: newExam.courseName,
      examDate: newExam.examDate,
      examTime: newExam.examTime,
      venue: newExam.venue || 'Campus Examination Hall',
      examType: newExam.examType,
      units: units.length > 0 ? units : [{ name: 'Complete Course Syllabus', completed: false }],
    };

    setExams(prev => [...prev, item]);
    setShowAddModal(false);
    setNewExam({
      courseCode: '',
      courseName: '',
      examDate: '',
      examTime: '09:30 AM – 12:30 PM',
      venue: '',
      examType: 'End-Semester',
      unitsText: '',
    });
  }

  function handleExportCalendar() {
    const cal = exams.map(e => ({
      id: e.id,
      title: `${e.courseCode} ${e.examType} Exam: ${e.courseName}`,
      description: `Time: ${e.examTime}\\nVenue: ${e.venue}\\nType: ${e.examType}`,
      startDate: e.examDate,
      location: e.venue,
    }));
    exportToICS(cal, 'university_exam_dates.ics');
  }

  // Sort exams chronologically
  const sortedExams = [...exams].sort((a, b) => a.examDate.localeCompare(b.examDate));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Examination Schedule &amp; Syllabus Tracker</h1>
          <p className="page-description">
            Official mid-term and end-semester dates, hall allocations, countdowns, and revision checklists.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportCalendar}
            id="export-exams-ics"
          >
            Export Dates (.ics)
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
            id="add-exam-btn"
          >
            + Add Exam Paper
          </button>
        </div>
      </div>

      {/* Exam Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {sortedExams.map(exam => {
          const daysLeft = differenceInDays(parseISO(exam.examDate), new Date());
          const isPastExam = daysLeft < 0;
          const completedUnits = exam.units.filter(u => u.completed).length;
          const prepPercent =
            exam.units.length > 0 ? Math.round((completedUnits / exam.units.length) * 100) : 0;

          return (
            <div key={exam.id} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>
                      {exam.courseCode}
                    </span>
                    <span className="badge badge-gray">{exam.examType}</span>
                    {isPastExam ? (
                      <span className="badge badge-gray">Concluded</span>
                    ) : daysLeft === 0 ? (
                      <span className="badge badge-amber">Examination Today</span>
                    ) : daysLeft <= 7 ? (
                      <span className="badge badge-red">{daysLeft} days remaining</span>
                    ) : (
                      <span className="badge badge-blue">{daysLeft} days left</span>
                    )}
                  </div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                    {exam.courseName}
                  </h2>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {format(parseISO(exam.examDate), 'EEEE, MMMM d, yyyy')}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Timing: {exam.examTime}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Hall: {exam.venue}
                  </div>
                </div>
              </div>

              {/* Syllabus Revision Checklist */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Syllabus Coverage: {completedUnits} of {exam.units.length} modules revised ({prepPercent}%)
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDelete(exam.id)}
                    style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '2px 8px' }}
                  >
                    Delete Entry
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
                  {exam.units.map((unit, idx) => (
                    <label
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '4px',
                        backgroundColor: unit.completed ? 'var(--success-bg)' : 'var(--bg-subtle)',
                        border: '1px solid',
                        borderColor: unit.completed ? 'var(--success-border)' : 'var(--border-color)',
                        fontSize: '0.8rem',
                        color: unit.completed ? 'var(--success)' : 'var(--text-main)',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={unit.completed}
                        onChange={() => toggleUnit(exam.id, idx)}
                        style={{ marginTop: '2px', cursor: 'pointer' }}
                      />
                      <span style={{ textDecoration: unit.completed ? 'line-through' : 'none' }}>
                        {unit.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Exam Modal */}
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
            style={{ width: '100%', maxWidth: '500px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="card-header">
              <h2 className="card-title">Add Examination Schedule</h2>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExam}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="exam-code">Course Code</label>
                  <input
                    id="exam-code"
                    type="text"
                    className="form-input"
                    placeholder="e.g. CS303"
                    value={newExam.courseCode}
                    onChange={e => setNewExam(p => ({ ...p, courseCode: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="exam-name">Course Name</label>
                  <input
                    id="exam-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Computer Networks"
                    value={newExam.courseName}
                    onChange={e => setNewExam(p => ({ ...p, courseName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="exam-date">Date</label>
                  <input
                    id="exam-date"
                    type="date"
                    className="form-input"
                    value={newExam.examDate}
                    onChange={e => setNewExam(p => ({ ...p, examDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="exam-type">Session Type</label>
                  <select
                    id="exam-type"
                    className="form-input"
                    value={newExam.examType}
                    onChange={e => setNewExam(p => ({ ...p, examType: e.target.value as ExamItem['examType'] }))}
                  >
                    <option value="End-Semester">End-Semester Final</option>
                    <option value="Mid-Term">Mid-Term Exam</option>
                    <option value="Practical / Viva">Practical / Viva</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="exam-time">Time Slot</label>
                  <input
                    id="exam-time"
                    type="text"
                    className="form-input"
                    placeholder="09:30 AM – 12:30 PM"
                    value={newExam.examTime}
                    onChange={e => setNewExam(p => ({ ...p, examTime: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="exam-venue">Hall / Venue</label>
                  <input
                    id="exam-venue"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Hall A, 2nd Floor"
                    value={newExam.venue}
                    onChange={e => setNewExam(p => ({ ...p, venue: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="exam-units">
                  Syllabus Units / Chapters (one per line)
                </label>
                <textarea
                  id="exam-units"
                  rows={3}
                  className="form-input"
                  placeholder="Unit 1: Fundamentals&#10;Unit 2: Core Algorithms&#10;Unit 3: Case Studies"
                  value={newExam.unitsText}
                  onChange={e => setNewExam(p => ({ ...p, unitsText: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="save-exam-btn">
                  Record Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
