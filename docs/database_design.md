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
  +--------------------+  (Historical)   |  (Student/Teacher/ |                 +--------------------+
                                         |   Admin/Parent)    |                           |
                                         +--------------------+                           | 1:N
                                           |        |   ^ (linkedStudents 1:N)            v
                                           | 1:N    |   +--------------------+  +--------------------+
                                           v        |   |   Parent Users     |  |     Attendance     |
  +--------------------+                 +----+     |   |    (Phase 31)      |  +--------------------+
  |  AttendanceRules   | --------------> | At-| <---+   +--------------------+            ^
  +--------------------+  (Evaluator)    | te-|                                           | 1:N
            |                            | nd-|                ^                          |
            | (DefaulterConfig)          | an-|                | 1:N            +--------------------+
            v                            | ce-|      +--------------------+     | AttendanceCorrect- |
  +--------------------+                 | Se-| <--- |      Classes       |     |      ions (P23)    |
  |  DefaulterRecords  | <-------------- | ss-|      +--------------------+     +--------------------+
  |  (Phase 30 Engine) |   (Student Ref) | io-|                |                          |
  +--------------------+                 | ns-|                v                          v
                                         +----+      +--------------------+     +--------------------+
                                                     | Notifications(P25) |     |  AuditLogs (P24)   |
                                                     | (Multi-Channel +   |     | (10 Institutional  |
                                                     |   Smart Advice)    |     |   Actions + Diffs) |
                                                     +--------------------+     +--------------------+
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
Authentication credentials, role RBAC, active academic profile, parent-ward relationships, and notification preferences.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PRIMARY KEY | User ID |
| `name` | String | REQUIRED | Full display name |
| `email` | String | UNIQUE, LOWERCASE, REQUIRED | Account email address |
| `password` | String | REQUIRED (Hashed bcrypt) | Password hash |
| `role` | String | ENUM (`student`, `teacher`, `admin`, `parent`) | RBAC Access role |
| `rollNo` | String | DEFAULT '' | Student Roll/Reg number |
| `department` | String | DEFAULT 'Computer Science' | Active department |
| `course` | String | DEFAULT '' | Degree course program |
| `semester` | String | DEFAULT '' | Active semester name |
| `academicYearId` | ObjectId | REF `AcademicYear` | Current active Academic Year |
| `semesterId` | ObjectId | REF `Semester` | Current active Semester |
| `divisionId` | ObjectId | REF `Division` | Current active Division |
| `divisionName` | String | DEFAULT '' | Division section name |
| `assignedSubjects` | [ObjectId] | REF `Subject` array | Assigned course subjects |
| `linkedStudents` | [ObjectId] | REF `User` array | Linked student accounts monitored by this parent (Phase 31) |
| `wardRollNo` | String | DEFAULT '' | Target student roll number specified during parent registration (Phase 31) |
| `lastDeviceFingerprint`| String | DEFAULT '' | Client browser device fingerprint |
| `lastBrowserId` | String | DEFAULT '' | Client browser ID |
| `fcmTokens` | [String] | Array | Registered FCM web push tokens |
| `notificationPreferences` | Object | Channels & Events toggles | `{ channels: { inApp, email, push }, events: { attendanceMarked, lowAttendance, leaveStatus, announcements, timetableChanged, classCancelled } }` |
| `guardianName` | String | DEFAULT '' | Parent/Guardian display name |
| `guardianEmail` | String | DEFAULT '' | Parent/Guardian email address for automated defaulter escalation dispatch |
| `guardianPhone` | String | DEFAULT '' | Parent/Guardian telephone contact |
| `guardianRelation` | String | ENUM (`Parent`, `Mother`, `Father`, `Guardian`, `Other`), DEFAULT `Parent` | Relationship to student |

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
| `isOfflineSynced` | Boolean | DEFAULT false | Flags if attendance was recorded while offline (Phase 34) |
| `offlineSyncTimestamp` | Date | OPTIONAL | Server synchronization timestamp (Phase 34) |
| `offlineClientTimestamp` | Date | OPTIONAL | Client device recording timestamp (Phase 34) |
| `offlineBatchId` | String | DEFAULT '' | Client-generated offline batch identifier (Phase 34) |
| `conflictResolution` | String | ENUM (`NONE`, `LOCAL_OVERRIDE`, `SERVER_PRESERVED`, `SMART_MERGED`, `MANUAL_RESOLVED`), DEFAULT `NONE` | Strategy applied to resolve discrepancies during synchronization (Phase 34) |

