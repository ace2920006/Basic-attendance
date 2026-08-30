# Multi-Role Attendance System - Requirements & Features Specification

This document details the functional specifications, feature requirements, and access control matrix across all implementation phases (**Phases 1 through 24**) for the **Attendance Management System**.

---

## 👥 User Roles & Features Breakdown

### 1. 🎓 Student Module
- **Authentication & Profile**:
  - Register new account (Roll Number, Department, Course, Semester).
  - Secure Login (JWT token authentication with HTTP-only refresh tokens).
  - Password recovery and profile change management.
- **Attendance Overview & Analytics**:
  - Real-time overall attendance percentage score with exam eligibility status badge (>75%).
  - Subject-wise attendance breakdown (Present, Absent, Late counts & percentages).
  - Attendance % Ratio Doughnut/Pie chart, Subject-wise stats chart, and Monthly Trend Line chart with 75% benchmark threshold.
- **Timetable & Calendar**:
  - Today's Scheduled Lectures, Tomorrow's Schedule, and Complete Interactive Weekly Schedule matrix (Monday to Sunday).
  - Interactive Monthly Attendance Calendar grid with color-coded day markers (`Present`, `Absent`, `Late`, `Leave`, `Holiday`).
- **Attendance Verification**:
  - **30s Dynamic QR Scanner**: Scan rotating expiring QR token with camera.
  - **GPS Geofencing**: Real-time student coordinate verification against campus boundary (500m radius).
  - **Anti-Proxy Protection**: Persistent device fingerprinting preventing proxy scans.
- **AI Workspace**:
  - **Attendance Predictor**: "Can I reach 75%?" math calculator, $S_{max}$ maximum allowed skips calculator, and interactive "What-If" simulator slider.
  - **Natural Language AI Chatbot**: Natural language query handling ("My attendance?", "Subjects below 75%", "Can I skip tomorrow?").
- **Leave Requests & Reports**:
  - Submit leave applications with proof document attachments (`PDF`, `PNG`, `JPG`, `DOCX`).
  - Download official printable university attendance transcripts (PDF) and raw CSV datasets.

---

### 2. 👩‍🏫 Teacher Module
- **Class & Schedule Management**:
  - Create active class sessions (`CreateClassModal.jsx`) specifying Subject Name, Code, Venue Room, Time Slot, and Capacity.
  - Schedule and manage weekly master timetable slots.
- **Attendance Session Engine (Phase 20)**:
  - 4-Tier domain separation: `Subject ➔ Scheduled Class ➔ Attendance Session ➔ Student Attendance`.
  - When teacher clicks "Start Attendance", system initializes a dedicated `AttendanceSession` instance with unique Session ID (`SESS-YYYYMMDD-XXXX`), Start Time, End Time, Mode (`QR`, `Manual`, `GPS`), QR secret token, campus location, and real-time session stats counters.
- **Attendance Operations**:
  - **30s Dynamic QR Generator**: Launch dynamic QR attendance session with live 30-second countdown timer and automatic token rotation.
  - **Interactive Attendance Screen**: Toggle student status (`Present`, `Absent`, `Late`), add session remarks, and execute one-click batch marking.
  - **History & Log Editor**: Search past class sessions and review recorded attendance entries.
- **Enrolled Roster & Reports**:
  - Enrolled student list displaying student attendance rates and defaulter warning tags.
  - Class attendance report generator with CSV, Excel, and PDF exports.
- **Leave Approvals & Security Console**:
  - Review student leave applications, view attached supporting proof documents, and execute Approve/Reject decisions with custom remarks.
- **Anti-Proxy Attendance Engine & Review Hub (Phase 21 & Phase 22)**:
  - **Multi-Signal Risk Engine**: Evaluates 6 signals (QR Token, GPS Geofencing, Time Window, Device Fingerprint, IP Address Burst, Attendance Pattern) and computes Quantitative 0-100 Risk Score.
  - **3-Tier Risk Classification**: Categorizes check-ins into `0-30 Normal`, `31-60 Review`, and `61-100 High Risk`.
  - **Non-Destructive Recording**: Suspicious scans are recorded with `riskScore` and `reviewStatus: 'Pending'` rather than discarded.
  - **Instructor Review Console**: Teacher review dashboard with single-click Approve / Reject, review notes, bulk review actions, multi-account device cluster tracking, and signal analytics.
