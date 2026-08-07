-- Attendance Management System - Seed Data (seed.sql)

-- 1. Insert Departments
INSERT INTO Departments (code, name, description) VALUES
('CS', 'Computer Science & Engineering', 'Department of Computer Science and Software Engineering'),
('EE', 'Electrical Engineering', 'Department of Electrical and Electronics Engineering'),
('ME', 'Mechanical Engineering', 'Department of Mechanical and Industrial Engineering');

-- 2. Insert Users (Password hashes correspond to bcrypt hash of 'password123')
INSERT INTO Users (email, password_hash, role, full_name) VALUES
('admin@system.com', '$2a$10$w8T0iL6i6K6T012345678uO9gGz5G34567890abcdefghijklm', 'admin', 'System Administrator'),
('john.smith@univ.edu', '$2a$10$w8T0iL6i6K6T012345678uO9gGz5G34567890abcdefghijklm', 'teacher', 'Dr. John Smith'),
('sarah.connor@univ.edu', '$2a$10$w8T0iL6i6K6T012345678uO9gGz5G34567890abcdefghijklm', 'teacher', 'Prof. Sarah Connor'),
('alex.student@student.edu', '$2a$10$w8T0iL6i6K6T012345678uO9gGz5G34567890abcdefghijklm', 'student', 'Alex Johnson'),
('emma.watson@student.edu', '$2a$10$w8T0iL6i6K6T012345678uO9gGz5G34567890abcdefghijklm', 'student', 'Emma Watson'),
('michael.brown@student.edu', '$2a$10$w8T0iL6i6K6T012345678uO9gGz5G34567890abcdefghijklm', 'student', 'Michael Brown');

-- 3. Insert Teachers
INSERT INTO Teachers (user_id, department_id, employee_code, phone, qualification) VALUES
(2, 1, 'EMP-CS-01', '+1555019283', 'Ph.D. Computer Science'),
(3, 1, 'EMP-CS-02', '+1555019284', 'M.Tech Software Engineering');

-- 4. Insert Students
INSERT INTO Students (user_id, department_id, roll_number, semester, batch_year, phone) VALUES
(4, 1, 'CS-2024-001', 4, 2024, '+1555021111'),
(5, 1, 'CS-2024-002', 4, 2024, '+1555022222'),
(6, 1, 'CS-2024-003', 4, 2024, '+1555023333');

-- 5. Insert Subjects
INSERT INTO Subjects (code, name, department_id, semester, credits) VALUES
('CS401', 'Database Management Systems', 1, 4, 4),
('CS402', 'Data Structures & Algorithms', 1, 4, 4),
('CS403', 'Web Application Development', 1, 4, 3);

-- 6. Insert Classes
INSERT INTO Classes (subject_id, teacher_id, department_id, semester, section, room_number, schedule_time) VALUES
(1, 1, 1, 4, 'A', 'Lab-301', 'Mon & Wed 10:00 AM - 11:30 AM'),
(2, 2, 1, 4, 'A', 'Room-102', 'Tue & Thu 02:00 PM - 03:30 PM');

-- 7. Insert Attendance Records
INSERT INTO Attendance (class_id, student_id, date, status, arrival_time, notes, marked_by) VALUES
(1, 1, '2026-08-01', 'present', '10:00:00', 'On time', 1),
(1, 2, '2026-08-01', 'present', '10:02:00', 'On time', 1),
(1, 3, '2026-08-01', 'absent', NULL, 'Unexcused absence', 1),
(1, 1, '2026-08-03', 'present', '10:00:00', 'On time', 1),
(1, 2, '2026-08-03', 'late', '10:18:00', 'Bus delay', 1),
(1, 3, '2026-08-03', 'present', '10:05:00', 'On time', 1);

-- 8. Insert Leave Requests
INSERT INTO LeaveRequests (student_id, start_date, end_date, reason, status, reviewed_by, review_comments) VALUES
(3, '2026-08-01', '2026-08-01', 'Medical appointment with doctor note', 'approved', 1, 'Medical leave approved');

-- 9. Insert Notifications
INSERT INTO Notifications (user_id, title, message, type, is_read) VALUES
(4, 'Welcome to Attendance Portal', 'Your student account is active. Check your timetable and attendance records.', 'info', 1),
(6, 'Low Attendance Warning', 'Your attendance in CS401 is currently below 75%. Please contact your course instructor.', 'warning', 0);
