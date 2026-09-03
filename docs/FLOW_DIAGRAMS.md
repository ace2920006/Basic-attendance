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

## 28. Phase 28 – Teacher Analytics & Classroom Insights Engine

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



