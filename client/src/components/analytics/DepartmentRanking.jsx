import React from 'react';
import { FiGrid, FiUsers, FiUserCheck, FiTrendingUp, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

export default function DepartmentRanking({ departments = [] }) {
  // Sort departments by average attendance rate descending
  const sortedDepts = [...departments].sort((a, b) => b.avgAttendance - a.avgAttendance);

  const getTierBadge = (rate) => {
    if (rate >= 88) {
      return {
        label: 'Top Performer',
        colorClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      };
    } else if (rate >= 80) {
      return {
        label: 'Solid Performance',
        colorClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
      };
    } else {
      return {
        label: 'Needs Improvement',
        colorClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      };
    }
  };

  return (
    <div className="glass-panel p-6 border-slate-800 space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FiGrid className="w-5 h-5 text-indigo-400" />
          Academic Department Attendance Rankings &amp; Comparison
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Comparative analysis of departmental attendance averages across CSE, ECE, ME, CE, and IT
        </p>
      </div>

      {/* Top 3 Department Highlights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedDepts.slice(0, 3).map((dept, index) => {
          const tier = getTierBadge(dept.avgAttendance);
          return (
            <div 
              key={dept.code} 
              className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl relative overflow-hidden space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                  Rank #{index + 1}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${tier.colorClass}`}>
                  {tier.label}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-white tracking-tight">{dept.name}</h4>
                <div className="text-xs text-slate-400 font-mono">Code: {dept.code} • HOD: {dept.hodName}</div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                <div>
                  <div className="text-[10px] text-slate-400">Total Enrolled</div>
                  <div className="text-sm font-bold text-white flex items-center gap-1">
                    <FiUsers className="w-3.5 h-3.5 text-indigo-400" /> {dept.totalStudents} Students
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Faculty Staff</div>
                  <div className="text-sm font-bold text-white flex items-center gap-1">
                    <FiUserCheck className="w-3.5 h-3.5 text-cyan-400" /> {dept.totalFaculty} Faculty
                  </div>
                </div>
              </div>

              {/* Progress Bar & Rate */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Attendance Rate</span>
                  <span className="font-bold text-emerald-400 font-mono text-sm">{dept.avgAttendance}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${dept.avgAttendance}%` }}
                  />
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Full Department Comparison Table */}
      <div className="overflow-x-auto pt-2">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="py-3 px-4 text-center">Rank</th>
              <th className="py-3 px-4">Department Name &amp; Code</th>
              <th className="py-3 px-4">Head of Department (HOD)</th>
              <th className="py-3 px-4 text-center">Students</th>
              <th className="py-3 px-4 text-center">Faculty</th>
              <th className="py-3 px-4 text-center">Avg Attendance %</th>
              <th className="py-3 px-4 text-center">Performance Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {sortedDepts.map((dept, idx) => {
              const tier = getTierBadge(dept.avgAttendance);
              return (
                <tr key={dept.code} className="hover:bg-slate-800/40 transition-colors">
                  
                  {/* Rank */}
                  <td className="py-3 px-4 text-center font-extrabold text-sm font-mono text-amber-400">
                    #{idx + 1}
                  </td>

                  {/* Name & Code */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{dept.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">Code: {dept.code}</div>
                  </td>

                  {/* HOD */}
                  <td className="py-3 px-4 text-slate-300 font-medium">
                    {dept.hodName}
                  </td>

                  {/* Total Students */}
                  <td className="py-3 px-4 text-center font-mono font-semibold text-white">
                    {dept.totalStudents}
                  </td>

                  {/* Total Faculty */}
                  <td className="py-3 px-4 text-center font-mono text-slate-400">
                    {dept.totalFaculty}
                  </td>

                  {/* Avg Attendance Rate */}
                  <td className="py-3 px-4 text-center">
                    <div className="font-extrabold text-sm text-emerald-400 font-mono">
                      {dept.avgAttendance}%
                    </div>
                    <div className="w-24 h-1.5 bg-slate-800 rounded-full mx-auto mt-1 overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full"
                        style={{ width: `${dept.avgAttendance}%` }}
                      />
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${tier.colorClass}`}>
                      {tier.label}
                    </span>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
