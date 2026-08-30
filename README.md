# 🎓 Multi-Role Attendance Management System

[![Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://mongodb.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933.svg?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg?logo=mongodb)](https://www.mongodb.com/)
[![Test Suite](https://img.shields.io/badge/Tests-75%2F75%20Passed-brightgreen.svg)](server/tests)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A modern, full-stack **Multi-Role Attendance Management System** designed for educational institutions. Built using **React 18, Vite, Tailwind CSS, Node.js, Express, and MongoDB**, it features tailored dashboards and workflows for **Students**, **Teachers (Faculty)**, and **Administrators**.

---

## 🌟 Key Highlights & System Capabilities

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
- 🤖 **AI Features (Phase 14)**: Attendance Prediction Engine ("Can student reach 75%?", max skips allowed, "What-If" simulator slider), Natural Language AI Chatbot ("My attendance?", "Subjects below 75%", "Can I skip tomorrow?", "Attendance report", "Remaining lectures"), and automated Suspicious Attendance & Proxy Detection Console.
- 📈 **Executive Analytics Dashboard (Phase 15)**: Comprehensive Admin analytics hub featuring 5 specialized sub-modules: Most Absent Students (< 75% attendance with shortage deficit calculator $X = \lceil 3T - 4P \rceil$), Best Attendance Leaderboard (Gold/Silver/Bronze medals & 100% Perfect badges), Department Ranking (CSE, ECE, ME, CE, IT average comparison & HOD view), Teacher Performance Metrics (classes conducted, on-time marking rate %, student attendance average), and Daily Attendance Inspector (date picker, summary metrics, and hourly time-slot session distribution).
- 🛡️ **Enterprise Security & Hardening (Phase 16)**: Multi-layered security stack including **Helmet HTTP Security Headers** (`Content-Security-Policy`, `X-Frame-Options`, `HSTS`, `X-Powered-By` suppression), **Sliding-Window Rate Limiting** (Global API 200 req/15 min, Auth endpoints 15 req/15 min, Sensitive operations 10 req/15 min), **XSS Payload Sanitizer** (recursive body/query/param HTML tag escaping), **Payload Input Validation**, **Hardened JWT & RBAC**, **CORS Governance**, **SHA-256 Server-Side Hashed Refresh Tokens**, and **HTTP-Only Cookies**.
- 🧪 **Automated Testing Suite (Phase 17 & Beyond)**: Comprehensive unit and integration test coverage (**11 test suites, 75/75 passing tests**) covering all core modules powered by **Jest**, **Supertest**, and **mongodb-memory-server**.
- 🏫 **Academic Year & Semester Engine (Phase 18)**: Dynamic institutional hierarchy engine (`Academic Year ➔ Semester ➔ Department ➔ Division ➔ Subjects`). Features custom session dates, active year status singletons, dynamic terms without hardcoding, class section capacity management (`IT-A`, `IT-B`, `IT-C`), interactive visual hierarchy tree, and wizard-driven student batch promotion engine with audit logs.
- ⚙️ **Advanced Attendance Rules Engine (Phase 19)**: Institution-wide configurable rules engine replacing hardcoded logic. Allows Admins to customize thresholds (Minimum Attendance %, Late Cutoff mins, Grace Period mins, Dynamic QR Validity mins, GPS Geofence Radius meters, Auto-Absent delay mins) and define advanced rules for 7 core statuses (`Present`, `Absent`, `Late`, `Excused`, `On Leave`, `Holiday`, `Cancelled Lecture`) with attendance inclusion weights. Includes an interactive real-time Rule Simulator / Sandbox.
- ⏱️ **Attendance Session Engine (Phase 20)**: Explicit 4-tier domain hierarchy (`Subject ➔ Scheduled Class ➔ Attendance Session ➔ Student Attendance`) separating static scheduled class definitions from active attendance sessions. Generates unique Session IDs (`SESS-YYYYMMDD-XXXX`), manages start/end timestamps, QR secret tokens, and session-linked attendance tracking.
- 🛡️ **Anti-Proxy Multi-Signal Verification (Phase 21)**: Multi-signal anti-proxy verification engine checking QR token authenticity, GPS Haversine boundary, active session window, device fingerprinting, and IP burst concurrency. Flagged scans are preserved for instructor review in `/admin/suspicious`.
- 📊 **Attendance Risk Scoring Engine (Phase 22)**: Quantitative 0–100 Attendance Risk Scoring System evaluating exact point weights (+50 Invalid QR, +40 Wrong GPS, +30 Duplicate Device, +20 Suspicious IP, +10 Unusual Timing) clamped to 0–100 and classified across 3 tiers (`0-30 Normal`, `31-60 Review`, `61-100 High Risk`).
- ✍️ **Attendance Correction Workflow (Phase 23)**: Formal attendance modification request, review, and audit trail system (`Original Value ➔ Correction Request ➔ Reason ➔ Review ➔ Approved/Rejected`). Records **Original Value**, **New Value**, **Changed By**, **Reason**, **Reviewer**, and **Timestamps** with dedicated Teacher (`/teacher/corrections`) and Admin (`/admin/corrections`) consoles.
- 📌 **Complete Institutional Audit Logging (Phase 24)**: Institutional audit trail recording all 10 core institutional actions (`LOGIN`, `LOGOUT`, `CREATE_STUDENT`, `DELETE_STUDENT`, `MARK_ATTENDANCE`, `EDIT_ATTENDANCE`, `APPROVE_LEAVE`, `REJECT_LEAVE`, `EXPORT_REPORT`, `CHANGE_SETTINGS`). Fully captures state transitions (e.g. `Absent → Present`) and change reasons (e.g. `"Medical document verified"`) with an upgraded Admin Audit Console (`/admin/audit-logs`) featuring quick-action filter pills, state transition diff cards, and CSV export.

---

## 👥 Role Capabilities & Feature Matrix

| Feature / Capability | Student | Teacher | Admin | Implementation Phase |
| :--- | :---: | :---: | :---: | :---: |
| **User Authentication & Token Refresh** | ✅ | ✅ | ✅ | Phase 1 & 16 |
| **Role-Based Access Control (RBAC)** | ✅ | ✅ | ✅ | Phase 1 & 16 |
| **Executive Dashboard & Global Analytics** | ❌ | ❌ | ✅ | Phase 5 & 15 |
| **Department, Course & Subject Management** | ❌ | ❌ | ✅ | Phase 5 |
| **Faculty & Student Account Management** | ❌ | ❌ | ✅ | Phase 5 & 16 |
| **Subject Assignment (Teachers & Students)** | ❌ | ❌ | ✅ | Phase 5 |
| **Class Session Creator & Active Roster** | ❌ | ✅ | ✅ | Phase 4 & 7 |
| **Mark & Edit Attendance with Remarks** | ❌ | ✅ | ✅ | Phase 4 & 7 |
| **Export Class Attendance CSV** | ❌ | ✅ | ✅ | Phase 4 & 10 |
| **Student Roster & Low Attendance Alerts** | ❌ | ✅ | ✅ | Phase 3, 4 & 12 |
| **Generate & Display 30s Dynamic QR Code** | ❌ | ✅ | ✅ | Phase 8 & 20 |
| **Scan QR Code & Auto-Record Attendance** | ✅ | ❌ | ❌ | Phase 8 & 20 |
| **GPS Campus Geolocation Radius Verification** | ✅ | ✅ | ✅ | Phase 8 & 19 |
| **Device Fingerprint Anti-Proxy Protection** | ✅ | ✅ | ✅ | Phase 8 & 21 |
| **Student Attendance Dashboard & Graph** | ✅ | ❌ | ❌ | Phase 3, 6 & 11 |
| **Interactive Monthly Attendance Calendar** | ✅ | ❌ | ❌ | Phase 6 |
| **Today's & Upcoming Class Timetable** | ✅ | ✅ | ❌ | Phase 3, 6 & 9 |
| **Create & Manage Weekly Timetable Slots** | ❌ | ✅ | ✅ | Phase 9 |
| **View Tomorrow's Classes Schedule** | ✅ | ✅ | ❌ | Phase 9 |
| **View Full Weekly Timetable Matrix** | ✅ | ✅ | ❌ | Phase 9 |
| **Apply for Medical / Absence Leave** | ✅ | ❌ | ❌ | Phase 6 & 13 |
| **Upload Leave Supporting Proof Document** | ✅ | ❌ | ❌ | Phase 13 |
| **Faculty Approve / Reject Student Leaves & Remarks** | ❌ | ✅ | ✅ | Phase 13 |
| **Maintain Full Leave Authorization History** | ✅ | ✅ | ✅ | Phase 13 |
| **Download Official Attendance Transcript (PDF/Excel/CSV)** | ✅ | ✅ | ✅ | Phase 6 & 10 |
| **View Attendance % Ratio Chart (Doughnut/Pie)** | ✅ | ✅ | ✅ | Phase 11 |
| **View Department Comparison Chart** | ❌ | ✅ | ✅ | Phase 11 |
| **View Monthly Trend & 75% Benchmark Line Chart** | ✅ | ✅ | ✅ | Phase 11 |
| **View Subject-Wise Attendance Chart** | ✅ | ✅ | ✅ | Phase 11 |
| **View Student Ranking & Leaderboard Chart** | ❌ | ✅ | ✅ | Phase 11 |
| **Switch Chart Library Engine (Recharts / Chart.js)** | ✅ | ✅ | ✅ | Phase 11 |
| **Real-Time Socket.io & FCM Push Notifications** | ✅ | ✅ | ✅ | Phase 12 |
| **Attendance Prediction Engine & "What-If" Simulator** | ✅ | ❌ | ❌ | Phase 14 |
| **Natural Language AI Chatbot ("Ask My Attendance")** | ✅ | ✅ | ✅ | Phase 14 |
| **Suspicious Attendance & Proxy Detection Console** | ❌ | ✅ | ✅ | Phase 14 & 21 |
| **Most Absent Students & Deficit Calculator** | ❌ | ❌ | ✅ | Phase 15 |
| **Best Attendance Leaderboard & Perfect Badges** | ❌ | ❌ | ✅ | Phase 15 |
| **Department Attendance Ranking & HOD View** | ❌ | ❌ | ✅ | Phase 15 |
| **Teacher Performance & Marking Metrics** | ❌ | ❌ | ✅ | Phase 15 |
| **Daily Attendance Inspector & Time Slot Breakdown** | ❌ | ❌ | ✅ | Phase 15 |
| **Helmet HTTP Security Headers & Rate Limiting** | ✅ | ✅ | ✅ | Phase 16 |
| **Hardened JWT & Multi-Role RBAC Authorization** | ✅ | ✅ | ✅ | Phase 16 |
| **Password Hashing & Strength Policy** | ✅ | ✅ | ✅ | Phase 16 |
| **Payload Input Validation & Schema Sanitization** | ✅ | ✅ | ✅ | Phase 16 |
| **XSS Payload Injection Sanitization** | ✅ | ✅ | ✅ | Phase 16 |
| **Configurable CORS Domain Management** | ✅ | ✅ | ✅ | Phase 16 |
| **Public Self-Registration Student Role Enforcement** | ✅ | ❌ | ❌ | Phase 16 |
| **Admin-Only Provisioning for Faculty & Admin Accounts** | ❌ | ❌ | ✅ | Phase 16 |
| **Nodemailer Password Reset Email Provider Dispatch** | ✅ | ✅ | ✅ | Phase 16 |
| **SHA-256 Server-Side Hashed Refresh Token Storage** | ✅ | ✅ | ✅ | Phase 16 |
| **HTTP-Only Secure Cookie Refresh Token Transport** | ✅ | ✅ | ✅ | Phase 16 |
| **Academic Year Management & Active Session Toggle** | ❌ | ❌ | ✅ | Phase 18 |
| **Dynamic Semesters Setup (No hardcoded terms)** | ❌ | ❌ | ✅ | Phase 18 |
| **Class Divisions & Sections (IT-A, IT-B, etc.)** | ❌ | ❌ | ✅ | Phase 18 |
| **Visual Academic Hierarchy Tree Console** | ✅ | ✅ | ✅ | Phase 18 |
| **Student Batch Promotion Engine & Audit History** | ❌ | ❌ | ✅ | Phase 18 |
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
| **Attendance Correction Audit Trail (Original, New, Changed By, Reason, Timestamps)** | ✅ | ✅ | ✅ | Phase 23 |
| **Complete 10-Action Audit Logging (`LOGIN` to `CHANGE_SETTINGS`)** | ✅ | ✅ | ✅ | Phase 24 |
| **State Mutation Diff Tracking (`Absent → Present`) & Reason Verification** | ✅ | ✅ | ✅ | Phase 24 |
| **Admin Audit Ledger UI with 10 Action Pills & CSV Export** | ❌ | ❌ | ✅ | Phase 24 |

---

## 📁 Repository Structure

```
Basic-attendance/
├── client/                      # Frontend Application (React 18 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/          # Reusable UI Components & Role Modals
│   │   │   ├── ai/              # Floating AI Chat Widget (AiChatWidget.jsx)
│   │   │   ├── analytics/       # Analytics Sub-Components (MostAbsent, BestAttendance, DeptRanking, etc.)
│   │   │   ├── charts/          # Modular Recharts & Chart.js components (Pie, Dept, Monthly, Subject, Ranking)
│   │   │   ├── common/          # ToastContainer, CreateAnnouncementModal, ProtectedRoute
│   │   │   ├── layout/          # Navbar, Sidebar, Header layout wrappers
│   │   │   ├── student/         # Student-specific components (StudentQRScannerModal.jsx)
│   │   │   ├── teacher/         # Teacher class creator modal & CreateTimetableModal
│   │   │   └── ui/              # Buttons, Cards, Inputs, Badges, Modals
│   │   ├── context/             # React State Contexts (AuthContext, NotificationContext)
│   │   ├── pages/
│   │   │   ├── admin/           # Admin Dashboard, Academic Engine, Rules Engine, Corrections, Audit Logs, Suspicious
│   │   │   ├── analytics/       # Visual Charts Hub (ChartsPage.jsx)
│   │   │   ├── auth/            # Login, Register, Forgot Password, Reset Password
│   │   │   ├── landing/         # Public Landing Page
│   │   │   ├── student/         # Student Dashboard, Calendar, History, Leave, Profile, Timetable, Prediction, AiChatPage
│   │   │   └── teacher/         # Teacher Dashboard, Take Attendance, History, Reports, Leave, Timetable, Corrections
│   │   ├── services/            # API client modules (api.js, socket.js, deviceFingerprint.js)
│   │   ├── App.jsx              # React Router route configurations
│   │   ├── index.css            # Global CSS & Tailwind imports
│   │   └── main.jsx             # React DOM entry point
│   ├── index.html
│   ├── vite.config.js           # Vite server configuration & API proxy setup
│   └── package.json
│
├── server/                      # Backend REST API (Node.js + Express + MongoDB)
│   ├── tests/                   # Automated Jest & Supertest Integration Test Suite (11 Test Suites, 75 Tests)
│   │   ├── setup.js             # Global MongoDB in-memory test environment setup
│   │   ├── auth.test.js         # Authentication, Login, Register, JWT, RBAC tests
│   │   ├── attendance.test.js   # Single/Bulk attendance, stats, defaulter threshold tests
│   │   ├── qr.test.js           # 30s dynamic QR verification & anti-proxy guard tests
│   │   ├── gps.test.js          # Haversine formula & campus 500m geofence tests
│   │   ├── reports.test.js      # Daily/Weekly/Monthly/Semester report generator tests
│   │   ├── charts.test.js       # Chart analytics datasets & student ranking tests
│   │   ├── notifications.test.js # Notification hub & FCM web push tests
│   │   ├── rules.test.js        # Attendance rules engine & sandbox tests
│   │   ├── sessions.test.js     # Attendance session lifecycle tests
│   │   ├── antiProxy.test.js    # Multi-signal anti-proxy risk engine & review tests
│   │   └── audit.test.js        # Complete 10-action audit logging & ledger tests (Phase 24)
│   ├── uploads/                 # Static uploaded files (leave attachments, profile pics)
│   ├── src/
│   │   ├── config/              # Database (db.js), WebSockets (socket.js), Firebase FCM (firebase.js)
│   │   ├── controllers/         # Request handlers (Auth, User, Attendance, Class, Leave, Timetable, Chart, AI, Analytics, Audit, Academic, Rules, Session, AntiProxy, Correction)
│   │   ├── middleware/          # Helmet, Rate Limiter, XSS Sanitizer, Input Validation, Audit Logger, JWT auth, RBAC guards
│   │   ├── models/              # Mongoose Schemas (User, Department, Course, Subject, Attendance, Class, Leave, Timetable, Notification, AuditLog, AcademicYear, Semester, Division, StudentEnrollment, AttendanceRule, AttendanceSession, AttendanceCorrection)
│   │   ├── routes/              # Express API Route definitions
│   │   ├── utils/               # JWT generator, Async handler wrappers, attendanceRulesEngine.js, antiProxyEngine.js, sendEmail.js
│   │   ├── app.js               # Express application initialization & security stack setup
│   │   └── server.js            # Node HTTP server launcher
│   ├── jest.config.js           # Jest runner configuration
│   ├── .env.example             # Server environment variables configuration template
│   └── package.json
│
├── docs/                        # Complete Documentation Suite
│   ├── requirements.md          # Functional & Non-Functional Specifications
│   ├── architecture.md          # System Architecture & Technical Specifications
│   ├── database_design.md       # Database ERD & Collection Schema Specifications
│   ├── FLOW_DIAGRAMS.md         # Mermaid Flowcharts & System Lifecycle Diagrams
│   └── PHASES.md                # Consolidated Phases Specification (Phases 1-24)
│
├── PHASES.md                    # Root Consolidated Phases Specification (Phases 1-24)
└── README.md                    # Master Project Documentation (This document)
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
   CLIENT_URL=http://localhost:3000
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

Run the complete backend test suite (**11 test suites, 75 tests**):

```bash
cd server
npm test
```

To run a specific module test suite:
```bash
npx jest tests/audit.test.js         # Phase 24 Complete Audit Logging
npx jest tests/antiProxy.test.js     # Phase 21 & 22 Anti-Proxy & Risk Scoring
npx jest tests/sessions.test.js      # Phase 20 Attendance Sessions
npx jest tests/rules.test.js         # Phase 19 Rules Engine & Sandbox
npx jest tests/auth.test.js          # Authentication & RBAC
npx jest tests/attendance.test.js    # Single & Bulk Attendance
npx jest tests/qr.test.js            # 30s Dynamic QR Token
npx jest tests/gps.test.js           # GPS Campus Geofencing
npx jest tests/reports.test.js       # Reports Generator
npx jest tests/charts.test.js        # Charts & Analytics
npx jest tests/notifications.test.js # Real-time Notifications & FCM
```

---

## 📡 Complete API Endpoint Reference

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new student account (Public self-registration forces role `student`)
- `POST /api/auth/login` — Authenticate user, issue JWT token & set HTTP-only refresh token cookie (Logs `LOGIN`)
- `POST /api/auth/refresh` — Issue fresh access token from secure refresh token
- `POST /api/auth/logout` — Revoke session, clear refresh token & record `LOGOUT` audit log
- `POST /api/auth/forgotpassword` — Generate reset token & send password recovery email via Nodemailer
- `PUT /api/auth/resetpassword/:resettoken` — Reset password using token

### 👤 User Management (`/api/users`)
- `GET /api/users` — Fetch all users with search, role, and department filters (Admin only)
- `POST /api/users` — Provision new teacher or admin account (Admin only, logs `CREATE_USER`)
- `GET /api/users/profile` — Get current logged-in user profile
- `PUT /api/users/profile` — Update user profile details (Logs `CHANGE_SETTINGS`)
- `DELETE /api/users/:id` — Remove user account (Admin only, logs `DELETE_STUDENT` / `DELETE_USER`)

### 🏢 Academic Hierarchy (`/api/departments`, `/api/courses`, `/api/subjects`)
- `GET / POST / PUT / DELETE /api/departments` — Department CRUD operations & HOD assignments
- `GET / POST / PUT / DELETE /api/courses` — Degree program courses CRUD operations
- `GET / POST / PUT / DELETE /api/subjects` — Subject CRUD & enrollment management

### 📋 Attendance & Classes (`/api/classes`, `/api/attendance`)
- `GET / POST /api/classes` — Create active class session & list scheduled classes
- `POST /api/classes/:id/start-qr` — Start dynamic 30-second expiring QR attendance session
- `GET /api/classes/:id/qr-token` — Fetch or auto-rotate active 30s QR session token
- `POST /api/classes/:id/stop-qr` — Stop active QR attendance session
- `POST /api/attendance/scan-qr` — Student scans QR code with GPS coordinates & device fingerprint
- `POST /api/attendance/mark` — Record manual session attendance for students (Logs `MARK_ATTENDANCE`)
- `GET /api/attendance/history` — Fetch attendance records with date, subject, and status filters
- `PUT /api/attendance/:id` — Edit past attendance record (Logs `EDIT_ATTENDANCE` with `Absent → Present` diff and reason)
- `GET /api/attendance/export` — Download class attendance report as CSV (Logs `EXPORT_REPORT`)

### ⏱️ Attendance Session Engine (`/api/sessions`)
- `POST /api/sessions/start` — Start new active Attendance Session & generate unique Session ID
- `GET /api/sessions/active` — Fetch currently active session for a class or instructor
- `GET /api/sessions` — List all attendance sessions with search, subject, and status filters
- `GET /api/sessions/:id` — Get detailed session metadata and enrolled attendance logs
- `GET /api/sessions/:id/qr-token` — Get or auto-rotate 30s dynamic QR session token
- `POST /api/sessions/:id/stop` — Stop/complete active attendance session and compile stats

### 🛡️ Anti-Proxy & Risk Scoring Engine (`/api/anti-proxy`)
- `GET /api/anti-proxy/flagged` — Fetch flagged/suspicious attendance records with risk score & status filters
- `PUT /api/anti-proxy/review/:id` — Instructor single-record review action (`approve` or `reject` with notes)
- `POST /api/anti-proxy/bulk-review` — Execute bulk approval or bulk rejection on selected flagged records
- `GET /api/anti-proxy/analytics` — Fetch multi-signal violation counts (QR, GPS, Time, Device, IP, Pattern) and risk score distribution
- `GET /api/anti-proxy/device-clusters` — Detect physical devices shared across multiple student accounts

### ✍️ Attendance Correction Workflow (`/api/corrections`)
- `POST /api/corrections` — Submit formal attendance correction request with mandatory reason
- `GET /api/corrections` — List correction requests with status filters (`Pending`, `Approved`, `Rejected`)
- `GET /api/corrections/:id` — Inspect specific correction request with original vs requested state
- `PUT /api/corrections/:id/review` — Review, approve, or reject correction request (Logs `EDIT_ATTENDANCE`)
- `GET /api/corrections/stats` — Fetch correction metrics (Pending, Approved, Rejected, Total)

### 📌 Complete Audit Logging Ledger (`/api/audit-logs`)
- `GET /api/audit-logs` — Fetch paginated institutional audit trail with search across actors, targets, reasons, and transitions (Admin only)
- `GET /api/audit-logs/stats` — Fetch audit overview metrics and 10-action category distribution (Admin only)
- `GET /api/audit-logs/export` — Download full audit ledger as a CSV file with Actor, Target, Transition, and Reason columns (Admin only, logs `EXPORT_REPORT`)

### 📝 Leave Application Workflow (`/api/leaves`)
- `POST /api/leaves` — Submit new leave application (Medical, Emergency, Event) with file attachment
- `GET /api/leaves/student` — View personal leave application history and approval status
- `PUT /api/leaves/:id/status` — Approve or reject leave application (Teacher / Admin, logs `APPROVE_LEAVE` / `REJECT_LEAVE`)

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
- `PUT /api/attendance-rules` — Update system thresholds & status weights (Admin only, logs `CHANGE_SETTINGS`)
- `POST /api/attendance-rules/reset` — Reset rules to factory defaults (Admin only, logs `CHANGE_SETTINGS`)
- `POST /api/attendance-rules/evaluate` — Interactive check-in evaluation simulator sandbox

### 🏥 System Health (`/api/health`)
- `GET /api/health` — Check backend status, connected database, security stack status, and API uptime

---

## 🧪 Technology Stack Breakdown

- **Frontend Core**: React 18, React Router DOM v7, Vite
- **Data Visualization**: Recharts, Chart.js, react-chartjs-2
- **Styling**: Tailwind CSS v4, Lucide React Icons, Custom Glassmorphism UI
- **Backend Framework**: Node.js, Express.js
- **Database Layer**: MongoDB, Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT), bcryptjs password hashing, HTTP-Only cookies
- **Real-Time Communication**: Socket.io, Firebase Cloud Messaging (FCM)
- **Testing Suite**: Jest, Supertest, mongodb-memory-server
- **File System**: Multer static file upload handler

---

## 📄 License & Contribution

This project is open-source and available under the [MIT License](LICENSE).

Contributions, issue reports, and feature suggestions are welcome! Feel free to open a Pull Request or Issue.
