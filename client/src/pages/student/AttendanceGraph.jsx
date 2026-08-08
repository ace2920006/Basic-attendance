import React from 'react';
import { FiBarChart2, FiCalendar } from 'react-icons/fi';
import { studentSubjects } from '../../data/mockData';

export default function AttendanceGraph() {
  const monthlyData = [
    { month: 'Jan', percentage: 92 },
    { month: 'Feb', percentage: 89 },
    { month: 'Mar', percentage: 85 },
    { month: 'Apr', percentage: 94 },
    { month: 'May', percentage: 88 },
    { month: 'Jun', percentage: 91 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Monthly Trend Chart */}
      <div className="glass-panel p-6 border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <FiBarChart2 className="w-5 h-5 text-indigo-400" />
            Monthly Attendance Analytics
          </h3>
          <span className="text-xs text-slate-400">Semester 4 Performance</span>
        </div>

        <div className="pt-6 pb-2">
          <div className="h-48 flex items-end justify-between gap-3 px-4">
            {monthlyData.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[11px] font-bold text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.percentage}%
                </span>
                <div 
                  className="w-full bg-gradient-to-t from-indigo-700 to-cyan-500 rounded-t-lg transition-all duration-500 group-hover:brightness-125"
                  style={{ height: `${item.percentage}%` }}
                />
                <span className="text-xs font-semibold text-slate-400">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course Progress Chart Bars */}
      <div className="glass-panel p-6 border-slate-800 space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <FiCalendar className="w-5 h-5 text-cyan-400" />
          Course Attendance Ratio Comparison
        </h3>

        <div className="space-y-4 pt-2">
          {studentSubjects.map((sub) => (
            <div key={sub.id} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-200">{sub.name} ({sub.code})</span>
                <span className="text-slate-300 font-bold">{sub.percentage}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3 p-0.5 border border-slate-800">
                <div 
                  className="h-full rounded-full transition-all duration-700"
                  style={{ 
                    width: `${sub.percentage}%`,
                    backgroundColor: sub.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
