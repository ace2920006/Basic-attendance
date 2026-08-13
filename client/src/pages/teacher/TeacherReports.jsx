import React, { useState } from 'react';
import { FiFileText, FiDownload, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { mockStudentsList } from '../../data/mockData';

export default function TeacherReports() {
  const [exported, setExported] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('CS401');

  const atRiskStudents = mockStudentsList.filter(s => s.attendanceRate < 75);

  const handleExportCSV = () => {
    // Generate real CSV string
    const headers = ['Roll Number', 'Student Name', 'Department', 'Semester', 'Attendance Rate (%)', 'Status'];
    const rows = mockStudentsList.map(s => [
      `"${s.rollNo}"`,
      `"${s.name}"`,
      `"${s.department}"`,
      `"${s.semester}"`,
      s.attendanceRate,
      `"${s.status}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedSubject}_Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExported(true);
    setTimeout(() => setExported(false), 3500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Export Controls */}
      <div className="glass-panel p-6 border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiFileText className="w-5 h-5 text-indigo-400" />
            Class Attendance Reports & Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Generate exportable summaries and monitor low attendance warnings</p>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="input-field text-xs py-2 bg-slate-900 w-auto"
          >
            <option value="CS401">CS401 - Database Systems</option>
            <option value="CS403">CS403 - Web Application Dev</option>
            <option value="CS502">CS502 - Software Architecture</option>
          </select>

          <button 
            onClick={handleExportCSV}
            className="btn btn-primary px-5 py-2.5 text-xs font-semibold shadow-lg shadow-indigo-600/30"
          >
            <FiDownload className="w-4 h-4" />
            <span>Export Attendance CSV</span>
          </button>
        </div>
      </div>

      {exported && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2">
          <FiCheckCircle className="w-4 h-4" />
          <span>CSV Exported Successfully! ({selectedSubject}_Attendance_Report.csv downloaded)</span>
        </div>
      )}

      {/* Summary Report Table */}
      <div className="glass-panel p-6 border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Subject Attendance Summary Roster</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Attendance Rate</th>
                <th className="py-3 px-4">Exam Eligibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {mockStudentsList.map((s) => (
                <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-300 font-semibold">{s.rollNo}</td>
                  <td className="py-3 px-4 text-white font-medium">{s.name}</td>
                  <td className="py-3 px-4 text-slate-400">{s.department}</td>
                  <td className="py-3 px-4 text-slate-400">{s.semester}</td>
                  <td className="py-3 px-4 font-bold">
                    <span className={s.attendanceRate >= 75 ? 'text-emerald-400' : 'text-rose-400'}>
                      {s.attendanceRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {s.attendanceRate >= 75 ? (
                      <span className="badge badge-present text-[10px]">Eligible</span>
                    ) : (
                      <span className="badge badge-absent text-[10px]">Flagged (&lt; 75%)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* At-Risk Students Warning Panel */}
      <div className="glass-panel p-6 border-rose-500/30 bg-rose-950/10 space-y-4">
        <div className="flex items-center gap-2 text-rose-400">
          <FiAlertTriangle className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">At-Risk Students (&lt; 75% Attendance Threshold)</h3>
        </div>

        <p className="text-xs text-slate-300">
          The following students have attendance scores below the mandatory 75% eligibility threshold for end-of-term examinations.
        </p>

        <div className="divide-y divide-slate-800/80">
          {atRiskStudents.map((stu) => (
            <div key={stu.id} className="py-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">{stu.name}</span>
                <span className="text-[11px] text-slate-400">{stu.rollNo} • {stu.department}</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-extrabold text-rose-400">{stu.attendanceRate}%</span>
                <button 
                  onClick={() => alert(`Warning notice issued to ${stu.name} (${stu.email})`)}
                  className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors"
                >
                  Issue Warning Notice
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