- **Attendance Correction Workflow (Phase 23)**:
  - **Correction Review Console (`/teacher/corrections`)**: Review pending correction requests with original status, requested status, and mandatory justification note.
  - Submit correction requests on past attendance records with mandatory audit justification.

---

### 3. 🛡️ Admin Module
- **Executive Analytics Dashboard Hub (Phase 15)**:
  - **Most Absent Students**: Aggregates defaulter students (< 75%) with shortage deficit calculator ($X = \lceil 3T - 4P \rceil$).
  - **Best Attendance Leaderboard**: Honor roll with Gold, Silver, Bronze medals and 100% Perfect badges.
  - **Department Ranking**: Comparative performance ranking across departments (CSE, ECE, ME, CE, IT) with HOD view.
  - **Teacher Performance**: Conducted class counts, on-time marking rate %, student attendance average, and performance tiers.
  - **Daily Attendance Inspector**: Date picker, summary metrics, and hourly time-slot session distribution graphs.
- **Academic Year & Semester Engine (Phase 18)**:
  - **Dynamic Academic Hierarchy**: `Academic Year (2026-27)` $\rightarrow$ `Semester (Semester 5)` $\rightarrow$ `Department (IT)` $\rightarrow$ `Division (IT-A, IT-B, IT-C)` $\rightarrow$ `Subjects`.
  - **Academic Year Setup**: Define session dates, set current active session singleton (`isCurrent`), and track session status (`Upcoming`, `Active`, `Completed`, `Archived`).
  - **Dynamic Semesters**: Create term schedules (`Semester 1` to `Semester 10`) under specific Academic Years without static code limitations.
  - **Class Division / Section Management**: Create sections (`IT-A`, `IT-B`, `IT-C`) with capacity tracking and live enrolled student counters.
  - **Student Batch Promotion Engine**: Promote student cohorts across academic terms with automatic historical audit tracking (`StudentEnrollment`).
  - **Visual Hierarchy Tree Console**: Interactive tree view displaying student counts, semester statuses, and allocated subjects per division.
- **Advanced Attendance Rules Engine (Phase 19)**:
  - **Configurable Rules & Thresholds**: Configure Minimum Attendance %, Late Arrival cutoff mins, Grace Period mins, Dynamic QR Token Validity, GPS Geofence Radius meters, and Auto-Absent delay.
  - **7-Status Matrix Rules**: Customize status definitions (`Present`, `Absent`, `Late`, `Excused`, `On Leave`, `Holiday`, `Cancelled Lecture`) with custom attendance weights (`0.0` to `1.0`), `countsAsAttended`, and `countsAsConducted` toggles.
  - **Interactive Check-In Simulator**: Test check-in arrival parameters (minutes delayed, distance, QR age) in real-time before saving rules.
- **Attendance Correction Governance (Phase 23)**:
  - Master administrative correction console (`/admin/corrections`) overseeing institutional attendance modification requests, before/after states, reviewer remarks, and timestamps.
- **Complete Institutional Audit Logging (Phase 24)**:
  - **10 Core Institutional Actions Tracked**: `LOGIN`, `LOGOUT`, `CREATE_STUDENT`, `DELETE_STUDENT`, `MARK_ATTENDANCE`, `EDIT_ATTENDANCE`, `APPROVE_LEAVE`, `REJECT_LEAVE`, `EXPORT_REPORT`, `CHANGE_SETTINGS`.
  - **State Mutation Tracking**: Captures before and after states (`Absent → Present`) and reasons (`"Medical document verified"`).
  - **Admin Audit Ledger UI (`/admin/audit-logs`)**: 10 action filter pills, state diff cards, search, inspector modal, and multi-column CSV export.
- **Enterprise Security & Hardening (Phase 16)**:
  - **Security Headers**: Helmet HTTP headers (`CSP`, `HSTS`, `X-Frame-Options`).
  - **Rate Limiting**: Sliding-window rate limiters protecting API endpoints against brute-force attacks.
  - **XSS Payload Sanitizer**: Recursive request payload HTML tag escaping.
  - **Public Self-Registration Role Enforcement**: Public self-registration (`/api/auth/register`) strictly forces `role = 'student'`. Faculty and Admin accounts must be created by an authorized Admin via `/api/users`.
  - **Nodemailer Password Reset Delivery**: Password reset token links are dispatched via Nodemailer HTML email service (`sendEmail.js`).
  - **SHA-256 Server-Side Token Hashing**: Refresh tokens are stored in MongoDB as SHA-256 hashes rather than plain text JWT strings.
  - **HTTP-Only Cookie Transport**: Refresh tokens are transported using secure HTTP-Only cookies.

