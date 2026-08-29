# 🎓 Multi-Role Attendance Management System

[![Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://mongodb.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933.svg?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg?logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A modern, full-stack **Multi-Role Attendance Management System** designed for educational institutions. Built using **React 18, Vite, Tailwind CSS, Node.js, Express, and MongoDB**, it features tailored dashboards and workflows for **Students**, **Teachers (Faculty)**, and **Administrators**.

---

## 🌟 Key Highlights

- 🎨 **Modern UI/UX**: Built with React 18, Tailwind CSS v4, Lucide icons, and modern glassmorphism dark/light design aesthetics.
- 🔐 **Role-Based Access Control (RBAC)**: Secure JWT authentication with role-protected client routes (`ProtectedRoute.jsx`) and backend authorization middleware.
- 👑 **Admin Control Center**: Complete management of academic hierarchy (Departments, Courses, Subjects), faculty profiles, student enrollments, and executive analytics.
- 👩‍🏫 **Faculty Attendance Suite**: Quick active class scheduling, interactive roster marking (Present / Absent / Late), session notes/remarks, history log editor, and CSV report export.
- 🎓 **Student Portal**: Real-time attendance percentage tracking, >75% exam eligibility status badges, interactive monthly attendance calendar, upcoming class timetable, visual analytics graphs, medical leave application system, and transcript PDF/CSV download.
- 📂 **File Uploads & Documents**: Integrated Multer storage for student leave supporting documents and avatar uploads.
- 📱 **Dynamic 30s QR Attendance**: Teacher generates rotating 30-second expiring QR code with live countdown timer.
- 📍 **GPS Geolocation Verification**: Real-time student coordinate verification against campus radius using Haversine distance calculations.
- 🛡️ **Device Anti-Proxy Verification**: Persistent browser ID and device fingerprinting to prevent proxy attendance submissions from shared devices.
- 🗓️ **Timetable Management**: Faculty schedules, edits, and manages weekly class slots; Students view Today's Classes, Tomorrow's Schedule, and complete Weekly Timetable matrix.
- 📊 **Visual Charts & Analytics (Phase 11)**: Interactive graphical dashboards comparing Attendance %, Department averages, Monthly Trends with 75% benchmark threshold line, Subject-wise ratios, and Student Rankings powered by dual **Recharts** and **Chart.js** engines with an on-the-fly engine switcher.
- 🔔 **Real-Time Notifications & Push Alerts (Phase 12)**: Socket.io WebSockets, Firebase Cloud Messaging (FCM) Web Push, audio chimes, drawer notifications hub, and toast alerts.
- 📑 **Leave Management (Phase 13)**: Student leave application with document upload (`PDF`, `PNG`, `JPG`, `DOCX`), faculty authorization console (`/teacher/leave`), approve/reject workflows with custom remarks, and real-time status updates with full audit history.
- 🤖 **AI Features (Phase 14)**: Attendance Prediction Engine ("Can student reach 75%?", max skips allowed, "What-If" simulator slider), Natural Language AI Chatbot ("My attendance?", "Subjects below 75%", "Can I skip tomorrow?", "Attendance report", "Remaining lectures"), and automated Suspicious Attendance & Proxy Detection Console (repeated same device, outside campus scans, duplicate QR tokens, impossible location jumps).
- 📈 **Executive Analytics Dashboard (Phase 15)**: Comprehensive Admin analytics hub featuring 5 specialized sub-modules: Most Absent Students (< 75% attendance with shortage deficit calculator $X = \lceil 3T - 4P \rceil$), Best Attendance Leaderboard (Gold/Silver/Bronze medals & 100% Perfect badges), Department Ranking (CSE, ECE, ME, CE, IT average comparison & HOD view), Teacher Performance Metrics (classes conducted, on-time marking rate %, student attendance average), and Daily Attendance Inspector (date picker, summary metrics, and hourly time-slot session distribution).
- 🛡️ **Enterprise Security & Audit Logging (Phase 16)**: Multi-layered security stack including **Helmet HTTP Security Headers** (`Content-Security-Policy`, `X-Frame-Options`, `HSTS`, `X-Powered-By` suppression), **Sliding-Window Rate Limiting** (Global API 200 req/15 min, Auth endpoints 15 req/15 min, Sensitive operations 10 req/15 min), **XSS Payload Sanitizer** (recursive body/query/param HTML tag escaping), **Payload Input Validation** (registration, login, password policy, ObjectId checks), **Hardened JWT & RBAC** (multi-role guard rails and explicit expiration handling), **CORS Governance**, and **Security Audit Logging System** with interactive Admin Audit Console (`/admin/audit-logs`), live metric cards, detail inspector modal, and CSV audit log export.
- 🧪 **Automated Testing Suite (Phase 17)**: Comprehensive unit and integration test coverage (38/38 passing tests) covering 7 core modules (**Authentication**, **Attendance**, **Dynamic QR**, **GPS Geofencing**, **Reports Generation**, **Charts Analytics**, and **Notifications Hub**) powered by **Jest**, **Supertest**, and **mongodb-memory-server**.
- 🏫 **Academic Year & Semester Engine (Phase 18)**: Dynamic institutional hierarchy engine (`Academic Year ➔ Semester ➔ Department ➔ Division ➔ Subjects`). Features custom session dates, active year status singletons, dynamic terms without hardcoding, class section capacity management (`IT-A`, `IT-B`, `IT-C`), interactive visual hierarchy tree, and wizard-driven student batch promotion engine with audit logs.
- ⚙️ **Advanced Attendance Rules Engine (Phase 19)**: Institution-wide configurable rules engine replacing hardcoded logic. Allows Admins to customize thresholds (Minimum Attendance %, Late Cutoff mins, Grace Period mins, Dynamic QR Validity mins, GPS Geofence Radius meters, Auto-Absent delay mins) and define advanced rules for 7 core statuses (`Present`, `Absent`, `Late`, `Excused`, `On Leave`, `Holiday`, `Cancelled Lecture`) with attendance inclusion weights (`countsAsAttended`, `countsAsConducted`, `attendanceWeight`). Includes an interactive real-time Rule Simulator / Sandbox.
- ⏱️ **Attendance Session Engine (Phase 20)**: Explicit 4-tier domain hierarchy (`Subject ➔ Scheduled Class ➔ Attendance Session ➔ Student Attendance`) separating static scheduled class definitions from active attendance sessions. When a teacher clicks "Start Attendance", the system creates a dedicated `AttendanceSession` instance with unique Session ID (`SESS-YYYYMMDD-XXXX`), start/end timestamps, QR secret token, GPS geofence location, teacher details, subject, and section.
- 🛡️ **Anti-Proxy Multi-Signal Verification (Phase 21)**: Comprehensive multi-signal anti-proxy verification engine checking QR token authenticity, GPS Haversine boundary, active session window, device fingerprinting, and IP burst concurrency. Flagged scans are preserved with `reviewStatus: 'Pending'` for instructor review in `/admin/suspicious`.
- 📊 **Attendance Risk Scoring Engine (Phase 22)**: Quantitative 0–100 Attendance Risk Scoring System evaluating exact point weights (+50 Invalid QR, +40 Wrong GPS, +30 Duplicate Device, +20 Suspicious IP, +10 Unusual Timing) clamped to 0–100 and classified across 3 tiers (`0-30 Normal`, `31-60 Review`, `61-100 High Risk`).
- ✍️ **Attendance Correction Workflow (Phase 23)**: Formal attendance modification request, review, and audit trail system (`Original Value ➔ Correction Request ➔ Reason ➔ Review ➔ Approved/Rejected`). Replaces direct overwrites with transparent audit logs recording **Original Value**, **New Value**, **Changed By**, **Reason**, **Reviewer**, and **Timestamps** with dedicated Teacher (`/teacher/corrections`) and Admin (`/admin/corrections`) consoles.

---

## 👥 Role Capabilities & Feature Matrix

| Feature / Capability | Student | Teacher | Admin |
| :--- | :---: | :---: | :---: |
| **User Authentication & Token Refresh** | ✅ | ✅ | ✅ |
| **Role-Based Access Control (RBAC)** | ✅ | ✅ | ✅ |
| **Executive Dashboard & Global Analytics** | ❌ | ❌ | ✅ |
| **Department, Course & Subject Management** | ❌ | ❌ | ✅ |
| **Faculty & Student Account Management** | ❌ | ❌ | ✅ |
| **Subject Assignment (Teachers & Students)** | ❌ | ❌ | ✅ |
| **Class Session Creator & Active Roster** | ❌ | ✅ | ✅ |
| **Mark & Edit Attendance with Remarks** | ❌ | ✅ | ✅ |
| **Export Class Attendance CSV** | ❌ | ✅ | ✅ |
| **Student Roster & Low Attendance Alerts** | ❌ | ✅ | ✅ |
| **Generate & Display 30s Dynamic QR Code** | ❌ | ✅ | ✅ |
| **Scan QR Code & Auto-Record Attendance** | ✅ | ❌ | ❌ |
| **GPS Campus Geolocation Radius Verification** | ✅ | ✅ | ✅ |
| **Device Fingerprint Anti-Proxy Protection** | ✅ | ✅ | ✅ |
| **Student Attendance Dashboard & Graph** | ✅ | ❌ | ❌ |
| **Interactive Monthly Attendance Calendar** | ✅ | ❌ | ❌ |
| **Today's & Upcoming Class Timetable** | ✅ | ✅ | ❌ |
| **Create & Manage Weekly Timetable Slots** | ❌ | ✅ | ✅ |
| **View Tomorrow's Classes Schedule** | ✅ | ✅ | ❌ |
| **View Full Weekly Timetable Matrix** | ✅ | ✅ | ❌ |
| **Apply for Medical / Absence Leave** | ✅ | ❌ | ❌ |
| **Upload Leave Supporting Proof Document** | ✅ | ❌ | ❌ |
| **Faculty Approve / Reject Student Leaves & Remarks** | ❌ | ✅ | ✅ |
| **Maintain Full Leave Authorization History** | ✅ | ✅ | ✅ |
| **Download Official Attendance Transcript** | ✅ | ✅ | ✅ |
| **View Attendance % Ratio Chart (Doughnut/Pie)** | ✅ | ✅ | ✅ |
| **View Department Comparison Chart** | ❌ | ✅ | ✅ |
| **View Monthly Trend & 75% Benchmark Line Chart** | ✅ | ✅ | ✅ |
| **View Subject-Wise Attendance Chart** | ✅ | ✅ | ✅ |
| **View Student Ranking & Leaderboard Chart** | ❌ | ✅ | ✅ |
| **Switch Chart Library Engine (Recharts / Chart.js)** | ✅ | ✅ | ✅ |
| **Real-Time Socket.io & FCM Push Notifications** | ✅ | ✅ | ✅ |
| **Attendance Prediction Engine & "What-If" Simulator** | ✅ | ❌ | ❌ |
| **Natural Language AI Chatbot ("Ask My Attendance")** | ✅ | ✅ | ✅ |
| **Suspicious Attendance & Proxy Detection Console** | ❌ | ✅ | ✅ |
| **Most Absent Students & Deficit Calculator** | ❌ | ❌ | ✅ |
| **Best Attendance Leaderboard & Perfect Badges** | ❌ | ❌ | ✅ |
| **Department Attendance Ranking & HOD View** | ❌ | ❌ | ✅ |
| **Teacher Performance & Marking Metrics** | ❌ | ❌ | ✅ |
| **Daily Attendance Inspector & Time Slot Breakdown** | ❌ | ❌ | ✅ |
| **Helmet HTTP Security Headers** | ✅ | ✅ | ✅ |
| **Sliding-Window Rate Limiting Protection** | ✅ | ✅ | ✅ |
| **Hardened JWT & Multi-Role RBAC Authorization** | ✅ | ✅ | ✅ |
| **Password Hashing & Strength Policy** | ✅ | ✅ | ✅ |
| **Payload Input Validation & Schema Sanitization** | ✅ | ✅ | ✅ |
| **XSS Payload Injection Sanitization** | ✅ | ✅ | ✅ |
| **Configurable CORS Domain Management** | ✅ | ✅ | ✅ |
| **Security Audit Logging & Admin Audit Console** | ❌ | ❌ | ✅ |
| **Public Self-Registration Student Role Enforcement** | ✅ | ❌ | ❌ |
| **Admin-Only Provisioning for Faculty & Admin Accounts** | ❌ | ❌ | ✅ |
| **Nodemailer Password Reset Email Provider Dispatch** | ✅ | ✅ | ✅ |
| **SHA-256 Server-Side Hashed Refresh Token Storage** | ✅ | ✅ | ✅ |
| **HTTP-Only Secure Cookie Refresh Token Transport** | ✅ | ✅ | ✅ |
| **Authentication Module Automated Unit & Integration Tests** | ✅ | ✅ | ✅ |
| **Attendance & 75% Defaulter Threshold Tests** | ✅ | ✅ | ✅ |
| **30s Dynamic QR Token & Anti-Proxy Guard Tests** | ✅ | ✅ | ✅ |
| **GPS Campus Geofencing (500m) Boundary Tests** | ✅ | ✅ | ✅ |
| **Daily, Weekly, Monthly, Semester Report Generator Tests** | ✅ | ✅ | ✅ |
| **Charts Analytics & Trend Datasets Tests** | ✅ | ✅ | ✅ |
| **Notification Engine & FCM Web Push Tests** | ✅ | ✅ | ✅ |
| **Academic Year Management & Active Session Toggle** | ❌ | ❌ | ✅ |
| **Dynamic Semesters Setup (No hardcoded terms)** | ❌ | ❌ | ✅ |
| **Class Divisions & Sections (IT-A, IT-B, etc.)** | ❌ | ❌ | ✅ |
| **Visual Academic Hierarchy Tree Console** | ✅ | ✅ | ✅ |
| **Student Batch Promotion Engine & Audit History** | ❌ | ❌ | ✅ |
| **Configurable Attendance Rules & Thresholds Engine** | ❌ | ❌ | ✅ |
| **7-Status Matrix Rules & Attendance Weights** | ❌ | ❌ | ✅ |
| **Interactive Rules Simulator / Sandbox Console** | ✅ | ✅ | ✅ |
| **Attendance Session Engine (Session ID, Start/End Timestamps)** | ❌ | ✅ | ✅ |
| **Session-Linked Attendance Logs & QR/GPS Session Management** | ✅ | ✅ | ✅ |
| **Anti-Proxy Attendance System (Multi-Signal Risk Engine)** | ✅ | ✅ | ✅ |
| **Teacher & Admin Suspicious Attendance Review Console** | ✅ | ✅ | ✅ |
| **Attendance Risk Scoring Engine (0-100 Multi-Signal Scoring)** | ✅ | ✅ | ✅ |
| **3-Tier Risk Classification (0-30 Normal, 31-60 Review, 61-100 High Risk)** | ✅ | ✅ | ✅ |
| **Attendance Correction Request Submission & Mandatory Reason** | ✅ | ✅ | ✅ |
| **Teacher & Admin Attendance Correction Review Consoles** | ❌ | ✅ | ✅ |
| **Complete Attendance Correction Audit Trail (Original, New, Changed By, Reason, Timestamps)** | ✅ | ✅ | ✅ |

---

## 📁 Repository Structure

```
Basic-attendance/
├── client/                      # Frontend Application (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/          # Reusable UI Components & Role Modals
│   │   │   ├── ai/              # Phase 14 Global Floating AI Chat Widget (AiChatWidget.jsx)
│   │   │   ├── analytics/       # Phase 15 Analytics Sub-Components (MostAbsentStudents, BestAttendance, DepartmentRanking, TeacherPerformance, DailyAttendance)
│   │   │   ├── charts/          # Modular Recharts & Chart.js components (Pie, Dept, Monthly, Subject, Ranking)
│   │   │   ├── layout/          # Navbar, Sidebar, Header layout wrappers
│   │   │   ├── student/         # Student-specific components & widgets
│   │   │   ├── teacher/         # Teacher class creator modal & CreateTimetableModal
│   │   │   └── ui/              # Buttons, Cards, Inputs, Badges, Modals
│   │   ├── context/             # React AuthContext for state & token management
│   │   ├── pages/
│   │   │   ├── admin/           # Admin Dashboard (AdminAnalytics.jsx), AdminAcademicEngine.jsx, AdminRulesEngine.jsx, Departments, Courses, Subjects, Users, SuspiciousDetection, AdminAuditLogs.jsx
│   │   │   ├── analytics/       # Phase 11 Visual Analytics Hub (ChartsPage.jsx)
│   │   │   ├── auth/            # Login, Register, Forgot Password, Reset Password
│   │   │   ├── landing/         # Public Landing Page
│   │   │   ├── student/         # Student Dashboard, Calendar, History, Leave, Profile, StudentTimetable, AttendancePrediction, AiChatPage
│   │   │   └── teacher/         # Teacher Dashboard, Take Attendance, History, Reports, TeacherTimetable
│   │   ├── services/            # API client modules (api.js)
│   │   ├── App.jsx              # React Router route configurations
│   │   ├── index.css            # Global CSS & Tailwind imports
│   │   └── main.jsx             # React DOM entry point
│   ├── index.html
│   ├── vite.config.js           # Vite server configuration & API proxy setup
│   └── package.json
│
├── server/                      # Backend REST API (Node.js + Express + MongoDB)
│   ├── tests/                   # Phase 17, 19, 20 & 21 Automated Unit & Integration Test Suites
│   │   ├── setup.js             # Global MongoDB in-memory / local test setup & cleanup
│   │   ├── auth.test.js         # Authentication, Login, Register, JWT, RBAC tests
│   │   ├── attendance.test.js   # Single/Bulk attendance, stats, defaulter threshold tests
│   │   ├── qr.test.js           # 30s dynamic QR verification & anti-proxy guard tests
│   │   ├── gps.test.js          # Haversine formula & campus 500m geofence tests
│   │   ├── reports.test.js      # Daily/Weekly/Monthly/Semester report generator tests
│   │   ├── charts.test.js       # Chart analytics datasets & student ranking tests
│   │   ├── notifications.test.js # Notification hub & FCM web push tests
│   │   ├── rules.test.js        # Attendance rules engine & sandbox tests
│   │   ├── sessions.test.js     # Phase 20 Attendance session lifecycle tests
│   │   └── antiProxy.test.js    # Phase 21 Multi-signal anti-proxy risk engine & review tests
│   ├── uploads/                 # Static uploaded files (leave attachments, profile pics)
│   ├── src/
│   │   ├── config/              # MongoDB Mongoose database connection
│   │   ├── controllers/         # Request handlers (Auth, User, Attendance, Class, Leave, Timetable, Chart, aiController, analyticsController, auditController, academicController, rulesController, sessionController, antiProxyController)
│   │   ├── middleware/          # Helmet, Rate Limiter, XSS Sanitizer, Input Validation, Audit Logger, JWT auth middleware, RBAC guards
│   │   ├── models/              # Mongoose Schemas (User, Department, Course, Subject, Attendance, Class, Leave, Timetable, Notification, AuditLog, AcademicYear, Semester, Division, StudentEnrollment, AttendanceRule, AttendanceSession)
│   │   ├── routes/              # Express API Route definitions (auth, user, attendance, class, leave, timetable, chart, aiRoutes, analyticsRoutes, auditRoutes, academicRoutes, rulesRoutes, sessionRoutes, antiProxyRoutes)
│   │   ├── utils/               # JWT generator, Async handler wrappers, attendanceRulesEngine.js, antiProxyEngine.js, sendEmail.js
│   │   ├── app.js               # Express application initialization & security stack setup
│   │   └── server.js            # Node HTTP server launcher
│   ├── jest.config.js           # Jest runner configuration
│   ├── .env.example             # Server environment variables configuration template
│   └── package.json

│
├── PHASES.md                    # Detailed consolidated specification across implementation phases
└── README.md                    # Master documentation file (This document)
```

---

## 🛠️ Installation & Setup Guide

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI

---

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Basic-attendance
```

---

### 2. Backend Setup (`server`)

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment configuration:
   Create a `.env` file in the `server` directory (or copy from `.env.example`):
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/attendance_db
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   UPLOAD_PATH=uploads
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will start listening at `http://localhost:5000`.*

---

### 3. Frontend Setup (`client`)

1. Open a new terminal window and navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend application will be available at `http://localhost:3000` (API requests are automatically proxied to port `5000`).*

---

### 4. Running Automated Tests (`server`)

Run the complete Phase 17 backend test suite (38 unit and integration tests across 7 test suites):

```bash
cd server
npm test
```

To run a specific module test suite:
```bash
npx jest tests/auth.test.js
npx jest tests/attendance.test.js
npx jest tests/qr.test.js
npx jest tests/gps.test.js
npx jest tests/reports.test.js
npx jest tests/charts.test.js
npx jest tests/notifications.test.js
```

---

## 📡 API Endpoint Reference

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new user (`student`, `teacher`, or `admin`)
- `POST /api/auth/login` — Authenticate user & return JWT token
- `POST /api/auth/forgotpassword` — Request password reset link
- `PUT /api/auth/resetpassword/:resettoken` — Reset password using token

### 👤 User Management (`/api/users`)
- `GET /api/users` — Fetch all users (Admin only)
- `GET /api/users/profile` — Get current logged-in user profile
- `PUT /api/users/profile` — Update user profile details
- `DELETE /api/users/:id` — Remove a user account (Admin only)

### 🏢 Departments, Courses & Subjects
- `GET / POST / PUT / DELETE /api/departments` — Department CRUD operations
- `GET / POST / PUT / DELETE /api/courses` — Course & degree program CRUD
- `GET / POST / PUT / DELETE /api/subjects` — Subject CRUD & enrollment management

### 📋 Attendance & Classes
- `GET / POST /api/classes` — Create active class session & list classes
- `POST /api/classes/:id/start-qr` — Start dynamic 30-second expiring QR attendance session
- `GET /api/classes/:id/qr-token` — Fetch or auto-rotate active 30s QR session token
- `POST /api/classes/:id/stop-qr` — Stop active QR attendance session
- `POST /api/attendance/scan-qr` — Student scans QR code with GPS coordinates & device fingerprint
- `POST /api/attendance/mark` — Record manual session attendance for students
- `GET /api/attendance/history` — Fetch attendance records with filters
- `PUT /api/attendance/:id` — Edit past attendance record status & notes
- `GET /api/attendance/export` — Download class attendance report as CSV

### 📝 Leave Application Workflow (`/api/leaves`)
- `POST /api/leaves` — Submit new leave application (Medical, Emergency, Event) with file attachment
- `GET /api/leaves/student` — View personal leave application history and approval status
- `PUT /api/leaves/:id/status` — Approve or reject leave application (Teacher / Admin)

### 🗓️ Timetable Management (`/api/timetable`)
- `GET /api/timetable` — Fetch timetable entries with optional day, section, or search filters
- `GET /api/timetable/today` — Fetch today's scheduled classes based on current day
- `GET /api/timetable/tomorrow` — Fetch tomorrow's scheduled classes
- `GET /api/timetable/weekly` — Fetch weekly timetable organized by day (Monday to Sunday)
- `POST /api/timetable` — Create a new timetable class slot (Teacher / Admin)
- `PUT /api/timetable/:id` — Update existing timetable class slot (Teacher / Admin)
- `DELETE /api/timetable/:id` — Remove a timetable class slot (Teacher / Admin)

### 📊 Executive Analytics Dashboard (`/api/analytics`)
- `GET /api/analytics/dashboard` — Fetch complete analytics dashboard metrics (All 5 sub-modules)
- `GET /api/analytics/most-absent` — Fetch low attendance defaulter students & shortfall deficit
- `GET /api/analytics/best-attendance` — Fetch high-achiever student leaderboard & perfect 100% badges
- `GET /api/analytics/department-ranking` — Fetch comparative department attendance rankings
- `GET /api/analytics/teacher-performance` — Fetch faculty performance metrics
- `GET /api/analytics/daily-attendance` — Fetch date-filtered daily attendance session logs & time slots

### 🛡️ Security Audit Logs (`/api/audit-logs`)
- `GET /api/audit-logs` — Fetch paginated security audit logs with search, role, status, action, and date filters (Admin only)
- `GET /api/audit-logs/stats` — Fetch audit overview metrics (total events, today's events, failed logins, warnings, top actions) (Admin only)
- `GET /api/audit-logs/export` — Download filtered audit log ledger as a CSV file (Admin only)

### 🏫 Academic Year & Semester Engine (`/api/academic`)
- `GET /api/academic/hierarchy` — Fetch complete visual academic hierarchy tree (`Academic Year ➔ Semester ➔ Department ➔ Division ➔ Subjects`)
- `GET / POST /api/academic/years` — Get list of academic years / Create new academic year
- `PUT / DELETE /api/academic/years/:id` — Update / Delete academic year
- `PATCH /api/academic/years/:id/set-current` — Set specified academic year as active singleton
- `GET / POST /api/academic/semesters` — Get dynamic semesters / Create semester under an Academic Year
- `PUT / DELETE /api/academic/semesters/:id` — Update / Delete semester
- `GET / POST / DELETE /api/academic/divisions` — Manage class divisions/sections (`IT-A`, `IT-B`, `IT-C`)
- `POST /api/academic/promote` — Execute student batch promotion to target Academic Year/Semester/Division
- `POST /api/academic/enroll` — Execute batch student enrollment into dynamic semesters/divisions
- `POST /api/academic/allocations` — Allocate subjects to dynamic semesters, class divisions, and instructors

### ⚙️ Advanced Attendance Rules Engine (`/api/attendance-rules`)
- `GET /api/attendance-rules` — Fetch active system rules & 7-status matrix definitions
- `PUT /api/attendance-rules` — Update system thresholds & status weights (Admin only)
- `POST /api/attendance-rules/reset` — Reset rules to factory defaults (Admin only)
- `POST /api/attendance-rules/evaluate` — Interactive check-in evaluation simulator sandbox

### ⏱️ Attendance Session Engine (`/api/sessions`)
- `POST /api/sessions/start` — Start new active Attendance Session & generate unique Session ID
- `GET /api/sessions/active` — Fetch currently active session for a class or instructor
- `GET /api/sessions` — List all attendance sessions with search, subject, and status filters
- `GET /api/sessions/:id` — Get detailed session metadata and enrolled attendance logs
- `GET /api/sessions/:id/qr-token` — Get or auto-rotate 30s dynamic QR session token
- `POST /api/sessions/:id/stop` — Stop/complete active attendance session and compile stats

### 🛡️ Anti-Proxy Attendance Engine & Review Hub (`/api/anti-proxy`)
- `GET /api/anti-proxy/flagged` — Fetch pending flagged/suspicious attendance records with risk level, review status, and search filters
- `PUT /api/anti-proxy/review/:id` — Instructor single-record review action (`approve` to verify, `reject` to mark Absent with notes)
- `POST /api/anti-proxy/bulk-review` — Execute bulk approval or bulk rejection on selected flagged records
- `GET /api/anti-proxy/analytics` — Fetch multi-signal violation counts (QR, GPS, Time, Device, IP, Pattern) and risk score distribution
- `GET /api/anti-proxy/device-clusters` — Detect physical devices shared across multiple student accounts

### 🏥 System Health (`/api/health`)
- `GET /api/health` — Check backend status, connected database, security stack status, and API uptime


---

## 🧪 Technology Stack Breakdown

- **Frontend Core**: React 18, React Router DOM v7, Vite
- **Data Visualization**: Recharts, Chart.js, react-chartjs-2
- **Styling**: Tailwind CSS v4, Lucide React Icons, Custom Glassmorphism UI
- **Backend Framework**: Node.js, Express.js
- **Database Layer**: MongoDB, Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT), bcryptjs password hashing
- **Testing Suite**: Jest, Supertest, mongodb-memory-server
- **File System**: Multer static file upload handler

---

## 📄 License & Contribution

This project is open-source and available under the [MIT License](LICENSE).

Contributions, issue reports, and feature suggestions are welcome! Feel free to open a Pull Request or Issue.
