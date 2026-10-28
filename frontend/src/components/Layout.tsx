import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useApp } from '../context';
import { getStudent, getTeacher } from '../api';
import type { Student, Teacher } from '../api';

export default function Layout() {
  const { role, user, studentId, teacherId } = useApp();
  const [student, setStudent] = useState<Student | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    if (role === 'student' && studentId) {
      getStudent(studentId).then(setStudent).catch(() => {});
    } else if (role === 'teacher' && teacherId) {
      getTeacher(teacherId).then(setTeacher).catch(() => {});
    }
  }, [role, studentId, teacherId]);

  const userName = user?.full_name || (role === 'student' ? student?.full_name : teacher?.full_name);
  const userSub =
    role === 'student'
      ? `${student?.department || 'Student'} • ${student?.student_id || user?.email || ''}`
      : `${teacher?.designation || 'Faculty'} • ${teacher?.department || user?.email || ''}`;

  return (
    <div className="app-layout">
      <Sidebar
        userName={userName}
        userSub={userSub}
        role={role}
      />
      <div className="main-content">
        <Header role={role} userName={userName} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
