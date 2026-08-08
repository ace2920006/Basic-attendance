import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Landing Page & Auth
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Student Portal
import StudentLayout from './pages/student/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import TodaysClasses from './pages/student/TodaysClasses';
import AttendanceGraph from './pages/student/AttendanceGraph';
import NotificationsList from './pages/student/NotificationsList';

// Teacher Portal
import TeacherLayout from './pages/teacher/TeacherLayout';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TakeAttendance from './pages/teacher/TakeAttendance';
import AttendanceHistory from './pages/teacher/AttendanceHistory';
import StudentsList from './pages/teacher/StudentsList';
import TeacherReports from './pages/teacher/TeacherReports';

// Admin Portal
import AdminLayout from './pages/admin/AdminLayout';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminTeachers from './pages/admin/AdminTeachers';
import AdminStudents from './pages/admin/AdminStudents';
import AdminSettings from './pages/admin/AdminSettings';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public & Authentication */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Student Portal Routes */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="classes" element={<TodaysClasses />} />
          <Route path="graph" element={<AttendanceGraph />} />
          <Route path="notifications" element={<NotificationsList />} />
        </Route>

        {/* Teacher Portal Routes */}
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<TeacherDashboard />} />
          <Route path="classes" element={<TeacherDashboard />} />
          <Route path="take-attendance" element={<TakeAttendance />} />
          <Route path="history" element={<AttendanceHistory />} />
          <Route path="students" element={<StudentsList />} />
          <Route path="reports" element={<TeacherReports />} />
        </Route>

        {/* Admin Portal Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminAnalytics />} />
          <Route path="departments" element={<AdminDepartments />} />
          <Route path="teachers" element={<AdminTeachers />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
