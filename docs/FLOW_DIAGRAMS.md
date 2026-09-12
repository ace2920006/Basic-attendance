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
11. [Attendance Correction Request & Approval Workflow](#11-attendance-correction-request--approval-workflow)
12. [Complete Institutional Audit Logging & State Mutation Pipeline](#12-complete-institutional-audit-logging--state-mutation-pipeline)
13. [Phase 25 Advanced Notification Engine & Multi-Channel Pipeline](#13-phase-25-advanced-notification-engine--multi-channel-pipeline)
14. [Phase 26 Attendance Forecasting Engine & Scenario Simulator](#14-phase-26-attendance-forecasting-engine--scenario-simulator)
15. [Phase 27 Personal Student Analytics & Visual Threshold Engine](#15-phase-27-personal-student-analytics--visual-threshold-engine)
16. [Phase 28 Teacher Analytics & Classroom Insights Engine](#16-phase-28-teacher-analytics--classroom-insights-engine)
17. [Phase 29 Admin Intelligence Dashboard & College Control Center Dataflow](#17-phase-29-admin-intelligence-dashboard--college-control-center-dataflow)
18. [Phase 30 Automated Defaulter Management & Escalation Pipeline](#18-phase-30-automated-defaulter-management--escalation-pipeline)
19. [Phase 31 Parent/Guardian Portal & Ward Monitoring Lifecycle](#19-phase-31-parentguardian-portal--ward-monitoring-lifecycle)
20. [Phase 31 Document Verification & Security Storage Pipeline](#20-phase-31-document-verification--security-storage-pipeline)
21. [Phase 33 PWA Service Worker & Camera QR Scanning Architecture](#21-phase-33-pwa-service-worker--camera-qr-scanning-architecture)
22. [Phase 34 Offline Attendance Sync & Multi-Strategy Conflict Resolution Flow](#22-phase-34-offline-attendance-sync--multi-strategy-conflict-resolution-flow)

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
        AuditCtrl["Audit & Correction Controllers"]
    end

    subgraph DB ["Database & Storage Layer (MongoDB / Mongoose)"]
        Col_Users[("Users Collection")]
        Col_Academic[("AcademicYears, Semesters, Divisions")]
        Col_Enrollment[("StudentEnrollments")]
        Col_Att[("Attendance & Sessions")]
        Col_Correction[("AttendanceCorrections")]
        Col_Audit[("AuditLogs (10 Actions + State Diffs)")]
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

Phase 21 & 22 Multi-Signal evaluation pipeline and instructor review resolution workflow:

```mermaid
flowchart TD
    ScanReq["Student Submits QR Scan <br/> (Payload: qrToken, GPS, Device, IP)"] --> Engine["Anti-Proxy Risk Engine <br/> (antiProxyEngine.js)"]
    
    subgraph MultiSignalEvaluation ["6 Multi-Signal Risk Factor Evaluation"]
        Engine --> Sig1["1. QR Token Signal (+50 if invalid)"]
        Engine --> Sig2["2. GPS Signal (+40 if out of campus)"]
        Engine --> Sig3["3. Device Fingerprint (+30 if shared)"]
        Engine --> Sig4["4. IP Burst Concurrency (+20)"]
        Engine --> Sig5["5. Timing / Jump (+10)"]
    end

    Sig1 & Sig2 & Sig3 & Sig4 & Sig5 --> ScoreCalc["Compute Aggregate Risk Score (0 - 100)"]
    
    ScoreCalc --> RiskCheck{Risk Tier?}
    
    RiskCheck -- "Score 0 - 30 (Normal)" --> AutoApprove["riskLevel: Normal <br/> reviewStatus: Approved <br/> (Auto-Marked Present)"]
    RiskCheck -- "Score 31 - 60 (Review)" --> PendingSuspicious["riskLevel: Review <br/> reviewStatus: Pending"]
    RiskCheck -- "Score 61 - 100 (High Risk)" --> PendingHighRisk["riskLevel: High Risk <br/> reviewStatus: Pending"]
    
    PendingSuspicious & PendingHighRisk --> ReviewQueue["Teacher & Admin Review Console <br/> (/admin/suspicious)"]
    
    subgraph InstructorReviewConsole ["Instructor Review Console Actions"]
        ReviewQueue --> InspectRecord["Inspect Signal Breakdown & Notes"]
        InspectRecord --> ApproveAction["Click 'Approve' <br/> (PUT /api/anti-proxy/review/:id)"]
        InspectRecord --> RejectAction["Click 'Reject' <br/> (PUT /api/anti-proxy/review/:id)"]
        
        ApproveAction --> VerifiedState["reviewStatus: Approved <br/> (Attendance Confirmed)"]
        RejectAction --> RejectedState["reviewStatus: Rejected <br/> status: Absent (Proxy Flagged)"]
    end
```

---

## 11. Attendance Correction Request & Approval Workflow

Phase 23 formal attendance modification workflow ensuring transparent auditability:

```mermaid
flowchart TD
    PastLog["Teacher Inspects Past Attendance Log <br/> (/teacher/attendance-history)"] --> ClickCorrect["Teacher Clicks 'Request Correction'"]
    
    ClickCorrect --> OpenModal["Open Correction Modal <br/> (Input Requested Status + Mandatory Reason)"]
    OpenModal --> SubmitRequest["POST /api/corrections <br/> (Payload: attendanceId, requestedStatus, reason)"]
    
    SubmitRequest --> CreateCorrection["Create AttendanceCorrection Record <br/> (Status: 'Pending')"]
    
    CreateCorrection --> ReviewQueue["Teacher / Admin Review Console <br/> (/teacher/corrections or /admin/corrections)"]
    
    ReviewQueue --> InspectDiff["Inspect Original Status vs Requested Status + Reason"]
    
    InspectDiff --> ReviewDecision{Review Action}
    
    ReviewDecision -- Approve --> ExecUpdate["1. Update Attendance Record status <br/> 2. Set Correction status: 'Approved' <br/> 3. Record EDIT_ATTENDANCE Audit Log"]
    ReviewDecision -- Reject --> RejCorrection["1. Keep Attendance Record unchanged <br/> 2. Set Correction status: 'Rejected'"]
    
    ExecUpdate --> RecordAudit["Audit Log Records: <br/> • Actor: Reviewer <br/> • Target: Student <br/> • Transition: Absent ➔ Present <br/> • Reason: 'Medical document verified'"]
    RejCorrection --> Done(["Workflow Complete"])
    RecordAudit --> Done
```

---

## 12. Complete Institutional Audit Logging & State Mutation Pipeline

Phase 24 complete audit trail logging 10 institutional actions with state diffs and reasons:

```mermaid
flowchart TD
    subgraph ActionTriggers ["10 Core Institutional Action Triggers"]
        A1["1. LOGIN / LOGOUT"]
        A2["2. CREATE_STUDENT / DELETE_STUDENT"]
        A3["3. MARK_ATTENDANCE"]
        A4["4. EDIT_ATTENDANCE (State Diff + Reason)"]
        A5["5. APPROVE_LEAVE / REJECT_LEAVE"]
        A6["6. EXPORT_REPORT (CSV/Excel/PDF)"]
        A7["7. CHANGE_SETTINGS (Rules & Allocations)"]
    end

    ActionTriggers --> AuditHelper["recordAuditLog() Helper <br/> (auditMiddleware.js)"]
    
    AuditHelper --> EnrichData["Enrich Audit Log Entry: <br/> • Actor: userId, userName, userEmail, userRole <br/> • Target: targetUser, targetUserName, targetUserRollNo <br/> • Mutation: originalValue, newValue, transition <br/> • Rationale: reason <br/> • Context: method, endpoint, IP, User-Agent"]
    
    EnrichData --> CommitDB["Commit to MongoDB AuditLogs Collection <br/> (req._auditLogged deduplication flag set)"]
    
    CommitDB --> AdminAuditHub["Admin Audit Console (/admin/audit-logs)"]
    
    subgraph AdminConsoleFeatures ["Admin Audit Console Capabilities"]
        AdminAuditHub --> PillFilter["10 Quick-Action Filter Pills (LOGIN to SETTINGS)"]
        AdminAuditHub --> DiffCards["Visual Transition Diff Cards (Absent ➔ Present)"]
        AdminAuditHub --> InspectorModal["Detail Inspector Modal (Actor, Target, JSON)"]
        AdminAuditHub --> ExportCSV["Export Institutional Audit Ledger CSV"]
    end
```

---

## 13. Phase 25 Advanced Notification Engine & Multi-Channel Pipeline

Centralized multi-channel notification engine, user preference filtering, smart recovery mathematics, and fan-out architecture:

```mermaid
flowchart TD
    subgraph CampusEvents ["7 Core Campus Domain Event Triggers"]
        E1["1. ATTENDANCE_MARKED <br/> (Roster / Batch / 30s QR)"]
        E2["2. LOW_ATTENDANCE <br/> (Below 75% Threshold)"]
        E3["3. LEAVE_APPROVED <br/> (Faculty Approval + Notes)"]
        E4["4. LEAVE_REJECTED <br/> (Faculty Rejection + Reason)"]
        E5["5. ANNOUNCEMENT <br/> (Target Role / Dept / Campus)"]
        E6["6. CLASS_CANCELLED <br/> (Session Cancelled Notice)"]
        E7["7. TIMETABLE_CHANGED <br/> (Slot Created / Updated)"]
    end

    CampusEvents --> Dispatcher["notificationService.dispatchNotification() <br/> (notificationService.js)"]

    subgraph SmartRecoveryMath ["Smart Recovery Mathematics Engine"]
        Dispatcher --> MathCheck{"Is Low Attendance Alert <br/> or Recovery Triggered?"}
        MathCheck -- Yes --> RecoveryCalc["Calculate Consecutive Lectures Needed: <br/> x = max(1, ceil((0.75 * T - P) / 0.25)) <br/> Safe Misses: s = max(0, floor((P - 0.75 * T) / 0.75))"]
        RecoveryCalc --> ActionText["Generate Actionable Advice: <br/> 'Your Database Systems attendance is 72%. <br/> You need 2 consecutive attended lectures to reach 75%.'"]
        ActionText --> AttachAdvice["Attach smartAdvice Payload to Notification Object"]
        MathCheck -- No --> PrefFilter
        AttachAdvice --> PrefFilter
    end

    subgraph PreferenceEngine ["User Preferences & Channel Filtering"]
        PrefFilter["Evaluate User Notification Preferences <br/> (user.notificationPreferences.channels & events)"]
        PrefFilter --> Ch1Check{"In-App Enabled & <br/> Event Subscribed?"}
        PrefFilter --> Ch2Check{"Email Enabled & <br/> User Has Email?"}
        PrefFilter --> Ch3Check{"Push Enabled & <br/> FCM Tokens Exist?"}
    end

    subgraph MultiChannelDelivery ["Multi-Channel Delivery Channels"]
        Ch1Check -- Yes --> Ch_InApp["1. IN-APP CHANNEL <br/> • Insert MongoDB Notification Document <br/> • Socket.io emit('notification_received')"]
        Ch2Check -- Yes --> Ch_Email["2. EMAIL CHANNEL <br/> • Generate Branded Dark-Theme HTML Template <br/> • Nodemailer SMTP Dispatch (sendEmail.js)"]
        Ch3Check -- Yes --> Ch_Push["3. PUSH NOTIFICATION CHANNEL <br/> • Firebase Admin SDK FCM Web Push <br/> • Service Worker (firebase-messaging-sw.js)"]
    end

    subgraph ClientRendering ["Client UI Presentation Hub"]
        Ch_InApp --> UI1["Floating Toast Alert + Sound Chime (ToastContainer.jsx)"]
        Ch_InApp --> UI2["Top Header Unread Badge Counter & Drawer (Header.jsx)"]
        Ch_InApp --> UI3["Interactive Notifications Hub (/student/notifications) <br/> • Smart Recovery Callout Banner <br/> • 6 Category Tabs <br/> • Delivery Badges (In-App, Email, Push) <br/> • Preferences Modal & Live Test Simulator"]
        Ch_Email --> UI4["Recipient University Email Inbox (HTML Email with Smart Advice Table)"]
        Ch_Push --> UI5["System Desktop / Mobile Web Push Alert"]
    end
```

---

## 14. Phase 26 Attendance Forecasting Engine & Scenario Simulator

Comprehensive architecture of the Mathematical Forecasting Engine, 3 interactive scenario calculators, milestone ladder, and Natural Language AI Assistant routing:

```mermaid
flowchart TD
    subgraph InputSources ["User Inputs & Query Entrypoints"]
        I1["Student Live Enrolled Subjects <br/> (MongoDB Attendance Records)"]
        I2["Interactive Forecasting Hub <br/> (client/src/pages/student/AttendancePrediction.jsx)"]
        I3["Natural Language AI Chatbot / Widget <br/> ('Can I skip 2 classes?', 'How many can I miss?')"]
        I4["Custom Sandbox Parameters <br/> (P attended, T total, Target R%, Future F)"]
    end

    InputSources --> EngineGateway["Attendance Forecasting Engine Core <br/> (server/src/utils/forecastingEngine.js)"]

    subgraph CoreCalculators ["3 Mathematical Forecasting Models"]
        EngineGateway --> Calc1["1. Recovery Calculator (How Many Must I Attend?) <br/> x = max(0, ceil((R*T - 100*P) / (100 - R)))"]
        EngineGateway --> Calc2["2. Safe Miss Allowance (How Many Can I Miss?) <br/> m = max(0, floor((100*P - R*T) / R))"]
        EngineGateway --> Calc3["3. Scenario Simulator (Can I Skip?) <br/> Projected % = ((P + a) / (T + a + b)) * 100"]
    end

    subgraph ScenarioEvaluation ["Scenario Evaluation & Risk Classification"]
        Calc3 --> CondCheck{"Is Projected % >= Target R%?"}
        CondCheck -- Yes --> SafeBranch["Status: SAFE / BORDERLINE <br/> • Remaining buffer = floor((100*(P+a) - R*(T+a+b)) / R) <br/> • 'Safe to skip! Attendance remains above target.'"]
        CondCheck -- No --> RiskBranch["Status: DEFICIT_WARNING / CRITICAL_DROP <br/> • Penalty needed = ceil((R*(T+a+b) - 100*(P+a)) / (100 - R)) <br/> • 'Skipping drops you below target! Recovery needed.'"]
    end

    subgraph ProjectionsAndMilestones ["Semester Trajectories & Milestones"]
        EngineGateway --> Milestones["Milestone Trajectory Ladder <br/> • 75% Benchmark <br/> • 80% Benchmark <br/> • 85% Benchmark <br/> • 90% Benchmark <br/> • 95% Benchmark"]
        EngineGateway --> Trajectories["Future Classes Simulations (F remaining) <br/> • 100% Future Attendance (Best Case Max %) <br/> • Target% Future Attendance (Projected %) <br/> • 50% Future Attendance (Moderate Shortage %) <br/> • 0% Future Attendance (Worst Case Floor %)"]
    end

    subgraph ClientUIPresentation ["Client Presentation & NLP Chatbot Responses"]
        SafeBranch --> UI_Hub["Forecasting Hub UI: <br/> • 'Can I Skip?' Interactive Dial <br/> • Safe Miss Cards per Subject <br/> • Recovery Planner Table <br/> • Milestone Ladder Grid"]
        RiskBranch --> UI_Hub
        Milestones --> UI_Hub
        Trajectories --> UI_Hub
        
        Calc1 --> AICards["AI Chatbot Cards: <br/> • must_attend_card <br/> • miss_allowance_card <br/> • can_skip_card <br/> • forecast_summary_card"]
        Calc2 --> AICards
        Calc3 --> AICards
    end
```

---

## 15. Phase 27 Personal Student Analytics & Visual Threshold Engine

End-to-end data aggregation pipeline from database entities, calculating the 9 core analytical metrics and rendering the visual attendance curve with the 75% minimum benchmark line:

```mermaid
flowchart TD
    subgraph DataSources ["Database Record Sources"]
        AR["Attendance Collection <br/> (Status, Date, Subject, Student)"]
        LR["Leave Collection <br/> (Type, Status, Start/End Date)"]
        SR["Subject Collection <br/> (Codes, Names, Teachers, Colors)"]
        RR["AttendanceRule System Rules <br/> (Weights, 7-Status Matrix, 75% Min)"]
    end

    DataSources --> EngineCore["Student Analytics Engine <br/> (server/src/utils/studentAnalyticsEngine.js)"]

    subgraph MetricsComputation ["9 Core Metrics Calculation"]
        EngineCore --> M1["1. Overall Attendance <br/> • Weighted % Score <br/> • Raw % Score <br/> • Exam Eligibility (>75%) <br/> • Delta to 75% Minimum"]
        EngineCore --> M2["2. Subject Breakdown <br/> • Per-Subject Attendance % <br/> • Safe Miss Allowance (m) <br/> • Consecutive Recovery Needed (x) <br/> • Color & Health Status"]
        EngineCore --> M3["3. Weekly Velocity (W1-W6) <br/> • Conducted vs Attended <br/> • Week-over-week Delta % <br/> • 75% Minimum Reference Line"]
        EngineCore --> M4["4. Monthly Progression <br/> • Multi-Month Timeline <br/> • Present, Absent, Late Counts <br/> • 75% Minimum Comparison"]
        EngineCore --> M5["5. Best Subject Detection <br/> • Highest Attendance Rate <br/> • Safety Cushion Above Minimum"]
        EngineCore --> M6["6. Worst Subject Alert <br/> • Lowest Attendance Rate <br/> • Deficit Gap & Recovery Count"]
        EngineCore --> M7["7. Late Count Deep Dive <br/> • Punctuality Score <br/> • 0.8x Rule Weight Impact"]
        EngineCore --> M8["8. Absent Count & Rate <br/> • Total Unexcused Absences <br/> • Course Absence Distribution"]
        EngineCore --> M9["9. Leave Tracking <br/> • Approved & Pending Requests <br/> • Medical, Duty, Emergency Types"]
    end

    subgraph VisualCurveEngine ["Visual Attendance Curve & 75% Minimum Benchmark Engine"]
        M4 --> CurvePoints["Monthly Attendance Curve Points <br/> (Jun: 83.3%, Jul: 92.5%, Aug: 88.0%)"]
        RR --> MinLine["75% Minimum Benchmark Horizontal Line"]
        CurvePoints --> VisualRenderer["Dual-Engine Chart Renderer <br/> • Recharts Spline AreaChart <br/> • Chart.js Tension Area Curve <br/> • Retro-Modern Visual Matrix Card"]
        MinLine --> VisualRenderer
    end

    subgraph ClientDashboard ["Student Personal Analytics UI (/student/analytics)"]
        M1 --> KPI["Top KPI Highlight Cards Grid"]
        M5 --> KPI
        M6 --> KPI
        M7 --> StatusGrid["Status Trio Cards Grid"]
        M8 --> StatusGrid
        M9 --> StatusGrid
        M2 --> SubjectExplorer["Subject Attendance Matrix & Filter Tabs"]
        M3 --> WeeklyRibbon["Weekly Velocity Progression Ribbon"]
        VisualRenderer --> VisualSection["Visual Attendance Curve & 75% Minimum Section"]
    end
```

---

## 16. Phase 28: Teacher Analytics & Classroom Insights Engine

```mermaid
flowchart TB
    subgraph DataSources ["Database & Query Layer"]
        TeacherUser["Teacher Identity & Assigned Subjects <br/> User Model"]
        AttendanceLogs["Class Attendance Records <br/> (Status: Present, Absent, Late)"]
        ClassSessions["Class Schedules & Divisions <br/> Class & Division Models"]
        SysRules["Attendance Rules Engine <br/> (0.8x Late Weight, 75% Min)"]
    end

    subgraph AnalyticsEngine ["Teacher Analytics Engine (teacherAnalyticsEngine.js)"]
        TeacherUser --> FilterPipeline["Query & Scope Filter <br/> • Subject Code <br/> • Division/Section <br/> • Timeframe (30d / Semester)"]
        AttendanceLogs --> FilterPipeline
        ClassSessions --> FilterPipeline
        SysRules --> FilterPipeline

        FilterPipeline --> Dim1["1. Average Class Attendance <br/> • Weighted Percentage Rate <br/> • Benchmark Comparison (+Delta)"]
        FilterPipeline --> Dim2["2. Most Absent Students <br/> • Ranked Defaulters Directory <br/> • Shortage Deficit Math: x = ceil((rT - P)/(1 - r))"]
        FilterPipeline --> Dim3["3. Most Late Students <br/> • Chronic Late Arrival Tracking <br/> • Punctuality Tier Classification"]
        FilterPipeline --> Dim4["4. Attendance by Lecture Slot <br/> • Morning Peak (10:15 AM: 89%) <br/> • Post-Lunch Drop (1:30 PM: 73%)"]
        FilterPipeline --> Dim5["5. Weekday Attendance Patterns <br/> • Mon 82%, Tue 91%, Wed 76%, Thu 88% <br/> • Friday Slump Detection (69%)"]
        FilterPipeline --> Dim6["6. Subject-Wise Attendance <br/> • CS401, CS405, CS502 Breakdown <br/> • Health Status: Healthy / At Risk"]
        FilterPipeline --> Dim7["7. Division Comparison <br/> • Sec A vs Sec B vs Sec C <br/> • Cross-Section Variance from Leader"]
    end

    subgraph BehavioralDetector ["Behavioral Pattern Engine & Advisory"]
        Dim5 --> DropDetector{"Friday Drop <br/> <= -5% from Avg?"}
        DropDetector -- Yes --> FridayAlert["⚠️ Poor Friday Attendance Pattern Alert <br/> (-12.2% below weekly average)"]
        DropDetector -- No --> NormalPattern["Stable Weekly Pattern"]
        FridayAlert --> ActionableAdvice["Pedagogical Intervention: <br/> Schedule interactive problem-solving labs or graded quizzes on Fridays"]
    end

    subgraph UIOutputs ["Faculty Presentation Interfaces"]
        Dim1 --> DashWidget["Teacher Dashboard Preview (/teacher) <br/> • Monday to Friday Pattern Strip <br/> • Friday Slump Alert Pill <br/> • Quick Metric Cards"]
        FridayAlert --> DashWidget
        
        Dim1 --> FullHub["Teacher Analytics Hub (/teacher/analytics) <br/> • Subject, Division, Timeframe Selectors <br/> • Weekday Bar Chart with 75% Reference Line <br/> • Lecture Slot Hourly Breakdown <br/> • Defaulter Recovery Math & Tables <br/> • Division Comparison Progress Gauges <br/> • Multi-Column CSV Summary Export"]
        Dim2 --> FullHub
        Dim3 --> FullHub
        Dim4 --> FullHub
        Dim5 --> FullHub
        Dim6 --> FullHub
        Dim7 --> FullHub
        ActionableAdvice --> FullHub
    end
```

---

## 17. Phase 29: Admin Intelligence Dashboard & College Control Center Dataflow

```mermaid
flowchart TD
    subgraph DataSources ["Institutional Big Data Telemetry"]
        DB_Users[("User Collection <br/> (Students: 2,481, Faculty: 143)")]
        DB_Attend[("Attendance Collection <br/> (Today: 87.4% Rate)")]
        DB_Depts[("Department Collection <br/> (6 Active Depts: CSE, IT, etc.)")]
        DB_Divs[("Division Collection <br/> (11 Class Sections)")]
        DB_Leaves[("Leave Collection <br/> (184 Total, 26 Pending)")]
        DB_Sessions[("AttendanceSession Collection <br/> (Daily Schedules & Scanners)")]
    end

    subgraph IntelligenceEngine ["Admin Intelligence Engine (adminIntelligenceEngine.js)"]
        Aggregator["Real-Time Aggregator & Fallback Synthesis"]
        DB_Users --> Aggregator
        DB_Attend --> Aggregator
        DB_Depts --> Aggregator
        DB_Divs --> Aggregator
        DB_Leaves --> Aggregator
        DB_Sessions --> Aggregator

        Aggregator --> Mod1["1. Executive KPI Summary <br/> • Total Students: 2,481 <br/> • Total Teachers: 143 <br/> • Today's Rate: 87.4% <br/> • Defaulters &lt;75%: 312"]
        Aggregator --> Mod2["2. Cross-Department Benchmark <br/> • Attendance Rankings & Volumes <br/> • Variance vs College Average"]
        Aggregator --> Mod3["3. Division Matrix <br/> • Section Sizes & Mentors <br/> • Today's vs Monthly %"]
        Aggregator --> Mod4["4. Attendance Velocity Trends <br/> • 6-Month 75% Benchmark Curve <br/> • Weekday Slump: Friday 73.1%"]
        Aggregator --> Mod5["5. Defaulter Mathematical Recovery <br/> • x = ceil((0.75T - P)/0.25) <br/> • Severity Tiers: Severe, Critical, Warning"]
        Aggregator --> Mod6["6. Faculty Compliance & Teaching <br/> • 97.5% Conduction & 94.8% Punctuality <br/> • Slot Analysis: Morning, Mid, Afternoon"]
        Aggregator --> Mod7["7. Anti-Proxy Telemetry <br/> • Hardware Fingerprints, GPS, Rapid Scans <br/> • High/Med/Low Risk Score Tiers"]
        Aggregator --> Mod8["8. Leave Statistics & Truancy <br/> • Medical, Duty, Casual, Sports <br/> • Department Load Distribution"]
    end

    subgraph APIChannel ["Secure Admin REST Route"]
        Mod1 --> RouteHandler["GET /api/analytics/admin-intelligence <br/> (protect + authorize('admin'))"]
        Mod2 --> RouteHandler
        Mod3 --> RouteHandler
        Mod4 --> RouteHandler
        Mod5 --> RouteHandler
        Mod6 --> RouteHandler
        Mod7 --> RouteHandler
        Mod8 --> RouteHandler
    end

    subgraph ControlCenterUI ["Admin Intelligence Control Center (/admin)"]
        RouteHandler --> KPICards["Executive ASCII Spec Metric Cards <br/> (Students, Teachers, Today %, Defaulters)"]
        RouteHandler --> TabDept["Department Comparison Bar Charts & Table"]
        RouteHandler --> TabDiv["Division Grid & Mentor Status"]
        RouteHandler --> TabTrend["6-Month Curve & Weekday Progression"]
        RouteHandler --> TabDef["Defaulter Table & Bulk Alert Dispatcher"]
        RouteHandler --> TabFac["Faculty Leaderboard & Teaching Compliance"]
        RouteHandler --> TabSec["Anti-Proxy Scanner Live Feeds"]
        RouteHandler --> TabLeave["Leave Category Ratios & Truancy Charts"]

        TabDef --> Action1["⚡ One-Click Bulk Defaulter Alerts"]
        RouteHandler --> Action2["📄 Export Institutional CSV Report"]
    end
```

---

## 18. Phase 30: Automated Defaulter Management & Escalation Pipeline

```mermaid
flowchart TD
    subgraph TriggerLayer ["1. Trigger Event & Evaluation Scope"]
        LiveMark["Class Attendance Marked / Self Check-In / CSV Upload"]
        BatchJob["Automated / Admin Batch Evaluation (POST /api/defaulters/evaluate)"]
        LiveMark --> DefaulterService["Defaulter Service Engine (defaulterService.js)"]
        BatchJob --> DefaulterService
    end

    subgraph ConfigLayer ["2. Configurable Institutional Rules (AttendanceRule)"]
        RuleConfig["defaulterConfig Object <br/> • Warning: &lt; 75% <br/> • Serious Warning: &lt; 70% <br/> • Admin Alert: &lt; 65% <br/> • Parent Alert: &lt; 60% <br/> • Min Classes Required: 5"]
        RuleConfig -.-> DefaulterService
    end

    subgraph MathPipeline ["3. Mathematical Classification & Recovery Deficit"]
        DefaulterService --> EvalStatus{"Cumulative Attendance <br/> vs Thresholds"}
        EvalStatus -- ">= 75%" --> AutoResolve["Auto-Resolve / Clear Defaulter <br/> • Status: resolved <br/> • Recovery Timestamp & Audit"]
        EvalStatus -- "< 75%" --> CalcRecovery["Recovery Classes Math: <br/> x = ceil((rT - P) / (1 - r)) <br/> where r = 0.75"]
        CalcRecovery --> TierClassifier{"Tier Classification"}
        
        TierClassifier -- "< 75% and >= 70%" --> Tier1["Tier 1: Warning <br/> (Status: Active)"]
        TierClassifier -- "< 70% and >= 65%" --> Tier2["Tier 2: Serious Warning <br/> (Status: Warning)"]
        TierClassifier -- "< 65% and >= 60%" --> Tier3["Tier 3: Admin Alert <br/> (High-Priority Watchlist)"]
        TierClassifier -- "< 60%" --> Tier4["Tier 4: Parent Alert <br/> (Critical Escalation)"]
    end

    subgraph RecordLedger ["4. DefaulterRecord Persistence & Audit"]
        Tier1 --> UpsertRecord[("DefaulterRecord Collection <br/> • student, tier, deficit, status <br/> • escalationHistory: [{ tier, timestamp, reason }]")]
        Tier2 --> UpsertRecord
        Tier3 --> UpsertRecord
        Tier4 --> UpsertRecord
        AutoResolve --> UpsertRecord
    end

    subgraph DispatchLayer ["5. Progressive Multi-Channel Notifications"]
        Tier1 --> StudentInApp["Student In-App & Push Notification <br/> ('Attendance dropped below 75%')"]
        Tier2 --> StudentWarningBanner["Student Dashboard Warning Banner <br/> + Mentor Counseling Callout"]
        Tier3 --> AdminDashboardAlert["Admin Intelligence Watchlist Badge <br/> + HOD Escalation Notice"]
        Tier4 --> ParentEmailDispatch["Automated Responsive HTML Parent Email <br/> • Recipient: guardianEmail <br/> • Deficit Recovery Math Included <br/> • Debarment Prevention Advisory"]
    end

    subgraph AdminConsoleUI ["6. Admin Defaulter Management Console (/admin/defaulters)"]
        UpsertRecord --> DefaulterConsole["Admin Defaulter Console <br/> • Dynamic Threshold Sliders (75/70/65/60) <br/> • Searchable Roster with Tier Badges <br/> • One-Click Bulk Warning Dispatch <br/> • Timeline Modal with Transition History <br/> • Counselor Resolution & Clearance Modal <br/> • Multi-Column CSV Export"]
        DefaulterConsole --> CounselorAction["Resolution Ledger: <br/> Record Counselor Notes & Mark Resolved"]
        CounselorAction --> UpsertRecord
    end
```

---

## 19. Phase 31: Parent/Guardian Portal & Ward Monitoring Lifecycle

The Phase 31 Parent/Guardian Portal provides transparent, real-time academic visibility for family members, governed by a strict server-side read-only security boundary:

```mermaid
flowchart TD
    subgraph AuthPortal ["1. Parent Authentication & Multi-Ward Context"]
        PLogin["Parent Logs In (POST /api/auth/login) <br/> Role: 'parent'"] --> PWards["Fetch Linked Wards (GET /api/parent/wards)"]
        PWards --> PSelectWard["Parent Selects Active Ward (e.g., CS2024001)"]
        LinkNew["Link Additional Ward <br/> (POST /api/parent/link-ward with studentRollNo)"] -.-> PWards
    end

    subgraph DataReadLayer ["2. Read-Only Academic & Attendance Aggregation"]
        PSelectWard --> ReqOverview["GET /api/parent/overview <br/> • Cumulative Attendance % <br/> • 75% Benchmark Zone <br/> • Total/Attended/Absent/Late Counts"]
        PSelectWard --> ReqHistory["GET /api/parent/attendance <br/> • Granular Day Logs <br/> • Date / Status Filters"]
        PSelectWard --> ReqSubjects["GET /api/parent/subjects <br/> • Course Breakdown <br/> • Consecutive Recovery Math <br/> • Safe Miss Allowance"]
        PSelectWard --> ReqLeaves["GET /api/parent/leaves <br/> • Medical Certificates & Proofs <br/> • Teacher Remarks & Status"]
        PSelectWard --> ReqWarnings["GET /api/parent/warnings <br/> • 4-Tier Defaulter Status <br/> • Counseling Directory Contacts"]
        PSelectWard --> ReqNotifs["GET /api/parent/notifications <br/> • Low Attendance Alerts <br/> • University Circulars"]
    end

    subgraph ReadOnlySecurityGate ["3. Strict Read-Only Security Gate (Server Middleware)"]
        ParentActor["Parent User Token (role: 'parent')"]
        
        ParentActor -.-> TryMark["Attempt: POST /api/attendance <br/> (Mark Student Attendance)"]
        ParentActor -.-> TryEdit["Attempt: PUT /api/attendance/:id <br/> (Edit Attendance Log)"]
        ParentActor -.-> TryDelete["Attempt: DELETE /api/attendance/:id <br/> (Delete Attendance Log)"]
        ParentActor -.-> TryApplyLeave["Attempt: POST /api/leaves <br/> (Submit Leave Request)"]
        ParentActor -.-> TryApproveLeave["Attempt: PUT /api/leaves/:id/status <br/> (Approve/Reject Leave)"]
        ParentActor -.-> TryQRScan["Attempt: POST /api/attendance/scan-qr <br/> (Scan QR Attendance)"]

        TryMark --> AuthCheck{"authorize('teacher', 'admin')"}
        TryEdit --> AuthCheck
        TryDelete --> AuthCheck
        TryApplyLeave --> AuthStudentOnly{"authorize('student')"}
        TryApproveLeave --> AuthCheck
        TryQRScan --> AuthStudentOnly

        AuthCheck -- "role === 'parent'" --> ForbiddenResponse["⛔ 403 Forbidden: Access Denied <br/> Parents Have Strict Read-Only Access"]
        AuthStudentOnly -- "role === 'parent'" --> ForbiddenResponse
    end

    subgraph ParentUI ["4. Parent Portal UI (React 18 SPA)"]
        ReqOverview --> UIPage1["Parent Dashboard (/parent) <br/> • Overall Gauge & 75% Alert Banner <br/> • Ward Profile Card & Quick Stats"]
        ReqHistory --> UIPage2["Parent Attendance History (/parent/attendance) <br/> • Interactive Filters & Status Pills"]
        ReqSubjects --> UIPage3["Parent Subject Hub (/parent/subjects) <br/> • Recovery Deficit & Safe Miss Badges"]
        ReqLeaves --> UIPage4["Parent Leaves Monitor (/parent/leaves) <br/> • Proof Previews & Official Reasons"]
        ReqWarnings --> UIPage5["Parent Defaulter Escalation (/parent/warnings) <br/> • Tier Visual Gauge & Counselor Hotline"]
        ReqNotifs --> UIPage6["Parent Notifications (/parent/notifications) <br/> • Unread Filter & Audio Chime Alerts"]
    end
```

---

## 20. Phase 31: Document Verification & Security Storage Pipeline

### 20A. End-to-End Multi-Tier Document Verification Workflow
Process flow from student submission through faculty review to final administrative sanction:

```mermaid
flowchart TD
    subgraph StudentStage ["1. Student Submission & Upload Stage"]
        Student["Student (/student/leave)"] --> SelectFile["Select Document File <br/> (PDF, JPG, PNG | &le; 5MB)"]
        SelectFile --> ClientCheck{"Client Size Check <br/> &le; 5MB?"}
        ClientCheck -- No --> ClientAlert["❌ Reject: File Exceeds 5MB Limit"]
        ClientCheck -- Yes --> PostUpload["POST /api/leaves/upload-document <br/> (Multipart Form-Data)"]
        PostUpload --> ApplyLeave["POST /api/leaves <br/> (Create Leave Record)"]
        ApplyLeave --> InitStage["Init Leave Record <br/> • verificationStage: 'teacher_review' <br/> • status: 'Pending'"]
    end

    subgraph SecurityGate ["2. Server Security & Threat Scanning Gate"]
        PostUpload --> MulterCheck{"Multer Extension Filter <br/> .pdf, .jpg, .jpeg, .png?"}
        MulterCheck -- No --> ErrExt["❌ 400 Bad Request: Unsupported Extension"]
        MulterCheck -- Yes --> SaveTmp["Store in server/secure_uploads/documents/ <br/> (Cryptographic Filename)"]
        
        SaveTmp --> MagicCheck{"Binary Magic-Byte Check <br/> (%PDF-, \\x89PNG, \\xFF\\xD8\\xFF)"}
        MagicCheck -- No --> Quarantine1["⚠️ Spoof Detected! Unlink File <br/> 400 Bad Request: Magic Byte Mismatch"]
        
        MagicCheck -- Yes --> MalwareScan{"Heuristic Antivirus Scan <br/> • EICAR Signature Check <br/> • Disguised Executable (MZ/ELF) <br/> • Script Tags (<script, eval) <br/> • PDF /Launch Exploits"}
        MalwareScan -- Threat Detected --> Quarantine2["🚨 Malware Flagged! <br/> • Unlink & Quarantine File <br/> • Log DOCUMENT_MALWARE_FLAGGED <br/> • 400 Bad Request: Threat Blocked"]
        MalwareScan -- Clean --> ComputeHash["✅ File Validated Clean <br/> • Compute SHA-256 Checksum <br/> • Set scanStatus: 'CLEAN' <br/> • Set scanEngine: 'Antigravity Heuristic Engine'"]
        ComputeHash --> ApplyLeave
    end

    subgraph TeacherReviewStage ["3. Teacher / Mentor Review Stage"]
        InitStage --> TeacherRoster["Teacher Leave Roster (/teacher/leave)"]
        TeacherRoster --> TeacherInspect["Teacher Inspects Leave & Document <br/> (GET /api/leaves/:id/document-token)"]
        TeacherInspect --> TeacherModal["Private In-App Preview Modal <br/> (Inline PDF / Image Viewer)"]
        TeacherModal --> TeacherDecision{"Teacher Review Action"}
        
        TeacherDecision -- Approve & Forward --> FwdAdmin["PUT /api/leaves/:id/teacher-review <br/> • Action: 'approve' <br/> • verificationStage: 'admin_verification' <br/> • status: 'Teacher Verified' <br/> • Log TEACHER_VERIFY_LEAVE"]
        TeacherDecision -- Reject --> TeacherReject["PUT /api/leaves/:id/teacher-review <br/> • Action: 'reject' <br/> • verificationStage: 'rejected' <br/> • status: 'Rejected' <br/> • Teacher Remarks Recorded"]
    end

    subgraph AdminVerificationStage ["4. Central Admin Verification Console"]
        FwdAdmin --> AdminConsole["Admin Document Verification (/admin/document-verification)"]
        AdminConsole --> AdminInspect["Admin Inspects Document Telemetry <br/> (SHA-256 Hash, Scan Status, File Size)"]
        AdminInspect --> ReScan{"Optional On-Demand Re-Scan <br/> (POST /api/leaves/:id/rescan)"}
        ReScan --> AdminConsole
        AdminInspect --> AdminDecision{"Admin Sanction Action"}
        
        AdminDecision -- Sanction & Approve --> FinalApprove["PUT /api/leaves/:id/admin-verify <br/> • Action: 'approve' <br/> • verificationStage: 'completed' <br/> • status: 'Approved' <br/> • Attendance Adjustment Authorized <br/> • Log ADMIN_VERIFY_LEAVE"]
        AdminDecision -- Deny --> FinalReject["PUT /api/leaves/:id/admin-verify <br/> • Action: 'reject' <br/> • verificationStage: 'rejected' <br/> • status: 'Rejected' <br/> • Official Administrative Remarks"]
    end

    subgraph NotificationBroadcast ["5. Automated Notification Dispatch"]
        FinalApprove --> NotifyStudent["Notify Student: Leave Approved ✅ <br/> (In-App + Push + Email)"]
        FinalApprove --> NotifyParent["Notify Parent: Ward Leave Approved <br/> (Read-Only Leaves Monitor)"]
        TeacherReject --> NotifyReject["Notify Student: Leave Rejected ❌"]
        FinalReject --> NotifyReject
    end
```

### 20B. Document Security, Binary Magic-Byte Inspection & Private Token Streaming Pipeline
Detailed architecture of the binary inspection, isolated storage, and temporary signed streaming subsystem:

```mermaid
flowchart LR
    subgraph ClientReq ["1. Client Request"]
        UserBrowser["Authenticated User <br/> (Student / Teacher / Admin / Parent)"]
        UserBrowser --> ReqToken["Request Preview Token <br/> (GET /api/leaves/:id/document-token)"]
    end

    subgraph AuthTokenServer ["2. Token Signing Engine (Server)"]
        ReqToken --> VerifyAccess{"Check User Rights: <br/> • Student Owner? <br/> • Teacher of Dept? <br/> • Admin Role? <br/> • Linked Parent of Ward?"}
        VerifyAccess -- No --> Return403["403 Forbidden"]
        VerifyAccess -- Yes --> SignJWT["Sign HMAC/JWT Token: <br/> • leaveId, userId, filePath, mimeType <br/> • Expires in 15 Minutes (900s)"]
        SignJWT --> TokenResp["Return token & secureStreamUrl"]
    end

    subgraph StreamPipe ["3. Private Secure Stream Engine"]
        TokenResp --> UserBrowser
        UserBrowser --> StreamReq["Inline Display Request: <br/> GET /api/leaves/document-stream/:token"]
        StreamReq --> TokenVerify{"Verify JWT Token <br/> & Expiry Window"}
        TokenVerify -- Expired / Invalid --> Return401["401 Unauthorized / Token Expired"]
        TokenVerify -- Valid --> ResolvePath["Resolve Isolated File Path: <br/> server/secure_uploads/documents/doc-*.ext"]
        ResolvePath --> CheckDisk{"File Exists <br/> on Disk?"}
        CheckDisk -- No --> Return404["404 Not Found"]
        CheckDisk -- Yes --> SendHeaders["Set Security Headers: <br/> • Content-Type: application/pdf | image/* <br/> • Content-Disposition: inline <br/> • X-Content-Type-Options: nosniff <br/> • Cache-Control: private, no-store"]
        SendHeaders --> StreamData["Pipe Binary ReadStream to Response"]
        StreamData --> RenderPreview["Secure In-App Preview Rendered <br/> (No Auth Headers Leaked in Browser URL)"]
    end
```

---

## 21. Phase 33: Progressive Web App (PWA) & Mobile Architecture

### 21A. Service Worker Caching, Offline Shell & Network Lifecycle
Architecture of the Service Worker caching layer, navigation fallback, and reactive online/offline detection:

```mermaid
flowchart TD
    subgraph ClientInit ["1. Client Launch & Registration"]
        BrowserWindow["Mobile / Desktop Browser"] --> MainJSX["main.jsx Bootloader"]
        MainJSX --> RegSW{"'serviceWorker' in navigator?"}
        RegSW -- Yes --> Register["navigator.serviceWorker.register('/sw.js')"]
        Register --> InstallEvent["SW 'install' Event Triggered"]
        InstallEvent --> PreCache["Pre-cache Static App Shell: <br/> • '/', '/index.html' <br/> • '/offline.html' <br/> • '/manifest.webmanifest' <br/> • Vector & Raster Icons (/icons/*)"]
        PreCache --> ActivateEvent["SW 'activate' Event Triggered"]
        ActivateEvent --> CleanOld["Purge Stale Cache Versions <br/> Activate 'campusattend-v1'"]
    end

    subgraph FetchPipeline ["2. Intelligent Multi-Strategy Fetch Interceptor"]
        BrowserWindow --> UserRequest["HTTP Request (Fetch Event)"]
        UserRequest --> ReqType{"Request Classification"}
        
        ReqType -- "Static Asset (JS, CSS, Font, Img)" --> CacheFirst["Cache-First Strategy <br/> (caches.match(event.request))"]
        CacheFirst --> AssetInCache{"Found in Cache?"}
        AssetInCache -- Yes --> ReturnCachedAsset["Return Cached Asset (0ms Latency)"]
        AssetInCache -- No --> FetchNetAsset["Fetch from Network & Save to Cache"]
        FetchNetAsset --> ReturnNetAsset["Return Asset to Client"]

        ReqType -- "Navigation (mode === 'navigate')" --> NetFirst["Network-First Strategy <br/> (fetch(event.request))"]
        NetFirst --> NetAlive{"Network Online?"}
        NetAlive -- Yes --> ReturnHTML["Return Fresh Page HTML <br/> Update Cache Copy"]
        NetAlive -- No --> MatchShell{"Cached Shell <br/> Available?"}
        MatchShell -- Yes --> ReturnShell["Return Pre-cached Page Shell"]
        MatchShell -- No --> ReturnOfflineHTML["Serve Glassmorphic offline.html <br/> (Offline Fallback Page)"]

        ReqType -- "API Mutation (POST/PUT/DELETE)" --> ApiGuard["API Request Interceptor"]
        ApiGuard --> ApiOnline{"Network Online?"}
        ApiOnline -- Yes --> PassApi["Forward to Backend REST API"]
        ApiOnline -- No --> OfflineJSON["Return 503 JSON: <br/> { offline: true, message: 'Currently offline...' }"]
    end

    subgraph ConnectivityTelemetry ["3. Reactive Network State Machine"]
        WindowEvents["window.addEventListener('online' / 'offline')"] --> NetHook["useNetworkStatus() Hook"]
        NetHook --> OfflineToast["OfflineBanner.jsx Component <br/> • Floating Glassmorphic Alert <br/> • Auto-hides on Reconnection"]
        NetHook --> RetryTrigger["User Clicks 'Retry Connection'"]
        RetryTrigger --> NetFirst
    end
```

### 21B. Device Camera Hardware QR Scanner & Dual Detection Pipeline
Complete process flow from user interaction to hardware video streaming, dual barcode analysis, sensor telemetry, and attendance submission:

```mermaid
flowchart TD
    subgraph TriggerStage ["1. Scanner Launch & Hardware Permissions"]
        UserAction["Student Taps 'Scan QR' <br/> (MobileBottomNav / Dashboard)"] --> OpenModal["Open StudentQRScannerModal.jsx"]
        OpenModal --> ReqMedia["Request Device Camera: <br/> navigator.mediaDevices.getUserMedia <br/> { video: { facingMode: 'environment' } }"]
        ReqMedia --> PermGranted{"Camera Permission Granted?"}
        PermGranted -- Denied --> FallbackTab["Switch to Manual Token Tab <br/> (Direct String Input)"]
        PermGranted -- Granted --> VideoStream["Bind HTML5 &lt;video&gt; Stream"]
    end

    subgraph HardwareControls ["2. Real-Time Camera Hardware Controls"]
        VideoStream --> LensToggle{"User Taps Lens Switcher"}
        LensToggle --> SwitchFacing["Toggle facingMode: <br/> 'environment' &harr; 'user'"]
        SwitchFacing --> ReqMedia

        VideoStream --> TorchToggle{"User Taps Flashlight"}
        TorchToggle --> ApplyTorch["track.applyConstraints <br/> { advanced: [{ torch: true/false }] }"]
    end

    subgraph DualDetectionEngine ["3. Dual-Engine Barcode Analysis Pipeline"]
        VideoStream --> FrameLoop["RequestAnimationFrame Scan Loop <br/> (Render Frame to Hidden &lt;canvas&gt;)"]
        FrameLoop --> CheckNative{"window.BarcodeDetector <br/> Supported?"}
        
        CheckNative -- Yes (Chromium/Android) --> NativeScan["Native BarcodeDetector Engine <br/> (Hardware Accelerated)"]
        NativeScan --> NativeResult{"QR Code Detected?"}
        
        CheckNative -- No (Safari/iOS/Firefox) --> JsQRScan["Pure-JS jsQR Engine <br/> (Analyze Canvas ImageData)"]
        JsQRScan --> JsResult{"QR Code Detected?"}

        NativeResult -- No --> FrameLoop
        JsResult -- No --> FrameLoop

        NativeResult -- Yes --> ExtractToken["Extract Decoded Token String"]
        JsResult -- Yes --> ExtractToken
    end

    subgraph SensoryFeedback ["4. Sensory Confirmation & Payload Packaging"]
        ExtractToken --> AudioFeedback["HTML5 Web Audio API: playScanBeep() <br/> (880Hz Sine Wave Acoustic Chime)"]
        ExtractToken --> VisualLaser["Animate Laser Sweep & Lock Reticle <br/> (.animate-scan-laser)"]
        ExtractToken --> GetLocation["Query Geolocation: <br/> navigator.geolocation.getCurrentPosition()"]
        ExtractToken --> GetFingerprint["Query Device Fingerprint & IP Cluster"]
        
        GetLocation --> PackagePayload["Package Attendance Submission Payload: <br/> { qrToken, latitude, longitude, deviceFingerprint }"]
        GetFingerprint --> PackagePayload
    end

    subgraph ServerSubmission ["5. Backend Verification & Attendance Marking"]
        PackagePayload --> PostApi["POST /api/attendance/scan-qr"]
        PostApi --> ServerVerify{"Backend Anti-Proxy Engine: <br/> • 30s Dynamic Secret Valid? <br/> • Within 500m Campus Geofence? <br/> • Active Attendance Session? <br/> • Device Collision Free?"}
        ServerVerify -- Valid --> SuccessUI["Display Emerald Checkmark Confirmed <br/> • Auto-close modal after 2.4s <br/> • Update Attendance Score %"]
        ServerVerify -- Invalid --> ErrorUI["Display Risk Warning / Error Banner <br/> Allow Rescan after 3.0s"]
    end
```

---

## 22. Phase 34 Offline Attendance Sync & Multi-Strategy Conflict Resolution Flow

Complete lifecycle showing local offline attendance recording in browser IndexedDB, automatic background reconnection sync, and multi-strategy conflict resolution:

```mermaid
flowchart TD
    subgraph OfflineRecordingStage ["1. Classroom Attendance Taking (Local-First)"]
        TeacherUI["Teacher Opens TakeAttendance.jsx <br/> (Selects Course CS401 & Section A)"] --> CheckCache{"Cached Roster in <br/> IndexedDB rosterCache?"}
        CheckCache -- Yes --> LoadLocal["Render Pre-Cached Student Roster"]
        CheckCache -- No --> LoadDefault["Render Default Student Roster <br/> (Pre-cache in IndexedDB)"]
        
        LoadLocal --> MarkRoster["Instructor Marks Roster <br/> (Present / Absent / Late / Remarks)"]
        LoadDefault --> MarkRoster
        
        MarkRoster --> ClickSubmit["Click 'Submit Class Attendance'"]
        ClickSubmit --> CheckOnline{"navigator.onLine <br/> Connectivity Status?"}
        
        CheckOnline -- Offline --> QueueItem["Enqueues Batch to IndexedDB: <br/> • Database: CampusAttendOfflineDB <br/> • Store: attendanceQueue <br/> • Stamped with ISO clientTimestamp"]
        CheckOnline -- Online --> TryDirect["Attempt Direct Server Submission <br/> POST /api/attendance/offline-sync"]
        TryDirect -- Network Dropout --> QueueItem
    end

    subgraph AutoSyncPipeline ["2. Reconnection & Auto-Sync Pipeline"]
        QueueItem --> SavedToast["Display Amber Offline Toast: <br/> 'Records safely queued locally'"]
        SavedToast --> AwaitNet["Wait for Connection Restored"]
        AwaitNet --> OnlineEvent["window.addEventListener('online')"]
        OnlineEvent --> DebounceNet["1.5s Network Stability Debounce"]
        DebounceNet --> TriggerSync["OfflineSyncContext: syncAllPending()"]
        TriggerSync --> PostSync["POST /api/attendance/offline-sync <br/> { batchId, records, conflictStrategy: 'detect_only' }"]
    end

    subgraph ServerConflictEngine ["3. Backend Conflict Detection Engine"]
        PostSync --> QueryServer["Query Server Database: <br/> • Existing Attendance on date/subject? <br/> • Approved Student Leaves in Leave model?"]
        QueryServer --> DiffCheck{"Status Difference <br/> or Discrepancy?"}
        
        DiffCheck -- No Conflict --> CleanCommit["Commit All Records to MongoDB <br/> isOfflineSynced: true, conflictResolution: 'NONE'"]
        DiffCheck -- Conflict Detected --> SplitItems["Commit Clean Records & Flag Conflicts: <br/> • Local Record: Status, Timestamp, Notes <br/> • Server Record: Status, Source, Reason"]
    end

    subgraph ConflictResolutionStrategy ["4. Multi-Strategy Conflict Resolution"]
        SplitItems --> ReturnConflict["Return HTTP 200: { hasConflicts: true, conflicts: [...] }"]
        ReturnConflict --> OpenModal["Auto-Launch ConflictResolutionModal.jsx <br/> Side-by-Side Comparison Diff View"]
        
        OpenModal --> ChooseStrategy{"Instructor Selects Resolution Strategy"}
        
        ChooseStrategy -- Smart Precedence --> SmartLogic["Smart Precedence Applied: <br/> • Approved Leaves > Absent/Present <br/> • Anti-Proxy QR Scan > Unmarked Absent <br/> • Latest Timestamp Breaks Ties"]
        ChooseStrategy -- Teacher Authority --> LocalWins["Teacher Authority (local_wins): <br/> • Classroom Roster Overwrites Server <br/> • conflictResolution: 'LOCAL_OVERRIDE'"]
        ChooseStrategy -- Preserve Server --> ServerWins["Server Preserved (server_wins): <br/> • Verified Cloud Record Locked <br/> • conflictResolution: 'SERVER_PRESERVED'"]
        ChooseStrategy -- Interactive Per-Student --> CustomLogic["Per-Student Toggles Applied <br/> POST /api/attendance/resolve-conflicts <br/> • conflictResolution: 'MANUAL_RESOLVED'"]
        
        SmartLogic --> CommitFinal["Commit Final Resolved Records to MongoDB"]
        LocalWins --> CommitFinal
        ServerWins --> CommitFinal
        CustomLogic --> CommitFinal
    end

    subgraph FinalTelemetry ["5. Telemetry, Auditing & State Sync"]
        CleanCommit --> AuditLog["Record Audit Log: <br/> action: OFFLINE_ATTENDANCE_SYNC"]
        CommitFinal --> AuditLog
        
        AuditLog --> UpdateLocal["Update Local Queue Item: <br/> syncStatus: 'synced', conflictData: null"]
        UpdateLocal --> LogHistory["Append to IndexedDB syncHistory Store"]
        UpdateLocal --> BadgeGreen["OfflineSyncBadge: Display Cloud Checkmark (Synced)"]
        CommitFinal --> SendAlerts["Trigger Student Notifications & Defaulter Engine"]
    end
```