---

### 9. `AuditLogs`
Master institutional and security audit ledger (Phase 24 Enriched).

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PRIMARY KEY | Unique Audit Log ID |
| `userId` | ObjectId | REF `User` | Actor User ID |
| `userName` | String | REQUIRED | Actor full name |
| `userEmail` | String | REQUIRED | Actor email address |
| `userRole` | String | ENUM (`student`, `teacher`, `admin`, `parent`, `system`, `guest`) | Actor role |
| `action` | String | REQUIRED (Enum: Institutional Actions) | `LOGIN`, `LOGOUT`, `CREATE_STUDENT`, `DELETE_STUDENT`, `MARK_ATTENDANCE`, `EDIT_ATTENDANCE`, `APPROVE_LEAVE`, `REJECT_LEAVE`, `EXPORT_REPORT`, `CHANGE_SETTINGS`, `OFFLINE_ATTENDANCE_SYNC` |
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
| `defaulterConfig` | Object | Configurable Thresholds (Phase 30) | `{ enabled: Boolean, warningThreshold: 75, seriousWarningThreshold: 70, adminAlertThreshold: 65, parentAlertThreshold: 60, minClassesRequired: 5, autoNotifyParent: Boolean, autoNotifyAdmin: Boolean }` |

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
| `eventType` | String | ENUM (14 Event Types) | `ATTENDANCE_MARKED`, `LOW_ATTENDANCE`, `LEAVE_APPROVED`, `LEAVE_REJECTED`, `LEAVE_STATUS`, `ANNOUNCEMENT`, `CLASS_CANCELLED`, `TIMETABLE_CHANGED`, `ANTI_PROXY_REVIEW`, `DEFAULTER_WARNING`, `DEFAULTER_SERIOUS`, `DEFAULTER_ADMIN_ALERT`, `DEFAULTER_PARENT_ALERT`, `GENERAL` |
| `read` | Boolean | DEFAULT false | Read receipt flag |
| `unread` | Boolean | DEFAULT true | Unread state flag |
| `channelsSent` | [String] | Array of `in_app`, `email`, `push` | Multi-channel dispatch delivery log |
| `smartAdvice` | Object | Smart recovery advisory payload | `{ currentPercentage, targetPercentage, lecturesNeeded, safeMisses, attendedLectures, totalLectures, actionableText }` |
| `data` | Schema.Types.Mixed | OPTIONAL | Domain metadata payload (e.g. `subjectCode`, `classId`, `leaveId`) |
| `createdAt` | Date | DEFAULT Date.now | Dispatch timestamp |

---

### 14. `DefaulterRecords`
Persistent automated defaulter tracking, recovery deficit calculations, escalation histories, and counselor resolutions (Phase 30).

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PRIMARY KEY | Unique Defaulter Record Mongo ID |
| `student` | ObjectId | REF `User`, REQUIRED | Target defaulter student reference |
| `department` | String | DEFAULT 'Computer Science' | Academic department |
| `attendancePercentage`| Number | REQUIRED (0 to 100) | Current cumulative attendance percentage |
| `attendedClasses` | Number | REQUIRED, MIN 0 | Number of classes attended |
| `totalClasses` | Number | REQUIRED, MIN 0 | Total number of classes conducted |
| `classesNeededToTarget` | Number | REQUIRED, MIN 0 | Consecutive classes needed to reach 75% |
| `tier` | String | ENUM (`warning`, `serious_warning`, `admin_alert`, `parent_alert`), REQUIRED | Active escalation tier |
| `status` | String | ENUM (`active`, `resolved`, `escalated`), DEFAULT `active` | Active tracking or resolution state |
| `escalationHistory` | Array [Object] | Audit Log of Transitions | `[{ tier, triggeredAt, attendancePercentage, classesNeeded, reason, notifiedChannels }]` |
| `parentNotified` | Boolean | DEFAULT false | Parent alert dispatch flag |
| `parentNotifiedAt` | Date | OPTIONAL | Timestamp of parent email notification |
| `resolvedAt` | Date | OPTIONAL | Timestamp of resolution / recovery |
| `resolvedBy` | ObjectId | REF `User`, OPTIONAL | Admin / Counselor who recorded resolution |
| `resolutionNotes` | String | DEFAULT '' | Justification or counselor action plan notes |
| `lastEvaluatedAt` | Date | DEFAULT Date.now | Most recent evaluation timestamp |
| `createdAt` | Date | DEFAULT Date.now | Record creation timestamp |
| `updatedAt` | Date | DEFAULT Date.now | Last update timestamp |

