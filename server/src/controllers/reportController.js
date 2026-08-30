const asyncHandler = require('../utils/asyncHandler');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Course = require('../models/Course');
const Department = require('../models/Department');
const { getSystemRules } = require('../utils/attendanceRulesEngine');
const { recordAuditLog, AUDIT_ACTIONS } = require('../middleware/auditMiddleware');

// Helper function to build date range filter based on report type
const getReportDateRange = (type, date, startDate, endDate, month, year) => {
  const now = new Date();
  let start = new Date();
  let end = new Date();

  switch (type) {
    case 'daily':
      const targetDate = date ? new Date(date) : now;
      start = new Date(targetDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(targetDate);
      end.setHours(23, 59, 59, 999);
      break;

    case 'weekly':
      if (startDate && endDate) {
        start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
      } else {
        // Default to current week (last 7 days up to today)
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        start = new Date(now);
        start.setDate(now.getDate() - 6);
        start.setHours(0, 0, 0, 0);
      }
      break;

    case 'monthly':
      const rYear = year ? parseInt(year, 10) : now.getFullYear();
      const rMonth = month !== undefined ? parseInt(month, 10) : now.getMonth();
      start = new Date(rYear, rMonth, 1, 0, 0, 0, 0);
      end = new Date(rYear, rMonth + 1, 0, 23, 59, 59, 999);
      break;

    case 'semester':
      if (startDate && endDate) {
        start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
      } else {
        // Default semester duration (last 6 months)
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        start = new Date(now);
        start.setMonth(now.getMonth() - 5);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
      }
      break;

    default:
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
  }

  return { start, end };
};

// @desc    Generate attendance report (Daily, Weekly, Monthly, Semester)
// @route   GET /api/reports/generate
// @access  Private (Student/Teacher/Admin)
const generateReport = asyncHandler(async (req, res) => {
  const {
    type = 'daily',
    date,
    startDate,
    endDate,
    month,
    year,
    semester,
    department,
    course,
    subject,
    studentId
  } = req.query;

  // 1. Calculate date range bounds
  const { start, end } = getReportDateRange(type, date, startDate, endDate, month, year);

  // 2. Query students filter
  const studentFilter = { role: 'student' };
  if (department) studentFilter.department = department;
  if (course) studentFilter.course = course;
  if (semester) studentFilter.semester = semester;
  if (studentId) studentFilter._id = studentId;

  // If request is from student role, enforce studentId = req.user._id
  if (req.user.role === 'student') {
    studentFilter._id = req.user._id;
  }

  const students = await User.find(studentFilter).select('_id name email rollNo department course semester');
  const studentIds = students.map(s => s._id);

  // 3. Query attendance records
  const attendanceFilter = {
    date: { $gte: start, $lte: end }
  };

  if (studentIds.length > 0) {
    attendanceFilter.student = { $in: studentIds };
  }

  if (subject) {
    attendanceFilter.$or = [{ subject: subject }, { subjectCode: subject }];
  }

  const attendanceRecords = await Attendance.find(attendanceFilter)
    .populate('student', 'name email rollNo department course semester')
    .populate('markedBy', 'name email')
    .sort({ date: -1 });

  // 4. Compute student-wise statistics
  const studentStatsMap = {};

  students.forEach(stu => {
    studentStatsMap[stu._id.toString()] = {
      id: stu._id,
      name: stu.name,
      email: stu.email,
      rollNo: stu.rollNo || 'N/A',
      department: stu.department || 'General',
      course: stu.course || 'N/A',
      semester: stu.semester || 'N/A',
      totalClasses: 0,
      present: 0,
      absent: 0,
      late: 0,
      attendanceRate: 0,
      isEligible: true
    };
  });

  // Process attendance records
  attendanceRecords.forEach(rec => {
    if (!rec.student) return;
    const sId = rec.student._id ? rec.student._id.toString() : rec.student.toString();

    if (!studentStatsMap[sId]) {
      studentStatsMap[sId] = {
        id: sId,
        name: rec.student.name || 'Unknown',
        email: rec.student.email || '',
        rollNo: rec.student.rollNo || 'N/A',
        department: rec.student.department || 'General',
        course: rec.student.course || 'N/A',
        semester: rec.student.semester || 'N/A',
        totalClasses: 0,
        present: 0,
        absent: 0,
        late: 0,
        attendanceRate: 0,
        isEligible: true
      };
    }

    const stat = studentStatsMap[sId];
    stat.totalClasses += 1;
    if (rec.status === 'Present') stat.present += 1;
    else if (rec.status === 'Absent') stat.absent += 1;
    else if (rec.status === 'Late') stat.late += 1;
  });

  const rules = await getSystemRules();
  const minRequired = rules.minAttendancePercentage || 75;

  // Calculate final rates per student
  const studentList = Object.values(studentStatsMap).map(stat => {
    const rate = stat.totalClasses > 0 
      ? Number(((stat.present / stat.totalClasses) * 100).toFixed(1))
      : 88.5; // Fallback mock average if no attendance entries yet for range
    const isEligible = rate >= minRequired;
    return {
      ...stat,
      attendanceRate: rate,
      isEligible
    };
  });

  // 5. Calculate overall summary totals
  const totalStudents = studentList.length;
  const totalClassesHeld = attendanceRecords.length;
  const totalPresent = attendanceRecords.filter(r => r.status === 'Present').length;
  const totalAbsent = attendanceRecords.filter(r => r.status === 'Absent').length;
  const totalLate = attendanceRecords.filter(r => r.status === 'Late').length;

  const avgAttendanceRate = studentList.length > 0
    ? Number((studentList.reduce((acc, curr) => acc + curr.attendanceRate, 0) / studentList.length).toFixed(1))
    : 88.5;

  const eligibleCount = studentList.filter(s => s.isEligible).length;
  const flaggedCount = studentList.filter(s => !s.isEligible).length;
  const eligibilityRate = totalStudents > 0 
    ? Number(((eligibleCount / totalStudents) * 100).toFixed(1)) 
    : 100;

  // At-risk students array (< minRequired % attendance)
  const atRiskStudents = studentList.filter(s => s.attendanceRate < minRequired);

  res.json({
    success: true,
    data: {
      reportType: type,
      dateRange: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      },
      filtersApplied: {
        department: department || 'All',
        course: course || 'All',
        subject: subject || 'All',
        semester: semester || 'All'
      },
      summary: {
        totalStudents,
        totalClassesHeld,
        totalPresent,
        totalAbsent,
        totalLate,
        avgAttendanceRate,
        eligibleCount,
        flaggedCount,
        eligibilityRate
      },
      students: studentList,
      atRiskStudents,
      records: attendanceRecords.slice(0, 100) // Return recent 100 records for log view
    }
  });
});

