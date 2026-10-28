"""
CampusHub — FastAPI Backend Application
Student & Teacher Academic Management Portal
"""
import hashlib
import secrets
import math
from datetime import date, timedelta, datetime
from typing import Optional, List

from fastapi import FastAPI, Depends, HTTPException, Query, status, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

import models
import schemas
from database import Base, engine, get_db
from seed import seed_database

# ── Create tables & seed ──────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CampusHub API",
    description="Backend API for CampusHub Student–Teacher Academic Management Portal",
    version="2.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    db = next(get_db())
    try:
        seed_database(db)
        _migrate_passwords(db)
        _migrate_resources(db)
    finally:
        db.close()


def _migrate_passwords(db: Session) -> None:
    """Back-fill password_hash for any legacy rows that have an empty string."""
    default_hash = _hash_password("campus123")
    updated = False
    for student in db.query(models.Student).all():
        if not student.password_hash:
            student.password_hash = default_hash
            updated = True
    for teacher in db.query(models.Teacher).all():
        if not teacher.password_hash:
            teacher.password_hash = default_hash
            updated = True
    if updated:
        db.commit()


def _migrate_resources(db: Session) -> None:
    """Ensure FacultyResource and PersonalResource tables exist and are populated."""
    models.Base.metadata.create_all(bind=engine)
    
    # 1. Faculty Resources
    if db.query(models.FacultyResource).count() == 0:
        teachers = db.query(models.Teacher).all()
        courses = db.query(models.Course).all()
        t1_id = teachers[0].id if teachers else 1
        t2_id = teachers[1].id if len(teachers) > 1 else t1_id
        c1_id = courses[0].id if courses else None
        c2_id = courses[1].id if len(courses) > 1 else None

        f1 = models.FacultyResource(
            teacher_id=t1_id,
            course_id=c1_id,
            title="Operating Systems — Process Scheduling Reference",
            description="Comprehensive guide covering CPU scheduling algorithms (FCFS, SJF, RR, Priority), process state transitions, and context switching overhead.",
            resource_type=models.ResourceType.link,
            url="https://en.wikipedia.org/wiki/Scheduling_(computing)",
        )
        f2 = models.FacultyResource(
            teacher_id=t2_id,
            course_id=c2_id,
            title="Database Indexing & B-Trees Guide",
            description="Technical documentation on B-Tree and B+ Tree structures, clustered vs non-clustered indexes, and query performance tuning in relational databases.",
            resource_type=models.ResourceType.document,
            url="https://en.wikipedia.org/wiki/B-tree",
        )
        db.add_all([f1, f2])
        db.commit()

    # 2. Personal Resources
    if db.query(models.PersonalResource).count() == 0:
        alex = db.query(models.Student).filter(models.Student.email == "alex.johnson@university.edu").first()
        if alex:
            p1 = models.PersonalResource(
                student_id=alex.id,
                title="My Python Practice",
                subject="Python / LeetCode",
                resource_type=models.ResourceType.link,
                description="Personal dynamic programming, sliding window, and two-pointer problem collection for interview preparation.",
                url="https://leetcode.com/problemset/all/",
            )
            p2 = models.PersonalResource(
                student_id=alex.id,
                title="BST Implementation Notes",
                subject="CS301 - Data Structures",
                resource_type=models.ResourceType.note,
                description="Personal notes on binary search tree implementation patterns, balancing, and recursive deletion edge cases.",
                url="https://en.wikipedia.org/wiki/Binary_search_tree",
            )
            p3 = models.PersonalResource(
                student_id=alex.id,
                title="Calculus Integration Techniques Summary",
                subject="MATH201 - Calculus II",
                resource_type=models.ResourceType.note,
                description="Quick reference cheat sheet covering u-substitution, integration by parts, and partial fraction decomposition.",
                url="https://en.wikipedia.org/wiki/Integration_by_parts",
            )
            db.add_all([p1, p2, p3])
            db.commit()


# ── Auth helpers ──────────────────────────────────────────────────────────────

def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def _get_session(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> models.UserSession:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    session = db.query(models.UserSession).filter(models.UserSession.token == token).first()
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if session.expires_at < datetime.utcnow():
        db.delete(session)
        db.commit()
        raise HTTPException(status_code=401, detail="Session expired — please log in again")
    return session


def _require_student(session: models.UserSession = Depends(_get_session)) -> models.UserSession:
    if session.role != models.UserRole.student:
        raise HTTPException(status_code=403, detail="Students only")
    return session


def _require_teacher(session: models.UserSession = Depends(_get_session)) -> models.UserSession:
    if session.role != models.UserRole.teacher:
        raise HTTPException(status_code=403, detail="Teachers only")
    return session


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "ok", "service": "CampusHub API"}


