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
  +--------------------+                 +--------------------+                 +--------------------+
  |  AttendanceRules   | --------------> | AttendanceSessions | --------------> |     Attendance     |
  +--------------------+  (Evaluator)    +--------------------+                 +--------------------+
                                                   ^                                      ^
                                                   | 1:N                                  | 1:N
                                         +--------------------+                 +--------------------+
                                         |      Classes       |                 | AttendanceCorrect- |
                                         +--------------------+                 |      ions (P23)    |
                                                   |                            +--------------------+
                                                   |                                      |
                                                   v                                      v
                                         +--------------------+                 +--------------------+
                                         | Notifications(P25) |                 |  AuditLogs (P24)   |
                                         | (Multi-Channel +   |                 | (10 Institutional  |
                                         |   Smart Advice)    |                 |   Actions + Diffs) |
                                         +--------------------+                 +--------------------+
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
Authentication credentials, role RBAC, active academic profile, and notification preferences.

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
| `notificationPreferences` | Object | Channels & Events toggles | `{ channels: { inApp, email, push }, events: { attendanceMarked, lowAttendance, leaveStatus, announcements, timetableChanged, classCancelled } }` |

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
| `status` | String | ENUM (`Present`, `Absent`, `Late`, `Excused`, `On Leave`, `Holiday`, `Cancelled Lecture`), REQUIRED | Attendance status |
| `arrivalTime` | String | DEFAULT '' | Arrival time timestamp |
| `departureTime` | String | DEFAULT '' | Departure time timestamp |
| `notes` | String | DEFAULT '' | Custom session remarks |
| `markedBy` | ObjectId | REF `User` | Evaluator ID |
| `classId` | ObjectId | REF `Class` | Scheduled Class reference |
| `sessionId` | ObjectId | REF `AttendanceSession` | Active Attendance Session reference |
| `riskScore` | Number | DEFAULT 0 (0 to 100) | Multi-signal Anti-Proxy risk score (Phase 22) |
| `riskLevel` | String | ENUM (`Normal`, `Review`, `Suspicious`, `High Risk`), DEFAULT `Normal` | Anti-Proxy Risk severity classification |
| `riskSignals` | [Object] | Array of `{ signal, status, scoreContribution, reason }` | Evaluated risk signals breakdown |
| `reviewStatus` | String | ENUM (`Approved`, `Pending`, `Rejected`), DEFAULT `Approved` | Instructor resolution review status |
| `reviewedBy` | ObjectId | REF `User` | Reviewing instructor user ID |
| `reviewedAt` | Date | OPTIONAL | Date of instructor review resolution |
| `reviewNotes` | String | DEFAULT '' | Instructor review resolution audit notes |

---

### 9. `AuditLogs`
Master institutional and security audit ledger (Phase 24 Enriched).

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PRIMARY KEY | Unique Audit Log ID |
| `userId` | ObjectId | REF `User` | Actor User ID |
| `userName` | String | REQUIRED | Actor full name |
| `userEmail` | String | REQUIRED | Actor email address |
| `userRole` | String | ENUM (`student`, `teacher`, `admin`, `system`, `guest`) | Actor role |
| `action` | String | REQUIRED (Enum: 10 Institutional Actions) | `LOGIN`, `LOGOUT`, `CREATE_STUDENT`, `DELETE_STUDENT`, `MARK_ATTENDANCE`, `EDIT_ATTENDANCE`, `APPROVE_LEAVE`, `REJECT_LEAVE`, `EXPORT_REPORT`, `CHANGE_SETTINGS` |
| `resource` | String | REQUIRED | Target resource module (e.g. `AUTH`, `ATTENDANCE`, `LEAVES`, `SETTINGS`, `REPORTS`) |
| `targetUser` | ObjectId | REF `User`, OPTIONAL | Target Student/User affected by the action |
| `targetUserName`| String | DEFAULT '' | Target Student/User full display name |
| `targetUserRollNo`| String | DEFAULT '' | Target Student Roll / Reg number |
| `originalValue`| String | DEFAULT '' | Previous status / configuration value (e.g. `"Absent"`) |
| `newValue` | String | DEFAULT '' | Updated status / configuration value (e.g. `"Present"`) |
| `transition` | String | DEFAULT '' | Readable state diff banner (e.g. `"Absent → Present"`) |
| `reason` | String | DEFAULT '' | Mandatory change justification (e.g. `"Medical document verified"`) |
| `method` | String | UPPERCASE | HTTP Method (`GET`, `POST`, `PUT`, `DELETE`, `SYSTEM`) |
| `endpoint` | String | REQUIRED | Invoked API route endpoint |
| `status` | String | ENUM (`SUCCESS`, `FAILED`, `WARNING`), DEFAULT `SUCCESS` | Execution outcome |
| `ipAddress` | String | DEFAULT '' | Client IPv4 / IPv6 address |
| `userAgent` | String | DEFAULT '' | Client browser / device user-agent string |
| `metadata` | Schema.Types.Mixed | OPTIONAL | Arbitrary context payload |

