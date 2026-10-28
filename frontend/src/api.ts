/**
 * CampusHub API client — Axios wrapper for Student & Teacher portal endpoints
 */
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

// Automatically attach Bearer token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('campushub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-handle 401 Unauthorized (session expired or invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes('/api/auth/login') &&
      !error.config?.url?.includes('/api/auth/register')
    ) {
      localStorage.removeItem('campushub_token');
      if (
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/register')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Teacher {
  id: number;
  teacher_id: string;
  full_name: string;
  email: string;
  department: string;
  designation: string;
  bio?: string;
  created_at: string;
}

export interface Student {
  id: number;
  full_name: string;
  email: string;
  student_id: string;
  department: string;
  year: number;
  semester: number;
  bio?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentCreate {
  full_name: string;
  email: string;
  student_id: string;
  department: string;
  year: number;
  semester: number;
  bio?: string;
  phone?: string;
  address?: string;
}

export interface StudentUpdate {
  full_name?: string;
  email?: string;
  department?: string;
  year?: number;
  semester?: number;
  bio?: string;
  phone?: string;
  address?: string;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  department: string;
  teacher_id: number;
  teacher_name?: string;
  created_at: string;
}

export type AttendanceStatus = 'present' | 'absent';

export interface AttendanceRecordSummary {
  id: number;
  date: string;
  status: AttendanceStatus;
}

export interface StudentCourseAttendanceSummary {
  course_id: number;
  course_code: string;
  course_name: string;
  teacher_name: string;
  attended: number;
  total: number;
  percentage: number;
  is_eligible: boolean;
  classes_can_miss: number;
  classes_needed: number;
  records: AttendanceRecordSummary[];
}

export interface AttendanceRecordOut {
  id: number;
  student_id: number;
  student_name: string;
  student_code: string;
  course_id: number;
  course_code: string;
  course_name: string;
  date: string;
  status: AttendanceStatus;
}

export interface AttendanceBatchCreate {
  course_id: number;
  date: string;
  records: Array<{ student_id: number; status: AttendanceStatus }>;
}

export interface Note {
  id: number;
  teacher_id: number;
  teacher_name: string;
  course_id: number;
  course_code: string;
  course_name: string;
  title: string;
  content: string;
  resource_url?: string;
  created_at: string;
  updated_at: string;
}

export interface NoteCreate {
  teacher_id: number;
  course_id: number;
  title: string;
  content: string;
  resource_url?: string;
}

export interface NoteUpdate {
  title?: string;
  content?: string;
  resource_url?: string;
  course_id?: number;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  student_id: number;
  title: string;
  description?: string;
  subject?: string;
  due_date?: string;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  subject?: string;
  due_date?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  subject?: string;
  due_date?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  location?: string;
  event_date: string;
  event_time?: string;
  category?: string;
  capacity?: number;
  organizer?: string;
  created_by?: string;
  created_at: string;
  registration_count: number;
  is_registered: boolean;
}

export interface EventCreate {
  title: string;
  description?: string;
  location?: string;
  event_date: string;
  event_time?: string;
  category?: string;
  capacity?: number;
  organizer?: string;
  created_by?: string;
}

export type ResourceType = 'note' | 'link' | 'file' | 'document' | 'video' | 'other';

export interface PersonalResource {
  id: number;
  student_id: number;
  title: string;
  subject?: string;
  resource_type: ResourceType;
  description?: string;
  url?: string;
  created_at: string;
  updated_at: string;
}

export interface PersonalResourceCreate {
  title: string;
  subject?: string;
  resource_type?: ResourceType;
  description?: string;
  url?: string;
}

export interface FacultyResource {
  id: number;
  teacher_id: number;
  teacher_name?: string;
  course_id?: number;
  course_code?: string;
  course_name?: string;
  title: string;
  resource_type: ResourceType;
  description?: string;
  url?: string;
  created_at: string;
  updated_at: string;
}

export interface FacultyResourceCreate {
  title: string;
  course_id?: number;
  resource_type?: ResourceType;
  description?: string;
  url?: string;
}

export interface Resource {
  id: number;
  title: string;
  description?: string;
  resource_type: ResourceType;
  subject?: string;
  url?: string;
  content?: string;
  teacher_id?: number;
  course_id?: number;
  student_id?: number;
  created_at: string;
  updated_at: string;
}

export interface ResourceCreate {
  title: string;
  description?: string;
  resource_type?: ResourceType;
  subject?: string;
  url?: string;
  content?: string;
  teacher_id?: number;
  course_id?: number;
  student_id?: number;
}

export interface DashboardStats {
  total_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  upcoming_events: number;
  registered_events: number;
  total_resources: number;
  tasks_due_this_week: number;
  overall_attendance?: number;
  low_attendance_courses?: number;
}

export interface CriticalStudent {
  student_id: number;
  student_code: string;
  full_name: string;
  course_name: string;
  course_code: string;
  attended: number;
  total: number;
  percentage: number;
}

export interface TeacherDashboardStats {
  courses_handled: number;
  courses: Course[];
  total_students: number;
  students_at_risk: CriticalStudent[];
  notes_published_count: number;
  upcoming_events_count: number;
}

// ── Teacher API ──────────────────────────────────────────────────────────────

export const listTeachers = () =>
  api.get<Teacher[]>('/api/teachers').then(r => r.data);

export const getTeacher = (id: number) =>
  api.get<Teacher>(`/api/teachers/${id}`).then(r => r.data);

export const getTeacherDashboard = (teacherId: number) =>
  api.get<TeacherDashboardStats>(`/api/teacher/dashboard/${teacherId}`).then(r => r.data);

// ── Course API ────────────────────────────────────────────────────────────────

export const listCourses = (params?: { teacher_id?: number }) =>
  api.get<Course[]>('/api/courses', { params }).then(r => r.data);

export const listCourseStudents = (courseId: number) =>
  api.get<Student[]>(`/api/courses/${courseId}/students`).then(r => r.data);

// ── Attendance API ────────────────────────────────────────────────────────────

export const getStudentAttendance = (studentId: number) =>
  api.get<StudentCourseAttendanceSummary[]>(`/api/attendance/student/${studentId}`).then(r => r.data);

export const getCourseAttendance = (courseId: number, date?: string) =>
  api.get<AttendanceRecordOut[]>(`/api/attendance/course/${courseId}`, { params: date ? { date } : {} }).then(r => r.data);

export const recordAttendance = (data: AttendanceBatchCreate) =>
  api.post<AttendanceRecordOut[]>('/api/attendance', data).then(r => r.data);

// ── Notes API ─────────────────────────────────────────────────────────────────

export const listNotes = (params?: { course_id?: number; teacher_id?: number; search?: string }) =>
  api.get<Note[]>('/api/notes', { params }).then(r => r.data);

export const createNote = (data: NoteCreate) =>
  api.post<Note>('/api/notes', data).then(r => r.data);

export const updateNote = (noteId: number, data: NoteUpdate) =>
  api.put<Note>(`/api/notes/${noteId}`, data).then(r => r.data);

export const deleteNote = (noteId: number) =>
  api.delete(`/api/notes/${noteId}`);

// ── Student API ──────────────────────────────────────────────────────────────

export const getStudent = (id: number) =>
  api.get<Student>(`/api/students/${id}`).then(r => r.data);

export const listStudents = () =>
  api.get<Student[]>('/api/students').then(r => r.data);

export const createStudent = (data: StudentCreate) =>
  api.post<Student>('/api/students', data).then(r => r.data);

export const updateStudent = (id: number, data: StudentUpdate) =>
  api.patch<Student>(`/api/students/${id}`, data).then(r => r.data);

// ── Dashboard API ─────────────────────────────────────────────────────────────

export const getDashboard = (studentId: number) =>
  api.get<DashboardStats>(`/api/dashboard/${studentId}`).then(r => r.data);

// ── Tasks API ─────────────────────────────────────────────────────────────────

export const listTasks = (studentId: number, params?: { status?: string; priority?: string; subject?: string }) =>
  api.get<Task[]>(`/api/students/${studentId}/tasks`, { params }).then(r => r.data);

export const createTask = (studentId: number, data: TaskCreate) =>
  api.post<Task>(`/api/students/${studentId}/tasks`, data).then(r => r.data);

export const updateTask = (taskId: number, data: TaskUpdate) =>
  api.patch<Task>(`/api/tasks/${taskId}`, data).then(r => r.data);

export const deleteTask = (taskId: number) =>
  api.delete(`/api/tasks/${taskId}`);

// ── Events API ────────────────────────────────────────────────────────────────

export const listEvents = (params?: { student_id?: number; category?: string; upcoming?: boolean }) =>
  api.get<Event[]>('/api/events', { params }).then(r => r.data);

export const createEvent = (data: EventCreate) =>
  api.post<Event>('/api/events', data).then(r => r.data);

export const updateEvent = (eventId: number, data: Partial<EventCreate>) =>
  api.put<Event>(`/api/events/${eventId}`, data).then(r => r.data);

export const deleteEvent = (eventId: number) =>
  api.delete(`/api/events/${eventId}`);

export const registerEvent = (eventId: number, studentId: number) =>
  api.post(`/api/events/${eventId}/register`, { student_id: studentId }).then(r => r.data);

export const unregisterEvent = (eventId: number, studentId: number) =>
  api.delete(`/api/events/${eventId}/register/${studentId}`);

// ── Personal Resources API (Student Private) ──────────────────────────────────

export const listMyPersonalResources = (params?: { resource_type?: string; subject?: string; search?: string }) =>
  api.get<PersonalResource[]>('/api/me/resources', { params }).then(r => r.data);

export const createMyPersonalResource = (data: PersonalResourceCreate) =>
  api.post<PersonalResource>('/api/me/resources', data).then(r => r.data);

export const updateMyPersonalResource = (resourceId: number, data: Partial<PersonalResourceCreate>) =>
  api.put<PersonalResource>(`/api/me/resources/${resourceId}`, data).then(r => r.data);

export const deleteMyPersonalResource = (resourceId: number) =>
  api.delete(`/api/me/resources/${resourceId}`);

// ── Faculty Resources API (Published by Faculty, Read-only for Students) ───────

export const listFacultyResources = (params?: { resource_type?: string; course_id?: number; teacher_id?: number; search?: string }) =>
  api.get<FacultyResource[]>('/api/faculty-resources', { params }).then(r => r.data);

export const createFacultyResource = (data: FacultyResourceCreate) =>
  api.post<FacultyResource>('/api/faculty-resources', data).then(r => r.data);

export const updateFacultyResource = (resourceId: number, data: Partial<FacultyResourceCreate>) =>
  api.put<FacultyResource>(`/api/faculty-resources/${resourceId}`, data).then(r => r.data);

export const deleteFacultyResource = (resourceId: number) =>
  api.delete(`/api/faculty-resources/${resourceId}`);

// ── Legacy Resources API ──────────────────────────────────────────────────────

export const listResources = (_studentId?: number, params?: { resource_type?: string; subject?: string; course_id?: number; search?: string }) =>
  api.get<Resource[]>('/api/resources', { params }).then(r => r.data);

export const createResource = (_studentId: number | undefined, data: ResourceCreate) =>
  api.post<Resource>('/api/resources', data).then(r => r.data);

export const updateResource = (resourceId: number, data: Partial<ResourceCreate>) =>
  api.put<Resource>(`/api/resources/${resourceId}`, data).then(r => r.data);

export const deleteResource = (resourceId: number) =>
  api.delete(`/api/resources/${resourceId}`);

// ── Auth API ──────────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'teacher';

export interface AuthUser {
  id: number;
  role: UserRole;
  full_name: string;
  email: string;
  profile_id: number;
}

export interface TokenResponse {
  token: string;
  role: UserRole;
  user: AuthUser;
}

export interface RegisterStudentRequest {
  full_name: string;
  email: string;
  password: string;
  student_id: string;
  department: string;
  year: number;
  semester: number;
  bio?: string;
  phone?: string;
  address?: string;
}

export const authLogin = (email: string, password: string) =>
  api.post<TokenResponse>('/api/auth/login', { email, password }).then(r => r.data);

export const authLogout = () =>
  api.post('/api/auth/logout').then(r => r.data);

export const authMe = () =>
  api.get<AuthUser>('/api/auth/me').then(r => r.data);

export const authRegisterStudent = (data: RegisterStudentRequest) =>
  api.post<TokenResponse>('/api/auth/register', data).then(r => r.data);

export default api;