# ── Auth ──────────────────────────────────────────────────────────────────────

@app.post("/api/auth/login", response_model=schemas.TokenResponse, tags=["Auth"])
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    hashed = _hash_password(data.password)
    # Try student first
    student = db.query(models.Student).filter(models.Student.email == data.email).first()
    if student and student.password_hash == hashed:
        token = secrets.token_hex(32)
        expires = datetime.utcnow() + timedelta(days=7)
        session = models.UserSession(
            token=token,
            role=models.UserRole.student,
            student_id=student.id,
            expires_at=expires,
        )
        db.add(session)
        db.commit()
        return schemas.TokenResponse(
            token=token,
            role=models.UserRole.student,
            user=schemas.AuthUser(
                id=student.id,
                role=models.UserRole.student,
                full_name=student.full_name,
                email=student.email,
                profile_id=student.id,
            ),
        )
    # Try teacher
    teacher = db.query(models.Teacher).filter(models.Teacher.email == data.email).first()
    if teacher and teacher.password_hash == hashed:
        token = secrets.token_hex(32)
        expires = datetime.utcnow() + timedelta(days=7)
        session = models.UserSession(
            token=token,
            role=models.UserRole.teacher,
            teacher_id=teacher.id,
            expires_at=expires,
        )
        db.add(session)
        db.commit()
        return schemas.TokenResponse(
            token=token,
            role=models.UserRole.teacher,
            user=schemas.AuthUser(
                id=teacher.id,
                role=models.UserRole.teacher,
                full_name=teacher.full_name,
                email=teacher.email,
                profile_id=teacher.id,
            ),
        )
    raise HTTPException(status_code=401, detail="Invalid email or password")


