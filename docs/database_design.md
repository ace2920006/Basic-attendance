# Database Design & Entity Relationship Specifications

This document outlines the MongoDB Mongoose database schema, collection definitions, fields, validation constraints, and relationships for the **Attendance Management System**.

---

## 📐 Entity Relationship Diagram (ERD Overview)

```
  +--------------------+       1:N       +--------------------+       1:N       +--------------------+
  |   AcademicYears    | --------------> |     Semesters      | --------------> |     Divisions      |
  +--------------------+                 +--------------------+                 +--------------------+
            |                                      |                                      |
            | 1:N                                  | 1:N                                  | 1:N
            v                                      v                                      v
  +--------------------+                 +--------------------+                 +--------------------+
  | StudentEnrollments | <-------------- |       Users        | --------------> |      Subjects      |
  +--------------------+  (Historical)   +--------------------+                 +--------------------+
                                                   |                                      |
                                                   | 1:N                                  | 1:N
                                                   v                                      v
                                         +--------------------+                 +--------------------+
                                         |     Attendance     | <-------------- |      Classes       |
                                         +--------------------+                 +--------------------+
                                                   ^
                                                   | 1:N
                                         +--------------------+
                                         |     AuditLogs      |
                                         +--------------------+
```

---

## 📊 Mongoose Collections & Schema Definitions

### 1. `AcademicYears`
Manages institutional academic sessions (e.g. 2026-27).

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PRIMARY KEY | Unique Academic Year ID |
| `yearName` | String | UNIQUE, REQUIRED | Session title (e.g., `2026-27`) |
| `startDate` | Date | REQUIRED | Session start date |
| `endDate` | Date | REQUIRED | Session end date |
| `isCurrent` | Boolean | DEFAULT false | Active current session flag (singleton enforced) |
| `status` | String | ENUM (`Upcoming`, `Active`, `Completed`, `Archived`) | Session status |
| `description` | String | DEFAULT '' | Description note |

---

### 2. `Semesters`
Dynamic term schedules attached to Academic Years.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PRIMARY KEY | Unique Semester ID |
| `name` | String | REQUIRED | Term name (e.g., `Semester 5`) |
| `semesterNumber` | Number | REQUIRED (1 to 10) | Term ordinal number |
| `academicYear` | ObjectId | REF `AcademicYear`, REQUIRED | Associated Academic Year |
| `startDate` | Date | OPTIONAL | Semester start date |
| `endDate` | Date | OPTIONAL | Semester end date |
| `isCurrent` | Boolean | DEFAULT false | Current semester flag |
| `status` | String | ENUM (`Upcoming`, `Active`, `Completed`) | Status |

---

### 3. `Divisions`
Class sections under Academic Year, Semester, and Department.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PRIMARY KEY | Unique Division ID |
| `name` | String | REQUIRED | Section title (e.g., `IT-A`, `CS-B`) |
| `section` | String | UPPERCASE, REQUIRED | Section letter (e.g., `A`, `B`, `C`) |
| `department` | String | REQUIRED | Department code or name |
| `academicYear` | ObjectId | REF `AcademicYear`, REQUIRED | Linked Academic Year |
| `semester` | ObjectId | REF `Semester`, REQUIRED | Linked Semester |
| `capacity` | Number | DEFAULT 60 | Maximum student capacity |
| `studentsCount` | Number | DEFAULT 0 | Live enrolled student count |

---

### 4. `StudentEnrollments`
Tracks student academic enrollment history and promotion audit records.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PRIMARY KEY | Unique Enrollment ID |
| `student` | ObjectId | REF `User`, REQUIRED | Target student |
| `academicYear` | ObjectId | REF `AcademicYear`, REQUIRED | Academic Year |
| `semester` | ObjectId | REF `Semester`, REQUIRED | Semester |
| `department` | String | REQUIRED | Enrolled department |
| `division` | ObjectId | REF `Division` | Class division |
| `divisionName` | String | DEFAULT '' | Division display name |
| `status` | String | ENUM (`Enrolled`, `Promoted`, `Graduated`, `Dropped`) | Enrollment status |
| `promotedAt` | Date | OPTIONAL | Date of promotion execution |
| `promotedFrom` | ObjectId | REF `StudentEnrollment` | Previous enrollment reference |
| `remarks` | String | DEFAULT '' | Admin promotion audit notes |

---

### 5. `Users`
Authentication credentials, role RBAC, and active academic profile.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PRIMARY KEY | User ID |
| `name` | String | REQUIRED | Full display name |
| `email` | String | UNIQUE, LOWERCASE, REQUIRED | Account email address |
| `password` | String | REQUIRED (Hashed bcrypt) | Password hash |
| `role` | String | ENUM (`student`, `teacher`, `admin`) | RBAC Access role |
| `rollNo` | String | DEFAULT '' | Student Roll/Reg number |
| `department` | String | DEFAULT 'Computer Science' | Active department |
| `course` | String | DEFAULT '' | Degree course program |
| `semester` | String | DEFAULT '' | Active semester name |
| `academicYearId` | ObjectId | REF `AcademicYear` | Current active Academic Year |
| `semesterId` | ObjectId | REF `Semester` | Current active Semester |
| `divisionId` | ObjectId | REF `Division` | Current active Division |
| `divisionName` | String | DEFAULT '' | Division section name |
| `assignedSubjects` | [ObjectId] | REF `Subject` array | Assigned course subjects |
| `lastDeviceFingerprint`| String | DEFAULT '' | Client browser device fingerprint |
| `lastBrowserId` | String | DEFAULT '' | Client browser ID |
| `fcmTokens` | [String] | Array | Registered FCM web push tokens |

