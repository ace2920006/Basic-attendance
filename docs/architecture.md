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
│   │   │   ├── admin/          # Admin Analytics, Academic Engine, Rules Engine, Corrections, Audit Logs (AdminAuditLogs.jsx), Suspicious, AdminIntelligenceDashboard.jsx, AdminDefaulterManagement.jsx, AdminDocumentVerification.jsx
│   │   │   ├── analytics/      # Visual Charts Hub (ChartsPage.jsx)
│   │   │   ├── auth/           # Login, Register, Password Recovery
│   │   │   ├── parent/         # Parent/Guardian Portal (ParentLayout, ParentDashboard, ParentAttendance, ParentSubjects, ParentLeaves, ParentWarnings, ParentNotifications)
│   │   │   ├── student/        # Student Dashboard, Calendar, History, Timetable, Prediction, AiChatPage, NotificationsList.jsx, StudentAnalytics.jsx
│   │   │   └── teacher/        # Teacher Dashboard, Take Attendance, History, Reports, Leave Approval, Corrections
│   │   ├── services/           # Centralized API Service Client (api.js, socket.js, deviceFingerprint.js)
│   │   ├── App.jsx             # Main Router Shell & Guarded Routes
│   │   └── main.jsx            # DOM Entry Mount
│   └── package.json
│
├── server/                     # Backend REST API Server (Node.js + Express + MongoDB)
│   ├── tests/                  # Automated Jest & Supertest Integration Test Suite (19 Test Suites, 169 Tests)
│   ├── uploads/                # Static Uploaded File Attachments (Avatars)
│   ├── secure_uploads/         # Non-Public Isolated Document Storage (secure_uploads/documents/)
│   ├── src/
│   │   ├── config/             # DB Connection (db.js), WebSockets (socket.js), Firebase FCM (firebase.js)
│   │   ├── controllers/        # Request Controllers (auth, user, attendance, class, timetable, report, chart, notification, leave, ai, analytics, audit, academic, rules, session, antiProxy, correction, defaulter, parent)
│   │   ├── middleware/         # Security Stack (Helmet, Rate Limiter, XSS, Input Validation, Audit Logger, JWT Auth, RBAC Authorization, secureUploadMiddleware.js)
│   │   ├── models/             # Mongoose Schemas (User, Department, Course, Subject, Attendance, Class, Leave, Timetable, Notification, AuditLog, AcademicYear, Semester, Division, StudentEnrollment, AttendanceRule, AttendanceSession, AttendanceCorrection, DefaulterRecord)
│   │   ├── routes/             # Express API Endpoints (including defaulterRoutes.js, parentRoutes.js, leaveRoutes.js)
│   │   ├── services/           # Business Services (notificationService.js, defaulterService.js, documentScannerService.js)
│   │   ├── utils/              # GeoUtils (Haversine formula), JWT Generator, Async Handler, attendanceRulesEngine.js, antiProxyEngine.js, forecastingEngine.js, studentAnalyticsEngine.js, adminIntelligenceEngine.js, sendEmail.js
│   │   ├── app.js              # Express Application Bootstrap & Security Layer
│   │   └── server.js           # Node HTTP Server Launcher
│   └── package.json
│
├── docs/                       # Project Documentation Suite
│   ├── requirements.md         # Requirements Specifications & Matrix (Phases 1-31)
│   ├── architecture.md         # System Architecture & Technical Specs (This document)
│   ├── database_design.md      # Database ERD & Schema Specs
│   ├── FLOW_DIAGRAMS.md        # Comprehensive System Flow Diagrams (Mermaid)
│   └── PHASES.md               # Master Consolidated Phase Implementations Specs (Phases 1-31)
│
├── .env.example                # Root Environment Variables Template
├── package.json                # Root Orchestration Scripts (install:all, dev, test)
├── PHASES.md                   # Master Consolidated Phase Implementations Specs (Phases 1-31)
└── README.md                   # Master Project Documentation
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

