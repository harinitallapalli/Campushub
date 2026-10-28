import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context';
import {
  listCourses,
  listCourseStudents,
  getCourseAttendance,
  recordAttendance,
} from '../../api';
import type { Course, Student, AttendanceStatus, AttendanceRecordOut } from '../../api';

export default function TeacherAttendance() {
  const { teacherId } = useApp();
  const [searchParams] = useSearchParams();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const [students, setStudents] = useState<Student[]>([]);
  const [statusMap, setStatusMap] = useState<Record<number, AttendanceStatus>>({});
  const [historyRecords, setHistoryRecords] = useState<AttendanceRecordOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load courses
  useEffect(() => {
    listCourses(teacherId ? { teacher_id: teacherId } : undefined)
      .then(res => {
        setCourses(res);
        const paramId = searchParams.get('courseId');
        if (paramId && res.some(c => c.id === Number(paramId))) {
          setSelectedCourseId(Number(paramId));
        } else if (res.length > 0) {
          setSelectedCourseId(res[0].id);
        }
      })
      .catch(() => {});
  }, [teacherId, searchParams]);

  // When course or date changes, load enrolled students & existing records for this date
  useEffect(() => {
    if (!selectedCourseId) return;

    setLoading(true);
    setMessage(null);

    Promise.all([
      listCourseStudents(selectedCourseId),
      getCourseAttendance(selectedCourseId, attendanceDate),
      getCourseAttendance(selectedCourseId), // all history
    ])
      .then(([studentsRes, dayRecordsRes, allHistoryRes]) => {
        setStudents(studentsRes);
        setHistoryRecords(allHistoryRes);

        // Map status for this date if already recorded, otherwise default to 'present'
        const initialStatus: Record<number, AttendanceStatus> = {};
        const recordedByStudent: Record<number, AttendanceStatus> = {};
        dayRecordsRes.forEach(r => {
          recordedByStudent[r.student_id] = r.status;
        });

        studentsRes.forEach(s => {
          initialStatus[s.id] = recordedByStudent[s.id] || 'present';
        });

        setStatusMap(initialStatus);
      })
      .catch(() => {
        setMessage({ type: 'error', text: 'Failed to load course students or attendance.' });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedCourseId, attendanceDate]);

  function handleStatusToggle(studentId: number, status: AttendanceStatus) {
    setStatusMap(prev => ({
      ...prev,
      [studentId]: status,
    }));
  }

  function handleMarkAll(status: AttendanceStatus) {
    const updated: Record<number, AttendanceStatus> = {};
    students.forEach(s => {
      updated[s.id] = status;
    });
    setStatusMap(updated);
  }

  async function handleSaveAttendance() {
    if (!selectedCourseId) return;
    setSaving(true);
    setMessage(null);

    try {
      const records = students.map(s => ({
        student_id: s.id,
        status: statusMap[s.id] || 'present',
      }));

      await recordAttendance({
        course_id: selectedCourseId,
        date: attendanceDate,
        records,
      });

      setMessage({
        type: 'success',
        text: `Attendance saved successfully for ${records.length} students on ${attendanceDate}! Student portals have been updated.`,
      });

      // Refresh history
      getCourseAttendance(selectedCourseId).then(setHistoryRecords);
    } catch {
      setMessage({ type: 'error', text: 'Error saving attendance. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const presentCount = Object.values(statusMap).filter(s => s === 'present').length;
  const absentCount = Object.values(statusMap).filter(s => s === 'absent').length;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '8px 0' }}>
      
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
            Record &amp; Manage Course Attendance
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Select your course, specify the session date, and record Present / Absent status.
          </p>
        </div>
        <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
          Faculty Attendance Authority
        </span>
      </div>

      {message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '0.85rem',
            backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
            border: `1px solid ${message.type === 'success' ? '#86efac' : '#f87171'}`,
            color: message.type === 'success' ? '#15803d' : '#991b1b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
          >
            &times;
          </button>
        </div>
      )}

      {/* ── Course & Date Selection Toolbar ──────────────────────────────── */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
          
          <div>
            <label htmlFor="course-select" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              Select Course:
            </label>
            <select
              id="course-select"
              value={selectedCourseId || ''}
              onChange={e => setSelectedCourseId(Number(e.target.value))}
              style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-page)' }}
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="attendance-date" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              Session Date:
            </label>
            <input
              id="attendance-date"
              type="date"
              value={attendanceDate}
              onChange={e => setAttendanceDate(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-page)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => handleMarkAll('present')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem', padding: '7px 12px' }}
              title="Mark all students present"
            >
              Mark All Present
            </button>
            <button
              onClick={() => handleMarkAll('absent')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem', padding: '7px 12px' }}
              title="Mark all students absent"
            >
              Mark All Absent
            </button>
          </div>

        </div>
      </div>

      {/* ── Attendance Roster Table ───────────────────────────────────────── */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 2px 0', color: 'var(--text-main)' }}>
              Enrolled Student Roster ({students.length} Students)
            </h2>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Course: {selectedCourse ? `${selectedCourse.code} — ${selectedCourse.name}` : ''} • Date: {attendanceDate}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem' }}>
            <span style={{ color: '#16a34a', fontWeight: 600 }}>Present: {presentCount}</span>
            <span style={{ color: '#dc2626', fontWeight: 600 }}>Absent: {absentCount}</span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading roster from database...
          </div>
        ) : students.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No students enrolled in this course.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-page)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Roll Number</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Student Name</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Department</th>
                <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>Mark Attendance</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => {
                const isPresent = statusMap[student.id] === 'present';
                return (
                  <tr key={student.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {student.student_id}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{student.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {student.department} (Yr {student.year})
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', borderRadius: '4px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(student.id, 'present')}
                          style={{
                            padding: '6px 14px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: isPresent ? '#16a34a' : 'var(--bg-surface)',
                            color: isPresent ? '#ffffff' : 'var(--text-secondary)',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          ✓ Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(student.id, 'absent')}
                          style={{
                            padding: '6px 14px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            borderLeft: '1px solid var(--border-color)',
                            backgroundColor: !isPresent ? '#dc2626' : 'var(--bg-surface)',
                            color: !isPresent ? '#ffffff' : 'var(--text-secondary)',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          ✗ Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Footer with Save Action */}
        <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-page)', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Saving updates existing records or registers new session logs in SQLite.
          </div>
          <button
            onClick={handleSaveAttendance}
            disabled={saving || students.length === 0}
            className="btn btn-primary"
            style={{ padding: '8px 20px', fontSize: '0.88rem' }}
            id="save-attendance-btn"
          >
            {saving ? 'Saving to Database...' : 'Save & Synchronize Attendance'}
          </button>
        </div>
      </div>

      {/* ── Previous Recorded Sessions Log ───────────────────────────────── */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '18px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 12px 0', color: 'var(--text-main)' }}>
          Historical Session Logs for {selectedCourse?.code || 'Course'}
        </h3>
        
        {historyRecords.length === 0 ? (
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '12px 0' }}>
            No past sessions logged yet for this course.
          </div>
        ) : (
          <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-page)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '6px 12px', textAlign: 'left', color: 'var(--text-secondary)' }}>Date</th>
                  <th style={{ padding: '6px 12px', textAlign: 'left', color: 'var(--text-secondary)' }}>Roll No</th>
                  <th style={{ padding: '6px 12px', textAlign: 'left', color: 'var(--text-secondary)' }}>Student Name</th>
                  <th style={{ padding: '6px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>Recorded Status</th>
                </tr>
              </thead>
              <tbody>
                {historyRecords.slice(0, 30).map(rec => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '6px 12px', color: 'var(--text-muted)' }}>{rec.date}</td>
                    <td style={{ padding: '6px 12px', fontWeight: 600, color: 'var(--text-main)' }}>{rec.student_code}</td>
                    <td style={{ padding: '6px 12px', color: 'var(--text-main)' }}>{rec.student_name}</td>
                    <td style={{ padding: '6px 12px', textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '1px 6px',
                          borderRadius: '3px',
                          fontWeight: 600,
                          backgroundColor: rec.status === 'present' ? '#dcfce7' : '#fee2e2',
                          color: rec.status === 'present' ? '#15803d' : '#b91c1c',
                        }}
                      >
                        {rec.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
