// Mock Data for Attendance App Phase 2 UI & Phase 6 Student Module

export const currentUser = {
  student: {
    id: 'STU-2024-001',
    name: 'Alex Rivera',
    email: 'alex.rivera@university.edu',
    phone: '+1 (555) 234-5678',
    address: '42 Academic Drive, Innovation City, CA',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    rollNo: 'CS-2024-089',
    department: 'Computer Science & Engineering',
    course: 'B.Tech Computer Science',
    semester: 'Semester 4',
    batch: '2024-2028',
    section: 'Sec A',
    advisor: 'Dr. Sarah Jenkins',
    overallAttendance: 88.5,
    totalClasses: 120,
    attendedClasses: 106,
    absentClasses: 14,
    lateClasses: 5,
    leavesTaken: 3,
  },
  teacher: {
    id: 'TCH-1002',
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@university.edu',
    role: 'teacher',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    designation: 'Associate Professor',
    department: 'Computer Science',
    assignedCourses: ['CS401 - Database Systems', 'CS405 - Web Technologies', 'CS502 - Software Architecture'],
  },
  admin: {
    id: 'ADM-001',
    name: 'Marcus Vance',
    email: 'admin.marcus@university.edu',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    designation: 'Chief System Administrator',
    department: 'Central Administration',
  }
};

export const studentSubjects = [
  { id: 'CS401', name: 'Database Management Systems', code: 'CS401', instructor: 'Dr. John Smith', total: 30, attended: 28, percentage: 93.3, color: '#6366f1' },
  { id: 'CS402', name: 'Data Structures & Algorithms', code: 'CS402', instructor: 'Prof. Sarah Connor', total: 32, attended: 29, percentage: 90.6, color: '#06b6d4' },
  { id: 'CS403', name: 'Web Application Development', code: 'CS403', instructor: 'Dr. Sarah Jenkins', total: 28, attended: 26, percentage: 92.8, color: '#10b981' },
  { id: 'CS404', name: 'Computer Networks', code: 'CS404', instructor: 'Prof. Alan Turing', total: 30, attended: 23, percentage: 76.6, color: '#f59e0b' },
  { id: 'CS405', name: 'Operating Systems', code: 'CS405', instructor: 'Dr. Linus Torvalds', total: 26, attended: 17, percentage: 65.3, color: '#f43f5e' }
];

export const studentTodaysClasses = [
  { id: 1, subject: 'Database Management Systems', code: 'CS401', time: '09:00 AM - 10:30 AM', room: 'Lab 301', instructor: 'Dr. John Smith', status: 'Completed', attendance: 'Present' },
  { id: 2, subject: 'Web Application Development', code: 'CS403', time: '11:00 AM - 12:30 PM', room: 'Room 204', instructor: 'Dr. Sarah Jenkins', status: 'Ongoing', attendance: 'Marked' },
  { id: 3, subject: 'Computer Networks', code: 'CS404', time: '02:00 PM - 03:30 PM', room: 'Hall B', instructor: 'Prof. Alan Turing', status: 'Upcoming', attendance: 'Pending' }
];

export const studentUpcomingLecture = {
  id: 3,
  subject: 'Computer Networks',
  code: 'CS404',
  time: '02:00 PM - 03:30 PM',
  room: 'Hall B',
  instructor: 'Prof. Alan Turing',
  topic: 'TCP/IP Protocol Suite & Subnetting',
  startsIn: '1 hour 30 mins'
};

export const studentNotifications = [
  { id: 1, title: 'Attendance Alert', message: 'Your attendance in Operating Systems (CS405) has fallen below 70%.', time: '2 hours ago', type: 'warning', unread: true },
  { id: 2, title: 'Leave Request Approved', message: 'Medical leave for 2026-08-01 has been approved by Dr. Jenkins.', time: '1 day ago', type: 'success', unread: true },
  { id: 3, title: 'Timetable Rescheduled', message: 'CS403 class on Friday will be conducted at 11:00 AM in Room 102.', time: '2 days ago', type: 'info', unread: false }
];

