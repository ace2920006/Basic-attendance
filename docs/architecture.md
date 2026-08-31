# System Architecture & Technical Specification

## 🏗️ High-Level System Architecture

The Attendance Management System is built on a modern MERN 3-Tier Architecture designed for modularity, real-time communication, security, and enterprise scalability:

```
[ Client Layer (React 18 SPA + Vite + Tailwind CSS + WebSockets) ]
                                |
                                |  HTTPS / REST API (JSON) + JWT Bearer Token Header
                                |  WebSockets (Socket.io) Real-time Event Channel
                                v
[ Application & Security Layer (Express REST Server + Socket.io Engine) ]
   ├── Security Stack: Helmet HTTP Headers, Rate Limiter, XSS Sanitizer, RBAC Guards
   ├── Real-time Engine: Socket.io Event Emitter, Firebase FCM Web Push
   └── Business Controllers: Auth, User, Attendance, Timetable, AI, Analytics, Audit, Academic, Rules, Session, AntiProxy, Correction
                                |
                                |  Mongoose ODM Drivers / Async I/O Query Engine
                                v
[ Database & Storage Layer (MongoDB Atlas / Local MongoDB Instance) ]
   ├── Core Collections: Users, Departments, Courses, Subjects, Classes, Attendance, Timetables, AttendanceRules, AttendanceSessions
   ├── Engine Collections: AcademicYears, Semesters, Divisions, StudentEnrollments, AttendanceCorrections
   └── Audit & Support: AuditLogs, Leaves, Notifications
```

---

## 📁 Directory Structure Breakdown

```
Basic-attendance/
├── client/                     # Frontend SPA Application (React 18 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Reusable UI Components & Role Modals
│   │   │   ├── ai/             # Global Floating AI Chatbot Widget (AiChatWidget.jsx)
│   │   │   ├── analytics/      # Analytics Sub-Components (MostAbsent, BestAttendance, DeptRanking, etc.)
│   │   │   ├── charts/         # Dual-Engine Visual Chart Components (Recharts & Chart.js)
│   │   │   ├── common/         # ToastContainer, CreateAnnouncementModal, ProtectedRoute
│   │   │   ├── layout/         # Header, Sidebar, Navbar Layout wrappers
│   │   │   ├── student/        # Student QR Scanner Modal
│   │   │   └── teacher/        # Teacher QR Modal, CreateClassModal, CreateTimetableModal
│   │   ├── context/            # React State Contexts (AuthContext, NotificationContext)
│   │   ├── pages/              # Role-based Route Pages
│   │   │   ├── admin/          # Admin Analytics, Academic Engine, Rules Engine, Corrections, Audit Logs (AdminAuditLogs.jsx), Suspicious
│   │   │   ├── analytics/      # Visual Charts Hub (ChartsPage.jsx)
│   │   │   ├── auth/           # Login, Register, Password Recovery
│   │   │   ├── student/        # Student Dashboard, Calendar, History, Timetable, Prediction, AiChatPage, NotificationsList.jsx
│   │   │   └── teacher/        # Teacher Dashboard, Take Attendance, History, Reports, Leave Approval, Corrections
│   │   ├── services/           # Centralized API Service Client (api.js, socket.js, deviceFingerprint.js)
│   │   ├── App.jsx             # Main Router Shell & Guarded Routes
│   │   └── main.jsx            # DOM Entry Mount
│   └── package.json
│
├── server/                     # Backend REST API Server (Node.js + Express + MongoDB)
│   ├── tests/                  # Automated Jest & Supertest Integration Test Suite (11 Test Suites, 84 Tests)
│   ├── uploads/                # Static Uploaded File Attachments (Medical Certificates, Avatars)
│   ├── src/
│   │   ├── config/             # DB Connection (db.js), WebSockets (socket.js), Firebase FCM (firebase.js)
│   │   ├── controllers/        # Request Controllers (auth, user, attendance, class, timetable, report, chart, notification, leave, ai, analytics, audit, academic, rules, session, antiProxy, correction)
│   │   ├── middleware/         # Security Stack (Helmet, Rate Limiter, XSS, Input Validation, Audit Logger, JWT Auth, RBAC Authorization)
│   │   ├── models/             # Mongoose Schemas (User, Department, Course, Subject, Attendance, Class, Leave, Timetable, Notification, AuditLog, AcademicYear, Semester, Division, StudentEnrollment, AttendanceRule, AttendanceSession, AttendanceCorrection)
│   │   ├── routes/             # Express API Endpoints
│   │   ├── services/           # Business Services (notificationService.js)
│   │   ├── utils/              # GeoUtils (Haversine formula), JWT Generator, Async Handler, attendanceRulesEngine.js, antiProxyEngine.js, sendEmail.js
│   │   ├── app.js              # Express Application Bootstrap & Security Layer
│   │   └── server.js           # Node HTTP Server Launcher
│   └── package.json
│
└── docs/                       # Project Documentation Suite
    ├── requirements.md         # Requirements Specifications & Matrix
    ├── architecture.md         # System Architecture & Technical Specs (This document)
    ├── database_design.md      # Database ERD & Schema Specs
    ├── FLOW_DIAGRAMS.md        # Comprehensive System Flow Diagrams (Mermaid)
    └── PHASES.md               # Master Consolidated Phase Implementations Specs (Phases 1-25)
```

---

## 🔑 Authentication, Security & Complete Audit Workflow