## 📈 Phase 26 Architecture: Attendance Forecasting Engine

```
       [ Student / Faculty / Admin Query ]
                        |
                        v
          +-----------------------------+
          | Attendance Forecasting Core | (server/src/utils/forecastingEngine.js)
          +-----------------------------+
                        |
         +--------------+--------------+
         |                             |
         v                             v
[ 3 Core Calculators ]     [ Natural Language AI Intents ]
 • "Can I Skip?" Simulator   • CAN_I_SKIP_SCENARIO ("Can I skip 2 classes?")
 • "How Many Can I Miss?"    • HOW_MANY_CAN_I_MISS ("Safe skip allowance")
 • "How Many Must I Attend?" • HOW_MANY_MUST_I_ATTEND ("Consecutive needed")
 • Multi-Target Milestones   • FORECAST_SUMMARY ("Forecast my attendance")
```

### Mathematical Proofs:
1. **Recovery Requirement**: Minimum consecutive attendances $x$ to reach target $R\%$:
   $$x = \max\left(0, \left\lceil \frac{R \cdot T - 100 \cdot P}{100 - R} \right\rceil\right)$$
2. **Safe Miss Allowance**: Maximum consecutive misses $m$ while maintaining $\ge R\%$:
   $$m = \max\left(0, \left\lfloor \frac{100 \cdot P - R \cdot T}{R} \right\rfloor\right)$$
3. **Scenario Projection**: Given $a$ planned attendances and $b$ planned skips:
   $$\text{Projected } \% = \frac{P + a}{T + a + b} \times 100$$

---

## 🎓 Phase 27 Architecture: Advanced Student Analytics Engine

```
       [ Student / Faculty / Admin Query ]
                        |
                        v
        +-------------------------------+
        | Student Analytics Engine Core | (server/src/utils/studentAnalyticsEngine.js)
        +-------------------------------+
                        |
    +-------------------+-------------------+
    |                                       |
    v                                       v
[ 9 Core Metrics Aggregator ]       [ Visual Threshold Engine ]
 • Overall Attendance (%)            • 75% Minimum Benchmark Line
 • Subject Attendance Breakdown      • Monotone Spline Curve (Jun-Aug)
 • Weekly Velocity Trend (W1-W6)     • Dual-Engine: Recharts & Chart.js
 • Monthly Progression Timeline      • Retro-Modern Visual Matrix Box
 • Best Subject Dynamic Detection
 • Worst Subject & Deficit Alert
 • Late Count & Punctuality
 • Absent Count & Rate
 • Leave Count & Categories
```

### Endpoints:
- `GET /api/analytics/student/me`: Personal analytics for logged-in student.
- `GET /api/analytics/student/:studentId`: Scoped student personal analytics for faculty and admin review.

---

## 📊 Phase 28 Architecture: Teacher Analytics & Classroom Insights Engine

```
       [ Faculty Instructor / Admin Query ]
                        |
                        v
        +-------------------------------+
        |  Teacher Analytics Engine     | (server/src/utils/teacherAnalyticsEngine.js)
        +-------------------------------+
                        |
    +-------------------+-------------------+
    |                                       |
    v                                       v
[ 7 Core Dimensions Aggregator ]    [ Behavioral Pattern Engine ]
 • Average Class Attendance (%)      • Mon-Fri Percentage Analysis
 • Most Absent Defaulter Directory   • Automated Friday Drop Alert (69%)
 • Shortage Deficit Math (x classes) • Pedagogical Interventions
 • Most Late Chronic Students        • Peak Midweek Engagement (Tue 91%)
 • Lecture Slot Timing Breakdown     • Post-Lunch Slump Diagnostics
 • Course Subject-Wise Breakdown
 • Class Division Comparison
```

### Endpoints:
- `GET /api/analytics/teacher/me`: Personal classroom analytics for logged-in teacher (with `subject`, `division`, `timeframe` filters).
- `GET /api/analytics/teacher/:teacherId`: Scoped teacher analytics for faculty and admin review.

---