export const studentLeaves = [
  { 
    id: 'LV-101', 
    leaveType: 'Medical', 
    startDate: '2026-08-01', 
    endDate: '2026-08-02', 
    reason: 'Severe viral fever and physician recommended bed rest.', 
    status: 'Approved', 
    appliedOn: '2026-07-31', 
    reviewedBy: 'Dr. Sarah Jenkins', 
    remarks: 'Medical certificate verified. Granted duty leave.' 
  },
  { 
    id: 'LV-102', 
    leaveType: 'Official Event', 
    startDate: '2026-08-15', 
    endDate: '2026-08-16', 
    reason: 'Representing university in Inter-College Hackathon Finals.', 
    status: 'Pending', 
    appliedOn: '2026-08-10', 
    reviewedBy: 'Pending Review', 
    remarks: 'Awaiting department head authorization.' 
  },
  { 
    id: 'LV-103', 
    leaveType: 'Personal Emergency', 
    startDate: '2026-07-12', 
    endDate: '2026-07-12', 
    reason: 'Family emergency, traveling out of state.', 
    status: 'Approved', 
    appliedOn: '2026-07-11', 
    reviewedBy: 'Marcus Vance', 
    remarks: 'Approved per department guidelines.' 
  }
];

export const studentAttendanceHistory = [
  { id: 'REC-001', date: '2026-08-12', subject: 'Database Management Systems', code: 'CS401', timeSlot: '09:00 AM - 10:30 AM', status: 'Present', arrivalTime: '08:58 AM', instructor: 'Dr. John Smith', notes: 'On time' },
  { id: 'REC-002', date: '2026-08-12', subject: 'Web Application Development', code: 'CS403', timeSlot: '11:00 AM - 12:30 PM', status: 'Present', arrivalTime: '11:02 AM', instructor: 'Dr. Sarah Jenkins', notes: 'On time' },
  { id: 'REC-003', date: '2026-08-11', subject: 'Operating Systems', code: 'CS405', timeSlot: '01:30 PM - 03:00 PM', status: 'Absent', arrivalTime: '--', instructor: 'Dr. Linus Torvalds', notes: 'Unexcused absence' },
  { id: 'REC-004', date: '2026-08-11', subject: 'Data Structures & Algorithms', code: 'CS402', timeSlot: '10:00 AM - 11:30 AM', status: 'Present', arrivalTime: '09:59 AM', instructor: 'Prof. Sarah Connor', notes: 'Lab evaluation passed' },
  { id: 'REC-005', date: '2026-08-10', subject: 'Computer Networks', code: 'CS404', timeSlot: '02:00 PM - 03:30 PM', status: 'Late', arrivalTime: '02:18 PM', instructor: 'Prof. Alan Turing', notes: 'Arrived 18 mins late' },
  { id: 'REC-006', date: '2026-08-08', subject: 'Web Application Development', code: 'CS403', timeSlot: '11:00 AM - 12:30 PM', status: 'Present', arrivalTime: '10:55 AM', instructor: 'Dr. Sarah Jenkins', notes: 'Quiz 2 completed' },
  { id: 'REC-007', date: '2026-08-07', subject: 'Database Management Systems', code: 'CS401', timeSlot: '09:00 AM - 10:30 AM', status: 'Present', arrivalTime: '08:59 AM', instructor: 'Dr. John Smith', notes: 'Active participation' },
  { id: 'REC-008', date: '2026-08-05', subject: 'Operating Systems', code: 'CS405', timeSlot: '01:30 PM - 03:00 PM', status: 'Absent', arrivalTime: '--', instructor: 'Dr. Linus Torvalds', notes: 'Sick leave requested' },
  { id: 'REC-009', date: '2026-08-04', subject: 'Data Structures & Algorithms', code: 'CS402', timeSlot: '10:00 AM - 11:30 AM', status: 'Present', arrivalTime: '09:57 AM', instructor: 'Prof. Sarah Connor', notes: 'Good' },
  { id: 'REC-010', date: '2026-08-01', subject: 'Computer Networks', code: 'CS404', timeSlot: '02:00 PM - 03:30 PM', status: 'Leave', arrivalTime: '--', instructor: 'Prof. Alan Turing', notes: 'Approved Medical Leave' }
];

export const teacherTodaysClasses = [
  { id: 'TC1', subject: 'Database Systems (CS401)', section: 'Sec A (CS-Sem 4)', time: '10:00 AM - 11:30 AM', room: 'Lab 301', studentsCount: 45, marked: true, present: 41, absent: 3, late: 1 },
  { id: 'TC2', subject: 'Web Technologies (CS405)', section: 'Sec B (CS-Sem 4)', time: '01:30 PM - 03:00 PM', room: 'Room 204', studentsCount: 42, marked: false, present: 0, absent: 0, late: 0 },
  { id: 'TC3', subject: 'Software Architecture (CS502)', section: 'Sec A (CS-Sem 6)', time: '03:30 PM - 05:00 PM', room: 'Hall C', studentsCount: 38, marked: false, present: 0, absent: 0, late: 0 }
];

