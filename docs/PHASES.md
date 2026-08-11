# Attendance Management System - Consolidated Phases Specification

This document provides a single, unified reference for all project implementation phases (**Phase 1 through Phase 5**) of the **Attendance Management System**.

---

## 📋 Table of Contents
1. [Phase 1 – Project Setup & Authentication Module](#-phase-1--project-setup--authentication-module)
2. [Phase 2 – Database & Core Architecture Module](#-phase-2--database--core-architecture-module)
3. [Phase 3 – Student Module](#-phase-3--student-module)
4. [Phase 4 – Teacher Module](#-phase-4--teacher-module)
5. [Phase 5 – Admin Module](#-phase-5--admin-module)

---

## 📌 Phase 1 – Project Setup & Authentication Module

### Core Requirements & Features
- **Tech Stack Setup**: Node.js + Express backend REST API and React + Vite frontend application.
- **Design System & UI**: Modern glassmorphism dark-mode UI with custom gradients, cohesive typography, responsive sidebar/header layouts, and clean animations.
- **Authentication Workflows**:
  - User Registration (`/api/auth/register`) with role selection (`student`, `teacher`, `admin`).
  - User Login (`/api/auth/login`) with `bcrypt` password verification and JWT token issuance.
  - Refresh Token (`/api/auth/refresh`) for seamless session persistence.
  - Password Recovery (`/api/auth/forgotpassword` & `/api/auth/resetpassword/:token`).
- **Role-Based Access Control (RBAC)**:
  - Route guards on frontend (`ProtectedRoute.jsx`) and backend authorization middleware (`authMiddleware.js`).
  - Automatic redirection based on user role (`/student`, `/teacher`, `/admin`).

### File Mapping
- Frontend Auth Pages: `client/src/pages/auth/LoginPage.jsx`, `RegisterPage.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx`
- Auth Context: `client/src/context/AuthContext.jsx`
- Backend Auth Controller: `server/src/controllers/authController.js`
- Backend Auth Middleware: `server/src/middleware/authMiddleware.js`

---

## 📌 Phase 2 – Database & Core Architecture Module

### Core Requirements & Features
- **Database Connection**: MongoDB connection via Mongoose driver (`server/src/config/db.js`).
- **Data Models**:
  - `User`: Handles account identity, password hash, role (`student` | `teacher` | `admin`), roll number, designation, department, course, semester, and assigned subjects array.
  - `Department`: Code, name, HOD name, total student count, total teacher count, average attendance rate.
  - `Course`: Program code, course title, department affiliation, duration in years, total semesters, description.
  - `Subject`: Subject code, name, department, course, assigned instructor, total classes count, theme color, enrolled students array.
  - `Attendance`: Student reference, subject name, subject code, timestamp date, status (`Present` | `Absent` | `Late`), arrival time, departure time, notes, markedBy user reference.
  - `Notification`: User reference, alert title, message content, status (`Read` | `Unread`), notification type.
- **API Server Infrastructure**: Express application setup (`server/src/app.js`), centralized error handling, static file upload serving, health check endpoint (`GET /api/health`).

### File Mapping
- Models: `server/src/models/User.js`, `Department.js`, `Course.js`, `Subject.js`, `Attendance.js`, `Notification.js`
- Main App: `server/src/app.js`, `server/src/server.js`

---

## 📌 Phase 3 – Student Module

### Core Requirements & Features
- **Student Dashboard Overview**: Real-time personal attendance score indicator, overall attendance percentage badge, and low attendance alert warnings.
- **Subject Attendance Breakdown**: Detailed statistics per subject showing total classes held, classes attended, absences, and subject-specific attendance percentages.
- **Today's Classes & Timetable**: Schedule view listing today's classes with timing slots, room numbers, subject codes, and instructor names.
- **Attendance Visual Analytics**: Graphical attendance trends displaying performance over time (`AttendanceGraph.jsx`).
- **Notifications & Alerts**: Alert system notifying students when attendance falls below threshold (75%) or when new attendance entries are recorded.

### File Mapping
- Student Portal Layout: `client/src/pages/student/StudentLayout.jsx`
- Dashboard: `client/src/pages/student/StudentDashboard.jsx`
- Today's Schedule: `client/src/pages/student/TodaysClasses.jsx`
- Attendance Analytics: `client/src/pages/student/AttendanceGraph.jsx`
- Alerts: `client/src/pages/student/NotificationsList.jsx`

---

## 📌 Phase 4 – Teacher Module

### Core Requirements & Features
- **Teacher Dashboard Overview**: Summary of daily assigned classes, pending attendance tasks, and quick access actions.
- **Take Attendance Interface**: Interactive student roster marking tool:
  - Mark individual or batch status (`Present`, `Absent`, `Late`).
  - Input arrival/departure timestamps and custom class notes.
  - Quick bulk attendance marking with one-click selection.
- **Attendance History & Log Editor**: View past attendance sessions with date range, subject, and status filters; capability to update recorded attendance.
- **Students Roster Directory**: Directory of students enrolled in teacher's subjects, including individual attendance rates and warning tags.
- **Reports & Data Export**: Summary reports generator with CSV export functionality for academic record keeping.

### File Mapping
- Teacher Portal Layout: `client/src/pages/teacher/TeacherLayout.jsx`
- Dashboard: `client/src/pages/teacher/TeacherDashboard.jsx`
- Attendance Marker: `client/src/pages/teacher/TakeAttendance.jsx`
- History & Logs: `client/src/pages/teacher/AttendanceHistory.jsx`
- Student Roster: `client/src/pages/teacher/StudentsList.jsx`
- Reports & Export: `client/src/pages/teacher/TeacherReports.jsx`
- Attendance API Controller: `server/src/controllers/attendanceController.js`

---

## 📌 Phase 5 – Admin Module

### Executive Dashboard Statistics
- ✅ **Students**: Total enrolled student population metric card with department breakdown.
- ✅ **Teachers**: Active faculty teacher count metric card with assigned instructor profiles.
- ✅ **Today's Attendance**: Real-time stats card displaying today's attendance rate %, today's total records marked, today's Present count, Absent count, and Late count breakdown widget.
- ✅ **Monthly Attendance**: Real-time stats card displaying current month's attendance rate %, current month's total records, Present/Absent/Late counts, and 6-month aggregate trend chart.

### Academic Operations & User Management
- ✅ **Create Departments**: Create and manage academic departments with name, short code, and Department Head (HOD).
- ✅ **Create Courses**: Create and manage degree programs with course title, program code, department affiliation, duration in years, and semester count.
- ✅ **Add Subjects**: Create academic subjects with subject code, title, department, course, total classes count, and custom color badge.
- ✅ **Add Teachers**: Register faculty instructor profiles with full name, university email, password, department, and academic designation.
- ✅ **Add Students**: Register enrolled student profiles with full name, roll number, university email, department, and semester.
- ✅ **Assign Teacher**: Assign faculty instructors to specific subjects via interactive assignment modals.
- ✅ **Assign Subjects**: Interactive multi-select subject enrollment modals to assign subjects to students or teachers.

### File Mapping
- Admin Portal Layout: `client/src/pages/admin/AdminLayout.jsx`
- Dashboard Analytics: `client/src/pages/admin/AdminAnalytics.jsx`
- Departments Management: `client/src/pages/admin/AdminDepartments.jsx`
- Courses Management: `client/src/pages/admin/AdminCourses.jsx`
- Subjects Management: `client/src/pages/admin/AdminSubjects.jsx`
- Teachers Management: `client/src/pages/admin/AdminTeachers.jsx`
- Students Directory: `client/src/pages/admin/AdminStudents.jsx`
- System Settings: `client/src/pages/admin/AdminSettings.jsx`
- Backend Controllers:
  - `server/src/controllers/departmentController.js`
  - `server/src/controllers/courseController.js`
  - `server/src/controllers/subjectController.js`
  - `server/src/controllers/userController.js`
  - `server/src/controllers/attendanceController.js`
- Backend Express Routes:
  - `server/src/routes/departmentRoutes.js`
  - `server/src/routes/courseRoutes.js`
  - `server/src/routes/subjectRoutes.js`
  - `server/src/routes/userRoutes.js`

---

## 📊 Access Control & Feature Matrix Across All Phases

| Feature / Capability | Student | Teacher | Admin | Phase |
| :--- | :---: | :---: | :---: | :---: |
| **Authentication & Profile Reset** | ✅ | ✅ | ✅ | Phase 1 |
| **User Role Access Control (RBAC)** | ✅ | ✅ | ✅ | Phase 1 |
| **Database Schemas & Models** | — | — | — | Phase 2 |
| **View Personal Dashboard & Graph** | ✅ | ❌ | ❌ | Phase 3 |
| **View Today's Classes Schedule** | ✅ | ✅ | ❌ | Phase 3 & 4 |
| **Receive Low Attendance Alerts** | ✅ | ❌ | ❌ | Phase 3 |
| **Take Class Attendance & Notes** | ❌ | ✅ | ✅ | Phase 4 |
| **View & Edit Attendance History** | ❌ | ✅ | ✅ | Phase 4 |
| **Export Class Attendance CSV** | ❌ | ✅ | ✅ | Phase 4 |
| **Create Academic Departments** | ❌ | ❌ | ✅ | Phase 5 |
| **Create Degree Courses** | ❌ | ❌ | ✅ | Phase 5 |
| **Add Academic Subjects** | ❌ | ❌ | ✅ | Phase 5 |
| **Add & Manage Teachers** | ❌ | ❌ | ✅ | Phase 5 |
| **Add & Manage Students** | ❌ | ❌ | ✅ | Phase 5 |
| **Assign Teachers to Subjects** | ❌ | ❌ | ✅ | Phase 5 |
| **Assign Subjects to Students/Teachers** | ❌ | ❌ | ✅ | Phase 5 |
| **View Executive Dashboard Stats (Students, Teachers, Today & Monthly Attendance)** | ❌ | ❌ | ✅ | Phase 5 |

---
*Last Updated: August 2026*