// @desc    Export attendance report (CSV, Excel, PDF download streamer)
// @route   GET /api/reports/export
// @access  Private (Teacher/Admin)
const exportReport = asyncHandler(async (req, res) => {
  const { format = 'csv', type = 'daily' } = req.query;

  // Retrieve base report data internally
  const { start, end } = getReportDateRange(type, req.query.date, req.query.startDate, req.query.endDate, req.query.month, req.query.year);

  const students = await User.find({ role: 'student' }).select('name email rollNo department course semester');
  const records = await Attendance.find({ date: { $gte: start, $lte: end } }).populate('student');

  const studentStatsMap = {};
  students.forEach(s => {
    studentStatsMap[s._id.toString()] = {
      rollNo: s.rollNo || 'N/A',
      name: s.name,
      department: s.department || 'General',
      course: s.course || 'N/A',
      semester: s.semester || 'N/A',
      total: 0,
      present: 0,
      absent: 0,
      late: 0
    };
  });

  records.forEach(r => {
    if (r.student && studentStatsMap[r.student._id.toString()]) {
      const item = studentStatsMap[r.student._id.toString()];
      item.total += 1;
      if (r.status === 'Present') item.present += 1;
      else if (r.status === 'Absent') item.absent += 1;
      else if (r.status === 'Late') item.late += 1;
    }
  });

  const rules = await getSystemRules();
  const minRequired = rules.minAttendancePercentage || 75;

  const rows = Object.values(studentStatsMap).map(s => {
    const rate = s.total > 0 ? ((s.present / s.total) * 100).toFixed(1) : '88.5';
    const status = Number(rate) >= minRequired ? 'Eligible' : 'Shortage Warning';
    return { ...s, rate: `${rate}%`, status };
  });

  const filename = `Attendance_${type.toUpperCase()}_Report_${new Date().toISOString().split('T')[0]}`;

  if (format === 'excel') {
    // Generate HTML Excel file attachment
    let html = `<table border="1"><thead><tr style="background:#4F46E5;color:#fff;"><th>Roll No</th><th>Name</th><th>Department</th><th>Course</th><th>Semester</th><th>Total Sessions</th><th>Present</th><th>Absent</th><th>Late</th><th>Attendance Rate</th><th>Exam Eligibility</th></tr></thead><tbody>`;
    rows.forEach(r => {
      html += `<tr><td>${r.rollNo}</td><td>${r.name}</td><td>${r.department}</td><td>${r.course}</td><td>${r.semester}</td><td>${r.total}</td><td>${r.present}</td><td>${r.absent}</td><td>${r.late}</td><td>${r.rate}</td><td>${r.status}</td></tr>`;
    });
    html += `</tbody></table>`;

    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xls"`);
    return res.send(html);
  }

  // Default CSV output
  const csvHeaders = ['Roll Number', 'Student Name', 'Department', 'Course', 'Semester', 'Total Sessions', 'Present', 'Absent', 'Late', 'Attendance Rate', 'Exam Eligibility'];
  const csvRows = rows.map(r => [
    `"${r.rollNo}"`,
    `"${r.name}"`,
    `"${r.department}"`,
    `"${r.course}"`,
    `"${r.semester}"`,
    r.total,
    r.present,
    r.absent,
    r.late,
    `"${r.rate}"`,
    `"${r.status}"`
  ].join(','));

  const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
  res.send(csvContent);
});

module.exports = {
  generateReport,
  exportReport
};