@app.post("/api/auth/logout", tags=["Auth"])
def logout(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
        session = db.query(models.UserSession).filter(models.UserSession.token == token).first()
        if session:
            db.delete(session)
            db.commit()
    return {"message": "Logged out"}


@app.get("/api/auth/me", response_model=schemas.AuthUser, tags=["Auth"])
def get_me(session: models.UserSession = Depends(_get_session)):
    if session.role == models.UserRole.student and session.student:
        return schemas.AuthUser(
            id=session.student.id,
            role=models.UserRole.student,
            full_name=session.student.full_name,
            email=session.student.email,
            profile_id=session.student.id,
        )
    if session.role == models.UserRole.teacher and session.teacher:
        return schemas.AuthUser(
            id=session.teacher.id,
            role=models.UserRole.teacher,
            full_name=session.teacher.full_name,
            email=session.teacher.email,
            profile_id=session.teacher.id,
        )
    raise HTTPException(status_code=404, detail="User not found")


@app.post("/api/auth/register", response_model=schemas.TokenResponse, status_code=201, tags=["Auth"])
def register_student(data: schemas.RegisterStudentRequest, db: Session = Depends(get_db)):
    if db.query(models.Student).filter(models.Student.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(models.Student).filter(models.Student.student_id == data.student_id).first():
        raise HTTPException(status_code=400, detail="Student ID already exists")
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    student = models.Student(
        full_name=data.full_name,
        email=data.email,
        password_hash=_hash_password(data.password),
        student_id=data.student_id,
        department=data.department,
        year=data.year,
        semester=data.semester,
        bio=data.bio,
        phone=data.phone,
        address=data.address,
    )
    db.add(student)
    db.flush()

    courses = db.query(models.Course).all()
    for c in courses:
        db.add(models.Enrollment(student_id=student.id, course_id=c.id))

    token = secrets.token_hex(32)
    expires = datetime.utcnow() + timedelta(days=7)
    session = models.UserSession(
        token=token,
        role=models.UserRole.student,
        student_id=student.id,
        expires_at=expires,
    )
    db.add(session)
    db.commit()
    db.refresh(student)

    return schemas.TokenResponse(
        token=token,
        role=models.UserRole.student,
        user=schemas.AuthUser(
            id=student.id,
            role=models.UserRole.student,
            full_name=student.full_name,
            email=student.email,
            profile_id=student.id,
        ),
    )




# ── Teachers ──────────────────────────────────────────────────────────────────

@app.get("/api/teachers", response_model=List[schemas.TeacherOut], tags=["Teachers"])
def list_teachers(db: Session = Depends(get_db)):
    return db.query(models.Teacher).all()


@app.get("/api/teachers/{teacher_id}", response_model=schemas.TeacherOut, tags=["Teachers"])
def get_teacher(teacher_id: int, db: Session = Depends(get_db)):
    teacher = db.query(models.Teacher).filter(models.Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher


@app.get("/api/teacher/dashboard/{teacher_id}", response_model=schemas.TeacherDashboardStats, tags=["Teacher Dashboard"])
def get_teacher_dashboard(teacher_id: int, db: Session = Depends(get_db)):
    teacher = db.query(models.Teacher).filter(models.Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    courses = db.query(models.Course).filter(models.Course.teacher_id == teacher_id).all()
    courses_out = [
        schemas.CourseOut(
            id=c.id,
            code=c.code,
            name=c.name,
            department=c.department,
            teacher_id=c.teacher_id,
            teacher_name=teacher.full_name,
            created_at=c.created_at,
        )
        for c in courses
    ]

    course_ids = [c.id for c in courses]
    
    total_enrolled = (
        db.query(models.Enrollment.student_id)
        .filter(models.Enrollment.course_id.in_(course_ids))
        .distinct()
        .count()
        if course_ids else 0
    )

    students_at_risk = []
    for c in courses:
        enrollments = db.query(models.Enrollment).filter(models.Enrollment.course_id == c.id).all()
        for en in enrollments:
            student = en.student
            records = (
                db.query(models.AttendanceRecord)
                .filter(
                    models.AttendanceRecord.course_id == c.id,
                    models.AttendanceRecord.student_id == student.id,
                )
                .all()
            )
            total = len(records)
            if total > 0:
                attended = sum(1 for r in records if r.status == models.AttendanceStatus.present)
                pct = round((attended / total) * 100, 1)
                if pct < 75.0:
                    students_at_risk.append(
                        schemas.CriticalStudent(
                            student_id=student.id,
                            student_code=student.student_id,
                            full_name=student.full_name,
                            course_name=c.name,
                            course_code=c.code,
                            attended=attended,
                            total=total,
                            percentage=pct,
                        )
                    )

    notes_count = db.query(models.Note).filter(models.Note.teacher_id == teacher_id).count()
    upcoming_events = db.query(models.Event).filter(models.Event.event_date >= date.today()).count()

    return schemas.TeacherDashboardStats(
        courses_handled=len(courses),
        courses=courses_out,
        total_students=total_enrolled,
        students_at_risk=students_at_risk,
        notes_published_count=notes_count,
        upcoming_events_count=upcoming_events,
    )


# ── Courses ───────────────────────────────────────────────────────────────────

@app.get("/api/courses", response_model=List[schemas.CourseOut], tags=["Courses"])
def list_courses(teacher_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    q = db.query(models.Course)
    if teacher_id is not None:
        q = q.filter(models.Course.teacher_id == teacher_id)
    courses = q.order_by(models.Course.code.asc()).all()

    out = []
    for c in courses:
        teacher_name = c.teacher.full_name if c.teacher else None
        out.append(
            schemas.CourseOut(
                id=c.id,
                code=c.code,
                name=c.name,
                department=c.department,
                teacher_id=c.teacher_id,
                teacher_name=teacher_name,
                created_at=c.created_at,
            )
        )
    return out


@app.get("/api/courses/{course_id}/students", response_model=List[schemas.StudentOut], tags=["Courses"])
def list_course_students(course_id: int, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    enrollments = db.query(models.Enrollment).filter(models.Enrollment.course_id == course_id).all()
    return [en.student for en in enrollments]


# ── Attendance (Teacher records, Student views) ──────────────────────────────

@app.get("/api/attendance/student/{student_id}", response_model=List[schemas.StudentCourseAttendanceSummary], tags=["Attendance"])
def get_student_attendance(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    enrollments = db.query(models.Enrollment).filter(models.Enrollment.student_id == student_id).all()
    results = []

    for en in enrollments:
        course = en.course
        teacher_name = course.teacher.full_name if course.teacher else "Faculty"

        records = (
            db.query(models.AttendanceRecord)
            .filter(
                models.AttendanceRecord.student_id == student_id,
                models.AttendanceRecord.course_id == course.id,
            )
            .order_by(models.AttendanceRecord.date.desc())
            .all()
        )

        total = len(records)
        attended = sum(1 for r in records if r.status == models.AttendanceStatus.present)

        if total > 0:
            percentage = round((attended / total) * 100, 1)
        else:
            percentage = 100.0

        is_eligible = percentage >= 75.0

        if total > 0 and is_eligible:
            classes_can_miss = math.floor((attended - 0.75 * total) / 0.75)
            if classes_can_miss < 0:
                classes_can_miss = 0
            classes_needed = 0
        elif total > 0 and not is_eligible:
            classes_needed = math.ceil((0.75 * total - attended) / 0.25)
            if classes_needed < 0:
                classes_needed = 0
            classes_can_miss = 0
        else:
            classes_can_miss = 0
            classes_needed = 0

        summary_records = [
            schemas.AttendanceRecordSummary(
                id=r.id,
                date=r.date,
                status=r.status,
            )
            for r in records
        ]

        results.append(
            schemas.StudentCourseAttendanceSummary(
                course_id=course.id,
                course_code=course.code,
                course_name=course.name,
                teacher_name=teacher_name,
                attended=attended,
                total=total,
                percentage=percentage,
                is_eligible=is_eligible,
                classes_can_miss=classes_can_miss,
                classes_needed=classes_needed,
                records=summary_records,
            )
        )

    return results


@app.get("/api/attendance/course/{course_id}", response_model=List[schemas.AttendanceRecordOut], tags=["Attendance"])
def get_course_attendance(
    course_id: int,
    attendance_date: Optional[date] = Query(None, alias="date"),
    db: Session = Depends(get_db),
):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    q = db.query(models.AttendanceRecord).filter(models.AttendanceRecord.course_id == course_id)
    if attendance_date is not None:
        q = q.filter(models.AttendanceRecord.date == attendance_date)

    records = q.order_by(models.AttendanceRecord.date.desc()).all()
    out = []
    for r in records:
        out.append(
            schemas.AttendanceRecordOut(
                id=r.id,
                student_id=r.student_id,
                student_name=r.student.full_name,
                student_code=r.student.student_id,
                course_id=r.course_id,
                course_code=course.code,
                course_name=course.name,
                date=r.date,
                status=r.status,
            )
        )
    return out


@app.post("/api/attendance", response_model=List[schemas.AttendanceRecordOut], tags=["Attendance"])
def record_attendance(data: schemas.AttendanceBatchCreate, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == data.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    saved_records = []
    for item in data.records:
        existing = (
            db.query(models.AttendanceRecord)
            .filter(
                models.AttendanceRecord.student_id == item.student_id,
                models.AttendanceRecord.course_id == data.course_id,
                models.AttendanceRecord.date == data.date,
            )
            .first()
        )
        if existing:
            existing.status = item.status
            db.flush()
            saved_records.append(existing)
        else:
            new_rec = models.AttendanceRecord(
                student_id=item.student_id,
                course_id=data.course_id,
                date=data.date,
                status=item.status,
            )
            db.add(new_rec)
            db.flush()
            saved_records.append(new_rec)

    db.commit()

    out = []
    for r in saved_records:
        db.refresh(r)
        out.append(
            schemas.AttendanceRecordOut(
                id=r.id,
                student_id=r.student_id,
                student_name=r.student.full_name,
                student_code=r.student.student_id,
                course_id=r.course_id,
                course_code=course.code,
                course_name=course.name,
                date=r.date,
                status=r.status,
            )
        )
    return out


# ── Notes (Teacher Creates, Student Views) ───────────────────────────────────

@app.get("/api/notes", response_model=List[schemas.NoteOut], tags=["Notes"])
def list_notes(
    course_id: Optional[int] = Query(None),
    teacher_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(models.Note)
    if course_id is not None:
        q = q.filter(models.Note.course_id == course_id)
    if teacher_id is not None:
        q = q.filter(models.Note.teacher_id == teacher_id)
    if search:
        search_fmt = f"%{search}%"
        q = q.filter(
            or_(
                models.Note.title.ilike(search_fmt),
                models.Note.content.ilike(search_fmt),
            )
        )

    notes = q.order_by(models.Note.created_at.desc()).all()
    out = []
    for n in notes:
        out.append(
            schemas.NoteOut(
                id=n.id,
                teacher_id=n.teacher_id,
                teacher_name=n.teacher.full_name,
                course_id=n.course_id,
                course_code=n.course.code,
                course_name=n.course.name,
                title=n.title,
                content=n.content,
                resource_url=n.resource_url,
                created_at=n.created_at,
                updated_at=n.updated_at,
            )
        )
    return out


@app.post("/api/notes", response_model=schemas.NoteOut, status_code=201, tags=["Notes"])
def create_note(data: schemas.NoteCreate, db: Session = Depends(get_db)):
    teacher = db.query(models.Teacher).filter(models.Teacher.id == data.teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    course = db.query(models.Course).filter(models.Course.id == data.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    note = models.Note(
        teacher_id=data.teacher_id,
        course_id=data.course_id,
        title=data.title,
        content=data.content,
        resource_url=data.resource_url,
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    return schemas.NoteOut(
        id=note.id,
        teacher_id=teacher.id,
        teacher_name=teacher.full_name,
        course_id=course.id,
        course_code=course.code,
        course_name=course.name,
        title=note.title,
        content=note.content,
        resource_url=note.resource_url,
        created_at=note.created_at,
        updated_at=note.updated_at,
    )


@app.put("/api/notes/{note_id}", response_model=schemas.NoteOut, tags=["Notes"])
def update_note(note_id: int, data: schemas.NoteUpdate, db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    if data.title is not None:
        note.title = data.title
    if data.content is not None:
        note.content = data.content
    if data.resource_url is not None:
        note.resource_url = data.resource_url
    if data.course_id is not None:
        course = db.query(models.Course).filter(models.Course.id == data.course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        note.course_id = data.course_id

    note.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(note)

    return schemas.NoteOut(
        id=note.id,
        teacher_id=note.teacher.id,
        teacher_name=note.teacher.full_name,
        course_id=note.course.id,
        course_code=note.course.code,
        course_name=note.course.name,
        title=note.title,
        content=note.content,
        resource_url=note.resource_url,
        created_at=note.created_at,
        updated_at=note.updated_at,
    )


@app.delete("/api/notes/{note_id}", status_code=204, tags=["Notes"])
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()


# ── Student / Profile ─────────────────────────────────────────────────────────

@app.get("/api/students/{student_id}", response_model=schemas.StudentOut, tags=["Profile"])
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@app.get("/api/students", response_model=List[schemas.StudentOut], tags=["Profile"])
def list_students(db: Session = Depends(get_db)):
    return db.query(models.Student).order_by(models.Student.id.asc()).all()


@app.post("/api/students", response_model=schemas.StudentOut, status_code=201, tags=["Profile"])
def create_student(data: schemas.StudentCreate, db: Session = Depends(get_db)):
    if db.query(models.Student).filter(models.Student.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(models.Student).filter(models.Student.student_id == data.student_id).first():
        raise HTTPException(status_code=400, detail="Student ID already exists")
    student = models.Student(**data.model_dump())
    db.add(student)
    db.flush()

    courses = db.query(models.Course).all()
    for c in courses:
        db.add(models.Enrollment(student_id=student.id, course_id=c.id))

    db.commit()
    db.refresh(student)
    return student


@app.patch("/api/students/{student_id}", response_model=schemas.StudentOut, tags=["Profile"])
def update_student(student_id: int, data: schemas.StudentUpdate, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(student, field, value)
    student.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(student)
    return student


# ── Dashboard ─────────────────────────────────────────────────────────────────

@app.get("/api/dashboard/{student_id}", response_model=schemas.DashboardStats, tags=["Dashboard"])
def get_dashboard(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    today = date.today()
    week_end = today + timedelta(days=7)

    tasks_q = db.query(models.Task).filter(models.Task.student_id == student_id)
    total_tasks = tasks_q.count()
    pending = tasks_q.filter(models.Task.status == models.TaskStatus.pending).count()
    in_progress = tasks_q.filter(models.Task.status == models.TaskStatus.in_progress).count()
    completed = tasks_q.filter(models.Task.status == models.TaskStatus.completed).count()

    overdue = (
        db.query(models.Task)
        .filter(
            models.Task.student_id == student_id,
            models.Task.due_date < today,
            models.Task.status != models.TaskStatus.completed,
        )
        .count()
    )

    due_this_week = (
        db.query(models.Task)
        .filter(
            models.Task.student_id == student_id,
            models.Task.due_date >= today,
            models.Task.due_date <= week_end,
            models.Task.status != models.TaskStatus.completed,
        )
        .count()
    )

    upcoming_events = (
        db.query(models.Event).filter(models.Event.event_date >= today).count()
    )

    registered_events = (
        db.query(models.EventRegistration)
        .filter(models.EventRegistration.student_id == student_id)
        .count()
    )

    total_resources = db.query(models.Resource).count()

    records = db.query(models.AttendanceRecord).filter(models.AttendanceRecord.student_id == student_id).all()
    overall_attendance = 100.0
    low_courses = 0
    if records:
        attended = sum(1 for r in records if r.status == models.AttendanceStatus.present)
        overall_attendance = round((attended / len(records)) * 100, 1)

        enrollments = db.query(models.Enrollment).filter(models.Enrollment.student_id == student_id).all()
        for en in enrollments:
            course_recs = [r for r in records if r.course_id == en.course_id]
            if course_recs:
                c_att = sum(1 for r in course_recs if r.status == models.AttendanceStatus.present)
                if (c_att / len(course_recs)) < 0.75:
                    low_courses += 1

    return schemas.DashboardStats(
        total_tasks=total_tasks,
        pending_tasks=pending,
        in_progress_tasks=in_progress,
        completed_tasks=completed,
        overdue_tasks=overdue,
        upcoming_events=upcoming_events,
        registered_events=registered_events,
        total_resources=total_resources,
        tasks_due_this_week=due_this_week,
        overall_attendance=overall_attendance,
        low_attendance_courses=low_courses,
    )


# ── Tasks ─────────────────────────────────────────────────────────────────────

@app.get("/api/students/{student_id}/tasks", response_model=List[schemas.TaskOut], tags=["Tasks"])
def list_tasks(
    student_id: int,
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    subject: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(models.Task).filter(models.Task.student_id == student_id)
    if status:
        q = q.filter(models.Task.status == status)
    if priority:
        q = q.filter(models.Task.priority == priority)
    if subject:
        q = q.filter(models.Task.subject.ilike(f"%{subject}%"))
    return q.order_by(models.Task.due_date.asc().nullslast(), models.Task.created_at.desc()).all()


@app.post("/api/students/{student_id}/tasks", response_model=schemas.TaskOut, status_code=201, tags=["Tasks"])
def create_task(student_id: int, data: schemas.TaskCreate, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    task = models.Task(student_id=student_id, **data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@app.get("/api/tasks/{task_id}", response_model=schemas.TaskOut, tags=["Tasks"])
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.patch("/api/tasks/{task_id}", response_model=schemas.TaskOut, tags=["Tasks"])
def update_task(task_id: int, data: schemas.TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task


@app.delete("/api/tasks/{task_id}", status_code=204, tags=["Tasks"])
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()


# ── Events (Teacher Creates/Manages, Student Views & Registers) ───────────────

@app.get("/api/events", response_model=List[schemas.EventOut], tags=["Events"])
def list_events(
    student_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    upcoming: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(models.Event)
    if category:
        q = q.filter(models.Event.category == category)
    if upcoming:
        q = q.filter(models.Event.event_date >= date.today())
    events = q.order_by(models.Event.event_date.asc()).all()

    result = []
    for event in events:
        reg_count = len(event.registrations)
        is_registered = False
        if student_id:
            is_registered = any(r.student_id == student_id for r in event.registrations)
        out = schemas.EventOut.model_validate(event)
        out.registration_count = reg_count
        out.is_registered = is_registered
        result.append(out)
    return result


@app.get("/api/events/{event_id}", response_model=schemas.EventOut, tags=["Events"])
def get_event(event_id: int, student_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    reg_count = len(event.registrations)
    is_registered = False
    if student_id:
        is_registered = any(r.student_id == student_id for r in event.registrations)
    out = schemas.EventOut.model_validate(event)
    out.registration_count = reg_count
    out.is_registered = is_registered
    return out


@app.post("/api/events", response_model=schemas.EventOut, status_code=201, tags=["Events"])
def create_event(data: schemas.EventCreate, db: Session = Depends(get_db)):
    event = models.Event(**data.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    out = schemas.EventOut.model_validate(event)
    out.registration_count = 0
    out.is_registered = False
    return out


@app.put("/api/events/{event_id}", response_model=schemas.EventOut, tags=["Events"])
def update_event(event_id: int, data: schemas.EventUpdate, db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(event, field, value)
    db.commit()
    db.refresh(event)
    out = schemas.EventOut.model_validate(event)
    out.registration_count = len(event.registrations)
    return out


@app.delete("/api/events/{event_id}", status_code=204, tags=["Events"])
def delete_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()


@app.post("/api/events/{event_id}/register", response_model=schemas.RegistrationOut, status_code=201, tags=["Events"])
def register_event(event_id: int, data: schemas.RegistrationCreate, db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if event.capacity and len(event.registrations) >= event.capacity:
        raise HTTPException(status_code=400, detail="Event is at full capacity")

    existing = (
        db.query(models.EventRegistration)
        .filter(
            models.EventRegistration.event_id == event_id,
            models.EventRegistration.student_id == data.student_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already registered for this event")

    reg = models.EventRegistration(event_id=event_id, student_id=data.student_id)
    db.add(reg)
    db.commit()
    db.refresh(reg)
    return reg


@app.delete("/api/events/{event_id}/register/{student_id}", status_code=204, tags=["Events"])
def unregister_event(event_id: int, student_id: int, db: Session = Depends(get_db)):
    reg = (
        db.query(models.EventRegistration)
        .filter(
            models.EventRegistration.event_id == event_id,
            models.EventRegistration.student_id == student_id,
        )
        .first()
    )
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
    db.delete(reg)
    db.commit()


# ── Student Personal Study Resources (Private to Student) ─────────────────────

@app.get("/api/me/resources", response_model=List[schemas.PersonalResourceOut], tags=["Personal Resources"])
def list_my_personal_resources(
    subject: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    session: models.UserSession = Depends(_require_student),
    db: Session = Depends(get_db),
):
    """List personal study resources owned exclusively by the authenticated student.
    Teachers receive 403 Forbidden. Other students cannot see these.
    """
    q = db.query(models.PersonalResource).filter(models.PersonalResource.student_id == session.student_id)
    if subject:
        q = q.filter(models.PersonalResource.subject.ilike(f"%{subject}%"))
    if resource_type:
        q = q.filter(models.PersonalResource.resource_type == resource_type)
    if search:
        s_fmt = f"%{search}%"
        q = q.filter(
            or_(
                models.PersonalResource.title.ilike(s_fmt),
                models.PersonalResource.description.ilike(s_fmt),
                models.PersonalResource.subject.ilike(s_fmt),
            )
        )
    return q.order_by(models.PersonalResource.created_at.desc()).all()


@app.post("/api/me/resources", response_model=schemas.PersonalResourceOut, status_code=201, tags=["Personal Resources"])
def create_my_personal_resource(
    data: schemas.PersonalResourceCreate,
    session: models.UserSession = Depends(_require_student),
    db: Session = Depends(get_db),
):
    """Create a private personal study resource for the authenticated student.
    Teacher role cannot call this (403). Student identity derived from auth token.
    """
    res = models.PersonalResource(
        student_id=session.student_id,
        title=data.title,
        subject=data.subject,
        resource_type=data.resource_type,
        description=data.description,
        url=data.url,
    )
    db.add(res)
    db.commit()
    db.refresh(res)
    return res


@app.get("/api/me/resources/{resource_id}", response_model=schemas.PersonalResourceOut, tags=["Personal Resources"])
def get_my_personal_resource(
    resource_id: int,
    session: models.UserSession = Depends(_require_student),
    db: Session = Depends(get_db),
):
    """Retrieve a single personal resource. Verifies that the authenticated student is the owner."""
    res = db.query(models.PersonalResource).filter(models.PersonalResource.id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Personal resource not found")
    if res.student_id != session.student_id:
        raise HTTPException(status_code=403, detail="Forbidden — you do not own this personal resource")
    return res


@app.put("/api/me/resources/{resource_id}", response_model=schemas.PersonalResourceOut, tags=["Personal Resources"])
def update_my_personal_resource(
    resource_id: int,
    data: schemas.PersonalResourceUpdate,
    session: models.UserSession = Depends(_require_student),
    db: Session = Depends(get_db),
):
    """Update a personal resource. Only the owner student can update."""
    res = db.query(models.PersonalResource).filter(models.PersonalResource.id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Personal resource not found")
    if res.student_id != session.student_id:
        raise HTTPException(status_code=403, detail="Forbidden — you do not own this personal resource")
    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(res, field, val)
    res.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(res)
    return res


@app.delete("/api/me/resources/{resource_id}", status_code=204, tags=["Personal Resources"])
def delete_my_personal_resource(
    resource_id: int,
    session: models.UserSession = Depends(_require_student),
    db: Session = Depends(get_db),
):
    """Delete a personal resource. Only the owner student can delete."""
    res = db.query(models.PersonalResource).filter(models.PersonalResource.id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Personal resource not found")
    if res.student_id != session.student_id:
        raise HTTPException(status_code=403, detail="Forbidden — you do not own this personal resource")
    db.delete(res)
    db.commit()


# ── Faculty Shared Resources (Teacher Managed / Student Read-Only) ────────────

@app.get("/api/faculty-resources", response_model=List[schemas.FacultyResourceOut], tags=["Faculty Resources"])
def list_faculty_resources(
    course_id: Optional[int] = Query(None),
    teacher_id: Optional[int] = Query(None),
    resource_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    session: models.UserSession = Depends(_get_session),
    db: Session = Depends(get_db),
):
    """List faculty-published resources. Open for both students and teachers to view."""
    q = db.query(models.FacultyResource)
    if course_id is not None:
        q = q.filter(models.FacultyResource.course_id == course_id)
    if teacher_id is not None:
        q = q.filter(models.FacultyResource.teacher_id == teacher_id)
    if resource_type:
        q = q.filter(models.FacultyResource.resource_type == resource_type)
    if search:
        s_fmt = f"%{search}%"
        q = q.filter(
            or_(
                models.FacultyResource.title.ilike(s_fmt),
                models.FacultyResource.description.ilike(s_fmt),
            )
        )
    items = q.order_by(models.FacultyResource.created_at.desc()).all()
    results = []
    for item in items:
        results.append(
            schemas.FacultyResourceOut(
                id=item.id,
                teacher_id=item.teacher_id,
                teacher_name=item.teacher.full_name if item.teacher else None,
                course_id=item.course_id,
                course_code=item.course.code if item.course else None,
                course_name=item.course.name if item.course else None,
                title=item.title,
                resource_type=item.resource_type,
                description=item.description,
                url=item.url,
                created_at=item.created_at,
                updated_at=item.updated_at,
            )
        )
    return results


@app.post("/api/faculty-resources", response_model=schemas.FacultyResourceOut, status_code=201, tags=["Faculty Resources"])
def create_faculty_resource(
    data: schemas.FacultyResourceCreate,
    session: models.UserSession = Depends(_require_teacher),
    db: Session = Depends(get_db),
):
    """Publish a new faculty resource. Only authenticated faculty can create.
    Teacher ID is derived from the auth session token, not client payload.
    """
    res = models.FacultyResource(
        teacher_id=session.teacher_id,
        course_id=data.course_id,
        title=data.title,
        resource_type=data.resource_type,
        description=data.description,
        url=data.url,
    )
    db.add(res)
    db.commit()
    db.refresh(res)
    return schemas.FacultyResourceOut(
        id=res.id,
        teacher_id=res.teacher_id,
        teacher_name=res.teacher.full_name if res.teacher else None,
        course_id=res.course_id,
        course_code=res.course.code if res.course else None,
        course_name=res.course.name if res.course else None,
        title=res.title,
        resource_type=res.resource_type,
        description=res.description,
        url=res.url,
        created_at=res.created_at,
        updated_at=res.updated_at,
    )


@app.get("/api/faculty-resources/{resource_id}", response_model=schemas.FacultyResourceOut, tags=["Faculty Resources"])
def get_faculty_resource(
    resource_id: int,
    session: models.UserSession = Depends(_get_session),
    db: Session = Depends(get_db),
):
    """Retrieve details for a single faculty resource."""
    res = db.query(models.FacultyResource).filter(models.FacultyResource.id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Faculty resource not found")
    return schemas.FacultyResourceOut(
        id=res.id,
        teacher_id=res.teacher_id,
        teacher_name=res.teacher.full_name if res.teacher else None,
        course_id=res.course_id,
        course_code=res.course.code if res.course else None,
        course_name=res.course.name if res.course else None,
        title=res.title,
        resource_type=res.resource_type,
        description=res.description,
        url=res.url,
        created_at=res.created_at,
        updated_at=res.updated_at,
    )


@app.put("/api/faculty-resources/{resource_id}", response_model=schemas.FacultyResourceOut, tags=["Faculty Resources"])
def update_faculty_resource(
    resource_id: int,
    data: schemas.FacultyResourceUpdate,
    session: models.UserSession = Depends(_require_teacher),
    db: Session = Depends(get_db),
):
    """Update a faculty resource. Students get 403 Forbidden.
    Teachers can only edit resources that they created.
    """
    res = db.query(models.FacultyResource).filter(models.FacultyResource.id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Faculty resource not found")
    if res.teacher_id != session.teacher_id:
        raise HTTPException(status_code=403, detail="Forbidden — you can only edit faculty resources that you created")
    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(res, field, val)
    res.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(res)
    return schemas.FacultyResourceOut(
        id=res.id,
        teacher_id=res.teacher_id,
        teacher_name=res.teacher.full_name if res.teacher else None,
        course_id=res.course_id,
        course_code=res.course.code if res.course else None,
        course_name=res.course.name if res.course else None,
        title=res.title,
        resource_type=res.resource_type,
        description=res.description,
        url=res.url,
        created_at=res.created_at,
        updated_at=res.updated_at,
    )


@app.delete("/api/faculty-resources/{resource_id}", status_code=204, tags=["Faculty Resources"])
def delete_faculty_resource(
    resource_id: int,
    session: models.UserSession = Depends(_require_teacher),
    db: Session = Depends(get_db),
):
    """Delete a faculty resource. Students get 403 Forbidden.
    Teachers can only delete resources that they created.
    """
    res = db.query(models.FacultyResource).filter(models.FacultyResource.id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Faculty resource not found")
    if res.teacher_id != session.teacher_id:
        raise HTTPException(status_code=403, detail="Forbidden — you can only delete faculty resources that you created")
    db.delete(res)
    db.commit()


# Backward compatibility for legacy calls
@app.get("/api/resources", response_model=List[schemas.FacultyResourceOut], tags=["Resources"])
def list_resources_legacy(
    course_id: Optional[int] = Query(None),
    resource_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    session: models.UserSession = Depends(_get_session),
    db: Session = Depends(get_db),
):
    return list_faculty_resources(course_id=course_id, resource_type=resource_type, search=search, session=session, db=db)

