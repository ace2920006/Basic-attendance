const express = require('express');
const cors = require('cors');
const path = require('path');
const envConfig = require('./config/env');

// Security Middlewares
const helmetMiddleware = require('./middleware/helmetMiddleware');
const { globalLimiter } = require('./middleware/rateLimitMiddleware');
const xssSanitizer = require('./middleware/xssMiddleware');
const { autoAuditLogger } = require('./middleware/auditMiddleware');

// Express Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const classRoutes = require('./routes/classRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const reportRoutes = require('./routes/reportRoutes');
const chartRoutes = require('./routes/chartRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const auditRoutes = require('./routes/auditRoutes');
const academicRoutes = require('./routes/academicRoutes');
const rulesRoutes = require('./routes/rulesRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const antiProxyRoutes = require('./routes/antiProxyRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const cookieParser = require('cookie-parser');

const app = express();

// Configured CORS settings
const corsOptions = {
  origin: process.env.CLIENT_URL || [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
};

// 1. Helmet HTTP Security Headers
app.use(helmetMiddleware);

// 2. Cross-Origin Resource Sharing
app.use(cors(corsOptions));

// 3. Body & Cookie Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 4. XSS Payload Sanitization
app.use(xssSanitizer);

// 5. Global Rate Limiter
app.use('/api', globalLimiter);

// 6. Automatic State Mutation Audit Logger
app.use(autoAuditLogger);

// Serve Uploaded Static Files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Attendance Management System API',
    security: {
      helmet: 'enabled',
      rateLimiter: 'enabled',
      xssSanitizer: 'enabled',
      auditLogger: 'enabled',
      cors: 'configured'
    },
    database: 'MongoDB',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/charts', chartRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/attendance-rules', rulesRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/anti-proxy', antiProxyRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
