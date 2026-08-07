# Database Design & Entity Relationship Specifications

This document outlines the database schema, table definitions, data types, constraints, and relationships for the **Attendance Management System**.

---

## 📐 Entity Relationship Diagram (ERD Overview)

```
  +------------------+         +------------------+         +------------------+
  |    Departments   | <------ |     Teachers     | ------> |      Users       |
  +------------------+         +------------------+         +------------------+
          ^                             ^                             ^
          |                             |                             |
          |                    +------------------+                   |
          +------------------- |     Classes      |                   |
          |                    +------------------+                   |
          |                             ^                             |
          v                             |                             v
  +------------------+                  |                   +------------------+
  |     Students     | -----------------+-----------------> |  LeaveRequests   |
  +------------------+                  |                   +------------------+
          ^                             |                             ^
          |                             v                             |
          |                    +------------------+                   |
          +------------------- |    Attendance    |                   |
                               +------------------+                   |
                                                                      v
                                                            +------------------+
                                                            |  Notifications   |
                                                            +------------------+
```

---

## 📊 Data Dictionary & Table Definitions

### 1. `Users`
Stores primary authentication and account profile details for all platform users.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER/UUID | PRIMARY KEY, AUTOINCREMENT | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User login email address |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `role` | VARCHAR(20) | CHECK (`student`, `teacher`, `admin`), NOT NULL | Access control role |
| `full_name` | VARCHAR(100) | NOT NULL | Display name |
| `is_active` | BOOLEAN | DEFAULT TRUE | Account active status |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation time |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last profile update time |

---

### 2. `Departments`
Represents academic departments within the institution.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique department ID |
| `code` | VARCHAR(20) | UNIQUE, NOT NULL | Dept code (e.g., `CS`, `EE`, `ME`) |
| `name` | VARCHAR(100) | NOT NULL | Full department name |
| `description` | TEXT | NULL | Brief description |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

---

### 3. `Teachers`
Extends `Users` with teacher-specific academic details.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Teacher record ID |
| `user_id` | INTEGER | FOREIGN KEY (`Users.id`) ON DELETE CASCADE | Linked user account |
| `department_id` | INTEGER | FOREIGN KEY (`Departments.id`) | Primary department |
| `employee_code` | VARCHAR(50) | UNIQUE, NOT NULL | Official institution ID |
| `phone` | VARCHAR(20) | NULL | Contact phone number |
| `qualification` | VARCHAR(100) | NULL | Highest degree earned |

---

### 4. `Students`
Extends `Users` with student-specific academic information.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Student record ID |
| `user_id` | INTEGER | FOREIGN KEY (`Users.id`) ON DELETE CASCADE | Linked user account |
| `department_id` | INTEGER | FOREIGN KEY (`Departments.id`) | Enrolled department |
| `roll_number` | VARCHAR(50) | UNIQUE, NOT NULL | Student roll/registration number |
| `semester` | INTEGER | NOT NULL | Current semester (1 to 8) |
| `batch_year` | INTEGER | NOT NULL | Admission batch year (e.g., 2024) |
| `phone` | VARCHAR(20) | NULL | Contact phone number |

---

### 5. `Subjects`
Academic courses offered across departments and semesters.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Subject ID |
| `code` | VARCHAR(20) | UNIQUE, NOT NULL | Subject code (e.g., `CS101`) |
| `name` | VARCHAR(100) | NOT NULL | Subject name |
| `department_id` | INTEGER | FOREIGN KEY (`Departments.id`) | Department |
| `semester` | INTEGER | NOT NULL | Academic semester |
| `credits` | INTEGER | DEFAULT 3 | Course credits |

---

### 6. `Classes`
Specific class section instances assigned to teachers and subjects.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Class ID |
| `subject_id` | INTEGER | FOREIGN KEY (`Subjects.id`) | Subject taught |
| `teacher_id` | INTEGER | FOREIGN KEY (`Teachers.id`) | Assigned teacher |
| `department_id` | INTEGER | FOREIGN KEY (`Departments.id`) | Department |
| `semester` | INTEGER | NOT NULL | Semester |
| `section` | VARCHAR(10) | NOT NULL | Section (e.g., `A`, `B`, `C`) |
| `room_number` | VARCHAR(20) | NULL | Room / Lab location |
| `schedule_time` | VARCHAR(100) | NULL | Schedule description |

---

### 7. `Attendance`
Daily attendance records per class session per student.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Attendance log ID |
| `class_id` | INTEGER | FOREIGN KEY (`Classes.id`) | Target class session |
| `student_id` | INTEGER | FOREIGN KEY (`Students.id`) | Student evaluated |
| `date` | DATE | NOT NULL | Date of session |
| `status` | VARCHAR(20) | CHECK (`present`, `absent`, `late`, `excused`) | Attendance status |
| `arrival_time` | TIME | NULL | Actual arrival time |
| `notes` | TEXT | NULL | Teacher notes |
| `marked_by` | INTEGER | FOREIGN KEY (`Teachers.id`) | Teacher who logged entry |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Log timestamp |

---

### 8. `LeaveRequests`
Leave applications submitted by students for review by teachers/admins.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Leave request ID |
| `student_id` | INTEGER | FOREIGN KEY (`Students.id`) | Student requesting leave |
| `start_date` | DATE | NOT NULL | Leave start date |
| `end_date` | DATE | NOT NULL | Leave end date |
| `reason` | TEXT | NOT NULL | Reason for leave |
| `status` | VARCHAR(20) | CHECK (`pending`, `approved`, `rejected`) | Approval status |
| `reviewed_by` | INTEGER | FOREIGN KEY (`Users.id`) NULL | Admin/Teacher reviewer |
| `review_comments` | TEXT | NULL | Feedback/notes from reviewer |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Submission timestamp |

---

### 9. `Notifications`
In-app notification system for user alerts.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Notification ID |
| `user_id` | INTEGER | FOREIGN KEY (`Users.id`) ON DELETE CASCADE | Recipient user |
| `title` | VARCHAR(150) | NOT NULL | Header title |
| `message` | TEXT | NOT NULL | Notification content |
| `type` | VARCHAR(30) | DEFAULT 'info' | Type (`info`, `warning`, `success`) |
| `is_read` | BOOLEAN | DEFAULT FALSE | Read state |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Created timestamp |

---

## ⚡ Performance Indexes

```sql
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_students_roll ON Students(roll_number);
CREATE INDEX idx_attendance_class_date ON Attendance(class_id, date);
CREATE INDEX idx_attendance_student ON Attendance(student_id);
CREATE INDEX idx_leave_student ON LeaveRequests(student_id);
CREATE INDEX idx_notifications_user_read ON Notifications(user_id, is_read);
```
