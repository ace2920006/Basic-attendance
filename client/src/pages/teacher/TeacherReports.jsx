import React, { useState, useEffect } from 'react';
import { 
  FiFileText, 
  FiDownload, 
  FiPrinter, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiSearch, 
  FiLayers,
  FiFilter
} from 'react-icons/fi';
import { mockStudentsList } from '../../data/mockData';
import { generateReportApi, getSubjectsApi } from '../../services/api';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/reportExporter';

export default function TeacherReports() {
  const [reportType, setReportType] = useState('daily'); // 'daily' | 'weekly' | 'monthly' | 'semester'
  const [selectedSubject, setSelectedSubject] = useState('CS401');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedSemester, setSelectedSemester] = useState('Semester 4');

  const [searchTerm, setSearchTerm] = useState('');
  const [subjectsList, setSubjectsList] = useState([]);
  const [exportedMsg, setExportedMsg] = useState('');
  const [reportData, setReportData] = useState(null);

  // Fetch subjects list for filter
  useEffect(() => {
    getSubjectsApi()
      .then(res => {
        if (res?.success && res.data) setSubjectsList(res.data);
      })
      .catch(() => {});
  }, []);

  // Fetch report data
  const handleFetchReport = async () => {
    try {
      const res = await generateReportApi({
        type: reportType,
        subject: selectedSubject,
        date: selectedDate,
        startDate,
        endDate,
        month: selectedMonth,
        year: selectedYear,
        semester: selectedSemester
      });
      if (res?.success && res.data) {
        setReportData(res.data);
      } else {
        setReportData(null);
      }
    } catch (err) {
      setReportData(null);
    }
  };

  useEffect(() => {
    handleFetchReport();
  }, [reportType, selectedSubject, selectedDate, startDate, endDate, selectedMonth, selectedYear, selectedSemester]);

  const activeStudents = reportData?.students?.length > 0 ? reportData.students : mockStudentsList;
  const filteredStudents = activeStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.rollNo && s.rollNo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const atRiskStudents = activeStudents.filter(s => (s.attendanceRate || s.percentage || 85) < 75);

  const getExportTitle = () => `Teacher Class Report (${selectedSubject}) - ${reportType.toUpperCase()}`;
  const getExportMetadata = () => ({
    'Subject Code': selectedSubject,
    'Report Type': reportType.toUpperCase(),
    'Timeframe': reportType === 'daily' ? selectedDate : reportType === 'weekly' ? `${startDate} to ${endDate}` : reportType === 'monthly' ? `Month ${selectedMonth + 1}, ${selectedYear}` : selectedSemester,
    'Total Students': filteredStudents.length
  });

  const getExportHeadersRows = () => {
    const headers = ['Roll Number', 'Student Name', 'Department', 'Semester', 'Attendance Rate', 'Exam Eligibility'];
    const rows = filteredStudents.map(s => [
      s.rollNo || 'N/A',
      s.name,
      s.department || 'Computer Science',
      s.semester || 'Semester 4',
      `${s.attendanceRate || s.percentage || 85}%`,
      (s.attendanceRate || s.percentage || 85) >= 75 ? 'Eligible' : 'Shortage Warning'
    ]);
    return { headers, rows };
  };

  const handleExportCSV = () => {
    const { headers, rows } = getExportHeadersRows();
    exportToCSV(getExportTitle(), headers, rows, `${selectedSubject}_Report_${reportType}`);
    triggerExportToast('CSV Report Downloaded');
  };

  const handleExportExcel = () => {
    const { headers, rows } = getExportHeadersRows();
    exportToExcel(getExportTitle(), getExportMetadata(), headers, rows, `${selectedSubject}_Report_${reportType}`);
    triggerExportToast('Excel (.xls) Report Downloaded');
  };

  const handleExportPDF = () => {
    const { headers, rows } = getExportHeadersRows();
    exportToPDF(getExportTitle(), getExportMetadata(), headers, rows, `${selectedSubject}_Report_${reportType}`);
    triggerExportToast('PDF Print Window Opened');
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
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiFileText className="w-5 h-5 text-indigo-400" />
            Class Attendance Reports & Export Hub
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate Daily, Weekly, Monthly, and Semester summaries with PDF, Excel, and CSV downloads.
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleExportCSV}
            className="btn bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 px-3 flex items-center gap-1.5 border border-slate-700 rounded-xl"
          >
            <FiDownload className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>

          <button 
            onClick={handleExportExcel}
            className="btn bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs py-2 px-3 flex items-center gap-1.5 border border-emerald-500/30 rounded-xl"
          >
            <FiDownload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel</span>
          </button>

          <button 
            onClick={handleExportPDF}
            className="btn btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
          >
            <FiPrinter className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {exportedMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2">
          <FiCheckCircle className="w-4 h-4" />
          <span>{exportedMsg}</span>
        </div>
      )}

      {/* Filter Controls Panel */}
      <div className="glass-panel p-6 border-slate-800 space-y-4">
        
        {/* Report Type Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <FiLayers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Report Mode:</span>
            </span>
          </div>

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

        {/* Dynamic Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Subject</label>
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="input-field py-2 bg-slate-900"
            >
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

          {reportType === 'daily' && (
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Date</label>
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
              <label className="block text-slate-400 font-semibold mb-1">Academic Term</label>
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

        </div>

      </div>

      {/* Attendance Summary Roster Table */}
      <div className="glass-panel p-6 border-slate-800 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base font-bold text-white">Subject Attendance Summary Roster</h3>
          
          <div className="relative w-full sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search student..."
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
                <th className="py-3 px-4">Attendance Rate</th>
                <th className="py-3 px-4">Exam Eligibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.map((s, idx) => {
                const rate = s.attendanceRate || s.percentage || 85;
                const isEligible = rate >= 75;
                return (
                  <tr key={s.id || s._id || idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-300 font-semibold">{s.rollNo || `CS-2024-00${idx+1}`}</td>
                    <td className="py-3 px-4 text-white font-medium">{s.name}</td>
                    <td className="py-3 px-4 text-slate-400">{s.department || 'Computer Science'}</td>
                    <td className="py-3 px-4 text-slate-400">{s.semester || 'Semester 4'}</td>
                    <td className="py-3 px-4 font-bold">
                      <span className={isEligible ? 'text-emerald-400' : 'text-rose-400'}>
                        {rate}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {isEligible ? (
                        <span className="badge badge-present text-[10px]">Eligible</span>
                      ) : (
                        <span className="badge badge-absent text-[10px]">Flagged (&lt; 75%)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* At-Risk Warning Panel */}
      {atRiskStudents.length > 0 && (
        <div className="glass-panel p-6 border-rose-500/30 bg-rose-950/10 space-y-4">
          <div className="flex items-center gap-2 text-rose-400">
            <FiAlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">At-Risk Students (&lt; 75% Attendance Threshold)</h3>
          </div>

          <div className="divide-y divide-slate-800/80">
            {atRiskStudents.map((stu, idx) => (
              <div key={stu.id || idx} className="py-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">{stu.name}</span>
                  <span className="text-[11px] text-slate-400">{stu.rollNo || 'CS-2024-089'} • {stu.department || 'Computer Science'}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-extrabold text-rose-400">{stu.attendanceRate || stu.percentage || 68}%</span>
                  <button 
                    onClick={() => alert(`Warning notice issued to ${stu.name}`)}
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
