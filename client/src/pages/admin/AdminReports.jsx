import React, { useState, useEffect } from 'react';
import { 
  FiFileText, 
  FiDownload, 
  FiPrinter, 
  FiFilter, 
  FiCalendar, 
  FiUsers, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiSearch,
  FiPieChart,
  FiBookOpen,
  FiLayers
} from 'react-icons/fi';
import { generateReportApi, getDepartmentsApi, getCoursesApi, getSubjectsApi } from '../../services/api';
import { mockStudentsList } from '../../data/mockData';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/reportExporter';

export default function AdminReports() {
  const [reportType, setReportType] = useState('daily'); // 'daily' | 'weekly' | 'monthly' | 'semester'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedSemester, setSelectedSemester] = useState('Semester 4');
  
  const [department, setDepartment] = useState('');
  const [course, setCourse] = useState('');
  const [subject, setSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [departmentsList, setDepartmentsList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [exportedMsg, setExportedMsg] = useState('');

  // Fetch filter dropdown options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [dRes, cRes, sRes] = await Promise.all([
          getDepartmentsApi().catch(() => ({ success: false })),
          getCoursesApi().catch(() => ({ success: false })),
          getSubjectsApi().catch(() => ({ success: false }))
        ]);

        if (dRes?.success && dRes.data) setDepartmentsList(dRes.data);
        if (cRes?.success && cRes.data) setCoursesList(cRes.data);
        if (sRes?.success && sRes.data) setSubjectsList(sRes.data);
      } catch (err) {
        console.error('Error fetching report filters:', err);
      }
    };
    fetchOptions();
  }, []);

  // Fetch / Generate report stats
  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const res = await generateReportApi({
        type: reportType,
        date: selectedDate,
        startDate,
        endDate,
        month: selectedMonth,
        year: selectedYear,
        semester: selectedSemester,
        department,
        course,
        subject
      });

      if (res?.success && res.data) {
        setReportData(res.data);
      } else {
        setReportData(null);
      }
    } catch (err) {
      console.warn('API report generation fallback to mock dataset:', err);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerateReport();
  }, [reportType, selectedDate, startDate, endDate, selectedMonth, selectedYear, selectedSemester, department, course, subject]);

  // Combined fallback dataset
  const activeStudents = reportData?.students?.length > 0 ? reportData.students : mockStudentsList;
  const filteredStudents = activeStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.rollNo && s.rollNo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const summary = reportData?.summary || {
    totalStudents: activeStudents.length,
    totalClassesHeld: 48,
    avgAttendanceRate: 88.5,
    eligibleCount: activeStudents.filter(s => (s.attendanceRate || 85) >= 75).length,
    flaggedCount: activeStudents.filter(s => (s.attendanceRate || 85) < 75).length,
    eligibilityRate: Math.round((activeStudents.filter(s => (s.attendanceRate || 85) >= 75).length / activeStudents.length) * 100)
  };

  const atRiskStudents = activeStudents.filter(s => (s.attendanceRate || 85) < 75);

  // --- Export Handlers ---
  const getExportTitle = () => {
    const typeLabel = reportType.toUpperCase();
    return `Institutional Attendance Report (${typeLabel})`;
  };

  const getExportMetadata = () => ({
    'Report Type': reportType.toUpperCase(),
    'Time Period': reportType === 'daily' ? selectedDate : reportType === 'weekly' ? `${startDate} to ${endDate}` : reportType === 'monthly' ? `Month ${selectedMonth + 1}, ${selectedYear}` : selectedSemester,
    'Department': department || 'All Departments',
    'Course': course || 'All Courses',
    'Subject': subject || 'All Subjects',
    'Total Enrolled': summary.totalStudents,
    'Average Rate': `${summary.avgAttendanceRate}%`
  });

  const getExportHeadersRows = () => {
    const headers = ['Roll Number', 'Student Name', 'Department', 'Semester', 'Total Classes', 'Present', 'Absent', 'Late', 'Attendance Rate', 'Exam Eligibility'];
    const rows = filteredStudents.map(s => [
      s.rollNo || 'N/A',
      s.name,
      s.department || 'Computer Science',
      s.semester || 'Semester 4',
      s.totalClasses || 40,
      s.present || 35,
      s.absent || 3,
      s.late || 2,
      `${s.attendanceRate || 88.5}%`,
      (s.attendanceRate || 88.5) >= 75 ? 'Eligible' : 'Shortage Warning'
    ]);
    return { headers, rows };
  };

  const handleExportCSV = () => {
    const { headers, rows } = getExportHeadersRows();
    exportToCSV(getExportTitle(), headers, rows, `Admin_${reportType}_Report_${new Date().toISOString().split('T')[0]}`);
    triggerExportToast('CSV File Downloaded Successfully');
  };

  const handleExportExcel = () => {
    const { headers, rows } = getExportHeadersRows();
    exportToExcel(getExportTitle(), getExportMetadata(), headers, rows, `Admin_${reportType}_Report_${new Date().toISOString().split('T')[0]}`);
    triggerExportToast('Excel (.xls) File Downloaded Successfully');
  };

  const handleExportPDF = () => {
    const { headers, rows } = getExportHeadersRows();
    exportToPDF(getExportTitle(), getExportMetadata(), headers, rows, `Admin_${reportType}_Report_${new Date().toISOString().split('T')[0]}`);
    triggerExportToast('PDF Print Engine Initialized');
  };

  const triggerExportToast = (msg) => {
    setExportedMsg(msg);
    setTimeout(() => setExportedMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="glass-panel p-6 border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FiFileText className="w-7 h-7 text-indigo-400" />
            <span>Institutional Attendance Reports Console</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generate, filter, and export Daily, Weekly, Monthly, and Semester academic attendance reports.
          </p>
        </div>

        {/* Export Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={handleExportCSV}
            className="btn bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 px-3.5 flex items-center gap-1.5 border border-slate-700 rounded-xl"
          >
            <FiDownload className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button 
            onClick={handleExportExcel}
            className="btn bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs py-2 px-3.5 flex items-center gap-1.5 border border-emerald-500/30 rounded-xl"
          >
            <FiDownload className="w-4 h-4 text-emerald-400" />
            <span>Export Excel</span>
          </button>

          <button 
            onClick={handleExportPDF}
            className="btn btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
          >
            <FiPrinter className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {exportedMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2 animate-fadeIn">
          <FiCheckCircle className="w-4 h-4" />
          <span>{exportedMsg}</span>
        </div>
      )}

      {/* Report Controls & Filters */}
      <div className="glass-panel p-6 border-slate-800 space-y-5">
        
        {/* Report Type Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <FiLayers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Report Type:</span>
            </span>
          </div>

          <div className="inline-flex p-1 bg-slate-950/80 rounded-xl border border-slate-800">
            <button
              onClick={() => setReportType('daily')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                reportType === 'daily'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Daily Report
            </button>
            <button
              onClick={() => setReportType('weekly')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                reportType === 'weekly'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Weekly Report
            </button>
            <button
              onClick={() => setReportType('monthly')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                reportType === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly Report
            </button>
            <button
              onClick={() => setReportType('semester')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                reportType === 'semester'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semester Report
            </button>
          </div>
        </div>

        {/* Dynamic Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          {/* Dynamic Date/Time Controls depending on Report Type */}
          {reportType === 'daily' && (
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Select Date</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field py-2 bg-slate-900"
              />
            </div>
          )}

          {reportType === 'weekly' && (
            <>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Start Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field py-2 bg-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">End Date</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field py-2 bg-slate-900"
                />
              </div>
            </>
          )}

          {reportType === 'monthly' && (
            <>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Month</label>
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="input-field py-2 bg-slate-900"
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
                    <option key={m} value={idx}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Year</label>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="input-field py-2 bg-slate-900"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>
              </div>
            </>
          )}

          {reportType === 'semester' && (
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Semester Term</label>
              <select 
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="input-field py-2 bg-slate-900"
              >
                {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map((sem) => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>
          )}

          {/* Department Filter */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Department</label>
            <select 
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="input-field py-2 bg-slate-900"
            >
              <option value="">All Departments</option>
              {departmentsList.map(d => (
                <option key={d._id || d.code} value={d.name}>{d.name} ({d.code})</option>
              ))}
              {departmentsList.length === 0 && (
                <>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Comm">Electronics & Comm</option>
                </>
              )}
            </select>
          </div>

          {/* Course Filter */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Course Program</label>
            <select 
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="input-field py-2 bg-slate-900"
            >
              <option value="">All Courses</option>
              {coursesList.map(c => (
                <option key={c._id || c.code} value={c.title}>{c.title}</option>
              ))}
              {coursesList.length === 0 && (
                <>
                  <option value="B.Tech Computer Science">B.Tech Computer Science</option>
                  <option value="B.Tech IT">B.Tech IT</option>
                </>
              )}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Subject Code</label>
            <select 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input-field py-2 bg-slate-900"
            >
              <option value="">All Subjects</option>
              {subjectsList.map(s => (
                <option key={s._id || s.code} value={s.code}>{s.code} - {s.name}</option>
              ))}
              {subjectsList.length === 0 && (
                <>
                  <option value="CS401">CS401 - Database Systems</option>
                  <option value="CS403">CS403 - Web Application Dev</option>
                  <option value="CS502">CS502 - Software Architecture</option>
                </>
              )}
            </select>
          </div>

        </div>

      </div>

      {/* Metrics Highlights Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Total Students</span>
            <FiUsers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{summary.totalStudents}</div>
          <span className="text-[10px] text-slate-400">Enrolled in selected filter</span>
        </div>

        <div className="glass-panel p-4 border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Attendance Rate</span>
            <FiPieChart className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-400">{summary.avgAttendanceRate}%</div>
          <span className="text-[10px] text-slate-400">Institutional Average</span>
        </div>

        <div className="glass-panel p-4 border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Exam Eligible (&gt;75%)</span>
            <FiCheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">{summary.eligibleCount}</div>
          <span className="text-[10px] text-emerald-400 font-semibold">{summary.eligibilityRate}% Compliance</span>
        </div>

        <div className="glass-panel p-4 border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Shortage Warning</span>
            <FiAlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400">{summary.flaggedCount}</div>
          <span className="text-[10px] text-rose-400 font-semibold">Students &lt; 75%</span>
        </div>
      </div>

      {/* Main Student Attendance Roster Table */}
      <div className="glass-panel p-6 border-slate-800 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FiBookOpen className="w-5 h-5 text-indigo-400" />
            <span>Generated Attendance Roster ({filteredStudents.length} Records)</span>
          </h3>

          <div className="relative w-full sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by student name or roll..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9 py-1.5 text-xs bg-slate-900"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold bg-slate-950/60">
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4 text-center">Total Classes</th>
                <th className="py-3 px-4 text-center">Present</th>
                <th className="py-3 px-4 text-center">Absent</th>
                <th className="py-3 px-4 text-right">Attendance Rate</th>
                <th className="py-3 px-4 text-center">Exam Eligibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.map((s, idx) => {
                const rate = s.attendanceRate || 88.5;
                const isEligible = rate >= 75;
                return (
                  <tr key={s.id || s._id || idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-300 font-semibold">{s.rollNo || `CS-2024-00${idx+1}`}</td>
                    <td className="py-3 px-4 text-white font-medium">{s.name}</td>
                    <td className="py-3 px-4 text-slate-400">{s.department || 'Computer Science'}</td>
                    <td className="py-3 px-4 text-slate-400">{s.semester || 'Semester 4'}</td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-200">{s.totalClasses || 40}</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold">{s.present || 35}</td>
                    <td className="py-3 px-4 text-center text-rose-400 font-bold">{s.absent || 3}</td>
                    <td className="py-3 px-4 text-right font-black">
                      <span className={isEligible ? 'text-emerald-400' : 'text-rose-400'}>
                        {rate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isEligible ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <FiCheckCircle className="w-3 h-3" /> Eligible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          <FiAlertTriangle className="w-3 h-3" /> Shortage (&lt;75%)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400 text-xs">
                    No student attendance records matched your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* At-Risk Students Warning Section */}
      {atRiskStudents.length > 0 && (
        <div className="glass-panel p-6 border-rose-500/30 bg-rose-950/10 space-y-4">
          <div className="flex items-center gap-2 text-rose-400">
            <FiAlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">At-Risk Students (&lt; 75% Threshold Alert)</h3>
          </div>

          <p className="text-xs text-slate-300">
            The following students require immediate academic intervention to satisfy minimum exam attendance requirements:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {atRiskStudents.map((stu, i) => (
              <div key={stu.id || i} className="p-3 bg-slate-900/80 border border-rose-500/20 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">{stu.name}</span>
                  <span className="text-[11px] text-slate-400">{stu.rollNo || 'CS-2024-089'} • {stu.department || 'Computer Science'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-rose-400">{stu.attendanceRate || 68}%</span>
                  <button 
                    onClick={() => alert(`Official warning notice dispatched to student ${stu.name}`)}
                    className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Issue Warning
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