## 🧠 Phase 29 Architecture: Admin Intelligence Dashboard (College-Level Control Center)

```
                       [ College Administrator Query ]
                                      |
                                      v
                      +-------------------------------+
                      |   Admin Intelligence Engine   | (server/src/utils/adminIntelligenceEngine.js)
                      +-------------------------------+
                                      |
         +----------------------------+----------------------------+
         |                                                         |
         v                                                         v
[ Executive KPI Command Center ]                        [ 7 Analytical Intelligence Hubs ]
 • Total Students: 2,481 (+4.2% YoY)                     1. Department Comparison & Variance
 • Total Faculty: 143 (1:17 Ratio)                       2. Inter-Division Matrix (CSE-A, IT-A, etc.)
 • Today's Live Attendance: 87.4%                        3. 6-Month Trajectory & Friday Slump Alert
 • Students <75%: 312 (12.6% Defaulters)                 4. Defaulter Math: x = ceil((0.75T - P)/0.25)
 • Secondary Pulse: Depts, Divisions, Leaves, Flags      5. Faculty Compliance & Teaching Slots
                                                         6. Multi-Signal Anti-Proxy Telemetry
                                                         7. Leave Approval & Truancy Impact
```

### Endpoints:
- `GET /api/analytics/admin-intelligence`: Complete college-level control center analytics (with optional `department`, `division`, `timeframe`, `search` filters).
- `GET /api/analytics/intelligence`: Alias endpoint for institutional intelligence telemetry.

---

## 🚨 Phase 30 Architecture: Automated Defaulter Management & Escalation Pipeline

```
                       [ Student Attendance Check-In / Live Mark ]
                                          |
                                          v
                    +-------------------------------------------+
                    | Defaulter Evaluation Engine               | (server/src/services/defaulterService.js)
                    | Checks Rule Thresholds & Minimum Classes  |
                    +-------------------------------------------+
                                          |
                      +-------------------+-------------------+
                      |                                       |
             Attendance >= 75%                       Attendance < 75%
                      |                                       |
                      v                                       v
         [ Clear / Auto-Resolve ]                 [ 4-Tier Escalation Pipeline ]
          • Transition: Active -> Resolved        • Calculate Deficit: x = ceil((rT - P)/(1 - r))
          • Timestamp & Recovery Audit            • Upsert DefaulterRecord (student, tier, status)
                                                              |
          +-----------------------+---------------------------+-----------------------+
          |                       |                           |                       |
          v                       v                           v                       v
      [ < 75% ]               [ < 70% ]                   [ < 65% ]               [ < 60% ]
   Tier 1: Warning     Tier 2: Serious Warning     Tier 3: Admin Alert    Tier 4: Parent Alert
   • In-App Notice     • Warning Flag Marked       • HOD Watchlist         • Urgent Escalation
   • Push Notification • Mandatory Counseling Call • Exam Debarment Alert  • Parent HTML Email
```

### Mathematical Deficit Recovery Formula
For a required benchmark percentage $r = \frac{\text{threshold}}{100}$ (e.g. 0.75), given total classes $T$ and attended classes $P$:
$$x = \left\lceil \frac{r \cdot T - P}{1 - r} \right\rceil$$

### Automated Action Dispatchers
- **Automatic Event Triggering**: Integrated directly into `checkAndSendAttendanceAlerts` on every attendance marking event.
- **Parent/Guardian Email Dispatcher**: Dispatches high-priority HTML emails with recovery mathematics and institutional contact details when attendance drops below the Tier 4 threshold (default `< 60%`).
- **Resolution & Audit Ledger**: Records student counselor resolutions with verified notes, or auto-resolves when cumulative attendance rises $\ge 75\%$.