1. **User Login Request**: User posts credentials (`email`, `password`) to `/api/auth/login`.
2. **Credential Verification**: Server verifies identity and compares `bcryptjs` hashed password.
3. **JWT Token Issuance**: Server signs JWT payload containing `id`, `email`, and `role` (`student` | `teacher` | `admin`) and sets secure HTTP-only refresh cookie.
4. **Institutional Audit Logging (Phase 24)**: Records `LOGIN` action (`SUCCESS` or `FAILED`), client IP address, and User-Agent.
5. **Protected API Requests**: Client attaches `Authorization: Bearer <token>` header to subsequent HTTP requests.
6. **Authorization Guard**: `protect` middleware verifies JWT signature and freshness; `authorize(...roles)` middleware enforces RBAC access control permissions.
7. **State Mutation & Reason Tracking**: When a record is altered (e.g. `EDIT_ATTENDANCE` or `CHANGE_SETTINGS`), the controller explicitly logs the before-state, after-state (`transition: "Absent → Present"`), target entity, and user-provided rationale (`reason: "Medical document verified"`).

---

## 🔔 Advanced Notification Engine Architecture (Phase 25)

The notification system is decoupled from controllers and centralized inside `server/src/services/notificationService.js`:

```
Domain Event (e.g. Attendance Marked, Low Attendance, Leave Decision, Class Cancelled, Timetable Change)
                                |
                                v
               [ Centralized Notification Service ]
              (notificationService.dispatchNotification)
                                |
          +---------------------+---------------------+
          | User Preferences & Channel Filter Check    |
          +---------------------+---------------------+
          |                     |                     |
          v                     v                     v
 [ In-App Channel ]     [ Email Channel ]      [ Push Channel ]
  • MongoDB Document     • Nodemailer HTML      • Firebase Admin SDK
  • Socket.io Emit       • Dark-Theme Layout    • FCM Web Push Tokens
  • Audio Chime & Toast  • Action Callout CTA   • Browser Service Worker
```

### Smart Recovery Advice Formula
When attendance falls below the target threshold (e.g. 75%):
$$\text{lecturesNeeded} = \max\left(1, \left\lceil \frac{\text{targetPct}/100 \times \text{total} - \text{attended}}{1 - \text{targetPct}/100} \right\rceil\right)$$

*Example Output:* **"Your Database Systems attendance has fallen to 72%. You need 2 consecutive attended lectures to reach 75%."**

When attendance is $\ge 75\%$:
$$\text{safeMisses} = \max\left(0, \left\lfloor \frac{\text{attended} - \text{targetPct}/100 \times \text{total}}{\text{targetPct}/100} \right\rfloor\right)$$

---

## 🔌 API Endpoint Hierarchy

- `/api/auth` $\rightarrow$ Register, Login, Logout, Password Recovery, Token Refresh (Logs `LOGIN`, `LOGOUT`)
- `/api/users` $\rightarrow$ Profile management, User directories, Role updates (Logs `CREATE_USER`, `DELETE_USER`, `CHANGE_SETTINGS`)
- `/api/departments` $\rightarrow$ Department CRUD operations & HOD assignments
- `/api/courses` $\rightarrow$ Degree program courses CRUD operations
- `/api/subjects` $\rightarrow$ Subject CRUD & course allocations
- `/api/classes` $\rightarrow$ Active class creation, 30s Dynamic QR token generation & rotation
- `/api/attendance` $\rightarrow$ Manual marking, 30s QR scanning, GPS campus boundary verification, History (Logs `MARK_ATTENDANCE`, `EDIT_ATTENDANCE`, `EXPORT_REPORT`)
- `/api/timetable` $\rightarrow$ Today's schedule, Tomorrow's schedule, Master weekly schedule matrix
- `/api/reports` $\rightarrow$ Daily, Weekly, Monthly, Semester report generation & PDF/Excel/CSV exports (Logs `EXPORT_REPORT`)
- `/api/charts` $\rightarrow$ Ratio charts, Dept comparison, Monthly trends, Subject breakdown, Student rankings
- `/api/notifications` $\rightarrow$ Notification feed, Unread counters, Preferences (`GET/PUT /preferences`), Multi-channel test simulator (`POST /test-dispatch`), Smart attendance recovery breakdown (`GET /smart-summary`), Web Push tokens, Announcements broadcast
- `/api/leaves` $\rightarrow$ Leave applications submission, Document attachment upload, Approval/Rejection workflow (Logs `APPROVE_LEAVE`, `REJECT_LEAVE`)
- `/api/ai` $\rightarrow$ Attendance 75% prediction engine, Natural language chatbot, Proxy anomaly detection
- `/api/analytics` $\rightarrow$ Most absent deficit calculator, Best attendance leaderboard, Dept rankings, Teacher metrics, Daily inspector
- `/api/academic` $\rightarrow$ Academic hierarchy tree, Academic Years, Dynamic Semesters, Divisions (`IT-A`), Batch Student Promotion Engine
- `/api/attendance-rules` $\rightarrow$ Institutional rule thresholds, 7-status matrix definitions, Sandbox check-in simulator (Logs `CHANGE_SETTINGS`)
- `/api/sessions` $\rightarrow$ Attendance Session Engine, Session ID generator, QR/GPS session start & stop lifecycle
- `/api/anti-proxy` $\rightarrow$ Anti-Proxy Multi-Signal Risk Engine, Phase 22 Attendance Risk Scoring (0-100), 3-Tier Classification (0-30 Normal, 31-60 Review, 61-100 High Risk), Flagged Records Review Console, Bulk Review, Device Clusters, Analytics
- `/api/corrections` $\rightarrow$ Attendance Modification Workflow, Request submission, Mandatory reasons, Teacher & Admin Review Consoles (Logs `EDIT_ATTENDANCE`)
- `/api/audit-logs` $\rightarrow$ Institutional Audit Trail Ledger, 10-Action breakdown stats, Multi-column CSV export (Logs `EXPORT_REPORT`)
- `/api/health` $\rightarrow$ Infrastructure health check & security stack status
