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
| **Apply for Medical / Absence Leave** | ✅ | ❌ | ❌ |
| **Download Official Attendance Transcript** | ✅ | ✅ | ✅ |

---

## 📁 Repository Structure

```
Basic-attendance/
├── client/                      # Frontend Application (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/          # Reusable UI Components & Role Modals
│   │   │   ├── layout/          # Navbar, Sidebar, Header layout wrappers
│   │   │   ├── student/         # Student-specific components & widgets
│   │   │   ├── teacher/         # Teacher class creator modal & components
│   │   │   └── ui/              # Buttons, Cards, Inputs, Badges, Modals
│   │   ├── context/             # React AuthContext for state & token management
│   │   ├── pages/
│   │   │   ├── admin/           # Admin Dashboard, Departments, Courses, Subjects, Users
│   │   │   ├── auth/            # Login, Register, Forgot Password, Reset Password
│   │   │   ├── landing/         # Public Landing Page
│   │   │   ├── student/         # Student Dashboard, Calendar, History, Leave, Profile
│   │   │   └── teacher/         # Teacher Dashboard, Take Attendance, History, Reports
│   │   ├── services/            # Axios API client modules
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
│   │   ├── controllers/         # Request handlers (Auth, User, Attendance, Class, Leave, etc.)
│   │   ├── middleware/          # JWT auth middleware, RBAC guards, Error handlers
│   │   ├── models/              # Mongoose Schemas (User, Department, Course, Subject, Attendance, Class, Leave, Notification)
│   │   ├── routes/              # Express API Route definitions
│   │   ├── utils/               # JWT generator, Async handler wrappers
│   │   ├── app.js               # Express application initialization & middleware setup
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

### 🏥 System Health (`/api/health`)
- `GET /api/health` — Check backend status, connected database, and API uptime

---

## 🧪 Technology Stack Breakdown

- **Frontend Core**: React 18, React Router DOM v7, Vite
- **Styling**: Tailwind CSS v4, Lucide React Icons, Custom Glassmorphism UI
- **Backend Framework**: Node.js, Express.js
- **Database Layer**: MongoDB, Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT), bcryptjs password hashing
- **File System**: Multer static file upload handler

---

## 📄 License & Contribution

This project is open-source and available under the [MIT License](LICENSE).

Contributions, issue reports, and feature suggestions are welcome! Feel free to open a Pull Request or Issue.