### Endpoints:
- `GET /api/defaulters`: Query active/resolved defaulters with multi-filter search (`department`, `tier`, `status`, `search`).
- `GET /api/defaulters/summary`: Defaulter KPI summary cards and tier distribution counts.
- `GET /api/defaulters/config` & `PUT /api/defaulters/config`: Read and dynamically update 4-tier threshold rules.
- `POST /api/defaulters/evaluate`: Trigger on-demand college-wide batch defaulter evaluation.
- `POST /api/defaulters/escalate/:id`: Manually escalate a student's defaulter tier with counselor notes.
- `POST /api/defaulters/resolve/:id`: Record counselor clearance and resolve defaulter status.
- `POST /api/defaulters/notify-bulk`: Dispatch multi-channel warning notices to filtered defaulter cohorts.
- `GET /api/defaulters/student/:studentId`: Retrieve student-facing defaulter status and escalation timeline.

---

## 👨‍👩‍👧 Phase 31: Parent/Guardian Portal Subsystem Architecture

### Architectural Overview & Ward Linking Topology
The Parent/Guardian Portal enables family members to monitor their student's (ward's) attendance, academic standing, leave requests, and institutional warnings.

```
       [ Parent User (role: 'parent') ]
                     |
       (User.linkedStudents: [ObjectId])
                     |
       +-------------+-------------+
       |                           |
       v                           v
[ Ward 1 (Student) ]        [ Ward 2 (Student) ]
 (User: CS2024001)           (User: CS2024045)
       |                           |
       +-------------+-------------+
                     |
                     v
   [ Read-Only Data Aggregation Subsystem ]
   ├── Attendance Collection: Cumulative %, Days Log, 75% Benchmark
   ├── Subject Collection: Course %, Safe Misses, Recovery Lectures
   ├── Leaves Collection: Student-filed leaves & Medical Proof Attachments
   ├── DefaulterRecords Collection: 4-Tier Warning Meter & Counselor Ledger
   └── Notifications Collection: Attendance shortage alerts & circulars
```

### Strict Read-Only Security Architecture
The system enforces a **Zero Mutation Policy** for the `parent` role. All mutation endpoints return `403 Forbidden`:

| Endpoint | Method | Parent Role Authorization | Enforcement Mechanism |
| :--- | :--- | :--- | :--- |
| `/api/attendance` | POST | ❌ 403 Forbidden | `authorize('teacher', 'admin')` |
| `/api/attendance/:id` | PUT | ❌ 403 Forbidden | `authorize('teacher', 'admin')` |
| `/api/attendance/:id` | DELETE | ❌ 403 Forbidden | `authorize('admin')` |
| `/api/attendance/bulk` | POST | ❌ 403 Forbidden | `authorize('teacher', 'admin')` |
| `/api/attendance/scan-qr` | POST | ❌ 403 Forbidden | `authorize('student')` |
| `/api/leaves` | POST | ❌ 403 Forbidden | `authorize('student')` |
| `/api/leaves/:id/status` | PUT | ❌ 403 Forbidden | `authorize('teacher', 'admin')` |

### Parent Endpoints (`/api/parent/*`):
- `GET /api/parent/wards`: List all registered students linked to the authenticated parent.
- `POST /api/parent/link-ward`: Link an additional ward using the student's unique roll number.
- `GET /api/parent/overview`: Fetch cumulative attendance percentage, 75% benchmark status, and quick metrics.
- `GET /api/parent/attendance`: Granular session logs with date, subject, and status filters.
- `GET /api/parent/subjects`: Subject-wise attendance breakdown, safe skip allowances, and consecutive recovery math.
- `GET /api/parent/leaves`: Ward's submitted leave applications, reviewer remarks, and proof attachments.
- `GET /api/parent/warnings`: Active defaulter tier (4 tiers), deficit recovery calculations, and counseling contacts.
- `GET /api/parent/notifications`: Read-only parent notification feed and institutional circulars.

---

## 📄 Phase 31: Document Verification & Secure Storage Architecture

### Multi-Stage Verification Pipeline
Leave applications with supporting proof documents (medical certificates, official event letters, duty orders) traverse an end-to-end multi-tier pipeline:

```
[ Student Submits Leave Request ]
               │
               ▼
[ Secure Document Upload Middleware ] ── (server/src/middleware/secureUploadMiddleware.js)
   • Multer Isolated Storage: server/secure_uploads/documents/
   • Strict 5MB Size Ceiling (5 * 1024 * 1024 bytes)
   • Allowed Formats: PDF, JPG, PNG
   • Cryptographically Randomized Filenames
               │
               ▼
[ Document Security Scanner Service ] ── (server/src/services/documentScannerService.js)
   • Binary Magic-Byte Inspection (%PDF-, \x89PNG, \xFF\xD8\xFF)
   • Heuristic Antivirus & Threat Analysis (EICAR, PE/ELF executables, scripts, PDF launch exploits)
   • SHA-256 Checksum Calculation & Tamper-Evident Hashing
   • ClamAV Daemon Socket Hook (where available)
               │
               ▼
[ Leave Record Created (verificationStage: 'teacher_review') ]
               │
               ▼
[ Faculty Mentor Review Stage ] ── (/teacher/leave)
   • Private Authenticated Document Streaming
   • Approve & Forward to Admin OR Reject with Remarks
   • Verification State ➔ verificationStage: 'admin_verification'
               │
               ▼
[ Admin Final Verification Console ] ── (/admin/document-verification)
   • Document Security & Integrity Inspector Modal
   • On-Demand Malware & SHA-256 Re-Scan
   • Official Institutional Sanctioning ➔ verificationStage: 'completed', status: 'Approved'
   • Automatic Attendance Adjustment & Audit Log Recording
```

### Document Security & Threat Prevention Measures
1. **Isolated Non-Public Storage**:
   - Stored in `server/secure_uploads/documents/` — isolated from Express public static file routing (`/uploads`).
   - Files cannot be directly accessed or enumerated via browser paths.
2. **Binary Magic-Byte Signature Validation**:
   - PDF: `%PDF-` (`0x25 0x50 0x44 0x46`)
   - PNG: `\x89PNG\r\n\x1a\n` (`0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A`)
   - JPEG: SOI marker (`0xFF 0xD8 0xFF`)
   - Eliminates extension spoofing attacks (e.g. `.exe` or `.html` renamed to `.pdf`).
3. **Multi-Vector Antivirus & Malware Engine**:
   - Signature checks for the standard EICAR test string.
   - Binary heuristic detection of disguised Windows PE/DOS executables (`MZ` header) and Linux ELF binaries.
   - Polyglot detection for inline HTML/JS tags (`<script`, `javascript:`, `eval(`, `<?php`).
   - PDF exploit vector scanning for active process launching (`/Launch`, `/EmbeddedFiles`, `/JavaScript`).
   - Auto-quarantine: Malicious uploads are unlinked immediately and logged with audit event `DOCUMENT_MALWARE_FLAGGED`.
4. **Private Access Streaming & Expiring Signed Tokens**:
   - **Direct Authenticated Session Streaming**: `GET /api/leaves/:id/document` checks student ownership, department teacher assignment, admin role, or linked parent authorization.
   - **15-Minute Signed Tokens**: `GET /api/leaves/:id/document-token` generates an HMAC/JWT signed token for embedded iframe or modal previews via `GET /api/leaves/document-stream/:token`.
   - Security response headers: `Content-Disposition: inline`, `X-Content-Type-Options: nosniff`, `Cache-Control: private, no-store`.

---

## 📱 Phase 33: Progressive Web App (PWA) & Mobile Subsystem Architecture

### Mobile Experience & Offline Shell Architecture
Phase 33 implements an installable, mobile-optimized architecture supporting offline shell execution, native-like mobile navigation, and device camera hardware integration:

