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
│   │   │   ├── admin/           # Admin Dashboard (AdminAnalytics.jsx), Departments, Courses, Subjects, Users, SuspiciousDetection, AdminAuditLogs.jsx
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
│   ├── uploads/                 # Static uploaded files (leave attachments, profile pics)
│   ├── src/
│   │   ├── config/              # MongoDB Mongoose database connection
│   │   ├── controllers/         # Request handlers (Auth, User, Attendance, Class, Leave, Timetable, Chart, aiController, analyticsController, auditController)
│   │   ├── middleware/          # Helmet, Rate Limiter, XSS Sanitizer, Input Validation, Audit Logger, JWT auth middleware, RBAC guards
│   │   ├── models/              # Mongoose Schemas (User, Department, Course, Subject, Attendance, Class, Leave, Timetable, Notification, AuditLog)
│   │   ├── routes/              # Express API Route definitions (auth, user, attendance, class, leave, timetable, chart, aiRoutes, analyticsRoutes, auditRoutes)
│   │   ├── utils/               # JWT generator, Async handler wrappers
│   │   ├── app.js               # Express application initialization & security stack setup
│   │   └── server.js            # Node HTTP server launcher
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
- **File System**: Multer static file upload handler

---

## 📄 License & Contribution

This project is open-source and available under the [MIT License](LICENSE).

Contributions, issue reports, and feature suggestions are welcome! Feel free to open a Pull Request or Issue.
