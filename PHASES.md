# Attendance Management System - Consolidated Phases Specification

This document provides a single, unified reference for all project implementation phases (**Phase 1 through Phase 5**) of the **Attendance Management System**.

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

## 📊 Access Control & Feature Matrix Across All Phases

| Feature / Capability | Student | Teacher | Admin | Phase |
| :--- | :---: | :---: | :---: | :---: |
| **Authentication & Profile Reset** | ✅ | ✅ | ✅ | Phase 1 |
| **User Role Access Control (RBAC)** | ✅ | ✅ | ✅ | Phase 1 |
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

---
*Last Updated: August 2026*




