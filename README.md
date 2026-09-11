# 🎓 Multi-Role Attendance Management System

[![Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://mongodb.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933.svg?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg?logo=mongodb)](https://www.mongodb.com/)
[![Test Suite](https://img.shields.io/badge/Tests-169%2F169%20Passed-brightgreen.svg)](server/tests)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A modern, full-stack **Multi-Role Attendance Management System** designed for educational institutions. Built using **React 18, Vite, Tailwind CSS, Node.js, Express, and MongoDB**, it features tailored dashboards and workflows for **Students**, **Teachers (Faculty)**, **Administrators**, and **Parents/Guardians**.

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
- 🧪 **Automated Testing Suite (Phase 17 & Beyond)**: Comprehensive unit and integration test coverage (**19 test suites, 169/169 passing tests**) covering all core modules powered by **Jest**, **Supertest**, and **mongodb-memory-server**.
- 🏫 **Academic Year & Semester Engine (Phase 18)**: Dynamic institutional hierarchy engine (`Academic Year ➔ Semester ➔ Department ➔ Division ➔ Subjects`). Features custom session dates, active year status singletons, dynamic terms without hardcoding, class section capacity management (`IT-A`, `IT-B`, `IT-C`), interactive visual hierarchy tree, and wizard-driven student batch promotion engine with audit logs.
- ⚙️ **Advanced Attendance Rules Engine (Phase 19)**: Institution-wide configurable rules engine replacing hardcoded logic. Allows Admins to customize thresholds (Minimum Attendance %, Late Cutoff mins, Grace Period mins, Dynamic QR Validity mins, GPS Geofence Radius meters, Auto-Absent delay mins) and define advanced rules for 7 core statuses (`Present`, `Absent`, `Late`, `Excused`, `On Leave`, `Holiday`, `Cancelled Lecture`) with attendance inclusion weights. Includes an interactive real-time Rule Simulator / Sandbox.
- ⏱️ **Attendance Session Engine (Phase 20)**: Explicit 4-tier domain hierarchy (`Subject ➔ Scheduled Class ➔ Attendance Session ➔ Student Attendance`) separating static scheduled class definitions from active attendance sessions. Generates unique Session IDs (`SESS-YYYYMMDD-XXXX`), manages start/end timestamps, QR secret tokens, and session-linked attendance tracking.
- 🛡️ **Anti-Proxy Multi-Signal Verification (Phase 21)**: Multi-signal anti-proxy verification engine checking QR token authenticity, GPS Haversine boundary, active session window, device fingerprinting, and IP burst concurrency. Flagged scans are preserved for instructor review in `/admin/suspicious`.
- 📊 **Attendance Risk Scoring Engine (Phase 22)**: Quantitative 0–100 Attendance Risk Scoring System evaluating exact point weights (+50 Invalid QR, +40 Wrong GPS, +30 Duplicate Device, +20 Suspicious IP, +10 Unusual Timing) clamped to 0–100 and classified across 3 tiers (`0-30 Normal`, `31-60 Review`, `61-100 High Risk`).
- ✍️ **Attendance Correction Workflow (Phase 23)**: Formal attendance modification request, review, and audit trail system (`Original Value ➔ Correction Request ➔ Reason ➔ Review ➔ Approved/Rejected`). Records **Original Value**, **New Value**, **Changed By**, **Reason**, **Reviewer**, and **Timestamps** with dedicated Teacher (`/teacher/corrections`) and Admin (`/admin/corrections`) consoles.
- 📌 **Complete Institutional Audit Logging (Phase 24)**: Institutional audit trail recording all 10 core institutional actions (`LOGIN`, `LOGOUT`, `CREATE_STUDENT`, `DELETE_STUDENT`, `MARK_ATTENDANCE`, `EDIT_ATTENDANCE`, `APPROVE_LEAVE`, `REJECT_LEAVE`, `EXPORT_REPORT`, `CHANGE_SETTINGS`). Fully captures state transitions (e.g. `Absent → Present`) and change reasons (e.g. `"Medical document verified"`) with an upgraded Admin Audit Console (`/admin/audit-logs`) featuring quick-action filter pills, state transition diff cards, and CSV export.
- 🔔 **Advanced Notification Engine (Phase 25)**: Centralized multi-channel notification engine routing notifications across **In-App** (MongoDB + Socket.io), **Email** (Nodemailer responsive HTML templates), and **Push Notification** (FCM Web Push). Features **Smart Notification Recovery Advisor** calculating exact consecutive lectures needed to reach target thresholds (e.g., *"Your Database Systems attendance has fallen to 72%. You need 2 consecutive attended lectures to reach 75%."*), automated multi-channel domain event processors for 7 core campus events, user notification preference toggles, and an interactive Test Notification Simulator.
- 🧮 **Attendance Forecasting Engine (Phase 26)**: Pure mathematical recovery engine calculating consecutive lectures required to attain thresholds ($x = \lceil \frac{rT - P}{1-r} \rceil$), safe miss allowance ($m = \lfloor \frac{P - rT}{r} \rfloor$), interactive "Can I Skip?" scenario sandbox, multi-benchmark ladder (75%, 80%, 85%, 90%), and AI Assistant natural language forecasting intent resolution.
- 🎓 **Advanced Student Analytics (Phase 27)**: Comprehensive personal student analytics dashboard (`/student/analytics`) aggregating **9 core metrics**: Overall Attendance (weighted %, raw %, delta), Subject Attendance (per-course %, safe miss allowance, recovery requirement), Weekly Trend (W1-W6 velocity deltas), Monthly Trend (trailing 6 months), Best Subject (dynamic detection), Worst Subject (deficit alert), Late Count (punctuality score & 0.8x weight), Absent Count (unexcused rate), and Leave Count (approved/pending categories). Features a visual attendance curve with an official **75% Minimum Requirement** reference benchmark line rendered in dual-engine Recharts and Chart.js.
- 📊 **Teacher Analytics & Insights (Phase 28)**: Comprehensive faculty analytics command center providing classroom intelligence across 7 core attendance dimensions: Average Class Attendance (weighted %, conducted vs attended, benchmark comparison), Most Absent Students (ranked defaulter directory with shortage deficit math $x = \max(0, \lceil \frac{0.75 T - P}{0.25} \rceil)$), Most Late Students (punctuality ratings & late counts), Attendance by Lecture (time-slot analysis comparing peak 10:15 AM engagement at 89.2% vs post-lunch 1:30 PM drop at 73.8%), Attendance by Weekday (Monday 82%, Tuesday 91%, Wednesday 76%, Thursday 88%, Friday 69% with automated Friday slump detection and actionable pedagogical advice), Subject Attendance (CS401, CS405, CS502), and Division Comparison (Section A vs Section B vs Section C with rankings and variance). Features an embedded insights widget on the Teacher Dashboard (`TeacherDashboard.jsx`) and a dedicated Teacher Analytics Hub (`/teacher/analytics` - `TeacherAnalytics.jsx`) with multi-filter controls and CSV export.
- 🧠 **Admin Intelligence Dashboard (Phase 29)**: College-level executive control center (`/admin` and `/admin/intelligence`) featuring top KPI summary cards matching institutional telemetry (**Total Students: 2,481**, **Total Teachers: 143**, **Today's Attendance: 87.4%**, **Students <75%: 312**) alongside 7 deep institutional modules: Cross-department benchmarking with variance from college average, Division and section comparison matrix (class sizes, mentors, defaulters), 6-month attendance trajectory with 75% UGC benchmark line, weekly velocity tracking (detecting Friday slump at 73.1% vs Tuesday peak at 90.4%), Defaulter analysis with exact mathematical deficit calculations ($x = \lceil \frac{0.75T - P}{0.25} \rceil$) and simulated bulk warning alerts dispatch, Teacher compliance and class scheduling metrics (97.5% conduction, 94.8% on-time marking, lecture time slots), Suspicious attendance and anti-proxy telemetry (device collisions, geofence breaches >500m, rapid scans), and College leave statistics and truancy impact.
- 🚨 **Automated Defaulter Management & Escalation Pipeline (Phase 30)**: Automated identification and progressive 4-tier escalation hierarchy (`<75%` Warning $\to$ `<70%` Serious Warning $\to$ `<65%` Admin Alert $\to$ `<60%` Parent/Guardian Alert) with configurable thresholds, deficit recovery mathematics ($x = \lceil \frac{rT - P}{1 - r} \rceil$), direct automated parent email alerts, auto-clearing upon attendance restoration, persistent `DefaulterRecord` tracking with counselor audit ledger, and a dedicated Admin Defaulter Management Console (`/admin/defaulters`).
- 👨‍👩‍👧 **Parent/Guardian Portal (Phase 31 Part A)**: Dedicated portal for parents/guardians with multi-ward switching, cumulative attendance percentage tracking, 75% university benchmark shortage alerts, subject-wise attendance breakdown with consecutive lecture recovery counters and safe skip allowances, student leave request inspection (with medical proof files and instructor remarks), 4-tier attendance warning tracking, counselor directory contacts, and institutional notification feeds. Features **Strict Read-Only Access Enforcement** guaranteeing parents cannot create, edit, mark, or override any attendance or leave records.
- 📄 **Document Verification & Security Engine (Phase 31 Part B)**: Enterprise document verification pipeline for student leave applications (`Student ➔ Upload Document ➔ Antivirus Scan ➔ Teacher Review ➔ Admin Verification`). Features strict 5MB size limits, binary magic-byte MIME signature verification (preventing spoofed executables or HTML masquerading as PDF/JPG/PNG), secure isolated storage in `server/secure_uploads/documents/`, heuristic antivirus and malware scanning engine (detecting EICAR signatures, embedded PE/ELF binaries, active script tags, PDF launch exploits, and ClamAV socket support), SHA-256 tamper-evident integrity hashes, 15-minute signed expiring access tokens, and a central Admin Document Verification Console (`/admin/document-verification`) with on-demand re-scanning and official sanctioning.
- 📱 **Progressive Web App (PWA) & Mobile Experience (Phase 33)**: Transforms CampusAttend into an installable mobile application with modern Web App Manifest, offline shell caching via Service Worker (`sw.js`), network status detector (`useNetworkStatus`), real-time device camera hardware QR scanning (dual native `BarcodeDetector` + pure-JS `jsqr` engine with lens flip & torch controls), thumb-zone mobile bottom navigation (`MobileBottomNav`), and automated install prompt banner (`beforeinstallprompt` & iOS Safari guide).

---

## 👥 Role Capabilities & Feature Matrix

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
| **Multi-Tier Leave Verification Pipeline (Student ➔ Teacher ➔ Admin)** | ✅ | ✅ | ✅ | ❌ | Phase 31 |
| **Secure Non-Public Document Storage (PDF, JPG, PNG | Max 5MB)** | ✅ | ✅ | ✅ | ❌ | Phase 31 |
| **Binary Magic-Byte File Signature & Spoof Validation** | ✅ | ✅ | ✅ | ❌ | Phase 31 |
| **Heuristic Antivirus & Malware Threat Scanning Engine** | ✅ | ✅ | ✅ | ❌ | Phase 31 |
| **Cryptographic SHA-256 Checksums & Tamper Verification** | ✅ | ✅ | ✅ | ❌ | Phase 31 |
| **Private Expiring Signed Access Tokens & Document Streams** | ✅ | ✅ | ✅ | ✅ | Phase 31 |
| **Admin Central Document Verification & Sanction Console** | ❌ | ❌ | ✅ | ❌ | Phase 31 |
| **On-Demand Antivirus & Integrity Re-Scan Engine** | ❌ | ❌ | ✅ | ❌ | Phase 31 |
| **Installable PWA Web App Manifest & App Icons** | ✅ | ✅ | ✅ | ✅ | Phase 33 |
| **Offline Shell & Service Worker Caching (`sw.js`)** | ✅ | ✅ | ✅ | ✅ | Phase 33 |
| **Real-Time Network Status Banner (`useNetworkStatus`)** | ✅ | ✅ | ✅ | ✅ | Phase 33 |
| **Mobile Bottom Navigation Bar (`MobileBottomNav`)** | ✅ | ✅ | ❌ | ❌ | Phase 33 |
| **Device Camera Hardware QR Scanner (Dual BarcodeDetector + jsQR)** | ✅ | ❌ | ❌ | ❌ | Phase 33 |
| **Lens Flip (Back/Front) & Torch Light Controls** | ✅ | ❌ | ❌ | ❌ | Phase 33 |
| **PWA Install Promotion Banner & iOS Add-to-Home Modal** | ✅ | ✅ | ✅ | ✅ | Phase 33 |

---

## 📁 Repository Structure

```
Basic-attendance/
├── client/                      # Frontend Application (React 18 + Vite + Tailwind CSS + PWA)
│   ├── public/                  # PWA Assets & Service Worker
│   │   ├── icons/               # PWA App Icons (192, 512, maskable, apple-touch, badge, svg)
│   │   ├── manifest.webmanifest # Progressive Web App Manifest
│   │   ├── sw.js                # Service Worker (offline caching, navigation fallback, push)
│   │   └── offline.html         # Offline fallback page
│   ├── src/
│   │   ├── components/          # Reusable UI Components & Role Modals
│   │   │   ├── ai/              # Floating AI Chat Widget (AiChatWidget.jsx)
│   │   │   ├── analytics/       # Analytics Sub-Components (MostAbsent, BestAttendance, DeptRanking, etc.)
│   │   │   ├── charts/          # Modular Recharts & Chart.js components (Pie, Dept, Monthly, Subject, Ranking)
│   │   │   ├── common/          # ToastContainer, OfflineBanner, CreateAnnouncementModal, ProtectedRoute
│   │   │   ├── layout/          # Navbar, Sidebar, Header, MobileBottomNav layout wrappers
│   │   │   ├── pwa/             # PwaInstallBanner.jsx & iOS install guides
│   │   │   ├── student/         # Student-specific components (StudentQRScannerModal.jsx with camera)
│   │   │   ├── teacher/         # Teacher class creator modal & CreateTimetableModal
│   │   │   └── ui/              # Buttons, Cards, Inputs, Badges, Modals
│   │   ├── context/             # React State Contexts (AuthContext, NotificationContext, PwaInstallContext)
│   │   ├── hooks/               # Custom hooks (useNetworkStatus.js)
│   │   ├── pages/
│   │   │   ├── admin/           # Admin Intelligence, Defaulters, Document Verification, Academic Engine, Rules Engine
│   │   │   ├── analytics/       # Visual Charts Hub (ChartsPage.jsx)
│   │   │   ├── auth/            # Login, Register, Forgot Password, Reset Password
│   │   │   ├── landing/         # Public Landing Page
│   │   │   ├── parent/          # Parent/Guardian Portal (ParentLayout, ParentDashboard, ParentAttendance, ParentSubjects, ParentLeaves, ParentWarnings, ParentNotifications)
│   │   │   ├── student/         # Student Dashboard, Calendar, History, Leave, Profile, Timetable, Prediction, AiChatPage, StudentAnalytics.jsx
│   │   │   └── teacher/         # Teacher Dashboard, Take Attendance, History, Reports, Leave, Timetable, Corrections, TeacherAnalytics.jsx
│   │   ├── services/            # API client modules (api.js, socket.js, deviceFingerprint.js)
│   │   ├── App.jsx              # React Router route configurations & PWA providers
│   │   ├── index.css            # Global CSS, laser scan animations & safe-area insets
│   │   └── main.jsx             # React DOM entry point & Service Worker registration
│   ├── index.html               # Enhanced with PWA meta tags, theme-color & touch icons
│   ├── vite.config.js           # Vite server configuration & API proxy setup
│   └── package.json
│
├── server/                      # Backend REST API (Node.js + Express + MongoDB)
│   ├── tests/                   # Automated Jest & Supertest Integration Test Suite (19 Test Suites, 169 Tests)
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
│   │   ├── audit.test.js        # Complete 10-action audit logging & ledger tests (Phase 24)
│   │   ├── forecasting.test.js  # Phase 26 Attendance forecasting engine tests
│   │   ├── studentAnalytics.test.js # Phase 27 Student personal analytics tests
│   │   ├── teacherAnalytics.test.js # Phase 28 Teacher analytics & insights tests
│   │   ├── adminIntelligence.test.js # Phase 29 Admin intelligence control center tests
│   │   ├── defaulterManagement.test.js # Phase 30 Automated defaulter management tests
│   │   ├── parentPortal.test.js # Phase 31 Parent/Guardian portal & read-only guard tests
│   │   └── documentVerification.test.js # Phase 31 Document Verification & security tests
│   ├── uploads/                 # Static uploaded files (avatars)
│   ├── secure_uploads/          # Non-public isolated storage (secure_uploads/documents/)
│   ├── src/
│   │   ├── config/              # Database (db.js), WebSockets (socket.js), Firebase FCM (firebase.js)
│   │   ├── controllers/         # Request handlers (Auth, User, Attendance, Class, Leave, Timetable, Chart, AI, Analytics, Audit, Academic, Rules, Session, AntiProxy, Correction, Defaulter, Parent)
│   │   ├── middleware/          # Helmet, Rate Limiter, XSS Sanitizer, Input Validation, Audit Logger, JWT auth, RBAC guards, secureUploadMiddleware.js
│   │   ├── models/              # Mongoose Schemas (User, Department, Course, Subject, Attendance, Class, Leave, Timetable, Notification, AuditLog, AcademicYear, Semester, Division, StudentEnrollment, AttendanceRule, AttendanceSession, AttendanceCorrection, DefaulterRecord)
│   │   ├── routes/              # Express API Route definitions (including defaulterRoutes.js, parentRoutes.js, leaveRoutes.js)
│   │   ├── services/            # Business Services (notificationService.js, defaulterService.js, documentScannerService.js)
│   │   ├── utils/               # JWT generator, Async handler wrappers, attendanceRulesEngine.js, antiProxyEngine.js, forecastingEngine.js, studentAnalyticsEngine.js, teacherAnalyticsEngine.js, adminIntelligenceEngine.js, sendEmail.js
│   │   ├── app.js               # Express application initialization & security stack setup
│   │   └── server.js            # Node HTTP server launcher
│   ├── jest.config.js           # Jest runner configuration
│   ├── .env.example             # Server environment variables configuration template
│   └── package.json
│
├── docs/                        # Complete Documentation Suite
│   ├── requirements.md          # Functional & Non-Functional Specifications (Phases 1-31)
│   ├── architecture.md          # System Architecture & Technical Specifications (Phases 1-31)
│   ├── database_design.md       # Database ERD & Collection Schema Specifications
│   ├── FLOW_DIAGRAMS.md         # Mermaid Flowcharts & System Lifecycle Diagrams
│   └── PHASES.md                # Consolidated Phases Specification (Phases 1-31)
│
├── .env.example                 # Root Environment Variables Template
├── package.json                 # Root Orchestration Scripts (install:all, dev, test)
├── PHASES.md                    # Root Consolidated Phases Specification (Phases 1-31)
└── README.md                    # Master Project Documentation (This document)
```

---

## 🛠️ Installation & Setup Guide

### 📋 Prerequisites
- **Node.js**: **22+** (`v22.x` or higher required)
- **MongoDB**: Community Server / Local instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI
- **npm**: `v10.x` or higher (bundled with Node.js 22+)

---

### ⚡ Quick Start (Root Orchestration Scripts)

The repository root includes convenient cross-platform orchestration scripts in [`package.json`](file:///d:/MY%20projects/FULL%20PROJECTS/attendance_app_starter/Basic-attendance/package.json):

```json
{
  "scripts": {
    "install:all": "npm install --prefix server && npm install --prefix client",
    "dev": "npx -y concurrently -k -p \"[{name}]\" -n \"SERVER,CLIENT\" -c \"cyan.bold,magenta.bold\" \"npm run dev --prefix server\" \"npm run dev --prefix client\"",
    "test": "npm test --prefix server"
  }
}
```

```bash
# 1. Clone repository
git clone <repository-url>
cd Basic-attendance

# 2. Install all dependencies across both server and client with one command:
npm run install:all

# 3. Create your environment configuration from the template:
cp .env.example .env
cp .env.example server/.env

# 4. Launch both Backend REST API (:5000) and Frontend Vite App (:3000) concurrently:
npm run dev

# 5. Run the complete automated test suite (19 test suites, 169 tests):
npm test
```

---

### 📦 Manual Step-by-Step Setup

#### 1. Backend Setup (`server`)

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
   # Database Configuration (Required)
   MONGODB_URI=mongodb://127.0.0.1:27017/attendance_db

   # Authentication & Security Secrets (Required)
   JWT_SECRET=your_jwt_access_token_secret_key_here
   JWT_EXPIRE=1h
   JWT_REFRESH_SECRET=your_jwt_refresh_token_secret_key_here
   JWT_REFRESH_EXPIRE=7d

   # Server & Client Connectivity
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173

   # Firebase Cloud Messaging (Optional)
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_SERVICE_ACCOUNT_JSON=

   # Storage Path
   UPLOAD_PATH=uploads
   SECURE_UPLOAD_PATH=secure_uploads/documents
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will start listening at `http://localhost:5000`.*

---

#### 2. Frontend Setup (`client`)

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

Run the complete backend test suite (**19 test suites, 169 tests**):

```bash
cd server
npm test
```

To run a specific module test suite:
```bash
npx jest tests/documentVerification.test.js # Phase 31 Document Verification & Security (15 tests)
npx jest tests/parentPortal.test.js        # Phase 31 Parent/Guardian Portal (18 tests)
npx jest tests/defaulterManagement.test.js # Phase 30 Automated Defaulter Management
npx jest tests/adminIntelligence.test.js   # Phase 29 Admin Intelligence Control Center
npx jest tests/teacherAnalytics.test.js    # Phase 28 Teacher Analytics & Insights
npx jest tests/studentAnalytics.test.js    # Phase 27 Advanced Student Analytics
npx jest tests/forecasting.test.js         # Phase 26 Attendance Forecasting Engine
npx jest tests/notifications.test.js       # Phase 25 Advanced Notification Engine
npx jest tests/audit.test.js               # Phase 24 Complete Audit Logging
npx jest tests/antiProxy.test.js           # Phase 21 & 22 Anti-Proxy & Risk Scoring
npx jest tests/sessions.test.js            # Phase 20 Attendance Sessions
npx jest tests/rules.test.js               # Phase 19 Rules Engine & Sandbox
npx jest tests/auth.test.js                # Authentication & RBAC
npx jest tests/attendance.test.js          # Single & Bulk Attendance
npx jest tests/qr.test.js                  # 30s Dynamic QR Token
npx jest tests/gps.test.js                 # GPS Campus Geofencing
npx jest tests/reports.test.js             # Reports Generator
npx jest tests/charts.test.js              # Charts & Analytics
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

### 📝 Leave Application & Document Verification Workflow (`/api/leaves`)
- `POST /api/leaves/upload-document` — Secure document upload with 5MB limit, binary magic-byte inspection (PDF, JPG, PNG), heuristic antivirus scanning, and SHA-256 integrity hash calculation
- `POST /api/leaves` — Submit new leave application (Medical, Emergency, Event) linked with verified document metadata
- `GET /api/leaves/student` — View student's personal leave applications with live multi-stage verification status (`teacher_review` ➔ `admin_verification` ➔ `completed`)
- `PUT /api/leaves/:id/teacher-review` — Faculty mentor reviews document, adds remarks, and approves/forwards to Admin (Logs `TEACHER_VERIFY_LEAVE`)
- `PUT /api/leaves/:id/admin-verify` — Admin officially sanctions leave, verifies document, and updates status (Logs `ADMIN_VERIFY_LEAVE`)
- `PUT /api/leaves/:id/status` — Legacy / direct leave status update endpoint (Teacher / Admin, logs `APPROVE_LEAVE` / `REJECT_LEAVE`)
- `GET /api/leaves/:id/document` — Authenticated private stream of leave supporting document with role-based ownership validation
- `GET /api/leaves/:id/document-token` — Generate a 15-minute expiring HMAC/JWT signed access token for secure iframe/modal streaming
- `GET /api/leaves/document-stream/:token` — Stream document securely via expiring signed token without leaking authorization headers
- `POST /api/leaves/:id/rescan` — Trigger on-demand malware heuristic re-scan and SHA-256 checksum re-verification on stored file (Admin only)

### 🗓️ Timetable Management (`/api/timetable`)
- `GET /api/timetable` — Fetch timetable entries with optional day, section, or search filters
- `GET /api/timetable/today` — Fetch today's scheduled classes based on current day
- `GET /api/timetable/tomorrow` — Fetch tomorrow's scheduled classes
- `GET /api/timetable/weekly` — Fetch weekly timetable organized by day (Monday to Sunday)
- `POST /api/timetable` — Create a new timetable class slot (Teacher / Admin)
- `PUT /api/timetable/:id` — Update existing timetable class slot (Teacher / Admin)
- `DELETE /api/timetable/:id` — Remove a timetable class slot (Teacher / Admin)

### 📊 Analytics & Insights Dashboard (`/api/analytics`)
- `GET /api/analytics/admin-intelligence` — **Admin Intelligence Dashboard (Phase 29)**: College-level executive control center delivering 4 core KPI summary cards (Total Students: 2,481, Total Teachers: 143, Today's Attendance: 87.4%, Students <75%: 312) alongside all 7 analytical modules (Department comparison, Division comparison, Attendance trends with 75% benchmark line & Friday slump, Defaulter analysis with $x = \lceil \frac{0.75T - P}{0.25} \rceil$ deficit math & bulk alerts, Teacher compliance and time slots, Suspicious anti-proxy telemetry, and Leave impact statistics) (Admin only)
- `GET /api/analytics/intelligence` — Alias endpoint for the Phase 29 College Intelligence Control Center (Admin only)
- `GET /api/analytics/teacher/me` — Teacher classroom analytics dashboard (Phase 28) with 7 core dimensions (Average class attendance, Most absent defaulters with shortage deficit math, Most late students, Attendance by lecture time slot, Weekday patterns with Friday drop detection, Subject attendance, and Division comparison)
- `GET /api/analytics/teacher/:teacherId` — Scoped inspection of faculty classroom analytics (Admin & Teacher)
- `GET /api/analytics/student/me` — Personal student analytics dashboard (Phase 27) with 9 core metrics (Overall, Subject, Weekly, Monthly, Best/Worst, Late, Absent, Leave) and visual 75% minimum curve
- `GET /api/analytics/student/:studentId` — Faculty and Admin inspection of student personal analytics dashboard
- `GET /api/analytics/dashboard` — Fetch complete administrative executive analytics dashboard metrics (All 5 sub-modules)
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

### 📈 Attendance Forecasting & AI Engine (`/api/ai`)
- `POST /api/ai/forecast/calculate` — Calculate arbitrary multi-parameter attendance forecasts, safe misses, and scenario projections
- `GET /api/ai/forecast/me` — Student-scoped live multi-subject attendance forecasting report and milestone roadmap
- `GET /api/ai/predict` — Predict student attendance trajectory and 75% target feasibility
- `POST /api/ai/chat` — Natural language AI assistant with NLP intent resolution for "Can I skip?", "How many can I miss?", and "How many must I attend?"
- `GET /api/ai/suspicious-detection` — Flag multi-signal proxy violations and device anomalies (Faculty / Admin only)

### 🚨 Automated Defaulter Management (`/api/defaulters`)
- `GET /api/defaulters` — List student defaulters with filtering by tier (`WARNING`, `SERIOUS_WARNING`, `ADMIN_ALERT`, `PARENT_ALERT`), department, division, status, search, and pagination
- `GET /api/defaulters/summary` — Fetch executive KPI summary (Total defaulters, counts per tier, parent notification counter, and active threshold settings)
- `GET /api/defaulters/config` — Retrieve active configurable escalation thresholds and automated policy settings
- `PUT /api/defaulters/config` — Update configurable thresholds (`warningThreshold`, `seriousWarningThreshold`, `adminAlertThreshold`, `parentAlertThreshold`) and notification toggles (Admin only)
- `POST /api/defaulters/evaluate` — Run automated batch scan and evaluation across departments / classes
- `POST /api/defaulters/:id/escalate` — Manually escalate student tier or dispatch immediate notification notice to student or parent
- `POST /api/defaulters/:id/resolve` — Mark defaulter record as resolved with counselor/medical justification notes
- `POST /api/defaulters/notify-bulk` — Bulk dispatch warning notices to active defaulters
- `GET /api/defaulters/student/:studentId` — Retrieve student-scoped defaulter status, active tier, and complete escalation timeline

### 👨‍👩‍👧 Parent/Guardian Portal (`/api/parent`)
- `GET /api/parent/wards` — List all registered wards/students linked to the authenticated parent account
- `POST /api/parent/link-ward` — Link an additional ward by providing `studentRollNo`
- `GET /api/parent/overview` — Fetch cumulative attendance %, 75% university benchmark status, quick statistics, and academic profile for active ward
- `GET /api/parent/attendance` — View detailed day-by-day attendance history with date, subject, and status filters
- `GET /api/parent/subjects` — Get subject-wise attendance breakdown, safe miss allowances, consecutive classes needed, and instructor contacts
- `GET /api/parent/leaves` — View ward's submitted leave requests, approval decisions, teacher remarks, and proof attachments
- `GET /api/parent/warnings` — Get active attendance warning level (4 tiers), deficit recovery calculations, and counseling department contacts
- `GET /api/parent/notifications` — View parent-specific notifications, low attendance alerts, and institutional circulars
- *Strict Read-Only Enforcement*: All mutation endpoints (`POST/PUT/DELETE /api/attendance/*`, `POST /api/leaves`) return `403 Forbidden` for parents.

### 🏥 System Health (`/api/health`)
- `GET /api/health` — Check backend status, connected database, security stack status, and API uptime

---

## 🔑 Demo Credentials

For quick local evaluation and multi-role testing, pre-configured accounts are provided:

| Role | Email | Password | Default Scope / Notes |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@attendance.edu` | `password123` | Institutional Control Center, Intelligence & Rules |
| **👩‍🏫 Teacher** | `teacher@attendance.edu` | `password123` | Faculty Suite, QR Generator & Roster Marking |
| **🎓 Student** | `student@attendance.edu` | `password123` | Student Portal, QR Scanner, Timetable & Leaves |
| **👨‍👩‍👧 Parent** | `parent.rivera@family.edu` | `password123` | Parent Portal (Linked Ward: Elena Rivera, CS2024001) |

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
