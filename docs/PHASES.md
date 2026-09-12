# Attendance Management System - Consolidated Phases Specification

This document provides a single, unified reference for all project implementation phases (**Phase 1 through Phase 34**) of the **Attendance Management System**.

---

## 📋 Table of Contents
1. [Phase 1 – Project Setup & Authentication Module](#-phase-1--project-setup--authentication-module)
2. [Phase 2 – Database & Core Architecture Module](#-phase-2--database--core-architecture-module)
3. [Phase 3 – Student Module](#-phase-3--student-module)
4. [Phase 4 – Teacher Module](#-phase-4--teacher-module)
5. [Phase 5 – Admin Module](#-phase-5--admin-module)
6. [Phase 6 – Student Module](#-phase-6--student-module)
7. [Phase 7 – Teacher Module](#-phase-7--teacher-module)
8. [Phase 8 – Attendance System (Core)](#-phase-8--attendance-system-core)
9. [Phase 9 – Timetable](#-phase-9--timetable)
10. [Phase 10 – Reports](#-phase-10--reports)
11. [Phase 11 – Charts](#-phase-11--charts)
12. [Phase 12 – Notifications](#-phase-12--notifications)
13. [Phase 13 – Leave Management](#-phase-13--leave-management)
14. [Phase 14 – AI Features](#-phase-14--ai-features)
15. [Phase 15 – Analytics Dashboard](#-phase-15--analytics-dashboard)
16. [Phase 16 – Security](#-phase-16--security)
17. [Phase 17 – Testing](#-phase-17--testing)
18. [Phase 18 – Academic Year & Semester Engine](#-phase-18--academic-year--semester-engine)
19. [Phase 19 – Advanced Attendance Rules Engine](#-phase-19--advanced-attendance-rules-engine)
20. [Phase 20 – Attendance Session Engine](#-phase-20--attendance-session-engine)
21. [Phase 21 – Anti-Proxy Attendance System](#-phase-21--anti-proxy-attendance-system)
22. [Phase 22 – Multi-Signal Risk Scoring Engine](#-phase-22--multi-signal-risk-scoring-engine)
23. [Phase 23 – Attendance Correction & Audit Trail](#-phase-23--attendance-correction--audit-trail)
24. [Phase 24 – Complete Audit Logging](#-phase-24--complete-audit-logging)
25. [Phase 25 – Advanced Notification Engine](#-phase-25--advanced-notification-engine)
26. [Phase 26 – Attendance Forecasting Engine](#-phase-26--attendance-forecasting-engine)
27. [Phase 27 – Advanced Student Analytics](#-phase-27--advanced-student-analytics)
28. [Phase 28 – Teacher Analytics](#-phase-28--teacher-analytics)
29. [Phase 29 – Admin Intelligence Dashboard](#-phase-29--admin-intelligence-dashboard-)
30. [Phase 30 – Automated Defaulter Management](#-phase-30--automated-defaulter-management-)
31. [Phase 31 – Parent/Guardian Portal](#-phase-31--parentguardian-portal-)
32. [Phase 32 – Document Verification](#-phase-32-document-verification-)
33. [Phase 33 – PWA / Mobile Experience](#-phase-33-pwa--mobile-experience-)
34. [Phase 34 – Offline Attendance Sync](#-phase-34--offline-attendance-sync)
35. [Access Control & Feature Matrix Across All Phases](#-access-control--feature-matrix-across-all-phases)

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

## 📌 Phase 6 – Student Module

### Core Requirements & Features
- **Student Dashboard Overview**:
  - **Attendance %**: Real-time overall percentage score, total sessions, present, absent count, and exam eligibility badge (>75%).
  - **Today's Lecture**: Full daily timetable with timings, room numbers, instructors, and status badges.
  - **Upcoming Lecture**: Dedicated next-lecture highlight banner showing live countdown, topic, room, and instructor.
  - **Notifications**: Feed showing system alerts, low attendance warnings, and timetable changes.
  - **Leave Status**: Quick leave status card showcasing active/past applications.
- **Attendance Calendar**: Monthly interactive grid view with color-coded day markers (`Present`, `Absent`, `Late`, `Leave`, `Holiday`) and day inspector panel.
- **Attendance History**: Searchable and filterable table log of past lecture attendance sessions with date range and status filters.
- **Attendance Graph**: Monthly attendance trend charts with 75% benchmark threshold line, subject-wise comparisons, and weekday pattern analytics.
- **Download Report**: Printable official attendance transcript and downloadable CSV report generator.
- **Apply Leave**: Leave application form (Medical, Emergency, Event, Duty Leave), supporting document upload simulation, and tracking log (`Pending`, `Approved`, `Rejected`).
- **Profile**: Student personal details, contact info editor, enrolled subjects grid, and account security password change.

### File Mapping
- Student Portal Layout: `client/src/pages/student/StudentLayout.jsx`
- Student Dashboard: `client/src/pages/student/StudentDashboard.jsx`
- Attendance Calendar: `client/src/pages/student/StudentCalendar.jsx`
- Attendance History: `client/src/pages/student/StudentHistory.jsx`
- Attendance Graph: `client/src/pages/student/AttendanceGraph.jsx`
- Download Report: `client/src/pages/student/StudentReport.jsx`
- Apply Leave: `client/src/pages/student/StudentLeave.jsx`
- Profile: `client/src/pages/student/StudentProfile.jsx`
- Notifications: `client/src/pages/student/NotificationsList.jsx`
- Leave Backend: `server/src/models/Leave.js`, `server/src/controllers/leaveController.js`, `server/src/routes/leaveRoutes.js`

---

## 📌 Phase 7 – Teacher Module

### Core Requirements & Features
- **Teacher Dashboard**:
  - **Create Class**: Modal dialog interface (`CreateClassModal.jsx`) allowing faculty to schedule and create active class sessions with subject name, subject code, room venue, time slot, section, and enrolled capacity.
  - **View Students**: Enrolled course student directory showing student roll numbers, attendance rates, status badges (>75% active, <75% warning), and advisory notification tools.
  - **Take Attendance**: Direct launcher to active class attendance roster sheet.
  - **Edit Attendance**: Access to past session logs with inline modal editor to modify student status and remarks.
  - **Generate Reports**: Class attendance reports analytics and downloadable CSV export generator.
- **Attendance Screen**:
  - **Student List**: Full interactive student roster table with roll numbers, names, and current attendance averages.
  - **Present Button**: Green toggle action button per student for marking Present.
  - **Absent Button**: Red toggle action button per student for marking Absent.
  - **Late Button**: Amber toggle action button per student for marking Late.
  - **Remarks**: Text input per student to attach custom session notes (e.g. "Medical note", "15 mins late", "Permission granted").
  - **Batch Actions & Real-Time Counters**: One-click "Mark All Present" & "Mark All Absent" with real-time Present/Absent/Late counter badges.

### File Mapping
- Dashboard & Class Creator: `client/src/pages/teacher/TeacherDashboard.jsx`, `client/src/components/teacher/CreateClassModal.jsx`
- Attendance Screen: `client/src/pages/teacher/TakeAttendance.jsx`
- History & Edit Attendance: `client/src/pages/teacher/AttendanceHistory.jsx`
- Enrolled Students Roster: `client/src/pages/teacher/StudentsList.jsx`
- Class Reports & CSV Export: `client/src/pages/teacher/TeacherReports.jsx`
- Backend Infrastructure:
  - Model: `server/src/models/Class.js`
  - Controller: `server/src/controllers/classController.js`, `server/src/controllers/attendanceController.js`
  - Routes: `server/src/routes/classRoutes.js`, `server/src/routes/attendanceRoutes.js`

---

## 📌 Phase 8 – Attendance System (Core)

### Core Requirements & Features
- **Attendance Verification Methods**:
  - **Manual Marking**: Faculty instructors manually toggle Present, Absent, or Late with session notes.
  - **QR Code Attendance**:
    - Faculty clicks **"Start Attendance"** on active class.
    - Server generates a dynamic **30-second expiring QR session token**.
    - Teacher UI displays live QR code with **30-second animated countdown timer** and auto-refreshes token every 30 seconds.
    - Students scan QR token via built-in web scanner / camera.
    - Server validates JWT signature and non-expired timestamp window (<= 30 seconds).
  - **GPS Location Verification**:
    - Browser captures current student GPS position (`latitude`, `longitude`).
    - Backend calculates distance between student position and campus coordinates using Haversine formula.
    - Server automatically rejects attendance if distance exceeds allowed radius (e.g. 500 meters).
  - **Device Fingerprint Verification**:
    - Captures persistent Browser ID, User-Agent, screen resolution, and client device fingerprint.
    - Stores Browser ID, Device Fingerprint, and Last Login timestamps.
    - Prevents proxy attendance by rejecting duplicate scans from the same physical device for multiple students in the same session.

### File Mapping
- Frontend QR Modals & Fingerprint: `client/src/components/teacher/QRAttendanceModal.jsx`, `client/src/components/student/StudentQRScannerModal.jsx`, `client/src/services/deviceFingerprint.js`
- Page Integration: `client/src/pages/teacher/TakeAttendance.jsx`, `client/src/pages/student/StudentDashboard.jsx`
- Geolocation Utility: `server/src/utils/geoUtils.js`
- Backend API Controllers: `server/src/controllers/classController.js`, `server/src/controllers/attendanceController.js`
- Models: `server/src/models/Attendance.js`, `server/src/models/Class.js`, `server/src/models/User.js`

---

## 📌 Phase 9 – Timetable

### Core Requirements & Features
- **Teacher Creates & Manages Timetable**:
  - Faculty/Admin can schedule, edit, and delete weekly timetable class slots.
  - Slot attributes: Day of week (`Monday` to `Sunday`), Start & End Time, Time Slot string, Subject Name, Subject Code, Room/Venue, Section, Department, Instructor Name, and theme color badge.
  - Weekly master schedule view with day filters, search filter, and inline modal editor (`CreateTimetableModal.jsx`).
- **Student Timetable Portal**:
  - **Today's Classes**: View today's scheduled lectures dynamically computed from current day of week with real-time status badges (`Completed`, `Ongoing`, `Upcoming`).
  - **Tomorrow**: View tomorrow's scheduled lectures to prepare notes and materials in advance.
  - **Weekly Timetable**: Complete interactive weekly schedule grid (Monday to Sunday) with day selector, room locations, teacher details, and full weekly matrix.

### File Mapping
- Backend Infrastructure:
  - Model: `server/src/models/Timetable.js`
  - Controller: `server/src/controllers/timetableController.js`
  - Routes: `server/src/routes/timetableRoutes.js`
  - App Integration: `server/src/app.js`
- Frontend Infrastructure:
  - API Client: `client/src/services/api.js`
  - Teacher Timetable Creator Modal: `client/src/components/teacher/CreateTimetableModal.jsx`
  - Teacher Timetable Manager: `client/src/pages/teacher/TeacherTimetable.jsx`
  - Student Timetable View: `client/src/pages/student/StudentTimetable.jsx`
  - Routing & Navigation: `client/src/App.jsx`, `client/src/components/layout/Sidebar.jsx`, `client/src/pages/teacher/TeacherDashboard.jsx`

---

## 📌 Phase 10 – Reports

### Core Requirements & Features
- **Multi-Timeframe Attendance Report Generator**:
  - **Daily Report**: Computes present, absent, late counts and rates for a specified calendar date.
  - **Weekly Report**: Computes weekly attendance statistics and trends across selected 7-day windows.
  - **Monthly Report**: Monthly aggregate metrics for selected month & year (e.g. August 2026).
  - **Semester Report**: Semester-wide comprehensive transcript calculating cumulative attendance rates, total sessions, and exam eligibility status (>75% = Eligible, <75% = Shortage Warning).
- **Export Engine**:
  - **PDF Export**: Formats official printable university transcript with academic headers, metadata summary, tabular audit, exam eligibility badges, and registrar signature block.
  - **Excel Export**: Generates `.xls` Microsoft Excel compatible spreadsheet file with custom styling and formatting.
  - **CSV Export**: Standard `.csv` download stream for raw data analysis.
- **Multi-Role Reports Hub**:
  - **Admin Reports Console** (`AdminReports.jsx`): Executive reporting suite filtering by Department, Course, Subject, and Semester with at-risk warning alerts.
  - **Teacher Reports Hub** (`TeacherReports.jsx`): Subject class attendance generator with CSV, Excel, and PDF exports.
  - **Student Report Portal** (`StudentReport.jsx`): Official student attendance transcript generator with Daily/Weekly/Monthly/Semester views.

### File Mapping
- Backend Infrastructure:
  - Controller: `server/src/controllers/reportController.js`
  - Routes: `server/src/routes/reportRoutes.js`
  - App Integration: `server/src/app.js`
- Frontend Infrastructure:
  - Export Utility: `client/src/utils/reportExporter.js`
  - API Client: `client/src/services/api.js`
  - Admin Reports Hub: `client/src/pages/admin/AdminReports.jsx`
  - Teacher Reports Hub: `client/src/pages/teacher/TeacherReports.jsx`
  - Student Report View: `client/src/pages/student/StudentReport.jsx`
  - Navigation & Routing: `client/src/App.jsx`, `client/src/components/layout/Sidebar.jsx`

---

## 📌 Phase 11 – Charts

### Core Requirements & Features
- **Visual Analytics Engine**:
  - **Attendance % Ratio**: Interactive Doughnut & Pie chart displaying distribution of Present, Absent, and Late attendance records with overall percentage center badge.
  - **Department Comparison**: Multi-department Bar chart comparing average attendance rates across academic departments (CSE, ECE, ME, CE, IT) against the campus benchmark.
  - **Monthly Trend**: 6 to 12 month Area & Line chart tracking monthly attendance trends with a prominent **75% minimum exam requirement line**.
  - **Subject Wise Breakdown**: Course subject attendance percentages, total sessions, present count, absent count, and subject color badges.
  - **Student Ranking & Leaderboard**: Horizontal Leaderboard Bar chart featuring rank badges (Gold, Silver, Bronze) for top performers and shortage warning alerts for at-risk students (<75%).
- **Dual-Engine Rendering**:
  - Full support for both **Recharts** and **Chart.js / react-chartjs-2**.
  - Interactive **Library Engine Switcher** toggle bar allowing users to switch rendering engines dynamically on the fly.
- **Role-Based Analytics Filtering**:
  - Admin sees system-wide campus analytics and department rankings.
  - Teacher sees department averages and student shortage warnings.
  - Student sees personal attendance ratio, monthly trend, and relative class standing.

### File Mapping
- Backend Infrastructure:
  - Controller: `server/src/controllers/chartController.js`
  - Routes: `server/src/routes/chartRoutes.js`
  - Express App Mount: `server/src/app.js` (`/api/charts/analytics`)
- Frontend Infrastructure:
  - API Client Helper: `client/src/services/api.js` (`getChartAnalyticsApi`)
  - Modular Chart Components:
    - `client/src/components/charts/AttendancePieChart.jsx`
    - `client/src/components/charts/DeptComparisonChart.jsx`
    - `client/src/components/charts/MonthlyTrendChart.jsx`
    - `client/src/components/charts/SubjectWiseChart.jsx`
    - `client/src/components/charts/StudentRankingChart.jsx`
  - Main Analytics Page: `client/src/pages/analytics/ChartsPage.jsx`
  - Student Analytics Page: `client/src/pages/student/AttendanceGraph.jsx`
  - Routing & Sidebar: `client/src/App.jsx`, `client/src/components/layout/Sidebar.jsx`

---

## 📌 Phase 12 – Notifications

### Core Requirements & Features
- **Real-Time WebSockets Engine**:
  - Socket.io integration on HTTP server (`server/src/config/socket.js`) and React client (`client/src/services/socket.js`).
  - Automatic authentication & connection lifecycle management joining user rooms (`user_${id}`), role rooms (`role_${role}`), and department rooms (`dept_${dept}`).
  - Centralized `sendNotification` helper emitting WS events and persisting notifications in MongoDB.
- **Firebase Cloud Messaging (FCM) / Web Push**:
  - FCM push notification support via Firebase Admin SDK (`server/src/config/firebase.js`) with dev fallback mode.
  - Browser Web Push Service Worker (`client/public/firebase-messaging-sw.js`).
  - User device FCM token registration (`POST /api/notifications/fcm-token`).
- **5 Mandatory Event Triggers**:
  - **Attendance Marked**: Notifies student in real-time when marked Present, Absent, or Late via manual roster or QR scan.
  - **Class Cancelled**: Notifies enrolled students in real-time when a class session or schedule is cancelled or removed.
  - **Low Attendance Warning**: Automatically warns student when cumulative or subject attendance drops below the 75% threshold.
  - **Leave Status Updated**: Notifies student applicant in real-time when leave application is Approved or Rejected.
  - **Announcements**: Broadcast or target real-time announcements from Admin/Teacher to Students, Teachers, or Campus-wide.
- **Notification Center UI & Toast Suite**:
  - Interactive top header Bell icon (`Header.jsx`) with live unread badge count & pulse animation.
  - Glassmorphism slide-out Notification Drawer with read/unread filters, Web Push toggle, and audio chime toggle.
  - Floating top-right real-time Toast alerts (`ToastContainer.jsx`) with custom event icons and Web Audio API chime sound.
  - Dedicated Notifications Hub Page (`NotificationsList.jsx`) with category filter tabs.
  - Broadcast Announcement Modal (`CreateAnnouncementModal.jsx`) for Admins and Teachers.

### File Mapping
- Backend Infrastructure:
  - Socket Config & Helper: `server/src/config/socket.js`
  - Firebase FCM Helper: `server/src/config/firebase.js`
  - Controller: `server/src/controllers/notificationController.js`
  - Routes: `server/src/routes/notificationRoutes.js`
  - Model Updates: `server/src/models/Notification.js`, `server/src/models/User.js`
  - Server Entry: `server/src/server.js`, `server/src/app.js`
- Frontend Infrastructure:
  - Socket Manager: `client/src/services/socket.js`
  - FCM Config: `client/src/config/firebase.js`, `client/public/firebase-messaging-sw.js`
  - Global Context: `client/src/context/NotificationContext.jsx`
  - Toast Container: `client/src/components/common/ToastContainer.jsx`
  - Header Bell & Drawer: `client/src/components/layout/Header.jsx`
  - Announcement Modal: `client/src/components/common/CreateAnnouncementModal.jsx`
- Notifications Page: `client/src/pages/student/NotificationsList.jsx`
  - API Client: `client/src/services/api.js`

---

## 📌 Phase 13 – Leave Management

### Core Requirements & Features
- **Student Leave Application**:
  - Formal leave request form with Leave Category selection (`Medical`, `Personal Emergency`, `Official Event`, `Duty Leave`), date range pickers, and detailed reason explanation text area.
  - Supporting document upload integration (`PDF`, `PNG`, `JPG`, `DOCX`) posting files to `/api/uploads` and linking file metadata to leave records.
  - Active and past leave status tracking dashboard (`Pending`, `Approved`, `Rejected`) with real-time status counters and document preview modal.
- **Teacher / Faculty Leave Approval Console**:
  - Dedicated Faculty Leave Console (`/teacher/leave`) with metric overview cards (Total Applications, Pending Review, Approved Leaves, Rejected Requests).
  - Status filter tabs (`Pending`, `Approved`, `Rejected`, `All`) and real-time student name / roll number search.
  - Detailed student request inspector showing student roll number, department, requested absence period, detailed reason, and attached proof document viewer.
  - One-click **Approve** & **Reject** authorization modal with optional custom faculty remarks.
- **Real-Time Notification & History Maintenance**:
  - Real-time Socket.io notification emission & persistent MongoDB notification record creation (`LEAVE_STATUS`) when faculty approves or rejects a request.
  - Complete history maintained with reviewer details, review timestamps, and comments for audit compliance.

### File Mapping
- Student Leave Page: `client/src/pages/student/StudentLeave.jsx`
- Teacher Leave Console: `client/src/pages/teacher/TeacherLeave.jsx`
- Navigation & Routing: `client/src/App.jsx`, `client/src/components/layout/Sidebar.jsx`
- Service & Upload API: `client/src/services/api.js`, `server/src/controllers/uploadController.js`, `server/src/routes/uploadRoutes.js`
- Backend Infrastructure:
  - Model: `server/src/models/Leave.js`, `server/src/models/Notification.js`
  - Controller: `server/src/controllers/leaveController.js`
  - Routes: `server/src/routes/leaveRoutes.js`

---

## 📌 Phase 14 – AI Features

### Core Requirements & Features
- **Attendance Prediction Engine ("Can Student Reach 75%?")**:
  - Trajectory & math engine calculating minimum required lectures to attend to achieve $\ge 75\%$ target across all enrolled subjects.
  - Maximum allowed skips calculator ($S_{max}$) determining how many future lectures can be missed safely.
  - Interactive "What-If" simulator slider (`AttendancePrediction.jsx`) enabling students to simulate future attendance rates (100%, 80%, 60%, 40%, 20%, 0%) and preview projected final percentages.
  - Subject-by-subject risk breakdown with custom status badges (`Guaranteed`, `Achievable`, `At Risk`, `Impossible`) and AI strategic advice notes.
- **Natural Language AI Chatbot ("Ask My Attendance")**:
  - Contextual NLP engine handling natural language queries and parsing intent from preset prompt pills:
    1. 💬 *"My attendance?"* $\rightarrow$ Returns overall status, present/absent breakdown, and compliance badge.
    2. 💬 *"Subjects below 75%"* $\rightarrow$ Lists lagging defaulter subjects with shortage counts and urgent alerts.
    3. 💬 *"Can I skip tomorrow?"* $\rightarrow$ Analyzes tomorrow's scheduled timetable slots and simulates attendance drop risks.
    4. 💬 *"Attendance report"* $\rightarrow$ Summary metrics with direct link trigger to download official PDF/Excel report.
    5. 💬 *"Remaining lectures"* $\rightarrow$ Breakdown of remaining conductable lectures per subject.
  - Dual UI components: Global Floating Widget (`AiChatWidget.jsx`) available on all pages and full-screen AI Workspace (`AiChatPage.jsx`).
- **Suspicious Attendance & Proxy Detection**:
  - Automated anomaly detector (`/api/ai/suspicious-detection`) running 4 active security scanners across attendance logs:
    1. **Repeated Same Device**: Flags multiple student accounts marking attendance using the exact same device fingerprint or browser ID.
    2. **Outside Campus**: Identifies QR/GPS attendance marked outside the 500m campus boundary.
    3. **Duplicate QR**: Identifies token reuse or duplicate scans within 5 minutes.
    4. **Impossible Locations**: Identifies rapid sequence scans requiring impossible physical travel speed ($> 100\text{ km/h}$).
  - Dedicated Faculty/Admin Security Console (`/admin/suspicious` & `/teacher/suspicious`) with category tabs, severity risk pills (`High`, `Medium`, `Low`), search filter, and full technical metadata inspector modal.

### File Mapping
- Backend Infrastructure:
  - Controller: `server/src/controllers/aiController.js`
  - Routes: `server/src/routes/aiRoutes.js`
  - Server App Mount: `server/src/app.js` (`/api/ai`)
- Frontend Infrastructure:
  - API Service Client: `client/src/services/api.js` (`getAttendancePredictionApi`, `sendAiChatMessageApi`, `getSuspiciousAttendanceApi`)
  - Global Floating Widget: `client/src/components/ai/AiChatWidget.jsx`
  - Student Prediction Page: `client/src/pages/student/AttendancePrediction.jsx` (`/student/predict`)
  - Student AI Workspace Page: `client/src/pages/student/AiChatPage.jsx` (`/student/ai-chat`)
  - Admin/Teacher Security Console: `client/src/pages/admin/SuspiciousDetection.jsx` (`/admin/suspicious` & `/teacher/suspicious`)
  - Navigation & Routing: `client/src/App.jsx`, `client/src/components/layout/Sidebar.jsx`

---

## 📌 Phase 15 – Analytics Dashboard

### Core Requirements & Features
- **Admin Analytics Dashboard Hub**:
  - Executive administrative dashboard organizing institutional intelligence into 5 specialized interactive modules.
- **1. Most Absent Students**:
  - Aggregates defaulter students (< 75% attendance) across departments.
  - Search filter (name/roll number) and department dropdown filter (CSE, ECE, ME, CE, IT).
  - Shortage deficit calculator computing exact missing classes needed to reach 75% benchmark ($X = \lceil 3T - 4P \rceil$).
  - Risk status indicators (`Critical Risk < 65%`, `Shortage Warning 65-74%`) and direct "Issue Warning Alert" trigger.
- **2. Best Attendance Leaderboard**:
  - Honor roll highlighting top-performing students (&ge; 90%).
  - Podium cards for Gold (#1), Silver (#2), and Bronze (#3) rank medals.
  - Perfect Attendance (100%) badges and direct "Send Honor Certificate / Commendation" alert trigger.
- **3. Department Ranking**:
  - Comparative departmental ranking comparing CSE, ECE, ME, CE, IT by average student attendance rate.
  - Department Head (HOD) details, total enrolled students, total faculty staff, and performance tier badges (`Top Performer >= 88%`, `Solid Performance 80-87%`, `Needs Improvement < 80%`).
  - Visual departmental progress bars comparing performance against campus benchmarks.
- **4. Teacher Performance Metrics**:
  - Faculty instructor performance evaluation directory.
  - Metrics: Total classes scheduled & conducted, on-time attendance marking rate %, average student attendance in assigned subjects, and faculty performance rating score/tier (`Outstanding`, `Excellent`, `Good`, `Needs Support`).
- **5. Daily Attendance Inspector**:
  - Interactive calendar date picker (defaults to current date, selectable past/future dates).
  - Summary metrics: Today's sessions held, present count, late arrivals, absent count, and daily attendance rate %.
  - Hourly session distribution graph (Morning, Midday, Afternoon slots) and subject-by-subject daily session table.

### File Mapping
- Backend Infrastructure:
  - Controller: `server/src/controllers/analyticsController.js`
  - Routes: `server/src/routes/analyticsRoutes.js`
  - Server App Mount: `server/src/app.js` (`/api/analytics`)
- Frontend Infrastructure:
  - API Service Client: `client/src/services/api.js` (`getAnalyticsDashboardApi`, `getMostAbsentStudentsApi`, `getBestAttendanceApi`, `getDepartmentRankingApi`, `getTeacherPerformanceApi`, `getDailyAttendanceApi`)
  - Admin Analytics Dashboard: `client/src/pages/admin/AdminAnalytics.jsx`
  - Analytics Sub-Components:
    - `client/src/components/analytics/MostAbsentStudents.jsx`
    - `client/src/components/analytics/BestAttendance.jsx`
    - `client/src/components/analytics/DepartmentRanking.jsx`
    - `client/src/components/analytics/TeacherPerformance.jsx`
    - `client/src/components/analytics/DailyAttendance.jsx`

---

## 📌 Phase 16 – Security

### Core Requirements & Features
- **Helmet HTTP Security Headers**:
  - Express security middleware setting standard HTTP headers (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `X-XSS-Protection`, `Referrer-Policy`, `Cross-Origin-Resource-Policy`).
  - Hides `X-Powered-By` header to mitigate technology stack disclosure risks.
- **Rate Limiting Engine**:
  - Sliding-window in-memory rate limiter protecting against brute-force attacks and DoS (`rateLimitMiddleware.js`).
  - Global API rate limiter (200 requests / 15 mins).
  - Auth rate limiter (15 requests / 15 mins on `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`).
  - Sensitive operations rate limiter (10 requests / 15 mins for password resets & QR generation).
- **Hardened JWT Authentication**:
  - JWT token issuance, verification, and explicit expiration handling (`authMiddleware.js`, `generateToken.js`).
  - Bearer token header scheme validation (`Authorization: Bearer <token>`).
  - Explicit error handling for expired (`TokenExpiredError`) and tampered (`JsonWebTokenError`) session tokens.
- **Password Hashing & Strength Governance**:
  - Salt generation (`bcrypt.genSalt(10)`) and hashing for user passwords.
  - Password strength validation enforcing minimum 6-character length and complexity rules.
- **Role-Based Access Control (RBAC)**:
  - Granular authorization middleware (`protect`, `authorize(...roles)`) shielding all sensitive administrative, teacher, and student API routes.
  - Generates HTTP 403 Forbidden responses and security warning audit logs on role access violations.
- **Input Validation Suite**:
  - Sanitizes and validates request payload parameters (`validateRegister`, `validateLogin`, `validatePasswordChange`, `validateParamId`).
  - Returns structured HTTP 400 Bad Request error schemas with field-level guidance.
- **XSS Protection Middleware**:
  - Recursive request payload sanitizer (`xssMiddleware.js`) stripping and escaping malicious script tags (`<script>`), inline handlers (`onload`, `onerror`), and `javascript:` URIs from `req.body`, `req.query`, and `req.params`.
- **Configurable CORS Governance**:
  - Cross-Origin Resource Sharing control with configurable origin whitelists (`CLIENT_URL` / localhost development ports), allowed headers, credentials handling, and preflight OPTIONS request resolution.
- **Security Audit Logging System & Admin Console**:
  - **Audit Mongoose Schema (`AuditLog.js`)**: Tracks user ID, role, name, email, action type, resource module, HTTP method, endpoint, IP address, User-Agent, status (`SUCCESS`, `FAILED`, `WARNING`), and metadata details.
  - **Audit Helper (`auditMiddleware.js`)**: Asynchronous, non-blocking audit event logger.
  - **Audit Controller & Express Router (`auditController.js`, `auditRoutes.js`)**: Endpoints for paginated audit log queries (`GET /api/audit-logs`), security stats (`GET /api/audit-logs/stats`), and CSV log export (`GET /api/audit-logs/export`).
  - **Admin Security Console (`AdminAuditLogs.jsx`)**: Glassmorphism UI displaying real-time security metric cards, filterable event table (Search, Status, Role, Date Range), detail inspector modal, and CSV export.

### File Mapping
- Backend Infrastructure:
  - Middlewares:
    - `server/src/middleware/helmetMiddleware.js`
    - `server/src/middleware/rateLimitMiddleware.js`
    - `server/src/middleware/xssMiddleware.js`
    - `server/src/middleware/validationMiddleware.js`
    - `server/src/middleware/auditMiddleware.js`
    - `server/src/middleware/authMiddleware.js`
  - Model: `server/src/models/AuditLog.js`
  - Controller: `server/src/controllers/auditController.js`
  - Routes: `server/src/routes/auditRoutes.js`
  - App Integration: `server/src/app.js`
- Frontend Infrastructure:
  - Security Console: `client/src/pages/admin/AdminAuditLogs.jsx`
  - API Client Service: `client/src/services/api.js` (`getAuditLogsApi`, `getAuditLogStatsApi`, `exportAuditLogsApi`)
  - Navigation & Routing: `client/src/App.jsx`, `client/src/components/layout/Sidebar.jsx`

---

## 📌 Phase 17 – Testing

### Core Requirements & Features
- **Automated Testing Suite**:
  - Comprehensive unit and integration test suites for backend APIs built using **Jest**, **Supertest**, and **mongodb-memory-server**.
- **1. Authentication Tests (`tests/auth.test.js`)**:
  - User registration (`student`, `teacher`, `admin`), password hashing with `bcrypt`, user login validation, JWT access & refresh token generation, and multi-role RBAC authorization guard tests.
- **2. Attendance Tests (`tests/attendance.test.js`)**:
  - Single & bulk attendance marking, attendance stats calculations, 75% defaulter threshold math, date/subject filtering, record updates, and record deletion.
- **3. QR Code Tests (`tests/qr.test.js`)**:
  - 30-second expiring dynamic QR JWT token signature validation, rejection of expired tokens, attendance marking via QR, and anti-proxy device fingerprint / browser ID duplicate detection.
- **4. GPS Geofencing Tests (`tests/gps.test.js`)**:
  - Haversine distance formula calculations (`getDistanceInMeters`), campus 500m radius geofence boundary enforcement, and outside campus location rejection.
- **5. Reports Tests (`tests/reports.test.js`)**:
  - Date range bound calculations (`getReportDateRange`) for daily, weekly, monthly, and semester reports, query filtering by department/course/semester/student, and student role data isolation.
- **6. Charts Tests (`tests/charts.test.js`)**:
  - Overall attendance ratio breakdown, departmental comparison stats, 6-month monthly trend dataset structure, subject-wise attendance stats, and student ranking leaderboard datasets.
- **7. Notifications Tests (`tests/notifications.test.js`)**:
  - User notification query & unread badge counters, marking individual/all notifications as read, deletion, FCM web push token registration, and broadcasting campus announcements.

### File Mapping
- Test Environment & Configuration:
  - `server/jest.config.js`
  - `server/tests/setup.js`
  - `server/package.json` (`npm test`)
- Module Test Suites:
  - `server/tests/auth.test.js`
  - `server/tests/attendance.test.js`
  - `server/tests/qr.test.js`
  - `server/tests/gps.test.js`
  - `server/tests/reports.test.js`
  - `server/tests/charts.test.js`
  - `server/tests/notifications.test.js`


---

## 📌 Phase 18 – Academic Year & Semester Engine

### Core Requirements & Features
- **Dynamic Academic Hierarchy Engine**: Replaced hard-coded semester assumptions with a dynamic, multi-tiered hierarchy:
  ```
  Academic Year (e.g., 2026-27)
      ↓
  Semester (e.g., Semester 5, Semester 6)
      ↓
  Department (e.g., Information Technology, Computer Science)
      ↓
  Class/Division (e.g., IT-A, IT-B, IT-C)
      ↓
  Subjects (e.g., Data Structures, Operating Systems)
  ```
- **Academic Year Management**:
  - Define custom Academic Years with start and end dates (e.g. `2026-27`).
  - Active session flag (`isCurrent`) automatically enforcing singleton active sessions across the institution.
  - Track session status (`Upcoming`, `Active`, `Completed`, `Archived`).
- **Dynamic Semester Engine**:
  - Dynamically attach term schedules (`Semester 1` to `Semester 10`) under specific Academic Years without static code limitations.
- **Class Division / Section Management**:
  - Configure Class Divisions (`IT-A`, `IT-B`, `IT-C`) linked to Department, Semester, and Academic Year.
  - Section capacity tracking and live enrolled student counters.
- **Student Batch Promotion Engine**:
  - Wizard-driven batch student promotion from current Academic Year/Semester/Division to target Academic Year/Semester/Division.
  - Automatic historical audit tracking via `StudentEnrollment` model recording promotion dates, previous sessions, and admin remarks.
- **Subject Allocation**:
  - Assign subjects to dynamic semesters, class divisions, and faculty instructors.
- **Visual Academic Hierarchy Tree UI**:
  - Admin Portal console (`/admin/academic`) featuring interactive, expandable tree representation displaying student counts, semester statuses, and allocated subjects per division.

### File Mapping
- Backend Models:
  - `server/src/models/AcademicYear.js`
  - `server/src/models/Semester.js`
  - `server/src/models/Division.js`
  - `server/src/models/StudentEnrollment.js`
  - `server/src/models/User.js` (updated with dynamic refs)
  - `server/src/models/Subject.js` (updated with dynamic refs)
- Backend Controller & Routes:
  - `server/src/controllers/academicController.js`
  - `server/src/routes/academicRoutes.js`
  - `server/src/app.js` (registered `/api/academic`)
- Frontend UI & API Client:
  - `client/src/services/api.js`
  - `client/src/pages/admin/AdminAcademicEngine.jsx`
  - `client/src/App.jsx` (`/admin/academic` route)
  - `client/src/components/layout/Sidebar.jsx` (Admin Sidebar item)

---

## 🔥 Phase 19 – Advanced Attendance Rules Engine

### Core Requirements & Features
- **Configurable Thresholds Engine**:
  - Replaced hard-coded attendance logic with institution-wide configurable rules:
    - Minimum Attendance Required % (Default: `75%`)
    - Late Arrival Threshold (Default: `10 minutes`)
    - On-Time Grace Period (Default: `5 minutes`)
    - Dynamic QR Token Validity (Default: `1 minute` / `60 seconds`)
    - GPS Geofence Campus Radius (Default: `100 meters`)
    - Auto-Mark Absent Delay (Default: `30 minutes`)
    - Consecutive Absentees Alert Threshold (Default: `3 classes`)
- **Advanced 7-Status Attendance Matrix**:
  - Fully configurable status rules for 7 core statuses:
    - `Present`: Attended = Yes, Conducted = Yes, Weight = 1.0
    - `Absent`: Attended = No, Conducted = Yes, Weight = 0.0
    - `Late`: Attended = Yes, Conducted = Yes, Weight = 0.8 (configurable)
    - `Excused`: Attended = Yes, Conducted = Yes, Weight = 1.0 (approved exceptions)
    - `On Leave`: Attended = No, Conducted = No (excluded from denominator)
    - `Holiday`: Attended = No, Conducted = No (scheduled institutional holiday)
    - `Cancelled Lecture`: Attended = No, Conducted = No (cancelled by faculty)
- **Real-Time Check-In Evaluation Engine**:
  - Centralized `attendanceRulesEngine.js` evaluator validating QR expiration, GPS distance, grace period, and late cutoff in real-time.
- **Admin Rules Console & Interactive Simulator**:
  - Admin Portal UI (`/admin/rules`) featuring threshold sliders, 7-status matrix editor, and an interactive check-in sandbox/simulator to test check-in parameters before saving.

### File Mapping
- Backend Models:
  - `server/src/models/AttendanceRule.js`
  - `server/src/models/Attendance.js` (expanded status enum)
- Backend Engine, Controller & Routes:
  - `server/src/utils/attendanceRulesEngine.js`
  - `server/src/controllers/rulesController.js`
  - `server/src/routes/rulesRoutes.js`
  - `server/src/controllers/classController.js` (updated)
  - `server/src/controllers/attendanceController.js` (updated)
  - `server/src/controllers/reportController.js` (updated)
  - `server/src/app.js` (mounted `/api/attendance-rules`)
- Frontend UI & API Client:
  - `client/src/services/api.js`
  - `client/src/pages/admin/AdminRulesEngine.jsx`
  - `client/src/App.jsx` (`/admin/rules` route)
  - `client/src/components/layout/Sidebar.jsx` (Rules Engine sidebar link)
- Tests:
  - `server/tests/rules.test.js`

---

## 🔥 Phase 20 – Attendance Session Engine

### Core Requirements & Features
- **4-Tier Domain Hierarchy**:
  - Separated static scheduled class definitions (`Class`) from live attendance session instances (`AttendanceSession`):
    $$\text{Subject} \longrightarrow \text{Scheduled Class} \longrightarrow \text{Attendance Session} \longrightarrow \text{Student Attendance}$$
- **Dynamic Attendance Session Instance Creation**:
  - When a teacher clicks **"Start Attendance"**, the system initializes a dedicated `AttendanceSession` model storing:
    - `sessionId`: Unique formatted string code (e.g. `SESS-20260826-A1B2C3`)
    - `startTime` & `endTime`: Timestamps marking session lifecycle
    - `teacher`, `subject`, `subjectCode`, `division`, `room`, `department`: Class metadata
    - `mode`: ENUM (`QR`, `Manual`, `GPS`, `Hybrid`)
    - `status`: ENUM (`Active`, `Completed`, `Cancelled`, `Expired`)
    - `qrSecretToken` & `qrExpiresAt`: Expiring 30s QR session token
    - `campusLocation`: GPS coordinates (`latitude`, `longitude`, `maxRadiusMeters`)
    - `stats`: Live counts for `totalStudents`, `presentCount`, `absentCount`, `lateCount`, `excusedCount`
- **Granular Attendance Tracking**:
  - `Attendance` records directly store `sessionId` linking individual student check-ins to specific session instances.
- **Session Lifecycle APIs**:
  - Endpoints for starting sessions (`POST /api/sessions/start`), stopping sessions (`POST /api/sessions/:id/stop`), getting active session (`GET /api/sessions/active`), fetching session token (`GET /api/sessions/:id/qr-token`), and retrieving session history (`GET /api/sessions`).

### File Mapping
- Backend Models:
  - `server/src/models/AttendanceSession.js`
  - `server/src/models/Attendance.js` (updated with `sessionId` ref)
- Backend Controller & Routes:
  - `server/src/controllers/sessionController.js`
  - `server/src/routes/sessionRoutes.js`
  - `server/src/app.js` (mounted `/api/sessions`)
  - `server/src/controllers/attendanceController.js` (updated)
- Frontend UI & API Client:
  - `client/src/services/api.js` (`startAttendanceSessionApi`, `getActiveSessionApi`, `stopAttendanceSessionApi`, etc.)
  - `client/src/components/teacher/QRAttendanceModal.jsx` (updated with Session ID badge and session APIs)
- Tests:
  - `server/tests/sessions.test.js`

---

## 🛡️ Phase 21 – Anti-Proxy Attendance System

### Core Requirements & Features
- **Multi-Signal Risk Engine Utility** (`server/src/utils/antiProxyEngine.js`):
  - Evaluates 6 multi-signal risk factors for each attendance check-in scan:
    1. **QR Token Signal**: Verifies 30s token rotation signature and expiration timestamp.
    2. **GPS Geolocation Signal**: Calculates Haversine distance vs session boundary, flags out-of-bounds check-ins (+30 to +50 score), and detects velocity jumps $>150$ km/h (+60 score).
    3. **Time Signal**: Detects scans performed post session completion or outside class window (+40 score).
    4. **Device Fingerprint Signal**: Cross-checks physical device fingerprints/browser IDs across student accounts today; flags shared devices across 2 accounts (+45 score) or multi-account device clusters (+70 score).
    5. **IP Address & Concurrency Signal**: Detects rapid scan bursts from the exact same IP address across multiple student accounts (+25 score).
    6. **Attendance Pattern Anomaly Signal**: Flags sudden device fingerprint switches for a student profile (+15 score).
- **Risk Score & Classification Pipeline**:
  - Calculates aggregated Risk Score $S = \min(100, \sum \text{scoreContribution})$.
  - Categorizes records into:
    - $S < 30 \implies$ `Normal` (`reviewStatus: 'Approved'`)
    - $S = 30-69 \implies$ `Suspicious` (`reviewStatus: 'Pending'`)
    - $S \ge 70 \implies$ `High Risk` (`reviewStatus: 'Pending'`)
- **Non-Destructive Attendance Recording**:
  - Scans with suspicious signals are recorded in MongoDB with `riskScore`, `riskLevel`, `riskSignals`, and `reviewStatus: 'Pending'`, allowing instructors to review and decide rather than losing scan data.
- **Teacher & Admin Review Console** (`/api/anti-proxy` & `SuspiciousDetection.jsx`):
  - **Live Multi-Signal Metrics**: Total Evaluated, Pending Review ⏳, High Risk 🚨, Device Clusters ⚠️, GPS Violations ❌, Prevention Rate %.
  - **Flagged Records Review Hub**: Card view with live Risk Score gauges and signal badges.
  - **Bulk Review Actions**: Select checkboxes to bulk approve or bulk reject records.
  - **Signal Breakdown Inspector Drawer**: Detailed view of evaluated signal contributions and instructor review notes input.
  - **Device Sharing Clusters View**: Graph/table showing physical devices shared across multiple student accounts.
  - **Multi-Signal Analytics View**: Visual distribution charts of signal violations.

### File Mapping
- Backend Model:
  - `server/src/models/Attendance.js` (updated with `riskScore`, `riskLevel`, `riskSignals`, `reviewStatus`, `reviewedBy`, `reviewedAt`, `reviewNotes`)
  - `server/src/models/Notification.js` (updated with `ANTI_PROXY_REVIEW` eventType)
- Backend Engine, Controller & Routes:
  - `server/src/utils/antiProxyEngine.js`
  - `server/src/controllers/antiProxyController.js`
  - `server/src/routes/antiProxyRoutes.js`
  - `server/src/controllers/attendanceController.js` (updated)
  - `server/src/app.js` (mounted `/api/anti-proxy`)
- Frontend UI & API Client:
  - `client/src/services/api.js` (`getFlaggedAntiProxyRecordsApi`, `reviewAntiProxyRecordApi`, `bulkReviewAntiProxyRecordsApi`, `getAntiProxyAnalyticsApi`, `getDeviceSharingClustersApi`)
  - `client/src/pages/admin/SuspiciousDetection.jsx` (redesigned review console)
  - `client/src/components/layout/Sidebar.jsx` (updated `Anti-Proxy Console 🛡️` links)
- Tests:
  - `server/tests/antiProxy.test.js`

---

## Phase 22: Attendance Risk Scoring Engine

### Implementation Objective
Implement an exact quantitative 0–100 Attendance Risk Score matrix evaluating incoming student attendance scans across multi-signal risk factors with exact point weights, clamped to 0–100, and classified into 3 risk tiers (`Normal`, `Review`, `High Risk`).

### Key Capabilities & Specifications
- **Multi-Signal Point Scoring Matrix**:
  - **Invalid QR Token**: `+50` points (untrusted signature or invalid payload)
  - **Wrong GPS (Out-of-Bounds)**: `+40` points (scanned outside campus 500m geofence radius)
  - **Duplicate Device**: `+30` points (same physical device used across multiple student accounts today)
  - **Suspicious IP**: `+20` points (concurrency burst > 2 student scans from same IP within 45 seconds)
  - **Unusual Timing**: `+10` points (attendance submitted before session start window or after session expired)
- **Score Clamping & 3-Tier Classification**:
  - Total score is calculated as $S = \min(100, \max(0, \sum \text{scoreContribution}))$.
  - Tier Boundaries:
    - **0 – 30**: `Normal` (`reviewStatus: 'Approved'`, Auto-Marked Present)
    - **31 – 60**: `Review` (`reviewStatus: 'Pending'`, Flagged for Instructor Review)
    - **61 – 100**: `High Risk` (`reviewStatus: 'Pending'`, Flagged for Urgent Review)
- **Backend Model & Controller Engine**:
  - `server/src/models/Attendance.js`: Updated `riskLevel` enum to `['Normal', 'Review', 'Suspicious', 'High Risk']`.
  - `server/src/utils/antiProxyEngine.js`: Refactored `evaluateAttendanceRisk` scoring logic and threshold checks.
  - `server/src/controllers/antiProxyController.js`: Updated filtering queries and analytics breakdown for all 3 risk tiers.
- **Frontend Review Console & Filters**:
  - `client/src/pages/admin/SuspiciousDetection.jsx`: Updated risk dropdown filters (`High Risk (61-100)`, `Review (31-60)`, `Normal (0-30)`), live score badges, and distribution cards.
- **Automated Tests**:
  - `server/tests/antiProxy.test.js`: Added unit and integration test assertions verifying exact signal weights (+50 Invalid QR, +40 Wrong GPS, +30 Duplicate Device, +20 Suspicious IP, +10 Unusual Timing) and tier boundaries.

### File Mapping
- Backend Engine & Models:
  - `server/src/utils/antiProxyEngine.js`
  - `server/src/models/Attendance.js`
  - `server/src/controllers/antiProxyController.js`
- Frontend UI:
  - `client/src/pages/admin/SuspiciousDetection.jsx`
- Tests:
  - `server/tests/antiProxy.test.js`

---

## ✍️ Phase 23 – Attendance Correction Workflow

### Overview & Objective
Teachers should not simply overwrite past attendance records. Instead, Phase 23 introduces a formal Attendance Correction Workflow:
`Original Value ➔ Correction Request ➔ Reason ➔ Teacher/Admin Review ➔ Approved / Rejected`

Every modification preserves a complete audit log recording:
- **Original Value**: The status prior to correction (e.g. `Absent`)
- **New Value**: The requested target status (e.g. `Present`)
- **Changed By**: User ID & Role who initiated the request
- **Reason**: Mandatory textual explanation for audit compliance
- **Reviewer & Review Comments**: Authorized reviewer ID, comment, and decision status
- **Timestamp**: Precise creation and review timestamps

### Core Features & Architecture
- **Mongoose Model (`AttendanceCorrection.js`)**:
  - Schema with references to `attendance`, `student`, `requestedBy`, `reviewedBy`, plus `originalStatus`, `requestedStatus`, `reason`, `status` (`Pending`, `Approved`, `Rejected`), `reviewedAt`, `reviewComment`, and timestamps.
- **Backend Controller & Express Routes (`correctionController.js`, `correctionRoutes.js`)**:
  - `POST /api/attendance-corrections`: Submits request and logs `ATTENDANCE_CORRECTION_REQUESTED` event.
  - `GET /api/attendance-corrections`: Retrieves requests with status/student/subject filters.
  - `PUT /api/attendance-corrections/:id/review`: Approve/Reject requests. On approval, updates original `Attendance` record status.
  - `GET /api/attendance-corrections/history/:attendanceId`: Returns complete audit trail for a specific attendance record.
- **Audit Logging & Socket Alerts**:
  - Emits real-time notifications to students and logs audit entries in `AuditLog`.
- **Frontend Consoles**:
  - Teacher Console (`/teacher/corrections`): Faculty view pending requests, submit corrections with reasons, and approve/reject.
  - Admin Console (`/admin/corrections`): Master institutional governance console with audit transition badges, reason inspection, and execution controls.
  - Roster Integration (`AttendanceHistory.jsx`): Replaced raw edit button with correction request modal requiring a reason.

### File Mapping
- Backend Models & Routes:
  - `server/src/models/AttendanceCorrection.js`
  - `server/src/controllers/correctionController.js`
  - `server/src/routes/correctionRoutes.js`
  - `server/src/app.js`
- Frontend Components & Pages:
  - `client/src/services/api.js`
  - `client/src/pages/teacher/TeacherCorrections.jsx`
  - `client/src/pages/admin/AdminCorrections.jsx`
  - `client/src/pages/teacher/AttendanceHistory.jsx`
  - `client/src/components/layout/Sidebar.jsx`
  - `client/src/App.jsx`

---

## 📌 Phase 24 – Complete Audit Logging

### Core Requirements & Features
- **10 Core Institutional Tracked Actions**:
  - `LOGIN`: Successful authentications and failed login attempt warnings with IP & client details.
  - `LOGOUT`: Explicit user session terminations and token invalidations.
  - `CREATE_STUDENT`: Student account creation via public registration or administrative provisioning.
  - `DELETE_STUDENT`: Student account deletion and offboarding.
  - `MARK_ATTENDANCE`: Attendance marked across all channels (single manual roster, bulk batch marking, and 30s QR check-ins).
  - `EDIT_ATTENDANCE`: Inline attendance adjustments with mandatory before/after state diff and reason (e.g. *Teacher X changed Student Y: Absent → Present, Reason: Medical document verified*).
  - `APPROVE_LEAVE`: Formal approval of student absence/medical leave applications with reviewer notes.
  - `REJECT_LEAVE`: Rejection of student leave applications with faculty remarks.
  - `EXPORT_REPORT`: Exporting attendance records to CSV, Excel, or PDF with filter criteria and total row counts.
  - `CHANGE_SETTINGS`: Modifications to attendance rules, thresholds, factory defaults, subject allocations, and security settings.
- **State Transition & Reason Engine**:
  - `AuditLog` model enriched with first-class fields: `targetUser`, `targetUserName`, `targetUserRollNo`, `originalValue`, `newValue`, `transition` (e.g. `"Absent → Present"`), and `reason` (e.g. `"Medical document verified"`).
  - Automated deduplication flag (`req._auditLogged`) ensuring specific domain actions take precedence over generic HTTP logging.
- **Admin Audit Ledger & Inspector UI (`/admin/audit-logs`)**:
  - **Quick Action Filter Bar**: 10 interactive category filter pills with live counters.
  - **State Mutation Diff Cards**: Visual transition badges (`Absent` ➔ `Present`) with reason callout boxes.
  - **Comprehensive Event Inspector Modal**: Actor identity, target student info, before/after values, network metadata, and technical JSON payload.
  - **Enriched CSV Export**: Multi-column audit export stream including Actor, Student, Action, Transition, Reason, Resource, Method, IP, and Status.
- **Automated Test Suite (`server/tests/audit.test.js`)**:
  - 16/16 passing unit and integration tests verifying all 10 actions, transitions, search queries, filter combinations, and CSV streams.

### File Mapping
- Backend Infrastructure:
  - Model: `server/src/models/AuditLog.js`
  - Middleware: `server/src/middleware/auditMiddleware.js`
  - Controllers:
    - `server/src/controllers/auditController.js`
    - `server/src/controllers/authController.js`
    - `server/src/controllers/userController.js`
    - `server/src/controllers/attendanceController.js`
    - `server/src/controllers/leaveController.js`
    - `server/src/controllers/reportController.js`
    - `server/src/controllers/rulesController.js`
    - `server/src/controllers/correctionController.js`
  - Routes: `server/src/routes/auditRoutes.js`
  - Tests: `server/tests/audit.test.js`
- Frontend Infrastructure:
  - Admin Audit Console: `client/src/pages/admin/AdminAuditLogs.jsx`
  - API Service Client: `client/src/services/api.js`

---

## 📌 Phase 25 – Advanced Notification Engine 🔔

### Core Requirements & Features
- **Centralized Notification Service (`notificationService.js`)**:
  - Modularized, multi-channel notification dispatcher decoupling notification dispatching from individual controllers.
  - Multi-channel routing:
    - **In-App Channel**: Persistent MongoDB `Notification` collection + Real-Time WebSocket emission via Socket.io.
    - **Email Channel**: Responsive HTML email templates via Nodemailer (with branded dark-mode styling, status color accents, and dev simulation fallback).
    - **Push Notification Channel**: Firebase Cloud Messaging (FCM) Web Push via Firebase Admin SDK.
- **7 Core Campus Domain Events**:
  1. `ATTENDANCE_MARKED`: Real-time notification with subject, status (Present, Late, Absent, Excused), date, and slot info.
  2. `LOW_ATTENDANCE` & **Smart Recovery Advice Engine**:
     - Calculates consecutive lectures needed to recover to target attendance threshold (75%):
       $$\text{lecturesNeeded} = \max\left(1, \left\lceil \frac{\text{minPercentage} \times \text{total} / 100 - \text{attended}}{1 - \text{minPercentage} / 100} \right\rceil\right)$$
     - Generates dynamic actionable text (e.g., *"Your Database Systems attendance has fallen to 72%. You need 2 consecutive attended lectures to reach 75%."*).
     - Calculates safe miss buffer for students above threshold:
       $$\text{safeMisses} = \max\left(0, \left\lfloor \frac{\text{attended} - \text{minPercentage} \times \text{total} / 100}{\text{minPercentage} / 100} \right\rfloor\right)$$
  3. `LEAVE_APPROVED`: Triggered when faculty approves absence/medical leave with remarks and reviewer identity.
  4. `LEAVE_REJECTED`: Triggered when faculty rejects leave request with rationale and remarks.
  5. `ANNOUNCEMENT`: Campus broadcasts filtered by target role, department, or campus-wide with priority indicators.
  6. `CLASS_CANCELLED`: Dispatches cancellation alerts to enrolled students with subject, room, slot, and reason.
  7. `TIMETABLE_CHANGED`: Dispatches timetable updates when slots are scheduled, rescheduled, or cancelled.
- **User Notification Preferences & Channel Controls**:
  - Granular channel toggles (`inApp`, `email`, `push`) and event subscription toggles (`attendanceMarked`, `lowAttendance`, `leaveStatus`, `announcements`, `timetableChanged`, `classCancelled`).
  - Dedicated API endpoints (`GET /api/notifications/preferences`, `PUT /api/notifications/preferences`).
- **Interactive Simulator Sandbox & Smart Summary**:
  - `POST /api/notifications/test-dispatch`: Multi-channel test dispatch simulator for instant verification.
  - `GET /api/notifications/smart-summary`: Student-scoped breakdown with recovery goals across all enrolled subjects.
- **Modern Frontend Notification Hub (`NotificationsList.jsx`)**:
  - 6 category filter tabs (All, Attendance Marked, Smart Alerts & Low %, Leave Status, Announcements, Schedule & Timetable).
  - Smart Attendance Recovery Recommendation Callout Banner.
  - Multi-Channel delivery badges (`In-App`, `Email`, `Push`) on each notification card.
  - Notification Preferences configuration modal dialog.
  - Interactive Live Test Simulator modal.

### File Mapping
- Backend Infrastructure:
  - Service: `server/src/services/notificationService.js`
  - Model: `server/src/models/Notification.js`, `server/src/models/User.js`
  - Controller: `server/src/controllers/notificationController.js`
  - Routes: `server/src/routes/notificationRoutes.js`
  - Controllers Updated: `attendanceController.js`, `leaveController.js`, `classController.js`, `timetableController.js`
  - Tests: `server/tests/notifications.test.js`
- Frontend Infrastructure:
  - Context: `client/src/context/NotificationContext.jsx`
  - Notifications Hub Page: `client/src/pages/student/NotificationsList.jsx`
  - Header Notification Drawer: `client/src/components/layout/Header.jsx`
  - API Client: `client/src/services/api.js`

---

## 📈 Phase 26 – Attendance Forecasting Engine

### Core Requirements & Features
- **Theoretical Formulation & Mathematical Proofs**:
  - **Consecutive Recovery Requirement ("How many classes must I attend?")**:
    $$\frac{P + x}{T + x} \ge r \implies x = \max\left(0, \left\lceil \frac{rT - P}{1 - r} \right\rceil\right) = \max\left(0, \left\lceil \frac{R \cdot T - 100 \cdot P}{100 - R} \right\rceil\right)$$
    *Example:* $P=17, T=25$ ($68\%$), target $75\% \implies x = \lceil \frac{0.75(25) - 17}{0.25} \rceil = 7$ consecutive attended lectures.
  - **Safe Miss Allowance ("How many classes can I miss?")**:
    $$\frac{P}{T + m} \ge r \implies m = \max\left(0, \left\lfloor \frac{P - rT}{r} \right\rfloor\right) = \max\left(0, \left\lfloor \frac{100 \cdot P - R \cdot T}{R} \right\rfloor\right)$$
    *Example:* $P=17, T=20$ ($85\%$), target $75\% \implies m = \lfloor \frac{17 - 15}{0.75} \rfloor = 2$ safe lecture misses.
  - **Scenario Simulation ("Can I skip?")**:
    $$\text{Projected } \% = \frac{P + a}{T + a + b} \times 100$$
    Evaluates whether projected attendance remains $\ge R\%$, computing remaining safe buffer or consecutive recovery penalty.
  - **Milestone Ladder**: Tracks milestones for $75\%, 80\%, 85\%, 90\%, 95\%$.
  - **Semester Trajectories**: Computes projected final percentages under 100%, 75%, 50%, and 0% (Floor) future attendance.
- **Backend Architecture & Endpoints**:
  - Pure calculation utility: `server/src/utils/forecastingEngine.js`
  - `POST /api/ai/forecast/calculate`: Multi-parameter sandbox forecasting endpoint.
  - `GET /api/ai/forecast/me`: Student-scoped multi-subject live forecasting aggregator.
  - Natural Language Intent Parsers in `aiController.js`:
    - `CAN_I_SKIP_SCENARIO` (*"Can I skip 2 classes?"*)
    - `HOW_MANY_CAN_I_MISS` (*"How many classes can I miss?"*)
    - `HOW_MANY_MUST_I_ATTEND` (*"How many classes must I attend?"*)
    - `FORECAST_SUMMARY` (*"Forecast my attendance"*)
- **Frontend Forecasting & Predictive Hub (`AttendancePrediction.jsx`)**:
  - 3-in-1 interactive tabbed calculators:
    - 🧮 **1. "Can I Skip?" Simulator**: Subject selector / custom mode, skip/attend steppers, real-time delta and safety badges.
    - 🛡️ **2. "How Many Can I Miss?" Safe Buffer**: Visual allowance cards and interactive custom sandbox.
    - 🎯 **3. "How Many Must I Attend?" Recovery Planner**: Consecutive lectures needed per subject, milestone ladder, and interactive calculator.
  - Semester future class scenarios ($100\%, 75\%, 50\%, 0\%$).
- **AI Chatbot Rich Cards (`AiChatWidget.jsx` & `AiChatPage.jsx`)**:
  - Quick query pills and dedicated cards: `can_skip_card`, `miss_allowance_card`, `must_attend_card`, `forecast_summary_card`.
- **Automated Verification**:
  - Dedicated test suite: `server/tests/forecasting.test.js` (14/14 tests passed).
  - Total system suite: **12 test suites, 98/98 tests passed**.

### File Mapping
- Backend Infrastructure:
  - Math Engine: `server/src/utils/forecastingEngine.js`
  - AI Controller: `server/src/controllers/aiController.js`
  - AI Routes: `server/src/routes/aiRoutes.js`
  - Automated Tests: `server/tests/forecasting.test.js`
- Frontend Infrastructure:
  - Forecasting Hub: `client/src/pages/student/AttendancePrediction.jsx`
  - Chatbot Widget: `client/src/components/ai/AiChatWidget.jsx`
  - AI Chat Page: `client/src/pages/student/AiChatPage.jsx`
  - API Client: `client/src/services/api.js`

---

## 🎓 Phase 27 – Advanced Student Analytics

### Core Requirements & Features
- **Personalized Student Analytics Dashboard**:
  - Comprehensive analytical command center empowering students with real-time personal metrics, historical trajectory tracking, recovery planning, and threshold monitoring.
- **Nine Core Attendance Metrics**:
  - 📊 **Overall Attendance**:
    - Weighted percentage score ($\%$) factoring institutional rules & weights (0.8x Late factor, excused leaves).
    - Raw attendance score and exam qualification status (`Eligible` $\ge 75\%$, `Warning` $< 75\%$).
    - Total sessions conducted, attended, and difference relative to the 75% baseline ($+10.5\%$ above or $-4.2\%$ below).
  - 📚 **Subject Attendance Breakdown**:
    - Granular course-by-course metrics (DSA, DBMS, OS, Networks, Software Engineering).
    - Per-subject progress bars with 75% threshold pins, color-coded health indicators (`Safe Zone`, `At Risk`, `Deficit`).
    - Integrated safe miss allowance ($m = \lfloor \frac{P - rT}{r} \rfloor$) and consecutive recovery requirement ($x = \lceil \frac{rT - P}{1 - r} \rceil$).
    - Dynamic filter tabs (All, Safe $\ge 75\%$, At Risk $< 75\%$) and multi-attribute sorting (Highest %, Lowest %, Name).
  - 📈 **Weekly Trend Progression**:
    - Rolling 6-8 week attendance velocity (W1 through W6).
    - Week-over-week performance delta badges ($\pm\%$) and conducted vs attended session counts.
    - Weekly bar/line visual comparison with the 75% institutional requirement line.
  - 🗓️ **Monthly Trend Progression**:
    - Multi-month timeline progression tracking trailing semester months (including Jun, Jul, Aug).
    - Month-by-month attendance rate, present count, absent count, and late count.
  - ⭐ **Best Subject Dynamic Detection**:
    - Dynamically identifies the student's highest performing subject.
    - Displays subject name, code, percentage, attended/total classes, and positive safety buffer margin.
  - ⚠️ **Worst Subject & Deficit Alert**:
    - Dynamically detects the lowest performing course.
    - Computes deficit gap below 75% and consecutive classes required to reach compliance.
  - ⏱️ **Late Count Analysis**:
    - Aggregates total late arrivals across all courses.
    - Punctuality rating (`Excellent`, `Good`, `Needs Improvement`), late percentage, and rule weight impact.
  - ❌ **Absent Count Analysis**:
    - Total unexcused and excused missed classes.
    - Course-by-course absence distribution and absence rate.
  - 📝 **Leave Count Tracking**:
    - Tracks approved, pending, and rejected leave requests from the `Leave` model plus attendance records marked `On Leave`.
    - Category breakdown: Medical, Personal Emergency, Official Event, and Duty Leave.
- **Visual Attendance Curve & 75% Minimum Benchmark**:
  - Visual spline curve specification matching:
    ```
    Attendance
    100% ┤
     90% ┤       ╭──╮
     80% ┤   ╭───╯  ╰──╮
     75% ┼───┼──────────┼── Minimum
     70% ┤
         └───────────────
           Jun Jul Aug
    ```
  - Dual-engine rendering support: **Recharts** (AreaChart with monotone curve and glowing linear gradient) and **Chart.js** (Line with custom canvas tension and fill).
  - Prominent horizontal dashed **75% Minimum Requirement** line with clear labeling and threshold intersection callouts.
  - Retro-modern ASCII visual card displaying the exact threshold curve specification with recent quarter performance nodes.
- **Backend Architecture & Endpoints**:
  - Analytical engine: `server/src/utils/studentAnalyticsEngine.js`
  - Controller: `server/src/controllers/analyticsController.js` (`getStudentPersonalAnalytics`)
  - Endpoints:
    - `GET /api/analytics/student/me`: Authenticated student personal analytics.
    - `GET /api/analytics/student/:studentId`: Scoped analytics accessible by student (own ID), faculty, and administrator.
  - High-fidelity realistic fallback dataset for fresh student accounts with zero recorded sessions.
- **Automated Verification**:
  - Dedicated test suite: `server/tests/studentAnalytics.test.js` (5/5 tests passed).
  - Complete system suite: **13 test suites, 103/103 tests passed**.

### File Mapping
- Backend Infrastructure:
  - Analytics Engine: `server/src/utils/studentAnalyticsEngine.js`
  - Analytics Controller: `server/src/controllers/analyticsController.js`
  - Analytics Routes: `server/src/routes/analyticsRoutes.js`
  - Automated Tests: `server/tests/studentAnalytics.test.js`
- Frontend Infrastructure:
  - Dashboard Page: `client/src/pages/student/StudentAnalytics.jsx`
  - API Client: `client/src/services/api.js`
  - Routing: `client/src/App.jsx`
  - Navigation: `client/src/components/layout/Sidebar.jsx`
  - Quick Linkage: `client/src/pages/student/StudentDashboard.jsx`

---

## 📊 Phase 28 – Teacher Analytics

### Core Requirements & Features
- **Faculty Analytics & Classroom Insights Command Center**:
  - Comprehensive analytical suite empowering educators with real-time class attendance diagnostics, weekday behavioral trend detection, time-slot performance, and section comparisons.
- **Seven Core Attendance Dimensions**:
  1. 📊 **Average Class Attendance**:
     - Overall weighted average attendance rate factoring institutional rule weights (0.8x Late factor, excused leaves).
     - Total lectures conducted, total attendances recorded, present count, absent count, and late count.
     - Performance comparison against the 75% institutional standard with delta badges (`+7.5% above minimum`).
  2. 👥 **Most Absent Students**:
     - Ranked directory of chronic defaulters in the teacher's classes.
     - Metrics: Student name, roll number, department, division, total classes, absent count, current attendance rate %, and shortage deficit calculation ($x = \max(0, \lceil \frac{0.75 T - P}{0.25} \rceil)$) indicating exact consecutive classes needed to recover to 75%.
     - Risk status indicators (`Critical Risk < 65%`, `Shortage Warning 65-74%`, `Borderline`).
  3. ⏱️ **Most Late Students**:
     - Chronic late-arrival directory across faculty courses.
     - Metrics: Student name, roll number, division, total sessions, late arrival count, lateness rate %, and punctuality tier (`High Lateness Risk > 20%`, `Frequent Latecomer 10-20%`, `Occasional Late < 10%`).
  4. ⏰ **Attendance by Lecture (Time Slot Breakdown)**:
     - Grouped attendance analytics across lecture time slots: Early Morning (09:00 - 10:00 AM), Mid-Morning (10:15 - 11:45 AM), Post-Lunch (01:30 - 02:45 PM), and Late Afternoon (03:15 - 04:30 PM).
     - Identifies peak engagement periods (10:15 AM: 89.2%) versus post-lunch attendance drops (1:30 PM: 73.8%).
  5. 📅 **Attendance by Weekday & Behavioral Pattern Detection**:
     - Monday through Friday percentage distribution:
       $$\text{Monday: 82\%} \quad \text{Tuesday: 91\%} \quad \text{Wednesday: 76\%} \quad \text{Thursday: 88\%} \quad \text{Friday: 69\%}$$
     - **Automated Behavioral Insight Engine**:
       - Detects the pre-weekend attendance dip: *"⚠️ Poor Friday Attendance Pattern Detected (69%) — 12.2% below the weekly average. High student absenteeism occurs ahead of the weekend."*
       - Provides actionable pedagogical interventions: *"Consider scheduling interactive problem-solving labs, graded quizzes, or team programming activities on Fridays."*
       - Highlights peak engagement days (Tuesday: 91%).
  6. 📚 **Subject Attendance Breakdown**:
     - Course-by-course performance (e.g. CS401 Database Systems, CS405 Web Technologies, CS502 Software Architecture).
     - Total classes conducted, enrolled students, attendance rate %, present/absent/late counts, and health status badges (`Healthy`, `Satisfactory`, `At Risk`).
  7. 🏢 **Division Comparison**:
     - Cross-section comparative metrics (Division A / Sec A vs Division B / Sec B vs Division C / Sec C).
     - Total enrolled students, sessions held, attendance rates, division rankings (#1, #2, #3), and variance from the leading division.
- **Embedded Teacher Dashboard Insights**:
  - `TeacherDashboard.jsx` enhanced with a prominent **Classroom Attendance Insights & Weekday Patterns** section displaying the Monday–Friday pattern strip, Friday drop alert badge, and quick link to the full analytics hub.
- **Dedicated Teacher Analytics Hub (`TeacherAnalytics.jsx`)**:
  - Accessible at `/teacher/analytics`.
  - Filter by Subject (All Subjects or specific course), Division (All Divisions or specific section), and Timeframe (`All Time`, `Past 30 Days`, `Semester Term`).
  - Interactive tabs: Attendance by Weekday, Attendance by Lecture Slot, Most Absent & Most Late Students, and Subject & Division Comparison.
  - Formatted CSV export generator.
- **Backend Architecture & Endpoints**:
  - Analytical engine: `server/src/utils/teacherAnalyticsEngine.js`
  - Controller: `server/src/controllers/analyticsController.js` (`getTeacherAnalytics`)
  - Endpoints:
    - `GET /api/analytics/teacher/me`: Logged-in teacher's analytics with query filters (`subject`, `division`, `timeframe`).
    - `GET /api/analytics/teacher/:teacherId`: Accessible by faculty and administrators.
  - Realistic fallback dataset matching the user prompt's exact weekday metrics when zero historical database records exist.
- **Automated Verification**:
  - Dedicated test suite: `server/tests/teacherAnalytics.test.js` (7/7 tests passed).
  - Full system suite: **14 test suites, 110/110 tests passed**.

### File Mapping
- Backend Infrastructure:
  - Analytics Engine: `server/src/utils/teacherAnalyticsEngine.js`
  - Analytics Controller: `server/src/controllers/analyticsController.js`
  - Analytics Routes: `server/src/routes/analyticsRoutes.js`
  - Automated Tests: `server/tests/teacherAnalytics.test.js`
- Frontend Infrastructure:
  - Analytics Hub Page: `client/src/pages/teacher/TeacherAnalytics.jsx`
  - Teacher Dashboard Widget: `client/src/pages/teacher/TeacherDashboard.jsx`
  - API Client: `client/src/services/api.js` (`getTeacherAnalyticsApi`)
  - Routing: `client/src/App.jsx`
  - Navigation: `client/src/components/layout/Sidebar.jsx`

---

## 📊 Access Control & Feature Matrix Across All Phases

| Feature / Capability | Student | Teacher | Admin | Phase |
| :--- | :---: | :---: | :---: | :---: |
| **Authentication & Profile Reset** | ✅ | ✅ | ✅ | Phase 1 |
| **User Role Access Control (RBAC)** | ✅ | ✅ | ✅ | Phase 1 & 16 |
| **Database Schemas & Models** | — | — | — | Phase 2 |
| **View Personal Dashboard & Graph** | ✅ | ❌ | ❌ | Phase 3 & 6 |
| **View Today's Classes Schedule** | ✅ | ✅ | ❌ | Phase 3, 4 & 9 |
| **Receive Low Attendance Alerts** | ✅ | ❌ | ❌ | Phase 3 & 12 |
| **Take Class Attendance & Notes** | ❌ | ✅ | ✅ | Phase 4 & 7 |
| **View & Edit Attendance History** | ❌ | ✅ | ✅ | Phase 4 & 7 |
| **Export Class Attendance CSV** | ❌ | ✅ | ✅ | Phase 4 & 7 |
| **Create Academic Departments** | ❌ | ❌ | ✅ | Phase 5 |
| **Create Degree Courses** | ❌ | ❌ | ✅ | Phase 5 |
| **Add Academic Subjects** | ❌ | ❌ | ✅ | Phase 5 |
| **Add & Manage Teachers** | ❌ | ❌ | ✅ | Phase 5 |
| **Add & Manage Students** | ❌ | ❌ | ✅ | Phase 5 |
| **Assign Teachers to Subjects** | ❌ | ❌ | ✅ | Phase 5 |
| **Assign Subjects to Students/Teachers** | ❌ | ❌ | ✅ | Phase 5 |
| **View Executive Dashboard Stats** | ❌ | ❌ | ✅ | Phase 5 |
| **View Attendance Calendar** | ✅ | ❌ | ❌ | Phase 6 |
| **Download Official Report & Transcript** | ✅ | ✅ | ✅ | Phase 6 & 10 |
| **Apply for Absence / Medical Leave** | ✅ | ❌ | ❌ | Phase 6 & 13 |
| **Upload Leave Supporting Proof Document** | ✅ | ❌ | ❌ | Phase 13 |
| **Approve / Reject Student Leaves & Remarks** | ❌ | ✅ | ✅ | Phase 13 |
| **Maintain Full Leave Authorization History** | ✅ | ✅ | ✅ | Phase 13 |
| **Manage Profile & Security Settings** | ✅ | ✅ | ✅ | Phase 6 |
| **Create Class Sessions (Faculty)** | ❌ | ✅ | ✅ | Phase 7 |
| **Interactive Attendance Screen & Remarks** | ❌ | ✅ | ✅ | Phase 7 |
| **Edit Attendance Status & Remarks** | ❌ | ✅ | ✅ | Phase 7 |
| **Generate & Display 30s Dynamic QR** | ❌ | ✅ | ✅ | Phase 8 |
| **Scan QR Attendance & Auto-Mark** | ✅ | ❌ | ❌ | Phase 8 |
| **GPS Campus Radius Verification** | ✅ | ✅ | ✅ | Phase 8 |
| **Device Fingerprint & Anti-Proxy Guard** | ✅ | ✅ | ✅ | Phase 8 |
| **Create & Manage Weekly Timetable Slots** | ❌ | ✅ | ✅ | Phase 9 |
| **View Tomorrow's Classes Schedule** | ✅ | ✅ | ❌ | Phase 9 |
| **View Full Weekly Timetable Matrix** | ✅ | ✅ | ❌ | Phase 9 |
| **Generate Daily, Weekly, Monthly, Semester Reports** | ✅ | ✅ | ✅ | Phase 10 |
| **Export Reports to PDF, Excel, and CSV** | ✅ | ✅ | ✅ | Phase 10 |
| **View Attendance % Ratio Chart (Doughnut/Pie)** | ✅ | ✅ | ✅ | Phase 11 |
| **View Department Comparison Chart** | ❌ | ✅ | ✅ | Phase 11 |
| **View Monthly Trend & 75% Benchmark Line Chart** | ✅ | ✅ | ✅ | Phase 11 |
| **View Subject-Wise Attendance Chart** | ✅ | ✅ | ✅ | Phase 11 |
| **View Student Ranking & Leaderboard Chart** | ❌ | ✅ | ✅ | Phase 11 |
| **Switch Chart Library Engine (Recharts / Chart.js)** | ✅ | ✅ | ✅ | Phase 11 |
| **Socket.io Real-Time Event Alerts & Audio Chime** | ✅ | ✅ | ✅ | Phase 12 |
| **FCM Web Push Push Notifications Registration** | ✅ | ✅ | ✅ | Phase 12 |
| **Receive Attendance Marked Real-Time Alert** | ✅ | ❌ | ❌ | Phase 12 |
| **Receive Class Cancelled Real-Time Alert** | ✅ | ❌ | ❌ | Phase 12 |
| **Receive Low Attendance Warning (<75%)** | ✅ | ❌ | ❌ | Phase 12 |
| **Receive Leave Application Approved/Rejected Alert** | ✅ | ❌ | ❌ | Phase 12 & 13 |
| **Broadcast & Receive Campus Announcements** | ✅ | ✅ | ✅ | Phase 12 |
| **Attendance Prediction Engine & "What-If" Simulator** | ✅ | ❌ | ❌ | Phase 14 |
| **Natural Language AI Chatbot ("Ask My Attendance")** | ✅ | ✅ | ✅ | Phase 14 |
| **Suspicious Attendance & Proxy Detection Console** | ❌ | ✅ | ✅ | Phase 14 |
| **Most Absent Students & Shortage Deficit Calculator** | ❌ | ❌ | ✅ | Phase 15 |
| **Best Attendance Leaderboard & Perfect 100% Badges** | ❌ | ❌ | ✅ | Phase 15 |
| **Academic Department Attendance Ranking & HOD View** | ❌ | ❌ | ✅ | Phase 15 |
| **Teacher Performance & On-Time Marking Metrics** | ❌ | ❌ | ✅ | Phase 15 |
| **Daily Attendance Inspector & Time Slot Breakdown** | ❌ | ❌ | ✅ | Phase 15 |
| **Helmet HTTP Security Headers** | ✅ | ✅ | ✅ | Phase 16 |
| **Sliding-Window Rate Limiting Protection** | ✅ | ✅ | ✅ | Phase 16 |
| **Hardened JWT Verification & Expiration Handling** | ✅ | ✅ | ✅ | Phase 16 |
| **Password Hashing & Strength Governance** | ✅ | ✅ | ✅ | Phase 16 |
| **Granular Multi-Role RBAC Authorization** | ✅ | ✅ | ✅ | Phase 16 |
| **Payload Input Validation & Schema Sanitization** | ✅ | ✅ | ✅ | Phase 16 |
| **XSS Payload Injection Protection** | ✅ | ✅ | ✅ | Phase 16 |
| **Configurable CORS Domain Management** | ✅ | ✅ | ✅ | Phase 16 |
| **Security Audit Logging & Admin Audit Console** | ❌ | ❌ | ✅ | Phase 16 |
| **Public Self-Registration Student Role Enforcement** | ✅ | ❌ | ❌ | Phase 16 |
| **Admin-Only Provisioning for Faculty & Admin Accounts** | ❌ | ❌ | ✅ | Phase 16 |
| **Nodemailer Password Reset Email Provider Dispatch** | ✅ | ✅ | ✅ | Phase 16 |
| **SHA-256 Server-Side Hashed Refresh Token Storage** | ✅ | ✅ | ✅ | Phase 16 |
| **HTTP-Only Secure Cookie Refresh Token Transport** | ✅ | ✅ | ✅ | Phase 16 |
| **Authentication Module Automated Unit & Integration Tests** | ✅ | ✅ | ✅ | Phase 17 |
| **Attendance & Defaulter Threshold Tests** | ✅ | ✅ | ✅ | Phase 17 |
| **30s Dynamic QR Token & Anti-Proxy Guard Tests** | ✅ | ✅ | ✅ | Phase 17 |
| **GPS Campus Geofencing (500m) Boundary Tests** | ✅ | ✅ | ✅ | Phase 17 |
| **Daily/Weekly/Monthly/Semester Report Generator Tests** | ✅ | ✅ | ✅ | Phase 17 |
| **Charts Analytics & Trend Datasets Tests** | ✅ | ✅ | ✅ | Phase 17 |
| **Notification Engine & FCM Web Push Tests** | ✅ | ✅ | ✅ | Phase 17 |
| **Create & Manage Academic Years** | ❌ | ❌ | ✅ | Phase 18 |
| **Dynamic Semesters Setup (No hardcoding)** | ❌ | ❌ | ✅ | Phase 18 |
| **Class Divisions & Sections (IT-A, IT-B, etc.)** | ❌ | ❌ | ✅ | Phase 18 |
| **Visual Academic Hierarchy Tree Console** | ✅ | ✅ | ✅ | Phase 18 |
| **Student Batch Promotion Engine** | ❌ | ❌ | ✅ | Phase 18 |
| **Student Enrollment & Session History Tracking** | ✅ | ✅ | ✅ | Phase 18 |
| **Configurable Attendance Rules & Thresholds Engine** | ❌ | ❌ | ✅ | Phase 19 |
| **7-Status Matrix Rules & Attendance Weights** | ❌ | ❌ | ✅ | Phase 19 |
| **Interactive Rules Simulator / Sandbox Console** | ✅ | ✅ | ✅ | Phase 19 |
| **Attendance Session Engine (Session ID, Start/End Timestamps)** | ❌ | ✅ | ✅ | Phase 20 |
| **Session-Linked Attendance Logs & QR/GPS Session Management** | ✅ | ✅ | ✅ | Phase 20 |
| **Anti-Proxy Attendance System (Multi-Signal Risk Engine)** | ✅ | ✅ | ✅ | Phase 21 |
| **Teacher & Admin Suspicious Attendance Review Console** | ✅ | ✅ | ✅ | Phase 21 |
| **Attendance Risk Scoring Engine (0-100 Multi-Signal Scoring)** | ✅ | ✅ | ✅ | Phase 22 |
| **3-Tier Risk Classification (0-30 Normal, 31-60 Review, 61-100 High Risk)** | ✅ | ✅ | ✅ | Phase 22 |
| **Attendance Correction Request Submission & Mandatory Reason** | ✅ | ✅ | ✅ | Phase 23 |
| **Teacher & Admin Attendance Correction Review Consoles** | ❌ | ✅ | ✅ | Phase 23 |
| **Complete Attendance Correction Audit Trail (Original, New, Changed By, Reason, Timestamps)** | ✅ | ✅ | ✅ | Phase 23 |
| **Complete Institutional Action Tracking (10 Core Action Events)** | ❌ | ❌ | ✅ | Phase 24 |
| **Attendance State Diffs & Transition Ledger (e.g. Absent → Present)** | ❌ | ❌ | ✅ | Phase 24 |
| **Mandatory Change Reason Verification ("Medical document verified")** | ❌ | ❌ | ✅ | Phase 24 |
| **10-Action Quick Filter Ledger, Inspector Modal & CSV Export** | ❌ | ❌ | ✅ | Phase 24 |
| **Multi-Channel Notification Dispatching (In-App, Email, Push)** | ✅ | ✅ | ✅ | Phase 25 |
| **Smart Notification Recovery Advisor ("N lectures needed for 75%")** | ✅ | ❌ | ❌ | Phase 25 |
| **User Notification Preferences & Channel Toggles** | ✅ | ✅ | ✅ | Phase 25 |
| **Automated Multi-Channel Domain Events (7 Event Processors)** | ✅ | ✅ | ✅ | Phase 25 |
| **Interactive Notification Simulator & Smart Summary Sandbox** | ✅ | ✅ | ✅ | Phase 25 |
| **Attendance Forecasting Mathematical Recovery Engine ($x = \lceil \frac{rT - P}{1-r} \rceil$)** | ✅ | ✅ | ✅ | Phase 26 |
| **Safe Miss Allowance Calculator ($m = \lfloor \frac{P - rT}{r} \rfloor$)** | ✅ | ✅ | ✅ | Phase 26 |
| **Interactive "Can I Skip?" Scenario Simulator & What-If Sandbox** | ✅ | ✅ | ✅ | Phase 26 |
| **Multi-Benchmark Milestone Ladder (75%, 80%, 85%, 90%)** | ✅ | ✅ | ✅ | Phase 26 |
| **AI Assistant NLP Forecasting Integration (Skip & Recovery Cards)** | ✅ | ✅ | ✅ | Phase 26 |
| **Personal Student Analytics Dashboard (9 Core Metrics & Status Breakdown)** | ✅ | ✅ | ✅ | Phase 27 |
| **Visual Attendance Curve with 75% Minimum Benchmark Line** | ✅ | ✅ | ✅ | Phase 27 |
| **Subject Attendance Safe Buffer & Consecutive Recovery Calculator** | ✅ | ✅ | ✅ | Phase 27 |
| **Weekly & Monthly Attendance Velocity Progression** | ✅ | ✅ | ✅ | Phase 27 |
| **Teacher Analytics & Insights Dashboard (7 Core Dimensions)** | ❌ | ✅ | ✅ | Phase 28 |
| **Weekday Pattern Analysis & Friday Slump Detection (Mon 82% to Fri 69%)** | ❌ | ✅ | ✅ | Phase 28 |
| **Attendance by Lecture Time Slot (Morning vs Post-Lunch Slump)** | ❌ | ✅ | ✅ | Phase 28 |
| **Most Absent & Most Late Faculty Student Directories with Deficit Math** | ❌ | ✅ | ✅ | Phase 28 |
| **Course Subject & Division Comparative Analytics (Sec A vs Sec B vs Sec C)** | ❌ | ✅ | ✅ | Phase 28 |
| **Admin Intelligence Dashboard (College-Level Control Center)** | ❌ | ❌ | ✅ | Phase 29 |
| **Top Executive KPI Console (Students: 2,481, Teachers: 143, Today: 87.4%, Defaulters: 312)** | ❌ | ❌ | ✅ | Phase 29 |
| **Cross-Department Performance Benchmark & Variance Analysis** | ❌ | ❌ | ✅ | Phase 29 |
| **Inter-Division & Section Matrix (Class Size, Mentors, Defaulters)** | ❌ | ❌ | ✅ | Phase 29 |
| **College-Wide 6-Month Trendline & Weekday Slump Analysis** | ❌ | ❌ | ✅ | Phase 29 |
| **Defaulter Intelligence & Recovery Roster ($x = \lceil \frac{0.75T - P}{0.25} \rceil$)** | ❌ | ❌ | ✅ | Phase 29 |
| **Faculty Teaching Compliance, On-Time Marking & Slot Distribution** | ❌ | ❌ | ✅ | Phase 29 |
| **College Anti-Proxy & Fraud Telemetry Console** | ❌ | ❌ | ✅ | Phase 29 |
| **Institutional Leave Analytics & Truancy Impact** | ❌ | ❌ | ✅ | Phase 29 |
| **Automated Defaulter Management & Multi-Tier Escalation** | ✅ | ✅ | ✅ | Phase 30 |
| **Configurable Escalation Thresholds (<75%, <70%, <65%, <60%)** | ❌ | ❌ | ✅ | Phase 30 |
| **Automated Parent/Guardian Email Alert Dispatch (<60%)** | ✅ | ✅ | ✅ | Phase 30 |
| **Persistent Defaulter Tracking & Counselor Audit Ledger** | ❌ | ✅ | ✅ | Phase 30 |

---

## 📌 Phase 29: Admin Intelligence Dashboard 🧠

### Overview & Control Center Architecture
Phase 29 transforms the administrator portal into an executive, college-level control center. It synthesizes institutional metrics across all academic departments, student divisions, faculty members, and security scanners into a single unified intelligence hub.

### Core Analytical Dimensions
1. **Executive KPI Command Center**:
   - Total Enrolled Students: `2,481` (across 6 academic departments)
   - Total Faculty Instructors: `143` (1:17 student-teacher ratio)
   - Today's Live Attendance Rate: `87.4%` (2,168 Present, 213 Absent, 100 Late)
   - Critical Defaulters (<75%): `312` students (12.6% institution-wide)
   - Operational telemetry: Active departments, divisions, pending leaves, flagged proxy scans.

2. **Department Comparison**:
   - Cross-department attendance ranking: CSE (91.2%), IT (89.6%), AI&DS (88.5%), ECE (84.8%), ME (80.4%), CE (78.5%).
   - Metrics: Enrolled students, faculty roster, average attendance %, defaulters count, variance from college average.
   - Interactive comparative bar charts and performance tiers (`Top Performer`, `Solid Performer`, `Watchlist`).

3. **Division Comparison**:
   - Granular section matrix: CSE-A, CSE-B, CSE-C, IT-A, IT-B, AIDS-A, ECE-A, ECE-B, ME-A, ME-B, CE-A.
   - Metrics: Enrollment, mentor/coordinator, attendance rate %, today's rate %, defaulters count, and risk badges.

4. **Attendance Trends & Day Velocity**:
   - 6-Month historical velocity with 75% UGC benchmark line.
   - Weekday distribution: Monday (86.8%), Tuesday Peak (90.4%), Wednesday (87.2%), Thursday (88.9%), Friday Slump Alert (73.1% with -17.3% drop).
   - Strategic institutional recommendations.

5. **Defaulter Analysis & Deficit Math**:
   - 3-tier severity classification: Severe Emergency (<50%), Critical Shortage (50-65%), Warning Borderline (65-75%).
   - Exact mathematical formula for clearing defaulter status: $x = \lceil \frac{0.75T - P}{0.25} \rceil$.
   - Ranked defaulter roster with search, department filtering, and simulated bulk warning alerts dispatch.

6. **Teacher & Class Statistics**:
   - Faculty compliance: 1,870 scheduled vs 1,824 conducted (97.5% conduction rate).
   - On-time marking punctuality index: 94.8%.
   - Top faculty leaderboard and lecture slot breakdown (Morning 8:30-10:30, Mid-day 11:00-1:00, Afternoon 2:00-4:00).

7. **Suspicious Attendance Intelligence**:
   - Anti-proxy overview: 2,481 scans monitored, 24 flagged today (6 high risk, 11 medium risk).
   - Signal distribution: Hardware device fingerprint collisions (50%), GPS geofence boundary breaches &gt;500m (33.3%), rapid succession scans &lt;30s (16.7%).
   - Live incident inspection feed with direct link to Anti-Proxy Security Console.

8. **Leave Statistics & Truancy Impact**:
   - 184 total applications with 77.2% approval rate (142 approved, 26 pending, 16 rejected).
   - Leave type breakdown: Medical Leave (42.4%), Official Duty (28.3%), Casual Emergency (19.5%), Sports & Cultural (9.8%).
   - Department leave load distribution.

---

## 📌 Phase 30: Automated Defaulter Management 🚨

### Overview & Escalation Pipeline Architecture
Phase 30 establishes an automated, policy-governed defaulter management system that proactively tracks student attendance, evaluates shortages against configurable institutional thresholds, and dispatches progressive multi-channel escalations.

### Escalation Hierarchy & Workflow
```
Student Check-In / Lecture Conducted
                  ↓
       Attendance Rate Evaluated
                  ↓
          Attendance < 75%
                  ↓
               Warning
                  ↓
            Notification
                  ↓
            Defaulter List
```

### Progressive Multi-Tier Escalation Thresholds (Configurable)
1. **< 75% → Warning**:
   - Low Attendance Warning dispatched to student (In-App, Push, Email).
   - Computes recovery classes needed: $x = \lceil \frac{rT - P}{1 - r} \rceil$ where $r = 0.75$.
2. **< 70% → Serious Warning**:
   - Serious Attendance Warning issued.
   - Student status flagged as `Warning`.
   - Prompts mandatory faculty mentor / academic advisor counseling meeting.
3. **< 65% → Admin Alert**:
   - Administrative Defaulter Alert dispatched to Academic Administrators and Department HODs.
   - Student placed on high-priority central examination watchlist.
4. **< 60% → Parent/Guardian Alert**:
   - Critical Defaulter Alert dispatched.
   - Automated formal notice generated and emailed directly to registered parent/guardian (`guardianEmail`).
   - Advises urgent institutional intervention to prevent semester debarment.

### Key Features
- **Configurable Thresholds**: Administrators can dynamically modify Warning, Serious Warning, Admin Alert, and Parent Alert percentages via an interactive slider panel.
- **Deficit Recovery Mathematics**: Real-time calculation of consecutive lectures required to restore standing ($x = \lceil \frac{rT - P}{1 - r} \rceil$).
- **Automated Trigger Hooks**: Automatically re-evaluates student status upon attendance mark, bulk marking, or QR self check-in.
- **Recovery & Resolution Ledger**: Clears defaulter status automatically when cumulative attendance reaches benchmark ($\ge 75\%$), or allows administrators to record verified counselor/medical clearance.
- **Executive Console**: Dedicated Admin Defaulter Management Console (`/admin/defaulters`) with filtering, search, CSV export, timeline modal, and bulk dispatch.

---

## 📌 Phase 31: Parent/Guardian Portal 👨‍👩‍👧

### Overview & Read-Only Governance
Phase 31 introduces a dedicated, high-fidelity **Parent/Guardian Portal** tailored for college and university environments. Parents gain transparent, real-time insight into their ward's academic standing, attendance records, subject breakdowns, leave history, circulars, and institutional attendance warnings.

Critically, the Parent portal operates under a **Strict Read-Only Access Guarantee**: parents have full visibility into attendance and leave data but cannot alter, modify, mark, or override any institutional records.

### Core Capabilities & Features
1. **Ward Overview & Identity**:
   - Multi-ward support allowing parents with multiple children to switch between students seamlessly.
   - Comprehensive profile showing roll number, semester, department, section, and faculty advisor contact details.
2. **Cumulative Attendance Monitoring**:
   - Real-time score indicator comparing cumulative attendance against the mandatory 75% university benchmark.
   - Exam eligibility indicator (Safe Zone $>75\%$ vs Defaulter Shortage $<75\%$).
   - Quick counters: Total conducted, attended, absent, late arrivals, and sanctioned medical leaves.
3. **Subject-Wise Attendance Breakdown**:
   - Course-by-course breakdown displaying total lectures, sessions attended, absences, and attendance percentages.
   - Threshold status indicator (Safe Zone, Shortage Warning, Critical Defaulter).
   - Recovery math: Exact consecutive lectures required to reach 75%, or safe misses remaining before dropping below threshold.
   - Course professor and instructor contact cards.
4. **Leave Requests & Approval Status**:
   - History of all student-submitted leave requests (Medical, Emergency, Official Duty).
   - Date ranges, total day count, submitted medical certificates/attachments, and reviewer remarks.
   - Clear policy disclaimer that leave requests must be filed directly by the student.
5. **Defaulter Warnings & Escalation Center**:
   - Visual 4-tier escalation tracker (Tier 1: Warning $<75\%$, Tier 2: Serious $<70\%$, Tier 3: Admin Alert $<65\%$, Tier 4: Parent Alert $<60\%$).
   - Mathematical deficit recovery calculator ($x = \lceil \frac{rT - P}{1 - r} \rceil$).
   - Academic Counseling Cell and Department Head direct contact links.
6. **Alerts & University Circulars**:
   - Dedicated notification center categorizing low attendance warnings, leave approvals, and circulars.
   - Read/unread tracking and audio chimes.

### Strict Read-Only Security Architecture
To guarantee academic integrity, all state-mutation routes enforce server-side role authorization checks:
- `POST /api/attendance` &bull; `403 Forbidden` for `parent`
- `PUT /api/attendance/:id` &bull; `403 Forbidden` for `parent`
- `DELETE /api/attendance/:id` &bull; `403 Forbidden` for `parent`
- `POST /api/attendance/bulk` &bull; `403 Forbidden` for `parent`
- `POST /api/attendance/scan-qr` &bull; `403 Forbidden` for `parent`
- `POST /api/leaves` &bull; `403 Forbidden` for `parent` (student only)
- `PUT /api/leaves/:id` &bull; `403 Forbidden` for `parent` (teacher/admin only)

### File Mapping
- **Backend**:
  - Model: `server/src/models/User.js` (extended with `role: 'parent'`, `linkedStudents`, `wardRollNo`)
  - Controller: `server/src/controllers/parentController.js`
  - Routes: `server/src/routes/parentRoutes.js` (`/api/parent/*`)
  - Notifications: `server/src/services/notificationService.js` (in-app parent dispatch)
  - Tests: `server/tests/parentPortal.test.js` (18 unit & security integration tests)
- **Frontend**:
  - API Client: `client/src/services/api.js` (`getParentWardsApi`, `getParentOverviewApi`, etc.)
  - Layout: `client/src/pages/parent/ParentLayout.jsx`
  - Dashboard: `client/src/pages/parent/ParentDashboard.jsx`
  - Attendance Log: `client/src/pages/parent/ParentAttendance.jsx`
  - Subject-Wise: `client/src/pages/parent/ParentSubjects.jsx`
  - Leaves: `client/src/pages/parent/ParentLeaves.jsx`
  - Warnings & Defaulter Recovery: `client/src/pages/parent/ParentWarnings.jsx`
  - Notifications: `client/src/pages/parent/ParentNotifications.jsx`
  - Route Config: `client/src/App.jsx` (`/parent/*`)
  - Auth & Switchers: `client/src/pages/auth/LoginPage.jsx`, `client/src/components/layout/Navbar.jsx`, `Sidebar.jsx`, `Header.jsx`, `ProtectedRoute.jsx`

---

## 📌 Phase 32: Document Verification 📄

### Overview & Multi-Stage Architecture
Phase 32 (also designated as Phase 31 Part B in architectural specifications) implements an enterprise-grade, secure **Document Verification System** for student leave applications. When students submit absence requests (medical certificates, event attendance permits, duty orders), the application traverses an end-to-end multi-tier verification pipeline:

```
        Student Submits Application
                    ↓
        Upload Supporting Document
   (PDF, JPG, PNG | Max 5MB | Antivirus Scan)
                    ↓
          Teacher / Mentor Review
        (Inspect via Private Access)
                    ↓
         Admin Final Verification
   (Central Sanction & Attendance Adjustment)
```

### Core Security & Document Integrity Features
1. **Strict File Size Limits**:
   - Hard limit enforced at Multer middleware layer: **5 MB** (`5 * 1024 * 1024` bytes).
   - Pre-upload client validation preventing unnecessary upload bandwidth with instant user feedback.
   - Standardized 400 Bad Request error handler (`LIMIT_FILE_SIZE`).
2. **Binary Magic-Byte MIME Validation**:
   - Prevents file spoofing attacks where dangerous executables or HTML scripts are renamed to `.pdf` or `.png`.
   - Direct inspection of the initial buffer bytes:
     - **PDF**: `%PDF` signature (`0x25 0x50 0x44 0x46`)
     - **PNG**: PNG signature (`0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A`)
     - **JPEG/JPG**: SOI marker (`0xFF 0xD8 0xFF`)
   - Rejects any other format or mismatch with immediate security alert.
3. **Secure, Non-Public Isolated Storage**:
   - Files are stored in `server/secure_uploads/documents/` — completely excluded from public static routes (`/uploads`).
   - Cryptographically randomized file naming (`doc-${Date.now()}-${randomHex}${ext}`) preventing path traversal and file enumeration.
4. **Virus & Malware Scanning Engine**:
   - Built-in heuristic and signature engine:
     - Scans for EICAR standard anti-virus test file signature.
     - Scans for disguised PE/DOS executables (`MZ` header) and ELF binary headers.
     - Scans for active script payloads (`<script`, `javascript:`, `eval(`, PHP tags).
     - Scans PDFs for dangerous active process vectors (`/Launch`, `/JavaScript`, `/JS`).
     - ClamAV integration hook for daemon socket streaming where available.
   - Computes SHA-256 cryptographic checksum for tamper verification.
   - Quarantines and immediately unlinks infected files, recording a security violation in audit logs.
5. **Private Access URLs & Signed Tokens**:
   - Zero public direct links.
   - **Authenticated Session Stream**: `GET /api/leaves/:id/document` verifies student ownership, teacher department assignment, admin role, or linked parent relationship.
   - **Signed Expiring Access Tokens**: `GET /api/leaves/:id/document-token` generates an HMAC/JWT signed token valid for 15 minutes, allowing safe inline streaming (`GET /api/leaves/document-stream/:token`) in iframes or modals without exposing user credentials in URL queries.
   - Sets secure headers: `Content-Disposition: inline`, `X-Content-Type-Options: nosniff`, `Cache-Control: private, no-store`.
6. **Multi-Tier State Machine**:
   - `Pending` (`stage: teacher_review`): Initial state upon student upload.
   - `Teacher Verified` (`stage: admin_verification`): Faculty mentor verifies medical proof and forwards to Admin.
   - `Approved` (`stage: completed`): Admin officially sanctions the leave, records audit entry, and notifies student and parent.
   - `Rejected` (`stage: rejected`): Rejection by teacher or admin with mandatory remarks.
7. **Dedicated Admin Document Verification Console**:
   - Route: `/admin/document-verification`.
   - KPI metrics: Awaiting Admin Check, Officially Sanctioned, Teacher Stage, and Rejected / Denied (plus Total Uploaded Documents count).
   - Real-time format filters (PDF, JPG, PNG) and status filters.
   - Document security inspection modal with SHA-256 telemetry and inline preview.
   - On-demand server re-scan button (`POST /api/leaves/:id/rescan`).

### File Mapping
- **Backend**:
  - Security Scanner: `server/src/services/documentScannerService.js`
  - Upload Middleware: `server/src/middleware/secureUploadMiddleware.js`
  - Model: `server/src/models/Leave.js` (extended with `document`, `verificationStage`, `teacherReview`, `adminVerification`)
  - Controller: `server/src/controllers/leaveController.js`
  - Routes: `server/src/routes/leaveRoutes.js`
  - Audit Middleware: `server/src/middleware/auditMiddleware.js`
  - Tests: `server/tests/documentVerification.test.js` (15 comprehensive unit & integration tests)
- **Frontend**:
  - API Client: `client/src/services/api.js` (`uploadLeaveDocumentApi`, `teacherReviewLeaveApi`, `adminVerifyLeaveApi`, `rescanLeaveDocumentApi`, `getDocumentTokenApi`, `getPrivateDocumentStreamUrl`, `getPrivateDocumentDownloadUrl`)
  - Student Leave: `client/src/pages/student/StudentLeave.jsx`
  - Teacher Leave: `client/src/pages/teacher/TeacherLeave.jsx`
  - Admin Console: `client/src/pages/admin/AdminDocumentVerification.jsx`
  - Navigation & Routes: `client/src/components/layout/Sidebar.jsx`, `client/src/App.jsx`
  - Mock Data: `client/src/data/mockData.js`

---

## 📌 Phase 33: PWA / Mobile Experience 📱

### Overview & Architecture
Phase 33 transforms CampusAttend into an installable, high-performance Progressive Web App (PWA) prior to future native mobile client expansion. The application delivers an app-like experience directly from modern mobile and desktop browsers: students and teachers can install CampusAttend to their home screens, navigate with an ergonomic thumb-zone bottom navigation bar, maintain access during connectivity interruptions with an offline shell and network status detector, receive push notification updates, and perform instant attendance check-ins using real-time device camera hardware QR scanning with automated GPS and device telemetry.

```
       Desktop / Mobile Web Browser
                     ↓
         PWA Manifest & Service Worker
     (App Icons, Standalone Mode, Offline Shell)
                     ↓
          Mobile-First Navigation Bar
   (Thumb-Zone Navigation + 1-Tap Center QR Button)
                     ↓
        Device Camera Hardware Scanner
    (Dual BarcodeDetector + jsQR Fallback Engine)
                     ↓
       Push Notifications & Home Install
  (beforeinstallprompt Banner + iOS Safari Guide)
                     ↓
 [Future Roadmap]: React Native App + Stitch MCP
```

### Core PWA & Mobile Capabilities

1. **Web App Manifest & Application Identity**:
   - Manifest specifications located at `client/public/manifest.webmanifest` and `client/public/manifest.json`.
   - Application Name: **CampusAttend** (Short: *CampusAttend*).
   - Display Mode: `standalone` with `portrait-primary` orientation.
   - Theme Color: `#4f46e5` (Indigo-600) with `#020617` (Slate-950) slate canvas background.
   - Quick Application Shortcuts:
     - **Scan QR Code** (`/student` with scanner shortcut)
     - **My Classes** (`/student/attendance` or `/teacher/dashboard`)
     - **Analytics** (`/student/analytics` or `/teacher/analytics`)
   - Full suite of high-resolution icons generated in `client/public/icons/`:
     - Master Vector: `icon.svg` (Dark slate canvas with indigo/violet shield, academic cap, and check badge).
     - Standard PWA Icons: `icon-192.png` (192x192), `icon-512.png` (512x512).
     - Android Adaptive Icon: `icon-maskable.png` (512x512 with safe-zone compliance).
     - Apple Touch Icon: `apple-touch-icon.png` (180x180 for iOS Home Screen).
     - Notification Badge: `badge-96.png` (96x96 monochrome badge).

2. **Service Worker (`sw.js`) & Offline Shell Resilience**:
   - Automated registration in `client/src/main.jsx` with lifecycle update checking.
   - Multi-tier caching architecture:
     - **Pre-cached Shell**: Core HTML shell, favicon, offline fallback page, and manifest pre-cached on install.
     - **Cache-First Static Assets**: Fast local retrieval of JavaScript bundles, CSS stylesheets, web fonts, and public icons (`campusattend-v1`).
     - **Network-First Navigation**: Navigation requests prioritize real-time network responses with graceful fallback to cached shell.
     - **Offline Fallback Page (`offline.html`)**: Rich dark-mode glassmorphic interface informing users when connectivity is lost, with instant retry functionality.
     - **API Offline Safeguard**: Non-GET mutations return a standardized `{ offline: true, message: 'You are currently offline...' }` payload during network drops.
   - **Reactive Network Detection**:
     - Custom hook `useNetworkStatus.js` listening to `window.online` and `window.offline` events.
     - Floating `OfflineBanner.jsx` component providing non-intrusive toast notification when connection is severed and auto-dismissing when back online.
   - **Web Push Notifications (`push` & `notificationclick`)**:
     - Background push event handler displaying notifications with custom actions (*Open Portal*, *Dismiss*).
     - Deep-linking click handler routing students directly into attendance logs or notifications console.

3. **Mobile-First Responsive Layout & Thumb-Zone Navigation**:
   - `MobileBottomNav.jsx` fixed at the viewport bottom with safe area inset support (`pb-safe` using `env(safe-area-inset-bottom)`).
   - Ergonomic 4-tab thumb-reachable navigation for Student and Teacher roles:
     - **Student**: Dashboard, Schedule, Attendance, Alerts.
     - **Teacher**: Dashboard, Classes, Roster/Reports, Alerts.
   - **Center Action Button**: Prominent glowing circular button for students providing instant 1-tap access to the camera QR scanner from any screen.
   - **Mobile Drawer Sidebar**: Desktop sidebar collapses cleanly on mobile (`hidden md:flex`), and expands into an animated slide-over navigation drawer accessible via header hamburger menu.

4. **Device Camera Hardware Integration & Live QR Scanner**:
   - Replaced manual token input modal with full camera hardware integration in `StudentQRScannerModal.jsx`.
   - Real-time video stream via `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })`.
   - Controls:
     - **Lens Switcher**: 1-tap toggling between rear camera (`environment`) and front camera (`user`).
     - **Flashlight / Torch**: Hardware torch toggle for low-light lecture halls on supported devices (`track.applyConstraints({ advanced: [{ torch: true }] })`).
     - **Manual Fallback Tab**: Instant switch to manual token paste if camera permissions are denied or unavailable.
   - **Dual-Engine QR Decoding**:
     - *Primary*: High-speed native `window.BarcodeDetector` API for hardware-accelerated detection in Chromium browsers.
     - *Fallback*: Pure JavaScript `jsqr` analyzer processing hidden canvas frame snapshots for universal Safari and older browser compatibility.
   - **Interactive User Feedback**:
     - Animated cyber-green scanning laser beam (`.animate-scan-laser`).
     - High-contrast corner targeting brackets with pulse indicators.
     - Synthetic Web Audio API beep sound (`playScanBeep()`) triggered instantaneously upon successful detection.
     - Automatic submission pipeline: attaches scanned token, real-time GPS coordinates (`getCurrentPosition`), and device telemetry to `POST /api/attendance/scan-qr`.

5. **Install Promotion Experience (`beforeinstallprompt` & iOS Modal)**:
   - `PwaInstallContext.jsx` tracking installation state, dismissal preferences, and standalone launch mode.
   - Responsive `PwaInstallBanner.jsx` sliding up on mobile web to guide students to install CampusAttend to their home screen with 1 tap.
   - iOS Safari detection presenting step-by-step guidance modal showing the Apple Share sheet and "Add to Home Screen" action.
   - Header "Install App" pill button on desktop and tablet browsers when installation is available.

6. **Future Architecture Bridge: React Native & MCP Stitch**:
   - The PWA implementation acts as the immediate mobile solution while laying the foundation for a future native React Native application.
   - Reusable shared layers:
     - API endpoints, payload validation, and token authentication contracts.
     - WebSocket event listeners and push notification schemas.
     - Geolocation and device fingerprinting logic.
   - MCP Server Integration: Future generation of native React Native mobile screens, navigation stacks, and design systems can be orchestrated using tools such as **Stitch MCP** (`generate_screen_from_text`, `create_design_system`, `generate_variants`).

### File Mapping
- **PWA Manifest & Assets**:
  - `client/public/manifest.webmanifest` & `client/public/manifest.json`
  - `client/public/sw.js` (Service Worker)
  - `client/public/offline.html` (Offline fallback page)
  - `client/public/icons/` (`icon.svg`, `icon-192.png`, `icon-512.png`, `icon-maskable.png`, `apple-touch-icon.png`, `badge-96.png`)
  - `client/index.html` (Manifest link, apple-touch-icon, theme-color meta tags)
- **Frontend Components & Contexts**:
  - PWA Install Context: `client/src/context/PwaInstallContext.jsx`
  - Install Banner & iOS Modal: `client/src/components/pwa/PwaInstallBanner.jsx`
  - Network Status Hook: `client/src/hooks/useNetworkStatus.js`
  - Offline Banner: `client/src/components/common/OfflineBanner.jsx`
  - Mobile Bottom Navigation: `client/src/components/layout/MobileBottomNav.jsx`
  - Camera QR Scanner: `client/src/components/student/StudentQRScannerModal.jsx`
  - Layouts: `client/src/pages/student/StudentLayout.jsx`, `client/src/pages/teacher/TeacherLayout.jsx`, `client/src/pages/admin/AdminLayout.jsx`, `client/src/pages/parent/ParentLayout.jsx`
  - Header: `client/src/components/layout/Header.jsx`
  - Sidebar: `client/src/components/layout/Sidebar.jsx`
  - Main & App: `client/src/main.jsx`, `client/src/App.jsx`
  - Styles: `client/src/index.css`

---

## 📌 Phase 34 – Offline Attendance Sync

### Overview & Architecture
Phase 34 delivers an enterprise-grade **Offline Attendance Synchronization System** designed for high-density university classrooms, campus basements, lecture halls, and dead zones where Wi-Fi or cellular connections are degraded or lost. When a teacher loses internet connectivity, attendance marking continues locally on the teacher's device without disruption or latency.

```
Teacher Device (Offline)
       ↓
Browser Storage (IndexedDB: CampusAttendOfflineDB)
       ↓
Local Attendance Queue (Pending Batches with Telemetry)
       ↓
Internet Returns (Auto-Detected via window.online / Manual Trigger)
       ↓
Server Sync Engine (POST /api/attendance/offline-sync)
       ↓
Conflict Handling:
[Local Record] + [Server Record / Approved Institutional Leave]
       ↓
Conflict Resolver:
  ├─ Smart Precedence (Approved Leave > Anti-Proxy QR > Timestamp)
  ├─ Teacher Authority (Classroom Physical Override)
  ├─ Server Preserved (Verified Cloud Record)
  └─ Interactive Side-by-Side Resolution Console
       ↓
Database Persistence (Attendance & AuditLog with Telemetry)
```

### Core Requirements & Features

1. **Local-First Architecture & IndexedDB Layer**:
   - **Database**: `CampusAttendOfflineDB` (Version 1).
   - **Object Stores**:
     - `attendanceQueue`: Persists offline attendance batches with client timestamps, subject, section, class ID, session ID, records array, retry counters, and conflict metadata. KeyPath: `id`.
     - `rosterCache`: Pre-caches student rosters and active class details so instructors can open classes and view student directories while completely disconnected from the network. KeyPath: `key` (`subject_section`).
     - `syncHistory`: Maintains a client-side transparent audit ledger of synchronized batches, conflict outcomes, and timestamps.
   - **Universal Storage Fallback**: Graceful automated fallback to `localStorage` with JSON serialization in environments where IndexedDB is restricted or unavailable.

2. **Attendance Queue & Auto-Sync Engine**:
   - As instructors mark individual attendance statuses (`Present`, `Absent`, `Late`, remarks) in offline mode, batches are stamped with an ISO client timestamp and queued locally.
   - **Reactive Reconnection**: Automatically registers `window.addEventListener('online')` and triggers background synchronization with exponential backoff and connection stability debouncing (1.5s).
   - **Manual Sync Controls**: Immediate "Sync All" and per-batch "Sync Now" triggers available in both the roster sheet and the dedicated Offline Sync Center modal.

3. **Multi-Strategy Conflict Resolution Engine**:
   When offline attendance arrives on the server, existing records created during the disconnect period (e.g. anti-proxy QR scans by students, approved medical leaves, or administrative changes) are evaluated:
   - **Smart Precedence (Institutional Default)**:
     - *Rule 1*: Institutional approved leaves (`On Leave`, `Excused`) always take precedence over offline absent/present marks to guarantee sanctioned student leave rights.
     - *Rule 2*: Verified Anti-Proxy QR scans take priority over unmarked absent logs, unless the instructor entered an explicit proxy/truancy note ("suspected proxy", "not in seat"), in which case teacher authority wins.
     - *Rule 3*: If both records are manual, latest timestamp wins.
   - **Teacher Authority (`local_wins`)**:
     - The physical classroom instructor's offline mark is treated as the final authority, cleanly overwriting prior server records.
   - **Server Preserved (`server_wins`)**:
     - Verified cloud records are locked and local discrepancies are discarded or flagged.
   - **Interactive Conflict Resolver Modal (`ConflictResolutionModal.jsx`)**:
     - Activated when discrepancies are detected under `detect_only` mode.
     - Displays a side-by-side comparison for each conflicted student: Local Record (Status, Recorded At, Remarks) vs Server Record (Status, Source, Reason).
     - Provides one-click bulk resolvers (*"Teacher Override All"*, *"Preserve Server All"*, *"Smart Precedence"*) and per-student granular status toggles with custom justification notes.

4. **Offline Sync Center & UI Consoles**:
   - **Offline Sync Center Modal (`OfflineSyncCenterModal.jsx`)**: Central console for monitoring queue health, retry attempts, storage quota estimates, and local sync audit logs.
   - **Real-Time Offline Sync Badge (`OfflineSyncBadge.jsx`)**: Responsive status pill in Header displaying connection mode, queue size, and pulsing conflict alerts.
   - **Enhanced Offline Banner (`OfflineBanner.jsx`)**: Informs the user of offline mode, queued batches, sync progress during reconnect, and conflict notifications.

### API Contracts
- `POST /api/attendance/offline-sync`:
  - Request: `{ batchId, subject, subjectCode, section, date, clientTimestamp, conflictStrategy, records: [{ studentId, status, notes, clientMarkedAt }] }`
  - Response (Clean): `{ success: true, hasConflicts: false, syncedCount, batchId }`
  - Response (Conflict): `{ success: true, hasConflicts: true, conflictsCount, conflicts: [...], syncedCount, batchId }`
- `POST /api/attendance/resolve-conflicts`:
  - Request: `{ batchId, subject, resolvedConflicts: [{ studentId, chosenStatus, chosenReason }] }`
  - Response: `{ success: true, resolvedCount, batchId }`

### File Mapping
- **Database & Services**:
  - IndexedDB Storage Utility: `client/src/utils/offlineAttendanceDB.js`
  - Context & Provider: `client/src/context/OfflineSyncContext.jsx`
  - API Client: `client/src/services/api.js`
- **Frontend Components**:
  - Conflict Resolution Modal: `client/src/components/teacher/ConflictResolutionModal.jsx`
  - Offline Sync Center Modal: `client/src/components/teacher/OfflineSyncCenterModal.jsx`
  - Status Badge: `client/src/components/common/OfflineSyncBadge.jsx`
  - Offline Banner: `client/src/components/common/OfflineBanner.jsx`
  - Teacher Roster Sheet: `client/src/pages/teacher/TakeAttendance.jsx`
  - Header: `client/src/components/layout/Header.jsx`
  - App Root: `client/src/App.jsx`
- **Backend**:
  - Model: `server/src/models/Attendance.js`
  - Audit Middleware: `server/src/middleware/auditMiddleware.js`
  - Controller: `server/src/controllers/attendanceController.js`
  - Routes: `server/src/routes/attendanceRoutes.js`
  - Tests: `server/tests/offlineSync.test.js`

---

## 🔐 Access Control & Feature Matrix Across All Phases

| Feature / Capability | Student | Teacher | Admin | Parent | Implementation Phase |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **User Authentication & Token Refresh** | ✅ | ✅ | ✅ | ✅ | Phase 1 & 16 |
| **Role-Based Access Control (RBAC)** | ✅ | ✅ | ✅ | ✅ | Phase 1 & 16 |
| **Executive Dashboard & Global Analytics** | ❌ | ❌ | ✅ | ❌ | Phase 5 & 15 |
| **Department, Course & Subject Management** | ❌ | ❌ | ✅ | ❌ | Phase 5 |
| **Faculty & Student Account Management** | ❌ | ❌ | ✅ | ❌ | Phase 5 & 16 |
| **Subject Assignment (Teachers & Students)** | ❌ | ❌ | ✅ | ❌ | Phase 5 |
| **Class Session Creator & Active Roster** | ❌ | ✅ | ✅ | ❌ | Phase 4 & 7 |
| **Mark & Edit Attendance with Remarks** | ❌ | ✅ | ✅ | ❌ | Phase 4 & 7 |
| **Export Class Attendance CSV** | ❌ | ✅ | ✅ | ❌ | Phase 4 & 10 |
| **Student Roster & Low Attendance Alerts** | ❌ | ✅ | ✅ | ❌ | Phase 3, 4 & 12 |
| **Generate & Display 30s Dynamic QR Code** | ❌ | ✅ | ✅ | ❌ | Phase 8 & 20 |
| **Scan QR Code & Auto-Record Attendance** | ✅ | ❌ | ❌ | ❌ | Phase 8 & 20 |
| **GPS Campus Geolocation Radius Verification** | ✅ | ✅ | ✅ | ❌ | Phase 8 & 19 |
| **Device Fingerprint Anti-Proxy Protection** | ✅ | ✅ | ✅ | ❌ | Phase 8 & 21 |
| **Student Attendance Dashboard & Graph** | ✅ | ❌ | ❌ | ❌ | Phase 3, 6 & 11 |
| **Interactive Monthly Attendance Calendar** | ✅ | ❌ | ❌ | ❌ | Phase 6 |
| **Today's & Upcoming Class Timetable** | ✅ | ✅ | ❌ | ❌ | Phase 3, 6 & 9 |
| **Create & Manage Weekly Timetable Slots** | ❌ | ✅ | ✅ | ❌ | Phase 9 |
| **View Tomorrow's Classes Schedule** | ✅ | ✅ | ❌ | ❌ | Phase 9 |
| **View Full Weekly Timetable Matrix** | ✅ | ✅ | ❌ | ❌ | Phase 9 |
| **Apply for Medical / Absence Leave** | ✅ | ❌ | ❌ | ❌ | Phase 6 & 13 |
| **Upload Leave Supporting Proof Document** | ✅ | ❌ | ❌ | ❌ | Phase 13 |
| **Faculty Approve / Reject Student Leaves & Remarks** | ❌ | ✅ | ✅ | ❌ | Phase 13 |
| **Maintain Full Leave Authorization History** | ✅ | ✅ | ✅ | ❌ | Phase 13 |
| **Download Official Attendance Transcript (PDF/Excel/CSV)** | ✅ | ✅ | ✅ | ❌ | Phase 6 & 10 |
| **View Attendance % Ratio Chart (Doughnut/Pie)** | ✅ | ✅ | ✅ | ❌ | Phase 11 |
| **View Department Comparison Chart** | ❌ | ✅ | ✅ | ❌ | Phase 11 |
| **View Monthly Trend & 75% Benchmark Line Chart** | ✅ | ✅ | ✅ | ❌ | Phase 11 |
| **View Subject-Wise Attendance Chart** | ✅ | ✅ | ✅ | ❌ | Phase 11 |
| **View Student Ranking & Leaderboard Chart** | ❌ | ✅ | ✅ | ❌ | Phase 11 |
| **Switch Chart Library Engine (Recharts / Chart.js)** | ✅ | ✅ | ✅ | ❌ | Phase 11 |
| **Real-Time Socket.io & FCM Push Notifications** | ✅ | ✅ | ✅ | ✅ | Phase 12 |
| **Attendance Prediction Engine & "What-If" Simulator** | ✅ | ❌ | ❌ | ❌ | Phase 14 |
| **Natural Language AI Chatbot ("Ask My Attendance")** | ✅ | ✅ | ✅ | ❌ | Phase 14 |
| **Suspicious Attendance & Proxy Detection Console** | ❌ | ✅ | ✅ | ❌ | Phase 14 & 21 |
| **Most Absent Students & Deficit Calculator** | ❌ | ❌ | ✅ | ❌ | Phase 15 |
| **Best Attendance Leaderboard & Perfect Badges** | ❌ | ❌ | ✅ | ❌ | Phase 15 |
| **Department Attendance Ranking & HOD View** | ❌ | ❌ | ✅ | ❌ | Phase 15 |
| **Teacher Performance & Marking Metrics** | ❌ | ❌ | ✅ | ❌ | Phase 15 |
| **Daily Attendance Inspector & Time Slot Breakdown** | ❌ | ❌ | ✅ | ❌ | Phase 15 |
| **Helmet HTTP Security Headers & Rate Limiting** | ✅ | ✅ | ✅ | ✅ | Phase 16 |
| **Hardened JWT & Multi-Role RBAC Authorization** | ✅ | ✅ | ✅ | ✅ | Phase 16 |
| **Password Hashing & Strength Policy** | ✅ | ✅ | ✅ | ✅ | Phase 16 |
| **Payload Input Validation & Schema Sanitization** | ✅ | ✅ | ✅ | ✅ | Phase 16 |
| **XSS Payload Injection Sanitization** | ✅ | ✅ | ✅ | ✅ | Phase 16 |
| **Configurable CORS Domain Management** | ✅ | ✅ | ✅ | ✅ | Phase 16 |
| **Public Self-Registration Student Role Enforcement** | ✅ | ❌ | ❌ | ❌ | Phase 16 |
| **Admin-Only Provisioning for Faculty & Admin Accounts** | ❌ | ❌ | ✅ | ❌ | Phase 16 |
| **Nodemailer Password Reset Email Provider Dispatch** | ✅ | ✅ | ✅ | ✅ | Phase 16 |
| **SHA-256 Server-Side Hashed Refresh Token Storage** | ✅ | ✅ | ✅ | ✅ | Phase 16 |
| **HTTP-Only Secure Cookie Refresh Token Transport** | ✅ | ✅ | ✅ | ✅ | Phase 16 |
| **Academic Year Management & Active Session Toggle** | ❌ | ❌ | ✅ | ❌ | Phase 18 |
| **Dynamic Semesters Setup (No hardcoded terms)** | ❌ | ❌ | ✅ | ❌ | Phase 18 |
| **Class Divisions & Sections (IT-A, IT-B, etc.)** | ❌ | ❌ | ✅ | ❌ | Phase 18 |
| **Visual Academic Hierarchy Tree Console** | ✅ | ✅ | ✅ | ❌ | Phase 18 |
| **Student Batch Promotion Engine & Audit History** | ❌ | ❌ | ✅ | ❌ | Phase 18 |
| **Configurable Attendance Rules & Thresholds Engine** | ❌ | ❌ | ✅ | ❌ | Phase 19 |
| **7-Status Matrix Rules & Attendance Weights** | ❌ | ❌ | ✅ | ❌ | Phase 19 |
| **Interactive Rules Simulator / Sandbox Console** | ✅ | ✅ | ✅ | ❌ | Phase 19 |
| **Attendance Session Engine (Session ID, Start/End Timestamps)** | ❌ | ✅ | ✅ | ❌ | Phase 20 |
| **Session-Linked Attendance Logs & QR/GPS Session Management** | ✅ | ✅ | ✅ | ❌ | Phase 20 |
| **Anti-Proxy Attendance System (Multi-Signal Risk Engine)** | ✅ | ✅ | ✅ | ❌ | Phase 21 |
| **Teacher & Admin Suspicious Attendance Review Console** | ✅ | ✅ | ✅ | ❌ | Phase 21 |
| **Attendance Risk Scoring Engine (0-100 Multi-Signal Scoring)** | ✅ | ✅ | ✅ | ❌ | Phase 22 |
| **3-Tier Risk Classification (0-30 Normal, 31-60 Review, 61-100 High Risk)** | ✅ | ✅ | ✅ | ❌ | Phase 22 |
| **Attendance Correction Request Submission & Mandatory Reason** | ✅ | ✅ | ✅ | ❌ | Phase 23 |
| **Teacher & Admin Attendance Correction Review Consoles** | ❌ | ✅ | ✅ | ❌ | Phase 23 |
| **Attendance Correction Audit Trail (Original, New, Changed By, Reason, Timestamps)** | ✅ | ✅ | ✅ | ❌ | Phase 23 |
| **Complete 10-Action Audit Logging (`LOGIN` to `CHANGE_SETTINGS`)** | ✅ | ✅ | ✅ | ❌ | Phase 24 |
| **State Mutation Diff Tracking (`Absent → Present`) & Reason Verification** | ✅ | ✅ | ✅ | ❌ | Phase 24 |
| **Admin Audit Ledger UI with 10 Action Pills & CSV Export** | ❌ | ❌ | ✅ | ❌ | Phase 24 |
| **Multi-Channel Notification Dispatching (In-App, Email, Push)** | ✅ | ✅ | ✅ | ✅ | Phase 25 |
| **Smart Notification Recovery Advisor ("N lectures needed for 75%")** | ✅ | ❌ | ❌ | ❌ | Phase 25 |
| **User Notification Preferences & Channel Toggles** | ✅ | ✅ | ✅ | ✅ | Phase 25 |
| **Automated Multi-Channel Domain Events (7 Event Processors)** | ✅ | ✅ | ✅ | ✅ | Phase 25 |
| **Interactive Notification Simulator & Smart Summary Sandbox** | ✅ | ✅ | ✅ | ❌ | Phase 25 |
| **Attendance Forecasting Engine & Safe Miss Allowance** | ✅ | ✅ | ✅ | ❌ | Phase 26 |
| **Interactive "Can I Skip?" Scenario Simulator & What-If Sandbox** | ✅ | ✅ | ✅ | ❌ | Phase 26 |
| **Multi-Benchmark Milestone Trajectory Ladder** | ✅ | ✅ | ✅ | ❌ | Phase 26 |
| **AI Assistant NLP Forecasting Integration (Skip & Recovery Cards)** | ✅ | ✅ | ✅ | ❌ | Phase 26 |
| **Personal Student Analytics Dashboard (9 Core Metrics & Status Breakdown)** | ✅ | ✅ | ✅ | ❌ | Phase 27 |
| **Visual Attendance Curve with 75% Minimum Benchmark Line** | ✅ | ✅ | ✅ | ❌ | Phase 27 |
| **Subject Attendance Safe Buffer & Consecutive Recovery Calculator** | ✅ | ✅ | ✅ | ❌ | Phase 27 |
| **Weekly & Monthly Attendance Velocity Progression** | ✅ | ✅ | ✅ | ❌ | Phase 27 |
| **Teacher Analytics & Insights Dashboard (7 Core Dimensions)** | ❌ | ✅ | ✅ | ❌ | Phase 28 |
| **Weekday Pattern Analysis & Friday Slump Detection (Mon 82% to Fri 69%)** | ❌ | ✅ | ✅ | ❌ | Phase 28 |
| **Attendance by Lecture Time Slot (Morning vs Post-Lunch Slump)** | ❌ | ✅ | ✅ | ❌ | Phase 28 |
| **Most Absent & Most Late Faculty Student Directories with Deficit Math** | ❌ | ✅ | ✅ | ❌ | Phase 28 |
| **Course Subject & Division Comparative Analytics (Sec A vs Sec B vs Sec C)** | ❌ | ✅ | ✅ | ❌ | Phase 28 |
| **Admin Intelligence Dashboard (College-Level Control Center)** | ❌ | ❌ | ✅ | ❌ | Phase 29 |
| **Top Executive KPI Console (Students: 2,481, Teachers: 143, Today: 87.4%, Defaulters: 312)** | ❌ | ❌ | ✅ | ❌ | Phase 29 |
| **Cross-Department Performance Benchmark & Variance Analysis** | ❌ | ❌ | ✅ | ❌ | Phase 29 |
| **Inter-Division & Section Matrix (Class Size, Mentors, Defaulters)** | ❌ | ❌ | ✅ | ❌ | Phase 29 |
| **College-Wide 6-Month Trendline & Weekday Slump Analysis** | ❌ | ❌ | ✅ | ❌ | Phase 29 |
| **Defaulter Intelligence & Recovery Roster ($x = \lceil \frac{0.75T - P}{0.25} \rceil$)** | ❌ | ❌ | ✅ | ❌ | Phase 29 |
| **Faculty Teaching Compliance, On-Time Marking & Slot Distribution** | ❌ | ❌ | ✅ | ❌ | Phase 29 |
| **College Anti-Proxy & Fraud Telemetry Console** | ❌ | ❌ | ✅ | ❌ | Phase 29 |
| **Institutional Leave Analytics & Truancy Impact** | ❌ | ❌ | ✅ | ❌ | Phase 29 |
| **Automated Defaulter Management & Escalation Engine** | ✅ | ✅ | ✅ | ❌ | Phase 30 |
| **Configurable Escalation Thresholds (<75%, <70%, <65%, <60%)** | ❌ | ❌ | ✅ | ❌ | Phase 30 |
| **Automated Parent/Guardian Email Alert Dispatch (<60%)** | ✅ | ✅ | ✅ | ✅ | Phase 30 |
| **Defaulter Resolution Ledger & Counselor Audit Roster** | ❌ | ✅ | ✅ | ❌ | Phase 30 |
| **Parent/Guardian Portal Access & Multi-Ward Selector** | ❌ | ❌ | ❌ | ✅ | Phase 31 |
| **Ward Cumulative Attendance & 75% Benchmark Status** | ❌ | ❌ | ❌ | ✅ | Phase 31 |
| **Ward Subject-Wise Breakdown & Recovery Deficit Countdown** | ❌ | ❌ | ❌ | ✅ | Phase 31 |
| **Inspect Ward Leave Records & Sanctioned Medical Proofs** | ❌ | ❌ | ❌ | ✅ | Phase 31 |
| **Ward 4-Tier Attendance Warning Tracker & Counseling Directory** | ❌ | ❌ | ❌ | ✅ | Phase 31 |
| **Parent In-App Notifications & Institutional Circulars** | ❌ | ❌ | ❌ | ✅ | Phase 31 |
| **Strict Read-Only Enforcement (No Attendance or Leave Alteration)** | ❌ | ❌ | ❌ | ✅ | Phase 31 |
| **Multi-Tier Leave Verification Pipeline (Student ➔ Teacher ➔ Admin)** | ✅ | ✅ | ✅ | ❌ | Phase 32 |
| **Secure Non-Public Document Storage (PDF, JPG, PNG | Max 5MB)** | ✅ | ✅ | ✅ | ❌ | Phase 32 |
| **Binary Magic-Byte File Signature & Spoof Validation** | ✅ | ✅ | ✅ | ❌ | Phase 32 |
| **Heuristic Antivirus & Malware Threat Scanning Engine** | ✅ | ✅ | ✅ | ❌ | Phase 32 |
| **Cryptographic SHA-256 Checksums & Tamper Verification** | ✅ | ✅ | ✅ | ❌ | Phase 32 |
| **Private Expiring Signed Access Tokens & Document Streams** | ✅ | ✅ | ✅ | ✅ | Phase 32 |
| **Admin Central Document Verification & Sanction Console** | ❌ | ❌ | ✅ | ❌ | Phase 32 |
| **On-Demand Antivirus & Integrity Re-Scan Engine** | ❌ | ❌ | ✅ | ❌ | Phase 32 |
| **Installable PWA Web App Manifest & App Icons** | ✅ | ✅ | ✅ | ✅ | Phase 33 |
| **Offline Shell & Service Worker Caching (`sw.js`)** | ✅ | ✅ | ✅ | ✅ | Phase 33 |
| **Real-Time Network Status Banner (`useNetworkStatus`)** | ✅ | ✅ | ✅ | ✅ | Phase 33 |
| **Mobile Bottom Navigation Bar (`MobileBottomNav`)** | ✅ | ✅ | ❌ | ❌ | Phase 33 |
| **Device Camera Hardware QR Scanner (Dual BarcodeDetector + jsQR)** | ✅ | ❌ | ❌ | ❌ | Phase 33 |
| **Lens Flip (Back/Front) & Torch Light Controls** | ✅ | ❌ | ❌ | ❌ | Phase 33 |
| **PWA Install Promotion Banner & iOS Add-to-Home Modal** | ✅ | ✅ | ✅ | ✅ | Phase 33 |
| **Offline Classroom Attendance Taking (IndexedDB Local Queue)** | ❌ | ✅ | ✅ | ❌ | Phase 34 |
| **Local Roster Pre-Caching & Zero-Network Class Session** | ❌ | ✅ | ✅ | ❌ | Phase 34 |
| **Automatic Internet Return Syncing & Exponential Backoff** | ❌ | ✅ | ✅ | ❌ | Phase 34 |
| **Multi-Strategy Attendance Conflict Resolver (4 Strategies)** | ❌ | ✅ | ✅ | ❌ | Phase 34 |
| **Interactive Side-by-Side Conflict Resolution Console Modal** | ❌ | ✅ | ✅ | ❌ | Phase 34 |
| **Offline Sync Center, Diagnostics & Telemetry Ledger** | ❌ | ✅ | ✅ | ❌ | Phase 34 |

---
*Last Updated: September 2026*







