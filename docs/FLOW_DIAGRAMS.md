# System Architecture & Workflow Diagrams

This document contains comprehensive flowcharts and system diagrams for the **Attendance Management System**, rendered using standard GitHub Flavored Markdown [`mermaid`](https://mermaid.js.org/) syntax.

---

## 📋 Table of Contents
1. [Dynamic Academic Hierarchy Tree](#1-dynamic-academic-hierarchy-tree)
2. [Student Batch Promotion Engine Workflow](#2-student-batch-promotion-engine-workflow)
3. [30-Second Dynamic QR Attendance & Security Verification Flow](#3-30-second-dynamic-qr-attendance--security-verification-flow)
4. [Overall System Architecture & Data Pipeline](#4-overall-system-architecture--data-pipeline)
5. [Real-Time Socket.io & FCM Web Push Notification Flow](#5-real-time-socketio--fcm-web-push-notification-flow)
6. [Student Leave Application & Authorization Flow](#6-student-leave-application--authorization-flow)
7. [AI Attendance Prediction & Proxy Anomaly Detection Flow](#7-ai-attendance-prediction--proxy-anomaly-detection-flow)
8. [Advanced Attendance Rules Engine Evaluation & Sandbox Flow](#8-advanced-attendance-rules-engine-evaluation--sandbox-flow)
9. [Attendance Session Engine & 4-Tier Hierarchy Flow](#9-attendance-session-engine--4-tier-hierarchy-flow)
10. [Anti-Proxy Multi-Signal Risk Engine & Review Workflow](#10-anti-proxy-multi-signal-risk-engine--review-workflow)

---

## 1. Dynamic Academic Hierarchy Tree

The Phase 18 Academic Engine organizes institutional data into a dynamic 5-tier hierarchy, replacing hard-coded term strings:

```mermaid
flowchart TD
    AY["Academic Year (e.g., 2026-27) <br/> [isCurrent: true]"]
    
    AY --> SEM5["Semester 5 (Odd Term)"]
    AY --> SEM6["Semester 6 (Even Term)"]
    
    SEM5 --> DEPT_IT["Department: Information Technology"]
    SEM5 --> DEPT_CSE["Department: Computer Science"]
    
    DEPT_IT --> DIV_ITA["Division: IT-A <br/> (Capacity: 60)"]
    DEPT_IT --> DIV_ITB["Division: IT-B <br/> (Capacity: 60)"]
    DEPT_IT --> DIV_ITC["Division: IT-C <br/> (Capacity: 60)"]
    
    DIV_ITA --> SUB1["Subject: Data Structures (DS101)"]
    DIV_ITA --> SUB2["Subject: Web Development (WEB201)"]
    DIV_ITB --> SUB3["Subject: Database Systems (DBMS301)"]
```

---

## 2. Student Batch Promotion Engine Workflow

Process flow for promoting student cohorts from a current academic term to a target academic term:

```mermaid
flowchart LR
    A["Admin Console <br/> (/admin/academic)"] --> B["Select Target Academic Year & Semester"]
    B --> C["Select Target Division <br/> (e.g., IT-A)"]
    C --> D["Query Enrolled Student Cohort"]
    D --> E["Select Students to Promote"]
    E --> F{"Execute Batch Promotion"}
    F --> G["Update User Profile <br/> (academicYearId, semesterId, divisionId)"]
    F --> H["Create StudentEnrollment Record <br/> (Status: 'Promoted', Audit Remarks)"]
    G --> I["Real-Time UI Refresh & Success Notification"]
    H --> I
```

---

## 3. 30-Second Dynamic QR Attendance & Security Verification Flow

Complete multi-layered security verification process when a student scans a 30-second expiring QR code:

```mermaid
flowchart TD
    Start(["Teacher Clicks 'Start QR Attendance'"]) --> GenToken["Server Signs 30s Dynamic JWT Token <br/> (qrSecretToken + Timestamp)"]
    GenToken --> DisplayQR["Faculty UI Displays Live QR <br/> with 30s Countdown Timer"]
    
    DisplayQR --> Scan["Student Scans QR Code via App"]
    Scan --> ExtrPayload["Extract Token + Client GPS + Browser Fingerprint"]
    
    ExtrPayload --> CheckExp{"Is Token Expired? <br/> (> 30 Seconds)"}
    CheckExp -- Yes --> RejectExp["❌ Reject: QR Token Expired"]
    
    CheckExp -- No --> CheckGPS{"Calculate Haversine Distance <br/> Is Distance <= 500 Meters?"}
    CheckGPS -- No --> RejectGPS["❌ Reject: Outside Campus Geofence Boundary"]
    
    CheckGPS -- Yes --> CheckDevice{"Check Device Fingerprint & Browser ID <br/> Duplicate Device Scan in Session?"}
    CheckDevice -- Yes --> RejectDevice["❌ Reject: Duplicate Device / Anti-Proxy Guard"]
    
    CheckDevice -- No --> RecordAtt["✅ Record Attendance: Present <br/> (Timestamp, arrivalTime, markedBy)"]
    RecordAtt --> PushNotif["Emit Socket.io Alert & Audio Chime to Student"]
```

---

## 4. Overall System Architecture & Data Pipeline

3-Tier Architecture showing Client SPA, Security Gateway, Application Services, and MongoDB Storage:

```mermaid
flowchart TB
    subgraph ClientLayer ["Client Layer (React 18 + Vite + Tailwind CSS)"]
        UI_Student["Student Portal (/student)"]
        UI_Teacher["Teacher Portal (/teacher)"]
        UI_Admin["Admin Console (/admin)"]
    end

    subgraph SecurityGateway ["Security Layer & API Gateway"]
        Helmet["Helmet Security Headers"]
        RateLimiter["Sliding-Window Rate Limiter"]
        XSS["XSS Payload Sanitizer"]
        JWT_RBAC["JWT Verification & RBAC Guards"]
        AuditMiddleware["Non-Blocking Audit Event Logger"]
    end

    subgraph ControllerLayer ["Application Controllers (Express.js)"]
        AuthCtrl["Auth & User Controller"]
        AttCtrl["Attendance & QR Controller"]
        AcadCtrl["Academic Engine Controller"]
        AICtrl["AI Predictor & Anomaly Detector"]
        AnalyticCtrl["Analytics Dashboard Controller"]
        NotifCtrl["Notification & FCM Controller"]
    end

    subgraph DB ["Database & Storage Layer (MongoDB / Mongoose)"]
        Col_Users[("Users Collection")]
        Col_Academic[("AcademicYears, Semesters, Divisions")]
        Col_Enrollment[("StudentEnrollments")]
        Col_Att[("Attendance Collection")]
        Col_Audit[("AuditLogs Collection")]
    end

    ClientLayer -->|HTTP REST JSON / JWT Bearer| SecurityGateway
    SecurityGateway --> ControllerLayer
    ControllerLayer --> DB
```

---

## 5. Real-Time Socket.io & FCM Web Push Notification Flow

Architecture of event-driven notification dispatch system across WebSockets and Firebase Cloud Messaging:

```mermaid
flowchart TD
    TriggerEvent["Event Triggered <br/> (Attendance Marked / Leave Update / Announcement)"] --> Helper["sendNotification Helper"]
    
    Helper --> DBStore["Save Notification to MongoDB <br/> (status: 'Unread')"]
    
    Helper --> WSCheck{"Is User Socket Connected?"}
    WSCheck -- Yes --> EmitWS["Emit Socket.io Event <br/> ('notification_received')"]
    EmitWS --> UIUpdate["Client UI Updates Unread Badge <br/> + Displays Toast + Plays Chime Sound"]
    
    Helper --> FCMCheck{"Does User Have FCM Web Push Token?"}
    FCMCheck -- Yes --> SendPush["Firebase Admin SDK Sends Web Push Notification"]
    SendPush --> SWRecv["Service Worker Displays System Desktop Notification"]
```

---

## 6. Student Leave Application & Authorization Flow

Step-by-step leave lifecycle from application submission to faculty authorization:

```mermaid
flowchart TD
    A["Student Fills Leave Form <br/> (Category, Date Range, Reason)"] --> B{"Attach Document Proof?"}
    B -- Yes --> Upload["Upload File to /api/uploads <br/> (PDF, PNG, JPG, DOCX)"]
    B -- No --> Submit["Submit Leave Application"]
    Upload --> Submit
    
    Submit --> CreateRec["Create Leave Record <br/> (Status: 'Pending')"]
    CreateRec --> AlertFaculty["Notify Assigned Faculty <br/> (Socket.io Alert)"]
    
    AlertFaculty --> Review["Faculty Opens Leave Console <br/> (/teacher/leave)"]
    Review --> Inspect["Inspect Details & View Document Attachment"]
    
    Inspect --> Decision{"Faculty Decision"}
    Decision -- Approve --> ApprStatus["Update Status: 'Approved' <br/> (Attach Faculty Remarks)"]
    Decision -- Reject --> RejStatus["Update Status: 'Rejected' <br/> (Attach Faculty Remarks)"]
    
    ApprStatus --> EmitNotif["Emit LEAVE_STATUS Notification to Student"]
    RejStatus --> EmitNotif
```

---

## 7. AI Attendance Prediction & Proxy Anomaly Detection Flow

Math trajectory calculation and security anomaly scanning flow:

```mermaid
flowchart TD
    subgraph PredictionEngine ["Attendance 75% Prediction Engine"]
        Input["Student Query / What-If Slider"] --> Calc["Math Engine: Calculate Deficit <br/> X = ceil(3T - 4P)"]
        Calc --> Skips["Calculate Max Skips: S_max = floor(P/0.75 - T)"]
        Skips --> Output["Display Risk Badge: Guaranteed / Achievable / At Risk"]
    end

    subgraph SecurityScanner ["Suspicious Attendance Anomaly Detector"]
        AttLogs["Scan Attendance Records"] --> Scanner1["Scanner 1: Duplicate Device Fingerprint"]
        AttLogs --> Scanner2["Scanner 2: Geofence > 500m"]
        AttLogs --> Scanner3["Scanner 3: Duplicate QR Scans in 5 min"]
        AttLogs --> Scanner4["Scanner 4: Impossible Travel Jump (> 100 km/h)"]
        
        Scanner1 --> Flag["Flag Anomaly Record <br/> (Assign Risk Tier: High/Medium/Low)"]
        Scanner2 --> Flag
        Scanner3 --> Flag
        Scanner4 --> Flag
        
        Flag --> AdminConsole["Display in Suspicious Logs Console <br/> (/admin/suspicious)"]
    end
```

---

## 8. Advanced Attendance Rules Engine Evaluation & Sandbox Flow

Process flow showing rules caching, dynamic QR & GPS boundary check-in evaluation, and interactive sandbox simulator:

```mermaid
flowchart TD
    CheckInTrigger["Student Scans QR / Check-In Request"] --> FetchRules["getSystemRules() <br/> (Check 60s In-Memory Cache)"]
    
    FetchRules --> Evaluator["attendanceRulesEngine.evaluateCheckInStatus()"]
    
    Evaluator --> QRCheck{"Is QR Timestamp > qrValidityMinutes?"}
    QRCheck -- Yes --> RejectQR["❌ Status: Absent <br/> Error: EXPIRED_QR"]
    
    QRCheck -- No --> GPSCheck{"Is GPS Distance > gpsRadiusMeters?"}
    GPSCheck -- Yes --> RejectGPS["❌ Status: Absent <br/> Error: OUT_OF_BOUNDS"]
    
    GPSCheck -- No --> TimeCheck{"Calculate Arrival Delay <br/> (checkInTime - classStartTime)"}
    
    TimeCheck -- Delay <= gracePeriodMinutes --> Present["✅ Status: Present <br/> (Within Grace Period)"]
    TimeCheck -- Delay <= lateThresholdMinutes --> Late["⚠️ Status: Late <br/> (Past Grace, Within Cutoff)"]
    TimeCheck -- Delay > lateThresholdMinutes --> Absent["❌ Status: Absent <br/> (Past Late Threshold Cutoff)"]
    
    subgraph SandboxSimulator ["Admin Rule Sandbox Simulator (/admin/rules)"]
        SandboxInput["Input Test Parameters: Delay Mins, Distance, QR Age"] --> RunSandbox["POST /api/attendance-rules/evaluate"]
        RunSandbox --> Evaluator
        Evaluator --> RenderResult["Render Evaluated Status Pill, Color, and Weight Score"]
    end
```

---

## 9. Attendance Session Engine & 4-Tier Hierarchy Flow

Hierarchy and Session Lifecycle workflow:

```mermaid
flowchart TD
    subgraph DomainHierarchy ["4-Tier Domain Hierarchy"]
        Subject["Subject (e.g. CS201 Data Structures)"] --> ClassSchedule["Scheduled Class (Room 302, 10:00 AM)"]
        ClassSchedule --> SessionInstance["Attendance Session (SESS-20260826-A1B2C3)"]
        SessionInstance --> StudentAtt["Student Attendance Record"]
    end

    subgraph SessionLifecycle ["Session Creation & Completion Lifecycle"]
        TeacherClick["Teacher Clicks 'Start Attendance'"] --> InitSession["POST /api/sessions/start"]
        InitSession --> GenId["Generate Unique Session ID + Start Time"]
        GenId --> GenQR["Sign 30s Dynamic JWT QR Token (Session Linked)"]
        GenQR --> SessionActive["Status: Active <br/> (Teacher UI Displays Session ID Badge & Countdown)"]
        
        SessionActive --> StudentScan["Student Scans QR Code"]
        StudentScan --> LinkAtt["Record Attendance (Linked to sessionId & classId)"]
        LinkAtt --> IncStats["$inc Session Stats: presentCount"]
        
        SessionActive --> TeacherStop["Teacher Clicks 'Stop Session'"]
        TeacherStop --> CompleteSession["POST /api/sessions/:id/stop"]
        CompleteSession --> FinalStats["Set Status: Completed & Record endTime"]
    end
```

---

## 10. Anti-Proxy Multi-Signal Risk Engine & Review Workflow

Phase 21 Multi-Signal evaluation pipeline and instructor review resolution workflow:

```mermaid
flowchart TD
    ScanReq["Student Submits QR Scan <br/> (Payload: qrToken, GPS, Device, IP)"] --> Engine["Anti-Proxy Risk Engine <br/> (antiProxyEngine.js)"]
    
    subgraph MultiSignalEvaluation ["6 Multi-Signal Risk Factor Evaluation"]
        Engine --> Sig1["1. QR Token Signal <br/> (Valid vs Expired 30s)"]
        Engine --> Sig2["2. GPS Signal <br/> (Haversine Distance vs Boundary)"]
        Engine --> Sig3["3. Session Time Signal <br/> (Active vs Post-Session Window)"]
        Engine --> Sig4["4. Device Fingerprint <br/> (Multi-Account Device Reuse ⚠️)"]
        Engine --> Sig5["5. IP Address Concurrency <br/> (30s Burst Scans)"]
        Engine --> Sig6["6. Pattern Anomaly <br/> (Unfamiliar Device Switch)"]
    end

    Sig1 & Sig2 & Sig3 & Sig4 & Sig5 & Sig6 --> ScoreCalc["Compute Aggregate Risk Score (0 - 100)"]
    
    ScoreCalc --> RiskCheck{Risk Level?}
    
    RiskCheck -- "Score < 30 (Normal)" --> AutoApprove["riskLevel: Normal <br/> reviewStatus: Approved <br/> (Auto-Marked Present)"]
    RiskCheck -- "Score 30 - 69 (Suspicious)" --> PendingSuspicious["riskLevel: Suspicious <br/> reviewStatus: Pending"]
    RiskCheck -- "Score >= 70 (High Risk)" --> PendingHighRisk["riskLevel: High Risk <br/> reviewStatus: Pending"]
    
    PendingSuspicious & PendingHighRisk --> ReviewQueue["Teacher & Admin Review Console <br/> (/admin/suspicious)"]
    
    subgraph InstructorReviewConsole ["Instructor Review Console Actions"]
        ReviewQueue --> InspectRecord["Inspect Signal Breakdown & Notes"]
        InspectRecord --> ApproveAction["Click 'Approve' <br/> (PUT /api/anti-proxy/review/:id)"]
        InspectRecord --> RejectAction["Click 'Reject' <br/> (PUT /api/anti-proxy/review/:id)"]
        
        ApproveAction --> VerifiedState["reviewStatus: Approved <br/> (Attendance Confirmed)"]
        RejectAction --> RejectedState["reviewStatus: Rejected <br/> status: Absent (Proxy Flagged)"]
    end
```
