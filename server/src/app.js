const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

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
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Security & Parsing Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded Static Files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Attendance Management System API',
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


// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