export const mockStudentsList = [
  { id: 'STU-001', rollNo: 'CS-2024-001', name: 'Aaron Paul', email: 'aaron@univ.edu', department: 'Computer Science', semester: 'Sem 4', attendanceRate: 94.2, status: 'Active' },
  { id: 'STU-002', rollNo: 'CS-2024-002', name: 'Bella Thorne', email: 'bella@univ.edu', department: 'Computer Science', semester: 'Sem 4', attendanceRate: 88.0, status: 'Active' },
  { id: 'STU-003', rollNo: 'CS-2024-003', name: 'Carlos Gomez', email: 'carlos@univ.edu', department: 'Computer Science', semester: 'Sem 4', attendanceRate: 64.5, status: 'Warning' },
  { id: 'STU-004', rollNo: 'CS-2024-004', name: 'Diana Prince', email: 'diana@univ.edu', department: 'Computer Science', semester: 'Sem 4', attendanceRate: 98.1, status: 'Active' },
  { id: 'STU-005', rollNo: 'CS-2024-005', name: 'Ethan Hunt', email: 'ethan@univ.edu', department: 'Computer Science', semester: 'Sem 4', attendanceRate: 72.0, status: 'Warning' },
  { id: 'STU-006', rollNo: 'CS-2024-006', name: 'Fiona Gallagher', email: 'fiona@univ.edu', department: 'Computer Science', semester: 'Sem 4', attendanceRate: 91.5, status: 'Active' },
  { id: 'STU-007', rollNo: 'CS-2024-007', name: 'George Clark', email: 'george@univ.edu', department: 'Computer Science', semester: 'Sem 4', attendanceRate: 82.4, status: 'Active' }
];

export const mockTeachersList = [
  { id: 'TCH-1001', name: 'Dr. John Smith', department: 'Computer Science', designation: 'Professor', subjects: ['CS401', 'CS501'], email: 'john.smith@univ.edu', phone: '+1 555-0192' },
  { id: 'TCH-1002', name: 'Dr. Sarah Jenkins', department: 'Computer Science', designation: 'Associate Professor', subjects: ['CS403', 'CS502'], email: 'sarah.jenkins@univ.edu', phone: '+1 555-0194' },
  { id: 'TCH-1003', name: 'Prof. Alan Turing', department: 'Electrical Eng.', designation: 'Senior Lecturer', subjects: ['EE301', 'EE304'], email: 'alan.turing@univ.edu', phone: '+1 555-0198' },
  { id: 'TCH-1004', name: 'Dr. Grace Hopper', department: 'Mechanical Eng.', designation: 'Department Head', subjects: ['ME201'], email: 'grace.hopper@univ.edu', phone: '+1 555-0199' }
];

export const mockDepartments = [
  { id: 'DEP-CS', name: 'Computer Science & Engineering', code: 'CSE', head: 'Dr. John Smith', totalStudents: 450, totalTeachers: 18, avgAttendance: 89.2 },
  { id: 'DEP-EE', name: 'Electrical Engineering', code: 'EE', head: 'Prof. Alan Turing', totalStudents: 380, totalTeachers: 14, avgAttendance: 84.5 },
  { id: 'DEP-ME', name: 'Mechanical Engineering', code: 'ME', head: 'Dr. Grace Hopper', totalStudents: 310, totalTeachers: 12, avgAttendance: 81.0 },
  { id: 'DEP-CE', name: 'Civil Engineering', code: 'CE', head: 'Dr. Robert Langdon', totalStudents: 290, totalTeachers: 10, avgAttendance: 86.7 },
  { id: 'DEP-BUS', name: 'Business & Management', code: 'BBA', head: 'Dr. Eleanor Vance', totalStudents: 520, totalTeachers: 22, avgAttendance: 91.4 }
];

export const adminAnalyticsData = {
  totalStudents: 1950,
  totalTeachers: 76,
  totalDepartments: 5,
  overallAttendanceRate: 86.8,
  todayPresentCount: 1710,
  todayAbsentCount: 240,
  flaggedStudentsCount: 48,
  monthlyTrend: [
    { month: 'Jan', rate: 88.2 },
    { month: 'Feb', rate: 87.5 },
    { month: 'Mar', rate: 85.0 },
    { month: 'Apr', rate: 89.1 },
    { month: 'May', rate: 86.8 },
    { month: 'Jun', rate: 84.4 }
  ]
};