---

## 🔐 Access Control Matrix (RBAC)

| Feature / Resource | Student | Teacher | Admin | Implementation Phase |
| :--- | :---: | :---: | :---: | :---: |
| **User Authentication & Token Refresh** | ✅ | ✅ | ✅ | Phase 1 & 16 |
| **Role-Based Access Control (RBAC)** | ✅ | ✅ | ✅ | Phase 1 & 16 |
| **Executive Dashboard & Global Analytics** | ❌ | ❌ | ✅ | Phase 5 & 15 |
| **Academic Year & Semester Engine** | ❌ | ❌ | ✅ | Phase 18 |
| **Class Divisions & Student Batch Promotion** | ❌ | ❌ | ✅ | Phase 18 |
| **Department, Course & Subject Management** | ❌ | ❌ | ✅ | Phase 5 |
| **Faculty & Student Account Management** | ❌ | ❌ | ✅ | Phase 5 & 16 |
| **Create Active Class & Generate 30s Dynamic QR** | ❌ | ✅ | ✅ | Phase 7, 8 & 20 |
| **Scan QR Code & Mark Attendance** | ✅ | ❌ | ❌ | Phase 8 & 20 |
| **GPS Campus Geofencing & Anti-Proxy Verification** | ✅ | ✅ | ✅ | Phase 8 & 21 |
| **Weekly Timetable Creator & Schedule Matrix** | ✅ | ✅ | ✅ | Phase 9 |
| **Submit Leave Request & Upload Document** | ✅ | ❌ | ❌ | Phase 6 & 13 |
| **Review / Approve Leave Requests & Remarks** | ❌ | ✅ | ✅ | Phase 13 |
| **View Attendance Charts (Pie, Dept, Trend, Subject, Ranking)** | ✅ | ✅ | ✅ | Phase 11 |
| **Real-Time Socket.io & FCM Web Push Notifications** | ✅ | ✅ | ✅ | Phase 12 |
| **Attendance Prediction Engine & AI Chatbot** | ✅ | ✅ | ✅ | Phase 14 |
| **Suspicious Proxy Detection Console** | ❌ | ✅ | ✅ | Phase 14 & 21 |
| **Executive Analytics Hub (5 Sub-Modules)** | ❌ | ❌ | ✅ | Phase 15 |
| **Configurable Attendance Rules & Thresholds Engine** | ❌ | ❌ | ✅ | Phase 19 |
| **7-Status Matrix Rules & Attendance Weights** | ❌ | ❌ | ✅ | Phase 19 |
| **Interactive Rules Simulator / Sandbox Console** | ✅ | ✅ | ✅ | Phase 19 |
| **Attendance Session Engine (Session ID, Start/End Timestamps)** | ❌ | ✅ | ✅ | Phase 20 |
| **Session-Linked Attendance Logs & QR/GPS Session Management** | ✅ | ✅ | ✅ | Phase 20 |
| **Attendance Risk Scoring Engine (0-100 Scoring & 3-Tier Classification)** | ✅ | ✅ | ✅ | Phase 22 |
| **Attendance Correction Workflow (Request, Reason, Review, Audit)** | ✅ | ✅ | ✅ | Phase 23 |
| **Complete 10-Action Audit Logging & Ledger Inspection** | ❌ | ❌ | ✅ | Phase 24 |
| **State Mutation Diff Cards (`Absent → Present`) & Reason Callouts** | ❌ | ❌ | ✅ | Phase 24 |
| **Institutional Audit CSV Export** | ❌ | ❌ | ✅ | Phase 24 |

---

## 🎨 System Non-Functional Requirements

1. **Security**: Password hashing via `bcryptjs`, stateless session management via signed `JWT` tokens, sliding-window rate limiting, Helmet HTTP headers, recursive XSS sanitization, and non-blocking security audit logging.
2. **Performance**: Fast REST API response times (< 50ms query latency), real-time WebSockets event broadcasting via Socket.io, and optimized Vite production bundling.
3. **Data Integrity**: MongoDB Mongoose schema validation constraints, singleton active academic year enforcement, unique index rules, and cascade reference safety.
4. **Responsiveness**: Modern, glassmorphism dark-mode interface built with React 18 and Tailwind CSS, fully responsive across mobile, tablet, and desktop viewports.