---

### 10. `AttendanceRules`
Institutional thresholds engine and 7-status matrix definitions.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PRIMARY KEY | Unique Rules Configuration ID |
| `minAttendancePercentage` | Number | DEFAULT 75 (0 to 100) | Minimum attendance percentage requirement |
| `lateThresholdMinutes` | Number | DEFAULT 10 (0 to 120) | Arrival time cutoff minutes for Late status |
| `gracePeriodMinutes` | Number | DEFAULT 5 (0 to 60) | On-time arrival grace period window |
| `qrValidityMinutes` | Number | DEFAULT 1 (0.25 to 30) | Dynamic QR session token validity window |
| `gpsRadiusMeters` | Number | DEFAULT 100 (10 to 5000) | Geofence campus radius limit in meters |
| `autoMarkAbsentMinutes` | Number | DEFAULT 30 | Auto-absent trigger delay |
| `allowStudentSelfCheckIn` | Boolean | DEFAULT true | Student self-service check-in toggle |
| `consecutiveAbsentAlertThreshold` | Number | DEFAULT 3 | Alert trigger for consecutive absentees |
| `statusConfigs` | Array [Object] | REQUIRED (7 Statuses) | Matrix rules defining `statusCode`, `label`, `countsAsAttended`, `countsAsConducted`, `attendanceWeight`, and `color` |

---

### 11. `AttendanceSessions`
Live attendance session instances (Phase 20).

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PRIMARY KEY | Unique Attendance Session Mongo ID |
| `sessionId` | String | UNIQUE, REQUIRED | Readable formatted session ID (e.g. `SESS-20260826-A1B2C3`) |
| `class` | ObjectId | REF `Class`, REQUIRED | Scheduled Class reference |
| `subject` | String | REQUIRED | Subject title |
| `subjectCode` | String | UPPERCASE, REQUIRED | Subject code (e.g. `CS201`) |
| `division` | String | DEFAULT 'Sec A' | Division/Section (e.g. `IT-A`) |
| `teacher` | ObjectId | REF `User`, REQUIRED | Faculty instructor user ID |
| `teacherName` | String | DEFAULT '' | Faculty instructor name |
| `department` | String | DEFAULT 'Computer Science' | Department name |
| `room` | String | DEFAULT '' | Classroom venue |
| `startTime` | Date | DEFAULT Date.now | Session start timestamp |
| `endTime` | Date | OPTIONAL | Session completion timestamp |
| `mode` | String | ENUM (`QR`, `Manual`, `GPS`, `Hybrid`) | Attendance verification mode |
| `status` | String | ENUM (`Active`, `Completed`, `Cancelled`, `Expired`) | Session status |
| `qrSecretToken` | String | DEFAULT '' | Expiring 30s dynamic QR JWT token |
| `qrExpiresAt` | Date | OPTIONAL | QR token expiration timestamp |
| `campusLocation` | Object | `{ latitude, longitude, maxRadiusMeters: 100 }` | Session GPS geofence location |
| `stats` | Object | `{ totalStudents, presentCount, absentCount, lateCount, excusedCount }` | Real-time session stats |

---

