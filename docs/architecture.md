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
   └── Business Controllers: Auth, Attendance, Timetable, AI, Analytics, Security Audit, Academic Engine, Rules Engine
                                |
                                |  Mongoose ODM Drivers / Async I/O Query Engine
                                v
[ Database & Storage Layer (MongoDB Atlas / Local MongoDB Instance) ]
   ├── Core Collections: Users, Departments, Courses, Subjects, Classes, Attendance, Timetables, AttendanceRules
   ├── Engine Collections: AcademicYears, Semesters, Divisions, StudentEnrollments
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
│   │   │   ├── admin/          # Admin Analytics, Academic Engine (AdminAcademicEngine.jsx), Rules Engine (AdminRulesEngine.jsx), Audit Logs, Departments, Courses, Subjects
│   │   │   ├── analytics/      # Visual Charts Hub (ChartsPage.jsx)
│   │   │   ├── auth/           # Login, Register, Password Recovery
│   │   │   ├── student/        # Student Dashboard, Calendar, History, Timetable, Prediction, AiChatPage
│   │   │   └── teacher/        # Teacher Dashboard, Take Attendance, History, Reports, Leave Approval
│   │   ├── services/           # Centralized API Service Client (api.js, socket.js, deviceFingerprint.js)
│   │   ├── App.jsx             # Main Router Shell & Guarded Routes
│   │   └── main.jsx            # DOM Entry Mount
│   └── package.json
│
├── server/                     # Backend REST API Server (Node.js + Express + MongoDB)
│   ├── tests/                  # Automated Jest & Supertest Integration Test Suite (auth, attendance, qr, gps, reports, charts, notifications, rules.test.js)
│   ├── uploads/                # Static Uploaded File Attachments (Medical Certificates, Avatars)
│   ├── src/
│   │   ├── config/             # DB Connection (db.js), WebSockets (socket.js), Firebase FCM (firebase.js)
│   │   ├── controllers/        # Request Controllers (auth, user, attendance, class, timetable, report, chart, notification, leave, ai, analytics, audit, academicController, rulesController)
│   │   ├── middleware/         # Security Stack (Helmet, Rate Limiter, XSS, Input Validation, Audit Logger, JWT Auth, RBAC Authorization)
│   │   ├── models/             # Mongoose Schemas (User, Department, Course, Subject, Attendance, Class, Leave, Timetable, Notification, AuditLog, AcademicYear, Semester, Division, StudentEnrollment, AttendanceRule)
│   │   ├── routes/             # Express API Endpoints (auth, users, departments, courses, subjects, classes, attendance, leaves, timetable, reports, charts, notifications, ai, analytics, audit, academicRoutes, rulesRoutes)
│   │   ├── utils/              # GeoUtils (Haversine formula), JWT Generator, Async Handler, attendanceRulesEngine.js
│   │   ├── app.js              # Express Application Bootstrap & Security Layer
│   │   └── server.js           # Node HTTP Server Launcher
│   └── package.json
│
└── docs/                       # Project Documentation Suite
    ├── requirements.md         # Requirements Specifications & Matrix
    ├── architecture.md         # System Architecture & Technical Specs
    ├── database_design.md      # Database ERD & Schema Specs
    ├── FLOW_DIAGRAMS.md        # Comprehensive System Flow Diagrams (Mermaid)
    └── PHASES.md               # Master Consolidated Phase Implementations Specs (Phases 1-19)
```

---

## 🔑 Authentication, Security & RBAC Workflow

1. **User Login Request**: User posts credentials (`email`, `password`) to `/api/auth/login`.
2. **Credential Verification**: Server verifies identity and compares `bcryptjs` hashed password.
3. **JWT Token Issuance**: Server signs JWT payload containing `id`, `email`, and `role` (`student` | `teacher` | `admin`).
4. **Security Audit Logging**: Asynchronous audit logger records login attempt status (`SUCCESS` / `FAILED`), client IP, and device fingerprint.
5. **Protected API Requests**: Client attaches `Authorization: Bearer <token>` header to subsequent HTTP requests.
6. **Authorization Guard**: `protect` middleware verifies JWT signature and freshness; `authorize(...roles)` middleware enforces RBAC access control permissions.

---

## 🔌 API Endpoint Hierarchy

- `/api/auth` $\rightarrow$ Register, Login, Logout, Password Recovery, Token Refresh
- `/api/users` $\rightarrow$ Profile management, User directories, Role updates
- `/api/departments` $\rightarrow$ Department CRUD operations & HOD assignments
- `/api/courses` $\rightarrow$ Degree program courses CRUD operations
- `/api/subjects` $\rightarrow$ Subject CRUD & course allocations
- `/api/classes` $\rightarrow$ Active class creation, 30s Dynamic QR token generation & rotation
- `/api/attendance` $\rightarrow$ Manual marking, 30s QR scanning, GPS campus boundary verification, History
- `/api/timetable` $\rightarrow$ Today's schedule, Tomorrow's schedule, Master weekly schedule matrix
- `/api/reports` $\rightarrow$ Daily, Weekly, Monthly, Semester report generation & PDF/Excel/CSV exports
- `/api/charts` $\rightarrow$ Ratio charts, Dept comparison, Monthly trends, Subject breakdown, Student rankings
- `/api/notifications` $\rightarrow$ Notification feed, Unread counters, Web Push tokens, Announcements broadcast
- `/api/leaves` $\rightarrow$ Leave applications submission, Document attachment upload, Approval/Rejection workflow
- `/api/ai` $\rightarrow$ Attendance 75% prediction engine, Natural language chatbot, Proxy anomaly detection
- `/api/analytics` $\rightarrow$ Most absent deficit calculator, Best attendance leaderboard, Dept rankings, Teacher metrics, Daily inspector
- `/api/audit-logs` $\rightarrow$ Security audit event ledger, Metric statistics, CSV audit log export
- `/api/academic` $\rightarrow$ Academic hierarchy tree, Academic Years, Dynamic Semesters, Divisions (`IT-A`), Batch Student Promotion Engine
- `/api/attendance-rules` $\rightarrow$ Institutional rule thresholds, 7-status matrix definitions, Sandbox check-in simulator
- `/api/health` $\rightarrow$ Infrastructure health check & security stack status
