"""
Seed data for CampusHub — realistic demonstration academic data for Student & Teacher portal.
Default student: Alex Johnson (STU-2024-001)
Default password for ALL seeded accounts: campus123
"""
import hashlib
from datetime import date, timedelta, datetime
from sqlalchemy.orm import Session
from models import (
    Teacher, Student, Course, Enrollment, AttendanceRecord,
    Note, Resource, FacultyResource, PersonalResource, Task, Event, EventRegistration,
    TaskStatus, TaskPriority, ResourceType, AttendanceStatus
)


def _hash_password(password: str) -> str:
    """Simple SHA-256 hash for demo purposes."""
    return hashlib.sha256(password.encode()).hexdigest()


_DEFAULT_PASSWORD = _hash_password("campus123")


def seed_database(db: Session) -> None:
    """Insert clean demonstration data if the database is unseeded."""
    if db.query(Student).count() > 0:
        return

    today = date.today()

    # ── 1. Teachers ────────────────────────────────────────────────────────────
    teachers = [
        Teacher(
            teacher_id="T001",
            full_name="Dr. K. Sharma",
            email="sharma@university.edu",
            password_hash=_DEFAULT_PASSWORD,
            department="Computer Science",
            designation="Professor & HOD",
            bio="Head of Computer Science Dept. Specializes in Operating Systems and Distributed Computing.",
        ),
        Teacher(
            teacher_id="T002",
            full_name="Prof. Priya Nair",
            email="priya.nair@university.edu",
            password_hash=_DEFAULT_PASSWORD,
            department="Computer Science",
            designation="Assistant Professor",
            bio="Faculty in Database Systems, Data Engineering, and Algorithm Design.",
        ),
    ]
    db.add_all(teachers)
    db.flush()

    # ── 2. Students (Alex Johnson as primary) ──────────────────────────────────
    alex = Student(
        student_id="STU-2024-001",
        full_name="Alex Johnson",
        email="alex.johnson@university.edu",
        password_hash=_DEFAULT_PASSWORD,
        department="Computer Science",
        year=2,
        semester=4,
        bio="Second-year CS student interested in software engineering and data structures.",
        phone="+1 (555) 012-3456",
        address="123 Campus Drive, University Town, ST 00001",
    )

    other_students = [
        Student(
            student_id="ST002",
            full_name="Ananya Reddy",
            email="ananya.reddy@university.edu",
            password_hash=_DEFAULT_PASSWORD,
            department="Computer Science",
            year=2,
            semester=4,
            bio="Interested in Machine Learning and Full-Stack Web Development.",
            phone="+91 98765 43211",
            address="University Enclave, Flat 201",
        ),
        Student(
            student_id="ST003",
            full_name="Rahul Kumar",
            email="rahul.kumar@university.edu",
            password_hash=_DEFAULT_PASSWORD,
            department="Computer Science",
            year=2,
            semester=4,
            bio="Focusing on Database Management, Cloud Platforms, and Open Source.",
            phone="+91 98765 43212",
            address="Campus Hostel Block A, Room 112",
        ),
        Student(
            student_id="ST004",
            full_name="Sneha Rao",
            email="sneha.rao@university.edu",
            password_hash=_DEFAULT_PASSWORD,
            department="Computer Science",
            year=2,
            semester=4,
            bio="Passionate about Computer Networks, Cyber Security, and Hackathons.",
            phone="+91 98765 43213",
            address="North Campus Hall, Room 408",
        ),
        Student(
            student_id="ST005",
            full_name="Arjun Reddy",
            email="arjun.reddy@university.edu",
            password_hash=_DEFAULT_PASSWORD,
            department="Computer Science",
            year=2,
            semester=4,
            bio="Enthusiastic about Algorithms, Mobile Apps, and Robotics Club.",
            phone="+91 98765 43214",
            address="Campus Hostel Block C, Room 215",
        ),
    ]
    all_students = [alex] + other_students
    db.add_all(all_students)
    db.flush()

    # ── 3. Courses ────────────────────────────────────────────────────────────
    courses = [
        Course(
            code="CS301",
            name="Operating Systems",
            department="Computer Science",
            teacher_id=teachers[0].id,
        ),
        Course(
            code="CS302",
            name="Database Management Systems",
            department="Computer Science",
            teacher_id=teachers[1].id,
        ),
        Course(
            code="CS303",
            name="Computer Networks",
            department="Computer Science",
            teacher_id=teachers[0].id,
        ),
        Course(
            code="CS304",
            name="Design & Analysis of Algorithms",
            department="Computer Science",
            teacher_id=teachers[1].id,
        ),
        Course(
            code="CS305L",
            name="Operating Systems Lab",
            department="Computer Science",
            teacher_id=teachers[0].id,
        ),
        Course(
            code="MA201",
            name="Discrete Mathematics",
            department="Mathematics",
            teacher_id=teachers[1].id,
        ),
    ]
    db.add_all(courses)
    db.flush()

    # ── 4. Enrollments ────────────────────────────────────────────────────────
    enrollments = []
    for c in courses:
        for s in all_students:
            enrollments.append(Enrollment(student_id=s.id, course_id=c.id))
    db.add_all(enrollments)
    db.flush()

    # ── 5. Attendance Records ─────────────────────────────────────────────────
    # Generates realistic past class dates and records matching:
    # CS301: 26/30 attended (86.7%)
    # CS302: 22/28 attended (78.6%)
    # CS303: 18/25 attended (72.0%) -> Critical (<75%)
    # CS304: 25/26 attended (96.2%)
    # CS305L: 11/12 attended (91.7%)
    # MA201: 15/22 attended (68.2%) -> Critical (<75%)
    course_specs = [
        (courses[0], 30, 26),
        (courses[1], 28, 22),
        (courses[2], 25, 18),
        (courses[3], 26, 25),
        (courses[4], 12, 11),
        (courses[5], 22, 15),
    ]

    attendance_records = []
    for course, total_sessions, attended_sessions in course_specs:
        absent_count = total_sessions - attended_sessions
        # Distribute absent days evenly
        absent_indices = set([int(i * (total_sessions / (absent_count + 1))) for i in range(1, absent_count + 1)]) if absent_count > 0 else set()
        
        session_dates = []
        d = today - timedelta(days=1)
        while len(session_dates) < total_sessions:
            if d.weekday() < 5:  # Monday to Friday
                session_dates.append(d)
            d -= timedelta(days=1)
        session_dates.sort()

        for idx, s_date in enumerate(session_dates):
            # Alex Johnson
            alex_status = AttendanceStatus.absent if idx in absent_indices else AttendanceStatus.present
            attendance_records.append(
                AttendanceRecord(student_id=alex.id, course_id=course.id, date=s_date, status=alex_status)
            )
            # Other students
            for s in other_students:
                s_status = AttendanceStatus.present if (idx + s.id) % 6 != 0 else AttendanceStatus.absent
                attendance_records.append(
                    AttendanceRecord(student_id=s.id, course_id=course.id, date=s_date, status=s_status)
                )

    db.add_all(attendance_records)

    # ── 6. Notes (Teacher-Created) ────────────────────────────────────────────
    notes = [
        Note(
            teacher_id=teachers[0].id,
            course_id=courses[0].id,
            title="Process Synchronization & Semaphores — Revision Notes",
            content="Detailed summary of Critical Section Problem, Peterson's Algorithm, Hardware Instructions (TestAndSet, Swap), Counting & Binary Semaphores, Classical Sync Problems (Producer-Consumer, Dining Philosophers).",
            resource_url="https://en.wikipedia.org/wiki/Semaphore_(programming)",
            created_at=datetime.utcnow() - timedelta(days=2),
        ),
        Note(
            teacher_id=teachers[1].id,
            course_id=courses[1].id,
            title="Database Normalization Quick Notes (1NF to BCNF)",
            content="Summary sheet covering Functional Dependencies, Closure of Attribute Sets, Canonical Cover, 1NF (atomic values), 2NF (no partial dependency), 3NF (no transitive dependency), and Boyce-Codd Normal Form with decomposition examples.",
            resource_url="https://en.wikipedia.org/wiki/Database_normalization",
            created_at=datetime.utcnow() - timedelta(days=4),
        ),
        Note(
            teacher_id=teachers[0].id,
            course_id=courses[2].id,
            title="OSI Model & TCP/IP Protocol Suite",
            content="Comprehensive reference of all 7 layers of the OSI model: Physical, Data Link, Network, Transport, Session, Presentation, Application. Packet encapsulation, MAC vs IP addressing, and TCP 3-way handshake.",
            resource_url="https://en.wikipedia.org/wiki/OSI_model",
            created_at=datetime.utcnow() - timedelta(days=6),
        ),
        Note(
            teacher_id=teachers[1].id,
            course_id=courses[3].id,
            title="Dynamic Programming Memoization Guide",
            content="Techniques for identifying optimal substructure and overlapping subproblems. Includes code walkthrough for 0/1 Knapsack, Longest Common Subsequence (LCS), and Matrix Chain Multiplication.",
            resource_url="https://en.wikipedia.org/wiki/Dynamic_programming",
            created_at=datetime.utcnow() - timedelta(days=8),
        ),
    ]
    db.add_all(notes)

    # ── 7. Alex Johnson's Original Tasks ──────────────────────────────────────
    tasks = [
        Task(
            student_id=alex.id,
            title="Physics Lab Experiment",
            description="Conduct and record observations for the optics experiment.",
            subject="PHY201 - Physics II",
            due_date=today - timedelta(days=5),
            status=TaskStatus.completed,
            priority=TaskPriority.medium,
        ),
        Task(
            student_id=alex.id,
            title="Operating Systems Lab Report",
            description="Document the process scheduling experiment results.",
            subject="CS402 - Operating Systems",
            due_date=today - timedelta(days=2),
            status=TaskStatus.completed,
            priority=TaskPriority.high,
        ),
        Task(
            student_id=alex.id,
            title="Data Structures Assignment 3",
            description="Implement a binary search tree with insert, delete, and search operations.",
            subject="CS301 - Data Structures",
            due_date=today + timedelta(days=3),
            status=TaskStatus.in_progress,
            priority=TaskPriority.high,
        ),
        Task(
            student_id=alex.id,
            title="Calculus Problem Set 5",
            description="Complete problems 1–20 from Chapter 8 on integration techniques.",
            subject="MATH201 - Calculus II",
            due_date=today + timedelta(days=6),
            status=TaskStatus.pending,
            priority=TaskPriority.medium,
        ),
        Task(
            student_id=alex.id,
            title="Technical Writing Essay",
            description="Write a 1500-word essay on the impact of open-source software.",
            subject="ENG102 - Technical Writing",
            due_date=today + timedelta(days=10),
            status=TaskStatus.pending,
            priority=TaskPriority.low,
        ),
        Task(
            student_id=alex.id,
            title="Database Design Project",
            description="Design an ER diagram and schema for the hospital management system case study.",
            subject="CS315 - Database Systems",
            due_date=today + timedelta(days=14),
            status=TaskStatus.pending,
            priority=TaskPriority.medium,
        ),
    ]
    db.add_all(tasks)

    # ── 8. Events ─────────────────────────────────────────────────────────────
    events = [
        Event(
            title="Library Orientation for New Students",
            description="Learn how to access digital journals, databases, and reserve study rooms.",
            location="Central Library",
            event_date=today + timedelta(days=1),
            event_time="11:30 AM",
            category="Academic",
            capacity=60,
            organizer="Library Services",
            created_by="Faculty Board",
        ),
        Event(
            title="Semester Opening Assembly",
            description="Welcome address by the Dean of Students and introduction to semester activities.",
            location="Main Auditorium",
            event_date=today + timedelta(days=4),
            event_time="10:00 AM",
            category="Academic",
            capacity=500,
            organizer="Dean of Students Office",
            created_by="Dean Office",
        ),
        Event(
            title="Workshop: Introduction to Machine Learning",
            description="Hands-on workshop covering supervised learning basics using Python and scikit-learn.",
            location="CS Lab 3",
            event_date=today + timedelta(days=7),
            event_time="02:00 PM",
            category="Workshop",
            capacity=40,
            organizer="Data Science Club",
            created_by="Prof. Priya Nair",
        ),
        Event(
            title="CS Department Hackathon",
            description="A 24-hour hackathon open to all CS students. Form teams of 2–4 and build a working project.",
            location="Engineering Block, Room 204",
            event_date=today + timedelta(days=12),
            event_time="09:00 AM",
            category="Technical",
            capacity=80,
            organizer="CS Student Association",
            created_by="Dr. K. Sharma",
        ),
        Event(
            title="Inter-College Debate Competition",
            description="Regional debate on technology and society. Open registration.",
            location="Seminar Hall B",
            event_date=today + timedelta(days=15),
            event_time="03:00 PM",
            category="Cultural",
            capacity=200,
            organizer="Literary Society",
            created_by="Faculty Board",
        ),
        Event(
            title="Career Fair — Technology & Engineering",
            description="Meet recruiters from 30+ companies. Bring your resume and dress professionally.",
            location="University Sports Hall",
            event_date=today + timedelta(days=20),
            event_time="11:00 AM",
            category="Career",
            capacity=400,
            organizer="Placement Cell",
            created_by="Placement Cell",
        ),
    ]
    db.add_all(events)
    db.flush()

    # Pre-register Alex for orientation & workshop
    db.add(EventRegistration(event_id=events[0].id, student_id=alex.id))
    db.add(EventRegistration(event_id=events[2].id, student_id=alex.id))

    # ── 9. Faculty Shared Resources (Published by Teachers) ───────────────────
    faculty_resources = [
        FacultyResource(
            teacher_id=teachers[0].id,
            course_id=courses[0].id,
            title="Operating Systems — Process Scheduling Reference",
            description="Comprehensive guide covering CPU scheduling algorithms (FCFS, SJF, RR, Priority), process state transitions, and context switching overhead.",
            resource_type=ResourceType.link,
            url="https://en.wikipedia.org/wiki/Scheduling_(computing)",
        ),
        FacultyResource(
            teacher_id=teachers[1].id,
            course_id=courses[1].id,
            title="Database Indexing & B-Trees Guide",
            description="Technical documentation on B-Tree and B+ Tree structures, clustered vs non-clustered indexes, and query performance tuning in relational databases.",
            resource_type=ResourceType.document,
            url="https://en.wikipedia.org/wiki/B-tree",
        ),
        FacultyResource(
            teacher_id=teachers[1].id,
            course_id=courses[3].id,
            title="MIT OpenCourseWare — Algorithms",
            description="Official lecture notes, video recordings, and problem sets from MIT 6.006 Introduction to Algorithms.",
            resource_type=ResourceType.link,
            url="https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/",
        ),
        FacultyResource(
            teacher_id=teachers[0].id,
            course_id=courses[2].id,
            title="Computer Networking TCP/IP Guide",
            description="Reference architecture for the TCP/IP stack, subnetting, CIDR notation, and Wireshark packet capture walkthroughs.",
            resource_type=ResourceType.link,
            url="https://www.ietf.org/rfc/rfc793.txt",
        ),
    ]
    db.add_all(faculty_resources)

    # ── 10. Student Personal Study Resources (Private to Alex Johnson) ─────────
    personal_resources = [
        PersonalResource(
            student_id=alex.id,
            title="My Python Practice",
            subject="Python / LeetCode",
            resource_type=ResourceType.link,
            description="Personal dynamic programming, sliding window, and two-pointer problem collection for interview preparation.",
            url="https://leetcode.com/problemset/all/",
        ),
        PersonalResource(
            student_id=alex.id,
            title="BST Implementation Notes",
            subject="CS301 - Data Structures",
            resource_type=ResourceType.note,
            description="Personal notes on binary search tree implementation patterns, balancing, and recursive deletion edge cases.",
            url="https://en.wikipedia.org/wiki/Binary_search_tree",
        ),
        PersonalResource(
            student_id=alex.id,
            title="Calculus Integration Techniques Summary",
            subject="MATH201 - Calculus II",
            resource_type=ResourceType.note,
            description="Quick reference cheat sheet covering u-substitution, integration by parts, and partial fraction decomposition.",
            url="https://en.wikipedia.org/wiki/Integration_by_parts",
        ),
        PersonalResource(
            student_id=alex.id,
            title="Web Development Documentation",
            subject="Personal Projects",
            resource_type=ResourceType.link,
            description="MDN web documentation on React hooks, async patterns, and modern JavaScript syntax.",
            url="https://developer.mozilla.org",
        ),
    ]
    db.add_all(personal_resources)

    db.commit()
    print("[OK] Demonstration data seeded successfully with separated Faculty & Personal Resources.")