---

### 15. `Leaves`
Student absence requests, multi-tier verification lifecycle, and isolated secure document telemetry (Phase 31 Enriched).

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PRIMARY KEY | Unique Leave Application ID |
| `student` | ObjectId | REF `User`, REQUIRED | Applying student user reference |
| `leaveType` | String | ENUM (`Medical`, `Personal Emergency`, `Official Event`, `Duty Leave`), REQUIRED | Category of leave request |
| `startDate` | Date | REQUIRED | Inclusive start date |
| `endDate` | Date | REQUIRED | Inclusive end date |
| `reason` | String | REQUIRED, TRIMMED | Student's formal reason and context |
| `documentUrl` | String | DEFAULT '' | Backward-compatible relative document path |
| `documentName` | String | DEFAULT '' | Backward-compatible original document name |
| **`document`** | Subdocument | Schema Object | Encapsulated secure file metadata and scanning telemetry |
| `document.originalName` | String | DEFAULT '' | Original filename uploaded by student |
| `document.storedName` | String | DEFAULT '' | Cryptographically randomized filename on disk |
| `document.filePath` | String | DEFAULT '' | Absolute path in non-public isolated storage (`server/secure_uploads/documents/`) |
| `document.mimeType` | String | DEFAULT '' | Validated MIME type (`application/pdf`, `image/png`, `image/jpeg`) |
| `document.size` | Number | DEFAULT 0, MAX 5MB | Exact file size in bytes |
| `document.hash` | String | DEFAULT '' | Cryptographic SHA-256 integrity checksum |
| `document.scanStatus` | String | ENUM (`CLEAN`, `FLAGGED`, `QUARANTINED`, `PENDING`), DEFAULT `PENDING` | Real-time antivirus threat status |
| `document.scanEngine` | String | DEFAULT 'Antigravity Heuristic Engine' | Malware engine identifier (Heuristic / ClamAV) |
| `document.scanDetails` | String | DEFAULT '' | Scan report details or detected threat description |
| `document.scannedAt` | Date | OPTIONAL | Antivirus scan completion timestamp |
| `status` | String | ENUM (`Pending`, `Teacher Verified`, `Approved`, `Rejected`), DEFAULT `Pending` | High-level application approval state |
| `verificationStage` | String | ENUM (`submitted`, `teacher_review`, `admin_verification`, `completed`, `rejected`), DEFAULT `teacher_review` | Fine-grained multi-tier pipeline state |
| `appliedOn` | Date | DEFAULT Date.now | Submission timestamp |
| **`teacherReview`** | Subdocument | Schema Object | Faculty mentor review stage record |
| `teacherReview.status` | String | ENUM (`Pending`, `Approved`, `Rejected`), DEFAULT `Pending` | Mentor recommendation status |
| `teacherReview.reviewedBy` | ObjectId | REF `User`, OPTIONAL | Faculty instructor user reference |
| `teacherReview.reviewedAt` | Date | OPTIONAL | Mentor review timestamp |
| `teacherReview.remarks` | String | DEFAULT '' | Mentor evaluation remarks |
| **`adminVerification`** | Subdocument | Schema Object | Central administration final sanction record |
| `adminVerification.status` | String | ENUM (`Pending`, `Verified`, `Rejected`), DEFAULT `Pending` | Administrative verification status |
| `adminVerification.verifiedBy` | ObjectId | REF `User`, OPTIONAL | Admin user reference |
| `adminVerification.verifiedAt` | Date | OPTIONAL | Admin verification timestamp |
| `adminVerification.remarks` | String | DEFAULT '' | Official administration sanction remarks |
| `timestamps` | Booleans | `createdAt`, `updatedAt` | Automatic Mongoose audit timestamps |

---

## ⚡ Performance Indexes

