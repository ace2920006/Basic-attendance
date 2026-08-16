import React, { useState, useEffect } from 'react';
import { 
  FiFileText, 
  FiDownload, 
  FiPrinter, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiUser, 
  FiAward, 
  FiCalendar,
  FiLayers
} from 'react-icons/fi';
import { currentUser, studentSubjects } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { generateReportApi } from '../../services/api';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/reportExporter';

export default function StudentReport() {
  const { user: authUser } = useAuth();
  const user = authUser || currentUser.student;

  const [reportType, setReportType] = useState('semester'); // 'daily' | 'weekly' | 'monthly' | 'semester'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [semester, setSemester] = useState('Semester 4');
  
  const [reportData, setReportData] = useState(null);
  const [exportedMsg, setExportedMsg] = useState('');

  const reportDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    generateReportApi({
      type: reportType,
      studentId: user._id || user.id,
      date: selectedDate,
      startDate,
      endDate,
      month: selectedMonth,
      year: selectedYear,
      semester
    })
      .then(res => {
        if (res?.success && res.data) setReportData(res.data);
      })
      .catch(() => {});
  }, [reportType, selectedDate, startDate, endDate, selectedMonth, selectedYear, semester]);

  const summary = reportData?.summary || {
    avgAttendanceRate: user.overallAttendance || 88.5,
    totalClassesHeld: user.totalClasses || 48,
    totalPresent: user.attendedClasses || 42,
    totalAbsent: user.absentClasses || 6
  };

  const overall = summary.avgAttendanceRate || 88.5;
  const isEligible = overall >= 75;

  const getExportTitle = () => `Official Student Attendance Report (${reportType.toUpperCase()})`;
  const getExportMetadata = () => ({
    'Student Name': user.name,
    'Roll Number': user.rollNo || 'CS-2024-089',
    'Department': user.department || 'Computer Science',
    'Course': user.course || 'B.Tech CS',
    'Report Mode': reportType.toUpperCase(),
    'Overall Rate': `${overall}%`,
    'Exam Eligibility': isEligible ? 'ELIGIBLE' : 'SHORTAGE WARNING'
  });

  const getExportHeadersRows = () => {
    const headers = ['Subject Code', 'Subject Name', 'Instructor', 'Total Lectures', 'Attended', 'Absences', 'Percentage', 'Status'];
    const rows = studentSubjects.map(sub => [
      sub.code,
      sub.name,
      sub.instructor,
      sub.total,
      sub.attended,
      sub.total - sub.attended,
      `${sub.percentage}%`,
      sub.percentage >= 75 ? 'Eligible' : 'Shortage Warning'
    ]);
    return { headers, rows };
  };

  const handleDownloadCSV = () => {
    const { headers, rows } = getExportHeadersRows();
    exportToCSV(getExportTitle(), headers, rows, `Student_Attendance_${user.rollNo || 'Report'}_${reportType}`);
    triggerToast('CSV Downloaded');
  };

  const handleDownloadExcel = () => {
    const { headers, rows } = getExportHeadersRows();
    exportToExcel(getExportTitle(), getExportMetadata(), headers, rows, `Student_Attendance_${user.rollNo || 'Report'}_${reportType}`);
    triggerToast('Excel Downloaded');
  };

  const handlePrintPDF = () => {
    const { headers, rows } = getExportHeadersRows();
    exportToPDF(getExportTitle(), getExportMetadata(), headers, rows, `Student_Attendance_${user.rollNo || 'Report'}_${reportType}`);
    triggerToast('PDF Window Opened');
  };

  const triggerToast = (msg) => {
    setExportedMsg(msg);
    setTimeout(() => setExportedMsg(''), 3500);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FiFileText className="w-7 h-7 text-indigo-400" />
            Official Attendance Report & Transcript
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generate, preview, print, or download your official academic attendance transcript in Daily, Weekly, Monthly, or Semester view.
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={handleDownloadCSV}
            className="btn bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 px-3 flex items-center gap-1.5 border border-slate-700 rounded-xl"
          >
            <FiDownload className="w-4 h-4 text-cyan-400" />
            <span>CSV</span>
          </button>

          <button 
            onClick={handleDownloadExcel}
            className="btn bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs py-2 px-3 flex items-center gap-1.5 border border-emerald-500/30 rounded-xl"
          >
            <FiDownload className="w-4 h-4 text-emerald-400" />
            <span>Excel</span>
          </button>

          <button 
            onClick={handlePrintPDF}
            className="btn btn-primary py-2 px-4 text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <FiPrinter className="w-4 h-4" />
            <span>Print / PDF Transcript</span>
          </button>
        </div>
      </div>

      {exportedMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2 print:hidden">
          <FiCheckCircle className="w-4 h-4" />
          <span>{exportedMsg}</span>
        </div>
      )}

      {/* Report Timeframe Selector Bar */}
      <div className="glass-panel p-4 border-slate-800 space-y-3 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FiLayers className="w-4 h-4 text-indigo-400" />
            <span>Report Mode:</span>
          </span>

          <div className="inline-flex p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
            {['daily', 'weekly', 'monthly', 'semester'].map((t) => (
              <button
                key={t}
                onClick={() => setReportType(t)}
                className={`px-3.5 py-1.5 font-semibold rounded-lg capitalize transition-all ${
                  reportType === t
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-800/80">
          {reportType === 'daily' && (
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Date</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field py-1.5 bg-slate-900"
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
                  className="input-field py-1.5 bg-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">End Date</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field py-1.5 bg-slate-900"
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
                  className="input-field py-1.5 bg-slate-900"
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
                  className="input-field py-1.5 bg-slate-900"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>
              </div>
            </>
          )}

          {reportType === 'semester' && (
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Academic Term</label>
              <select 
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="input-field py-1.5 bg-slate-900"
              >
                {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map((sem) => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="glass-panel p-8 border-slate-800 space-y-6 bg-slate-900/90 text-slate-100 print:bg-white print:text-slate-900 print:p-0 print:border-none shadow-2xl">
        
        {/* Document Header */}
        <div className="border-b border-slate-800 print:border-slate-300 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 print:text-indigo-700 font-extrabold text-xl tracking-tight">
              <FiAward className="w-6 h-6" />
              <span>UNIVERSITY ACADEMIC AFFAIRS</span>
            </div>
            <h3 className="text-lg font-bold text-white print:text-slate-900 mt-1">
              Official Student Attendance Transcript ({reportType.toUpperCase()})
            </h3>
            <p className="text-xs text-slate-400 print:text-slate-600">Generated on {reportDate} • Verification Code: REG-2026-89A</p>
          </div>

          {/* Exam Eligibility Badge */}
          <div className="text-left md:text-right">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs ${
              isEligible 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 print:bg-emerald-100 print:text-emerald-800' 
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 print:bg-rose-100 print:text-rose-800'
            }`}>
              {isEligible ? <FiCheckCircle className="w-4 h-4" /> : <FiAlertTriangle className="w-4 h-4" />}
              {isEligible ? 'ELIGIBLE FOR EXAMINATIONS (>75%)' : 'ATTENDANCE SHORTAGE WARNING (<75%)'}
            </span>
          </div>
        </div>

        {/* Student Metadata Table */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200 text-xs">
          <div>
            <span className="block text-slate-400 print:text-slate-500 font-medium">Student Name</span>
            <span className="block font-bold text-white print:text-slate-900 text-sm mt-0.5">{user.name}</span>
          </div>
          <div>
            <span className="block text-slate-400 print:text-slate-500 font-medium">Roll Number</span>
            <span className="block font-bold text-indigo-300 print:text-indigo-700 text-sm mt-0.5">{user.rollNo || 'CS-2024-089'}</span>
          </div>
          <div>
            <span className="block text-slate-400 print:text-slate-500 font-medium">Department</span>
            <span className="block font-semibold text-slate-200 print:text-slate-800 text-xs mt-0.5">{user.department || 'Computer Science'}</span>
          </div>
          <div>
            <span className="block text-slate-400 print:text-slate-500 font-medium">Academic Term</span>
            <span className="block font-semibold text-slate-200 print:text-slate-800 text-xs mt-0.5">{semester}</span>
          </div>
        </div>

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="p-4 rounded-xl bg-slate-950/50 print:bg-slate-100 border border-slate-800 print:border-slate-200">
            <span className="block text-2xl font-black text-indigo-400 print:text-indigo-700">{overall}%</span>
            <span className="block text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold mt-1">Overall Rate</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/50 print:bg-slate-100 border border-slate-800 print:border-slate-200">
            <span className="block text-2xl font-black text-white print:text-slate-900">{summary.totalClassesHeld}</span>
            <span className="block text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold mt-1">Total Sessions</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/50 print:bg-slate-100 border border-slate-800 print:border-slate-200">
            <span className="block text-2xl font-black text-emerald-400 print:text-emerald-700">{summary.totalPresent}</span>
            <span className="block text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold mt-1">Attended</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/50 print:bg-slate-100 border border-slate-800 print:border-slate-200">
            <span className="block text-2xl font-black text-rose-400 print:text-rose-700">{summary.totalAbsent}</span>
            <span className="block text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold mt-1">Absences</span>
          </div>
        </div>

        {/* Subject Wise Detail Breakdown Table */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white print:text-slate-900 border-b border-slate-800 print:border-slate-300 pb-2">
            Subject-Wise Attendance Detailed Audit
          </h4>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 print:bg-slate-200 text-slate-400 print:text-slate-700 font-bold border-b border-slate-800 print:border-slate-300">
                <th className="p-3">Code</th>
                <th className="p-3">Subject Title</th>
                <th className="p-3">Faculty Instructor</th>
                <th className="p-3 text-center">Total</th>
                <th className="p-3 text-center">Attended</th>
                <th className="p-3 text-center">Absents</th>
                <th className="p-3 text-right">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 print:divide-slate-200 text-slate-200 print:text-slate-800">
              {studentSubjects.map((sub) => {
                const isSubSafe = sub.percentage >= 75;
                return (
                  <tr key={sub.id} className="hover:bg-slate-950/40 print:hover:bg-slate-50">
                    <td className="p-3 font-bold text-indigo-400 print:text-indigo-700">{sub.code}</td>
                    <td className="p-3 font-semibold">{sub.name}</td>
                    <td className="p-3 text-slate-300 print:text-slate-600">{sub.instructor}</td>
                    <td className="p-3 text-center font-medium">{sub.total}</td>
                    <td className="p-3 text-center text-emerald-400 print:text-emerald-700 font-bold">{sub.attended}</td>
                    <td className="p-3 text-center text-rose-400 print:text-rose-700 font-bold">{sub.total - sub.attended}</td>
                    <td className="p-3 text-right font-black">
                      <span className={`px-2 py-0.5 rounded ${isSubSafe ? 'text-emerald-400 print:text-emerald-700' : 'text-rose-400 print:text-rose-700 font-extrabold bg-rose-500/10'}`}>
                        {sub.percentage}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Official Sign Off Footer */}
        <div className="pt-8 border-t border-slate-800 print:border-slate-300 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400 print:text-slate-600">
          <div>
            <p>Computer-generated official record by <strong>AttendPro AMS System</strong>.</p>
            <p className="text-[10px] mt-0.5">No signature required. Verified against university database server.</p>
          </div>
          <div className="text-right">
            <div className="h-8 border-b border-slate-600 w-48 mb-1"></div>
            <span className="text-[11px] font-bold text-slate-300 print:text-slate-800">Academic Registrar Signature</span>
          </div>
        </div>

      </div>

    </div>
  );
}