```
                               Mobile / Desktop Browser
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
     [ Web App Manifest Subsystem ]                   [ Service Worker Subsystem ]
     • manifest.webmanifest / manifest.json           • sw.js Cache Controller
     • Standalone Display Mode                        • Cache-First Static Assets (campusattend-v1)
     • #4f46e5 Theme / #020617 Slate Canvas           • Network-First Navigation Strategy
     • 6 Responsive Vector & Raster Icons             • Offline Fallback Shell (offline.html)
     • Application Shortcuts (Scan, Classes, Stats)   • Web Push Push & NotificationClick
                  │                                               │
                  └───────────────────────┬───────────────────────┘
                                          ▼
                         [ Client Mobile UX Container ]
          ┌───────────────────────────────┼───────────────────────────────┐
          ▼                               ▼                               ▼
 [ Thumb Bottom Navigation ]    [ Device Hardware QR Scanner ]    [ Install Promotion Engine ]
 • MobileBottomNav.jsx          • StudentQRScannerModal.jsx       • PwaInstallContext.jsx
 • 4-Role Aware Touch Tabs      • MediaDevices getUserMedia       • beforeinstallprompt Listener
 • Floating 1-Tap QR Button     • Rear/Front Camera Lens Flip     • Slide-Up Mobile Banner
 • Safe-Area Inset Support      • Hardware Torch Flashlight       • iOS Safari Add-to-Home Modal
 • Responsive Drawer Sidebar    • Dual BarcodeDetector + jsQR     • Header Desktop/Tablet Pill
```

### Core PWA Engineering Components
1. **Multi-Strategy Service Worker (`client/public/sw.js`)**:
   - **Pre-cache Core Shell**: Pre-caches HTML, icons, and `offline.html` on `install`.
   - **Cache-First for Static Assets**: JavaScript, CSS, Google Fonts, and static PNG/SVG images are served from cache first for instantaneous page load.
   - **Network-First for Documents & HTML**: Page navigation requests attempt live network first, falling back to cached shell or styled `offline.html` during disconnects.
   - **API Offline Guard**: Mutation requests (`POST`, `PUT`, `DELETE`) intercepted during disconnects return `{ offline: true, message: 'You are currently offline...' }`.
2. **Device Camera Hardware QR Scanner Pipeline**:
   - Captures video stream using `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })`.
   - Allows switching between back and front cameras dynamically.
   - Applies hardware torch constraints where available (`torch` track property).
   - Dual-engine parsing: Native `window.BarcodeDetector` (Chromium/Android) + canvas frame extraction with pure-JS `jsqr` fallback (iOS Safari / Firefox).
   - Audio feedback using HTML5 Web Audio API oscillator synthesis (`playScanBeep()`).
   - Automatically bundles scanned payload with GPS coordinates (`navigator.geolocation`) and device fingerprint into `POST /api/attendance/scan-qr`.
3. **PWA Install Promotion Lifecycle**:
   - Intercepts and holds `beforeinstallprompt` event in `PwaInstallContext`.
   - Evaluates standalone display mode via `window.matchMedia('(display-mode: standalone)').matches` or `navigator.standalone`.
   - Renders responsive slide-up banner on mobile web and provides step-by-step visual guide for iOS Safari users.
4. **Future React Native Bridge via Stitch MCP**:
   - Reusable domain logic: API client methods, WebSocket listeners, GPS calculations, and risk models.
   - Using **Stitch MCP** server to generate native React Native screens and design systems matching CampusAttend's design tokens.

---

## 🔌 API Endpoint Hierarchy