```javascript
// Phase 31 Leave & Document Verification Indexes
LeaveSchema.index({ student: 1, status: 1 });
LeaveSchema.index({ verificationStage: 1, status: 1 });
LeaveSchema.index({ 'document.scanStatus': 1 });
LeaveSchema.index({ createdAt: -1 });

// Phase 30 Automated Defaulter Management Indexes
DefaulterRecordSchema.index({ department: 1, status: 1, tier: 1 });
DefaulterRecordSchema.index({ student: 1, status: 1 });
DefaulterRecordSchema.index({ tier: 1, status: 1 });
DefaulterRecordSchema.index({ lastEvaluatedAt: -1 });

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

// Phase 28 Teacher Analytics Index
AttendanceSchema.index({ markedBy: 1, date: -1 });
AttendanceSchema.index({ subjectCode: 1, markedBy: 1, date: -1 });

// Phase 31 Parent/Guardian Portal Indexes
UserSchema.index({ linkedStudents: 1 });
UserSchema.index({ wardRollNo: 1 });

// Core Performance Indexes
UserSchema.index({ email: 1 }, { unique: true });
AttendanceSchema.index({ student: 1, date: 1 });
AttendanceSchema.index({ subjectCode: 1, date: 1 });
AttendanceSchema.index({ isOfflineSynced: 1, offlineBatchId: 1 });
NotificationSchema.index({ user: 1, read: 1 });
```

---

## ⚡ Client-Side IndexedDB Schema (`CampusAttendOfflineDB`)

In addition to the server-side MongoDB database, the system includes a client-side local database in the browser using the native **IndexedDB API** (Database: `CampusAttendOfflineDB`, Version: 1) managed by `client/src/utils/offlineAttendanceDB.js`:

### 1. `attendanceQueue` Store
Persists attendance recorded by teachers while disconnected from the campus network.

| Property | Type | Index | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | PRIMARY KEY | Unique client batch ID (`offline_timestamp_rand`) |
| `batchId` | String | None | Batch identifier |
| `subject` | String | INDEX (`subject`) | Course subject name |
| `subjectCode` | String | None | Course subject code |
| `section` | String | None | Class division / section |
| `classId` | String / null | None | Scheduled class ID |
| `sessionId` | String / null | None | Active attendance session ID |
| `date` | String | None | Attendance date string (ISO) |
| `clientTimestamp`| String | None | ISO timestamp when teacher took attendance |
| `teacherId` | String | None | Instructor user ID |
| `teacherName` | String | None | Instructor display name |
| `records` | Array [Object] | None | Enrolled student attendance records `[{ studentId, name, rollNo, status, notes }]` |
| `syncStatus` | String | INDEX (`syncStatus`) | `pending`, `syncing`, `synced`, `conflict`, `failed` |
| `conflictData` | Object / null | None | Server-detected conflict payloads for review |
| `retryCount` | Number | None | Sync retry attempt counter |
| `lastError` | String / null | None | Last error message if sync failed |
| `createdAt` | Number | INDEX (`createdAt`) | Epoch timestamp |
| `updatedAt` | Number | None | Last modified epoch timestamp |

### 2. `rosterCache` Store
Pre-caches student directories so teachers can mark attendance without network access.

| Property | Type | Index | Description |
| :--- | :--- | :--- | :--- |
| `key` | String | PRIMARY KEY | `${subject}_${section}` lowercase lookup key |
| `subject` | String | None | Course subject code |
| `section` | String | None | Division / section name |
| `students` | Array [Object] | None | Cached student roster with profile and contact info |
| `cachedAt` | Number | None | Epoch timestamp when cached |

### 3. `syncHistory` Store
Maintains a client-side transparency log of completed synchronization events.

| Property | Type | Index | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | PRIMARY KEY | Unique log identifier |
| `batchId` | String | None | Associated batch ID |
| `subject` | String | None | Course subject code |
| `section` | String | None | Section name |
| `syncedCount` | Number | None | Count of records committed to server |
| `conflictsResolved` | Number | None | Discrepancies resolved |
| `strategy` | String | None | Applied resolution strategy (`clean`, `smart_merge`, `local_wins`, etc.) |
| `syncedAt` | Number | INDEX (`syncedAt`) | Epoch timestamp of sync completion |
| `message` | String | None | Server result message |

