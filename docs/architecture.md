# System Architecture & Technical Specification

## 🏗️ High-Level System Architecture

The Attendance Management System is built on a 3-Tier Architecture designed for modularity, security, and scalability:

```
[ Client Layer (Frontend React SPA) ]
                  |  HTTP / REST (JSON) + JWT Header
                  v
[ Application Layer (Express REST API Server) ]
                  |  SQL Queries / ORM / Driver
                  v
[ Database Layer (PostgreSQL / SQLite Relational DB) ]
```

---

## 📁 Directory Structure Breakdown

```
attendance-system/
├── client/                     # Frontend Application (React + Vite)
│   ├── public/                 # Static Assets
│   ├── src/
│   │   ├── components/         # Reusable UI Components (Navbar, Sidebar, Cards, Modal)
│   │   ├── pages/              # Views (Login, StudentDashboard, TeacherDashboard, AdminDashboard)
│   │   ├── context/            # Global State (AuthContext, ThemeContext)
│   │   ├── services/           # API Client Services (axios/fetch endpoints)
│   │   ├── styles/             # Global CSS Variables, Themes, and Glassmorphism design system
│   │   └── App.jsx             # Main Router & App Shell
│   └── package.json
│
├── server/                     # Backend Application (Node.js + Express REST API)
│   ├── src/
│   │   ├── config/             # DB Connection & Environment Config
│   │   ├── controllers/        # Request Handlers (authController, attendanceController, etc.)
│   │   ├── middleware/         # Auth JWT verification, RBAC role guard, Error Handler
│   │   ├── models/             # Database queries & data access abstraction
│   │   ├── routes/             # API Endpoints (auth, users, classes, attendance, leaves)
│   │   └── app.js              # Server Bootstrap & Middleware Setup
│   └── package.json
│
├── database/                   # Database Schemas & Migrations
│   ├── schema.sql              # Standard DDL Script (9 Tables with Keys & Constraints)
│   ├── seed.sql                # Initial Mock Data (Users, Depts, Subjects, Classes, Logs)
│   └── design.md               # Data Dictionary & Entity Specs
│
└── docs/                       # Project Documentation
    ├── requirements.md         # Requirements & Feature Matrix
    ├── architecture.md         # System Architecture & API Protocols
    └── database_design.md      # Detailed ERD & Schema Specs
```

---

## 🔑 Authentication & Authorization Workflow

1. **User Login Request**: User posts credentials (`email`, `password`) to `/api/auth/login`.
2. **Credential Verification**: Server verifies email and compares `bcrypt` hashed password.
3. **JWT Generation**: Server signs a JWT payload containing `userId`, `email`, and `role` (`student` | `teacher` | `admin`).
4. **Client Token Storage**: Client receives JWT and stores it in secure storage (`localStorage`/`cookie`).
5. **Protected API Requests**: Client attaches `Authorization: Bearer <token>` header to all subsequent API requests.
6. **Middleware Authorization Guard**: Backend `authMiddleware` validates JWT, decodes user identity, and `roleGuard` enforces access permissions based on user role.

---

## 🔌 API Endpoint Hierarchy

- `/api/auth` -> Login, Register, Profile, Refresh Token
- `/api/admin` -> Departments, Semesters, Subjects, User Management (Students/Teachers), System Analytics
- `/api/teachers` -> Class management, Student rosters, Reports export
- `/api/students` -> Attendance view, Timetable, Leave application submission
- `/api/attendance` -> Mark attendance, Edit attendance, Query date ranges
- `/api/leaves` -> Create leave request, Approve/Reject leave request
- `/api/notifications` -> Get unread notifications, Mark notification as read