- `/api/auth` $\rightarrow$ Register, Login, Logout, Password Recovery, Token Refresh (Logs `LOGIN`, `LOGOUT`)
- `/api/users` $\rightarrow$ Profile management, User directories, Role updates, Guardian contact info (Logs `CREATE_USER`, `DELETE_USER`, `CHANGE_SETTINGS`)
- `/api/departments` $\rightarrow$ Department CRUD operations & HOD assignments
- `/api/courses` $\rightarrow$ Degree program courses CRUD operations
- `/api/subjects` $\rightarrow$ Subject CRUD & course allocations
- `/api/classes` $\rightarrow$ Active class creation, 30s Dynamic QR token generation & rotation
- `/api/attendance` $\rightarrow$ Manual marking, 30s QR scanning, GPS campus boundary verification, History (Logs `MARK_ATTENDANCE`, `EDIT_ATTENDANCE`, `EXPORT_REPORT`)
- `/api/timetable` $\rightarrow$ Today's schedule, Tomorrow's schedule, Master weekly schedule matrix
- `/api/reports` $\rightarrow$ Daily, Weekly, Monthly, Semester report generation & PDF/Excel/CSV exports (Logs `EXPORT_REPORT`)
- `/api/charts` $\rightarrow$ Ratio charts, Dept comparison, Monthly trends, Subject breakdown, Student rankings
- `/api/notifications` $\rightarrow$ Notification feed, Unread counters, Preferences (`GET/PUT /preferences`), Multi-channel test simulator (`POST /test-dispatch`), Smart attendance recovery breakdown (`GET /smart-summary`), Web Push tokens, Announcements broadcast
- `/api/leaves` $\rightarrow$ Secure document upload (`POST /upload-document`), Leave submission (`POST /`), Multi-stage verification (`PUT /:id/teacher-review`, `PUT /:id/admin-verify`), Private document streaming (`GET /:id/document`), 15-min signed tokens (`GET /:id/document-token`, `GET /document-stream/:token`), On-demand malware re-scan (`POST /:id/rescan`) (Logs `TEACHER_VERIFY_LEAVE`, `ADMIN_VERIFY_LEAVE`, `DOCUMENT_UPLOADED`, `DOCUMENT_MALWARE_FLAGGED`)
- `/api/ai` $\rightarrow$ Attendance Forecasting Engine (`POST /forecast/calculate`, `GET /forecast/me`), Attendance 75% prediction (`GET /predict`), Natural language chatbot (`POST /chat`), Proxy anomaly detection (`GET /suspicious-detection`)
- `/api/analytics` $\rightarrow$ Admin Intelligence Dashboard (`/admin-intelligence`, `/intelligence`), Teacher classroom analytics (`/teacher/me`, `/teacher/:teacherId`), Student personal analytics dashboard (`/student/me`, `/student/:studentId`), Most absent deficit calculator, Best attendance leaderboard, Dept rankings, Teacher metrics, Daily inspector
- `/api/academic` $\rightarrow$ Academic hierarchy tree, Academic Years, Dynamic Semesters, Divisions (`IT-A`), Batch Student Promotion Engine
- `/api/attendance-rules` $\rightarrow$ Institutional rule thresholds, Defaulter policy config, 7-status matrix definitions, Sandbox check-in simulator (Logs `CHANGE_SETTINGS`)
- `/api/sessions` $\rightarrow$ Attendance Session Engine, Session ID generator, QR/GPS session start & stop lifecycle
- `/api/anti-proxy` $\rightarrow$ Anti-Proxy Multi-Signal Risk Engine, Phase 22 Attendance Risk Scoring (0-100), 3-Tier Classification (0-30 Normal, 31-60 Review, 61-100 High Risk), Flagged Records Review Console, Bulk Review, Device Clusters, Analytics
- `/api/corrections` $\rightarrow$ Attendance Modification Workflow, Request submission, Mandatory reasons, Teacher & Admin Review Consoles (Logs `EDIT_ATTENDANCE`)
- `/api/audit-logs` $\rightarrow$ Institutional Audit Trail Ledger, 10-Action breakdown stats, Multi-column CSV export (Logs `EXPORT_REPORT`)
- `/api/defaulters` $\rightarrow$ Automated Defaulter Management Engine, 4-Tier Escalation Pipeline, Configurable Thresholds, Batch Evaluation, Parent HTML Email Dispatcher, Counselor Resolution Ledger
- `/api/parent` $\rightarrow$ Parent/Guardian Portal, Multi-Ward Selector, Cumulative Overview, Subject-Wise Recovery Breakdown, Ward Leaves & Proofs, Defaulter Warnings, Read-Only Security Enforcement
- `/api/health` $\rightarrow$ Infrastructure health check & security stack status



