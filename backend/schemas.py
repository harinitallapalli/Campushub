"""
Pydantic schemas for request/response validation in CampusHub.
"""
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel
from models import TaskStatus, TaskPriority, ResourceType, AttendanceStatus, UserRole


# ── Auth Schemas ──────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str


class AuthUser(BaseModel):
    id: int
    role: UserRole
    full_name: str
    email: str
    profile_id: int  # student.id or teacher.id


class TokenResponse(BaseModel):
    token: str
    role: UserRole
    user: AuthUser


class RegisterStudentRequest(BaseModel):
    full_name: str
    email: str
    password: str
    student_id: str
    department: str
    year: int
    semester: int
    bio: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


# ── Teacher Schemas ───────────────────────────────────────────────────────────

class TeacherCreate(BaseModel):
    teacher_id: str
    full_name: str
    email: str
    department: str
    designation: str = "Faculty"
    bio: Optional[str] = None


class TeacherOut(BaseModel):
    id: int
    teacher_id: str
    full_name: str
    email: str
    department: str
    designation: str
    bio: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Student Schemas ───────────────────────────────────────────────────────────

class StudentCreate(BaseModel):
    full_name: str
    email: str
    student_id: str
    department: str
    year: int
    semester: int
    bio: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    semester: Optional[int] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class StudentOut(BaseModel):
    id: int
    full_name: str
    email: str
    student_id: str
    department: str
    year: int
    semester: int
    bio: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Course Schemas ────────────────────────────────────────────────────────────

class CourseCreate(BaseModel):
    code: str
    name: str
    department: str
    teacher_id: int


class CourseOut(BaseModel):
    id: int
    code: str
    name: str
    department: str
    teacher_id: int
    teacher_name: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Attendance Schemas ────────────────────────────────────────────────────────

class AttendanceStudentStatus(BaseModel):
    student_id: int
    status: AttendanceStatus


class AttendanceBatchCreate(BaseModel):
    course_id: int
    date: date
    records: List[AttendanceStudentStatus]


class AttendanceRecordOut(BaseModel):
    id: int
    student_id: int
    student_name: str
    student_code: str
    course_id: int
    course_code: str
    course_name: str
    date: date
    status: AttendanceStatus

    model_config = {"from_attributes": True}


class AttendanceRecordSummary(BaseModel):
    id: int
    date: date
    status: AttendanceStatus


class StudentCourseAttendanceSummary(BaseModel):
    course_id: int
    course_code: str
    course_name: str
    teacher_name: str
    attended: int
    total: int
    percentage: float
    is_eligible: bool
    classes_can_miss: int
    classes_needed: int
    records: List[AttendanceRecordSummary]


# ── Note Schemas ──────────────────────────────────────────────────────────────

class NoteCreate(BaseModel):
    teacher_id: int
    course_id: int
    title: str
    content: str
    resource_url: Optional[str] = None


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    resource_url: Optional[str] = None
    course_id: Optional[int] = None


class NoteOut(BaseModel):
    id: int
    teacher_id: int
    teacher_name: str
    course_id: int
    course_code: str
    course_name: str
    title: str
    content: str
    resource_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Personal Resource Schemas (Student Private) ───────────────────────────────

class PersonalResourceCreate(BaseModel):
    title: str
    subject: Optional[str] = None
    resource_type: ResourceType = ResourceType.link
    description: Optional[str] = None
    url: Optional[str] = None


class PersonalResourceUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    resource_type: Optional[ResourceType] = None
    description: Optional[str] = None
    url: Optional[str] = None


class PersonalResourceOut(BaseModel):
    id: int
    student_id: int
    title: str
    subject: Optional[str] = None
    resource_type: ResourceType
    description: Optional[str] = None
    url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Faculty Resource Schemas (Teacher Published / Student Read-Only) ──────────

class FacultyResourceCreate(BaseModel):
    title: str
    course_id: Optional[int] = None
    resource_type: ResourceType = ResourceType.link
    description: Optional[str] = None
    url: Optional[str] = None


class FacultyResourceUpdate(BaseModel):
    title: Optional[str] = None
    course_id: Optional[int] = None
    resource_type: Optional[ResourceType] = None
    description: Optional[str] = None
    url: Optional[str] = None


class FacultyResourceOut(BaseModel):
    id: int
    teacher_id: int
    teacher_name: Optional[str] = None
    course_id: Optional[int] = None
    course_code: Optional[str] = None
    course_name: Optional[str] = None
    title: str
    resource_type: ResourceType
    description: Optional[str] = None
    url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Legacy Resource Schemas ───────────────────────────────────────────────────

class ResourceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    resource_type: ResourceType = ResourceType.link
    subject: Optional[str] = None
    url: Optional[str] = None
    content: Optional[str] = None
    teacher_id: Optional[int] = None
    course_id: Optional[int] = None
    student_id: Optional[int] = None


class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    resource_type: Optional[ResourceType] = None
    subject: Optional[str] = None
    url: Optional[str] = None
    content: Optional[str] = None
    course_id: Optional[int] = None


class ResourceOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    resource_type: ResourceType
    subject: Optional[str] = None
    url: Optional[str] = None
    content: Optional[str] = None
    teacher_id: Optional[int] = None
    course_id: Optional[int] = None
    student_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}



# ── Task Schemas ──────────────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    subject: Optional[str] = None
    due_date: Optional[date] = None
    status: TaskStatus = TaskStatus.pending
    priority: TaskPriority = TaskPriority.medium


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None


class TaskOut(BaseModel):
    id: int
    student_id: int
    title: str
    description: Optional[str] = None
    subject: Optional[str] = None
    due_date: Optional[date] = None
    status: TaskStatus
    priority: TaskPriority
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Event Schemas ─────────────────────────────────────────────────────────────

class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    event_date: date
    event_time: Optional[str] = None
    category: Optional[str] = None
    capacity: Optional[int] = None
    organizer: Optional[str] = None
    created_by: Optional[str] = None


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    event_date: Optional[date] = None
    event_time: Optional[str] = None
    category: Optional[str] = None
    capacity: Optional[int] = None
    organizer: Optional[str] = None
    created_by: Optional[str] = None


class EventOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    event_date: date
    event_time: Optional[str] = None
    category: Optional[str] = None
    capacity: Optional[int] = None
    organizer: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime
    registration_count: int = 0
    is_registered: bool = False

    model_config = {"from_attributes": True}


class RegistrationCreate(BaseModel):
    student_id: int


class RegistrationOut(BaseModel):
    id: int
    event_id: int
    student_id: int
    registered_at: datetime

    model_config = {"from_attributes": True}


# ── Dashboard Schemas ─────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_tasks: int
    pending_tasks: int
    in_progress_tasks: int
    completed_tasks: int
    overdue_tasks: int
    upcoming_events: int
    registered_events: int
    total_resources: int
    tasks_due_this_week: int
    overall_attendance: Optional[float] = None
    low_attendance_courses: Optional[int] = 0


class CriticalStudent(BaseModel):
    student_id: int
    student_code: str
    full_name: str
    course_name: str
    course_code: str
    attended: int
    total: int
    percentage: float


class TeacherDashboardStats(BaseModel):
    courses_handled: int
    courses: List[CourseOut]
    total_students: int
    students_at_risk: List[CriticalStudent]
    notes_published_count: int
    upcoming_events_count: int