---

### 6. `Subjects`
Course subject curriculum specifications.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PRIMARY KEY | Subject ID |
| `code` | String | UNIQUE, UPPERCASE, REQUIRED | Subject code (e.g., `CS101`) |
| `name` | String | REQUIRED | Subject title |
| `department` | String | DEFAULT 'Computer Science' | Department |
| `course` | String | DEFAULT '' | Course program / Semester |
| `academicYearRef` | ObjectId | REF `AcademicYear` | Linked Academic Year |
| `semesterRef` | ObjectId | REF `Semester` | Linked Semester |
| `divisionRef` | ObjectId | REF `Division` | Linked Division |
| `divisionName` | String | DEFAULT '' | Division display name |
| `instructor` | String | DEFAULT '' | Faculty instructor name |
| `instructorId` | ObjectId | REF `User` | Faculty instructor ID |
| `assignedStudents` | [ObjectId] | REF `User` array | Enrolled student IDs |
| `totalClasses` | Number | DEFAULT 30 | Expected total sessions |

---

### 7. `Classes`
Active class session instances.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PRIMARY KEY | Class session ID |
| `subject` | String | REQUIRED | Subject title |
| `subjectCode` | String | UPPERCASE, REQUIRED | Subject code |
| `section` | String | DEFAULT 'Sec A' | Class section |
| `room` | String | REQUIRED | Venue room number |
| `timeSlot` | String | REQUIRED | Lecture time slot |
| `department` | String | DEFAULT 'Computer Science' | Department |
| `instructor` | String | DEFAULT '' | Instructor name |
| `instructorId` | ObjectId | REF `User` | Instructor ID |
| `qrActive` | Boolean | DEFAULT false | Active 30s QR session state |
| `qrSecretToken` | String | DEFAULT '' | Active QR JWT session token |
| `qrExpiresAt` | Date | OPTIONAL | QR token expiration time |
| `campusLocation` | Object | `{ latitude, longitude, maxRadiusMeters: 500 }` | Geofence coordinates |

---

### 8. `Attendance`
Granular daily attendance session logs.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PRIMARY KEY | Attendance log ID |
| `student` | ObjectId | REF `User`, REQUIRED | Student evaluated |
| `subject` | String | REQUIRED | Subject name |
| `subjectCode` | String | UPPERCASE, REQUIRED | Subject code |
| `date` | Date | REQUIRED | Session date |
| `status` | String | ENUM (`Present`, `Absent`, `Late`), REQUIRED | Attendance status |
| `arrivalTime` | String | DEFAULT '' | Arrival time timestamp |
| `departureTime` | String | DEFAULT '' | Departure time timestamp |
| `notes` | String | DEFAULT '' | Custom session remarks |
| `markedBy` | ObjectId | REF `User` | Evaluator ID |

---

### 9. `AuditLogs`
Security and system state mutation audit ledger.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PRIMARY KEY | Audit record ID |
| `userId` | ObjectId | REF `User` | Actor user ID |
| `userName` | String | REQUIRED | Actor display name |
| `userEmail` | String | REQUIRED | Actor email |
| `userRole` | String | ENUM (`student`, `teacher`, `admin`, `guest`) | Actor RBAC role |
| `action` | String | REQUIRED | Action type (e.g., `LOGIN_SUCCESS`, `PROMOTE_STUDENTS`) |
| `resource` | String | REQUIRED | Target module (e.g., `AUTH`, `ACADEMIC_ENGINE`) |
| `method` | String | UPPERCASE | HTTP Method (`GET`, `POST`, `PUT`, `DELETE`) |
| `endpoint` | String | REQUIRED | API endpoint URL |
| `status` | String | ENUM (`SUCCESS`, `FAILED`, `WARNING`) | Event status |
| `ipAddress` | String | DEFAULT '' | Client IP |
| `userAgent` | String | DEFAULT '' | Client User-Agent |
| `metadata` | Schema.Types.Mixed | OPTIONAL | Arbitrary context payload |

---

## ⚡ Performance Indexes

```javascript
// Academic Engine Indexes
AcademicYearSchema.index({ yearName: 1 }, { unique: true });
SemesterSchema.index({ name: 1, academicYear: 1 }, { unique: true });
DivisionSchema.index({ name: 1, semester: 1, department: 1 }, { unique: true });
StudentEnrollmentSchema.index({ student: 1, academicYear: 1, semester: 1 });

// Core Performance Indexes
UserSchema.index({ email: 1 }, { unique: true });
AttendanceSchema.index({ student: 1, date: 1 });
AttendanceSchema.index({ subjectCode: 1, date: 1 });
AuditLogSchema.index({ createdAt: -1, status: 1 });
NotificationSchema.index({ user: 1, read: 1 });
```
