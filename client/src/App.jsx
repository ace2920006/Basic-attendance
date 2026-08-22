import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ToastContainer from './components/common/ToastContainer';
import ProtectedRoute from './components/common/ProtectedRoute';

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
import StudentTimetable from './pages/student/StudentTimetable';
import AttendanceGraph from './pages/student/AttendanceGraph';
import NotificationsList from './pages/student/NotificationsList';
import StudentCalendar from './pages/student/StudentCalendar';
import StudentHistory from './pages/student/StudentHistory';
import StudentReport from './pages/student/StudentReport';
import StudentLeave from './pages/student/StudentLeave';
import StudentProfile from './pages/student/StudentProfile';

// Teacher Portal
import TeacherLayout from './pages/teacher/TeacherLayout';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherTimetable from './pages/teacher/TeacherTimetable';
import TakeAttendance from './pages/teacher/TakeAttendance';
import AttendanceHistory from './pages/teacher/AttendanceHistory';
import StudentsList from './pages/teacher/StudentsList';
import TeacherReports from './pages/teacher/TeacherReports';
import TeacherLeave from './pages/teacher/TeacherLeave';

// Admin Portal
import AdminLayout from './pages/admin/AdminLayout';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminCourses from './pages/admin/AdminCourses';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminTeachers from './pages/admin/AdminTeachers';
import AdminStudents from './pages/admin/AdminStudents';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';

// Phase 11 Charts
import ChartsPage from './pages/analytics/ChartsPage';

// Phase 14 AI Features
import AttendancePrediction from './pages/student/AttendancePrediction';
import AiChatPage from './pages/student/AiChatPage';
import SuspiciousDetection from './pages/admin/SuspiciousDetection';
import AiChatWidget from './components/ai/AiChatWidget';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <ToastContainer />
          <AiChatWidget />
          <Routes>
            {/* Public & Authentication */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Student Portal Routes */}
            <Route 
              path="/student" 
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StudentDashboard />} />
              <Route path="predict" element={<AttendancePrediction />} />
              <Route path="ai-chat" element={<AiChatPage />} />
              <Route path="classes" element={<StudentTimetable />} />
              <Route path="timetable" element={<StudentTimetable />} />
              <Route path="calendar" element={<StudentCalendar />} />
              <Route path="history" element={<StudentHistory />} />
              <Route path="graph" element={<AttendanceGraph />} />
              <Route path="charts" element={<ChartsPage />} />
              <Route path="report" element={<StudentReport />} />
              <Route path="leave" element={<StudentLeave />} />
              <Route path="notifications" element={<NotificationsList />} />
              <Route path="profile" element={<StudentProfile />} />
            </Route>

            {/* Teacher Portal Routes */}
            <Route 
              path="/teacher" 
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <TeacherLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<TeacherDashboard />} />
              <Route path="suspicious" element={<SuspiciousDetection />} />
              <Route path="classes" element={<TeacherDashboard />} />
              <Route path="timetable" element={<TeacherTimetable />} />
              <Route path="take-attendance" element={<TakeAttendance />} />
              <Route path="history" element={<AttendanceHistory />} />
              <Route path="students" element={<StudentsList />} />
              <Route path="reports" element={<TeacherReports />} />
              <Route path="leave" element={<TeacherLeave />} />
              <Route path="charts" element={<ChartsPage />} />
              <Route path="notifications" element={<NotificationsList />} />
            </Route>

            {/* Admin Portal Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminAnalytics />} />
              <Route path="audit-logs" element={<AdminAuditLogs />} />
              <Route path="suspicious" element={<SuspiciousDetection />} />
              <Route path="departments" element={<AdminDepartments />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="subjects" element={<AdminSubjects />} />
              <Route path="teachers" element={<AdminTeachers />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="charts" element={<ChartsPage />} />
              <Route path="notifications" element={<NotificationsList />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}
