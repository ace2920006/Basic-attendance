# Multi-Role Attendance System - Requirements & Features Specification

This document details the functional specifications, feature requirements, and access control matrix for the **Attendance System**.

---

## 👥 User Roles & Features Breakdown

### 1. 🎓 Student Module
- **Authentication**:
  - Register new account (with Roll Number, Department, Semester validation).
  - Secure Login (JWT token authentication).
- **Attendance Overview**:
  - Real-time overall attendance percentage indicator.
  - Course/Subject-wise attendance breakdown (Present, Absent, Late count & percentages).
- **Timetable View**:
  - Daily & weekly class schedules with room numbers, subject names, and teacher details.
- **Leave Request Management**:
  - Submit leave applications specifying date range, leave reason, and supporting documents/notes.
  - Track leave application status (`Pending`, `Approved`, `Rejected`) with admin/teacher review comments.
- **Notifications & Alerts**:
  - Automated alerts for low attendance thresholds (e.g., below 75%).
  - Notifications when attendance is marked, or leave request status changes.
- **Attendance History**:
  - Detailed chronological log of attendance entries with filtering by subject, date range, and status.

---

### 2. 👩‍🏫 Teacher Module
- **Authentication**:
  - Secure Login using assigned Employee Credentials.
- **Class & Schedule Management**:
  - View assigned classes and daily schedule.
  - Create/configure class sessions (Select Subject, Section, Room Number, Time Slot).
- **Attendance Operations**:
  - Interactive Attendance Marker (Mark Present, Absent, Late, or Excused).
  - Auto-flag late arrivals based on set start time thresholds.
  - Edit previously recorded attendance entries within permitted modification windows.
- **Reports & Analytics**:
  - View subject-wise and class-wise attendance summaries.
  - Highlighting students with critical absence records.
  - Export attendance reports in CSV/Excel formats.

---

### 3. 🛡️ Admin Module
- **User Management**:
  - **Add/Manage Students**: Import/Export students in bulk via CSV, edit profiles, assign to departments/semesters.
  - **Add/Manage Teachers**: Create teacher accounts, assign departments and qualifications.
- **Academic Structure Management**:
  - **Departments**: Add, edit, remove academic departments (e.g., Computer Science, Electrical Eng).
  - **Semesters**: Configure active academic semesters and academic years.
  - **Subjects**: Add subjects, map subjects to departments, semesters, and credits.
  - **Classes**: Map subjects and teachers to class sections and schedules.
- **Executive Dashboard**:
  - System-wide statistics: total students, teachers, departments, active classes.
  - Institution-wide average attendance rates and trend visualization.
  - Leave request approval overview and emergency notification broadcasts.

---

## 🔐 Access Control Matrix (RBAC)

| Feature / Resource | Student | Teacher | Admin |
| :--- | :---: | :---: | :---: |
| **User Management (Create/Edit Users)** | ❌ | ❌ | ✅ |
| **Manage Depts, Semesters, Subjects** | ❌ | ❌ | ✅ |
| **Create & Assign Classes** | ❌ | ✅ | ✅ |
| **Mark & Edit Attendance** | ❌ | ✅ | ✅ |
| **Export Class Attendance Reports** | ❌ | ✅ | ✅ |
| **Submit Leave Request** | ✅ | ❌ | ❌ |
| **Review / Approve Leave Request** | ❌ | ✅ | ✅ |
| **View Personal Attendance & Timetable** | ✅ | ❌ | ❌ |
| **View System Analytics Dashboard** | ❌ | ❌ | ✅ |
| **Receive Notifications** | ✅ | ✅ | ✅ |

---

## 🎨 System Non-Functional Requirements
1. **Security**: Password hashing using `bcrypt`, stateless session management using signed `JWT` tokens.
2. **Performance**: Fast API response times (< 100ms for attendance marking queries).
3. **Data Integrity**: Database constraints enforcing foreign key references, uniqueness for roll numbers and employee codes, and indexed attendance queries.
4. **Responsiveness**: Modern, responsive user interface adapted for mobile, tablet, and desktop viewports.