### 12. `AttendanceCorrections`
Formal attendance modification request, review, and audit trail collection (Phase 23).

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PRIMARY KEY | Unique Correction Request ID |
| `attendance` | ObjectId | REF `Attendance`, REQUIRED | Target Attendance record reference |
| `student` | ObjectId | REF `User`, REQUIRED | Target student ID |
| `subject` | String | DEFAULT '' | Subject title or code |
| `date` | Date | DEFAULT Date.now | Original session date |
| `originalStatus` | String | ENUM (`Present`, `Absent`, `Late`, `Excused`, `On Leave`, `Holiday`, `Cancelled Lecture`) | Original attendance status |
| `requestedStatus` | String | ENUM (`Present`, `Absent`, `Late`, `Excused`, `On Leave`, `Holiday`, `Cancelled Lecture`) | Requested target attendance status |
| `reason` | String | REQUIRED | Mandatory rationale for audit compliance |
| `requestedBy` | ObjectId | REF `User`, REQUIRED | User ID of requester (Changed By) |
| `status` | String | ENUM (`Pending`, `Approved`, `Rejected`), DEFAULT `Pending` | Approval workflow status |
| `reviewedBy` | ObjectId | REF `User`, OPTIONAL | Reviewer User ID |
| `reviewedAt` | Date | OPTIONAL | Review decision timestamp |
| `reviewComment` | String | DEFAULT '' | Reviewer notes or justification |

---

### 13. `Notifications`
Centralized multi-channel alerts and smart attendance recovery advice collection (Phase 25 Enriched).

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PRIMARY KEY | Unique Notification ID |
| `user` | ObjectId | REF `User`, REQUIRED | Recipient user ID |
| `title` | String | REQUIRED | Notification headline |
| `message` | String | REQUIRED | Detailed message content |
| `type` | String | ENUM (`info`, `success`, `warning`, `error`), DEFAULT `info` | UI theme severity level |
| `eventType` | String | ENUM (10 Event Types) | `ATTENDANCE_MARKED`, `LOW_ATTENDANCE`, `LEAVE_APPROVED`, `LEAVE_REJECTED`, `LEAVE_STATUS`, `ANNOUNCEMENT`, `CLASS_CANCELLED`, `TIMETABLE_CHANGED`, `ANTI_PROXY_REVIEW`, `GENERAL` |
| `read` | Boolean | DEFAULT false | Read receipt flag |
| `unread` | Boolean | DEFAULT true | Unread state flag |
| `channelsSent` | [String] | Array of `in_app`, `email`, `push` | Multi-channel dispatch delivery log |
| `smartAdvice` | Object | Smart recovery advisory payload | `{ currentPercentage, targetPercentage, lecturesNeeded, safeMisses, attendedLectures, totalLectures, actionableText }` |
| `data` | Schema.Types.Mixed | OPTIONAL | Domain metadata payload (e.g. `subjectCode`, `classId`, `leaveId`) |
| `createdAt` | Date | DEFAULT Date.now | Dispatch timestamp |

---

## ⚡ Performance Indexes

```javascript
// Phase 25 Notification Indexes
NotificationSchema.index({ user: 1, unread: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, eventType: 1, createdAt: -1 });

// Phase 24 Complete Audit Logging Indexes
AuditLogSchema.index({ createdAt: -1, action: 1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ targetUser: 1, createdAt: -1 });
AuditLogSchema.index({ targetUserName: 1 });
AuditLogSchema.index({ reason: 'text', transition: 'text' });

// Phase 23 Attendance Correction Indexes
AttendanceCorrectionSchema.index({ attendance: 1, createdAt: -1 });
AttendanceCorrectionSchema.index({ status: 1, createdAt: -1 });
AttendanceCorrectionSchema.index({ student: 1 });

// Academic Engine Indexes
AcademicYearSchema.index({ yearName: 1 }, { unique: true });
SemesterSchema.index({ name: 1, academicYear: 1 }, { unique: true });
DivisionSchema.index({ name: 1, semester: 1, department: 1 }, { unique: true });
StudentEnrollmentSchema.index({ student: 1, academicYear: 1, semester: 1 });

// Core Performance Indexes
UserSchema.index({ email: 1 }, { unique: true });
AttendanceSchema.index({ student: 1, date: 1 });
AttendanceSchema.index({ subjectCode: 1, date: 1 });
NotificationSchema.index({ user: 1, read: 1 });
```
