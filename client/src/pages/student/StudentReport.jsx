import React, { useState } from 'react';
import { 
  FiFileText, 
  FiDownload, 
  FiPrinter, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiUser, 
  FiAward, 
  FiCalendar 
} from 'react-icons/fi';
import { currentUser, studentSubjects } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

export default function StudentReport() {
  const { user: authUser } = useAuth();
  const user = authUser || currentUser.student;

  const [semester, setSemester] = useState('Semester 4');
  const [reportDate, setReportDate] = useState('2026-08-12');

  const overall = user.overallAttendance || 88.5;
  const isEligible = overall >= 75;

  // Export CSV generator helper
  const handleDownloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Official Student Attendance Report\n";
    csvContent += `Student Name,${user.name}\n`;
    csvContent += `Roll Number,${user.rollNo}\n`;
    csvContent += `Department,${user.department}\n`;
    csvContent += `Course,${user.course}\n`;
    csvContent += `Semester,${semester}\n`;
    csvContent += `Overall Percentage,${overall}%\n`;
    csvContent += `Exam Eligibility,${isEligible ? 'ELIGIBLE' : 'SHORTAGE'}\n\n`;

    csvContent += "Subject Code,Subject Name,Instructor,Total Lectures,Attended,Absences,Percentage,Status\n";
    studentSubjects.forEach(sub => {
      const status = sub.percentage >= 75 ? 'Safe' : 'Shortage';
      csvContent += `"${sub.code}","${sub.name}","${sub.instructor}",${sub.total},${sub.attended},${sub.total - sub.attended},${sub.percentage}%,${status}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_Report_${user.rollNo}_${semester}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FiFileText className="w-7 h-7 text-indigo-400" />
            Official Attendance Report & Transcript
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generate, preview, print, or download your official academic attendance record.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadCSV}
            className="btn btn-secondary py-2 px-4 text-xs flex items-center gap-2"
          >
            <FiDownload className="w-4 h-4 text-cyan-400" />
            <span>Download CSV</span>
          </button>
          <button 
            onClick={handlePrint}
            className="btn btn-primary py-2 px-4 text-xs flex items-center gap-2"
          >
            <FiPrinter className="w-4 h-4" />
            <span>Print / PDF Transcript</span>
          </button>
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
              Official Student Attendance Transcript
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
            <span className="block font-semibold text-slate-200 print:text-slate-800 text-xs mt-0.5">{user.department}</span>
          </div>
          <div>
            <span className="block text-slate-400 print:text-slate-500 font-medium">Academic Term</span>
            <span className="block font-semibold text-slate-200 print:text-slate-800 text-xs mt-0.5">{semester}</span>
          </div>
        </div>

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="p-4 rounded-xl bg-slate-950/50 print:bg-slate-100 border border-slate-800 print:border-slate-200">
            <span className="block text-2xl font-black text-indigo-400 print:text-indigo-700">{user.overallAttendance}%</span>
            <span className="block text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold mt-1">Overall Rate</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/50 print:bg-slate-100 border border-slate-800 print:border-slate-200">
            <span className="block text-2xl font-black text-white print:text-slate-900">{user.totalClasses}</span>
            <span className="block text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold mt-1">Total Sessions</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/50 print:bg-slate-100 border border-slate-800 print:border-slate-200">
            <span className="block text-2xl font-black text-emerald-400 print:text-emerald-700">{user.attendedClasses}</span>
            <span className="block text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold mt-1">Attended</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/50 print:bg-slate-100 border border-slate-800 print:border-slate-200">
            <span className="block text-2xl font-black text-rose-400 print:text-rose-700">{user.absentClasses}</span>
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
