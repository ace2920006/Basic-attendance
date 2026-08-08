import React, { useState } from 'react';
import { FiFileText, FiDownload, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { mockStudentsList } from '../../data/mockData';

export default function TeacherReports() {
  const [exported, setExported] = useState(false);

  const atRiskStudents = mockStudentsList.filter(s => s.attendanceRate < 75);

  const handleExportCSV = () => {
    setExported(true);
    setTimeout(() => setExported(false), 3500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Export CTA */}
      <div className="glass-panel p-6 border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiFileText className="w-5 h-5 text-indigo-400" />
            Class Attendance Reports & Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Generate exportable summaries and monitor low attendance warnings</p>
        </div>

        <button 
          onClick={handleExportCSV}
          className="btn btn-primary px-5 py-2.5 text-xs font-semibold shadow-lg shadow-indigo-600/30"
        >
          <FiDownload className="w-4 h-4" />
          <span>Export Attendance CSV</span>
        </button>
      </div>

      {exported && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2">
          <FiCheckCircle className="w-4 h-4" />
          <span>CSV Exported Successfully! (CS401_Attendance_Report_August2026.csv downloaded)</span>
        </div>
      )}

      {/* At Risk Students Warning Panel */}
      <div className="glass-panel p-6 border-rose-500/30 bg-rose-950/10 space-y-4">
        <div className="flex items-center gap-2 text-rose-400">
          <FiAlertTriangle className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">At-Risk Students (< 75% Attendance)</h3>
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
                <button className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors">
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
