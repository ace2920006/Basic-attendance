import React from 'react';
import { FiBarChart2, FiTrendingUp, FiCheckCircle, FiAlertTriangle, FiCalendar } from 'react-icons/fi';
import { studentSubjects } from '../../data/mockData';

export default function AttendanceGraph() {
  const monthlyData = [
    { month: 'Jan', percentage: 92 },
    { month: 'Feb', percentage: 89 },
    { month: 'Mar', percentage: 85 },
    { month: 'Apr', percentage: 94 },
    { month: 'May', percentage: 88 },
    { month: 'Jun', percentage: 91 },
    { month: 'Jul', percentage: 84 },
    { month: 'Aug', percentage: 88.5 }
  ];

  const dayWiseData = [
    { day: 'Monday', rate: 92, sessions: 24, attended: 22 },
    { day: 'Tuesday', rate: 95, sessions: 22, attended: 21 },
    { day: 'Wednesday', rate: 86, sessions: 26, attended: 22 },
    { day: 'Thursday', rate: 88, sessions: 24, attended: 21 },
    { day: 'Friday', rate: 78, sessions: 24, attended: 19 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FiBarChart2 className="w-7 h-7 text-indigo-400" />
            Attendance Visual Graph & Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Performance trend over time, minimum 75% exam threshold benchmark, and subject comparisons.
          </p>
        </div>

        {/* Benchmark Pill */}
        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-xs text-indigo-300 font-semibold self-start sm:self-auto">
          <FiTrendingUp className="w-4 h-4 text-emerald-400" />
          <span>75% Minimum Requirement Line</span>
        </div>
      </div>

      {/* Monthly Trend Chart Card */}
      <div className="glass-panel p-6 border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <FiBarChart2 className="w-5 h-5 text-indigo-400" />
              Monthly Attendance Performance Trend
            </h3>
            <p className="text-xs text-slate-400">Historical performance across 2026 academic term</p>
          </div>
          <span className="badge bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-3 py-1">
            Current Avg: 88.5%
          </span>
        </div>

        {/* Bar Chart Container */}
        <div className="pt-6 pb-2 relative">
          
          {/* 75% Benchmark Reference Line */}
          <div className="absolute left-0 right-0 top-[25%] border-b-2 border-dashed border-rose-500/50 z-10 flex justify-end pr-2">
            <span className="text-[10px] font-bold text-rose-400 bg-slate-950 px-2 py-0.5 rounded border border-rose-500/30">
              75% Threshold Limit
            </span>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 px-4 relative z-20">
            {monthlyData.map((item, idx) => {
              const isAbove = item.percentage >= 75;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className={`text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity ${isAbove ? 'text-indigo-300' : 'text-rose-400'}`}>
                    {item.percentage}%
                  </span>
                  <div 
                    className={`w-full rounded-t-lg transition-all duration-500 group-hover:brightness-125 ${
                      isAbove 
                        ? 'bg-gradient-to-t from-indigo-700 via-indigo-500 to-cyan-400' 
                        : 'bg-gradient-to-t from-rose-700 to-rose-400'
                    }`}
                    style={{ height: `${item.percentage}%` }}
                  />
                  <span className="text-xs font-semibold text-slate-400">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Column Grid: Course Attendance Comparison & Day-Wise Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Course Progress Chart (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 border-slate-800 space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <FiCalendar className="w-5 h-5 text-cyan-400" />
            Subject-Wise Attendance Ratio
          </h3>

          <div className="space-y-4 pt-2">
            {studentSubjects.map((sub) => {
              const isSafe = sub.percentage >= 75;
              return (
                <div key={sub.id} className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-200">{sub.name} <span className="text-indigo-400">({sub.code})</span></span>
                    <span className={`font-bold ${isSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {sub.percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-900 rounded-full h-2.5 p-0.5 border border-slate-800">
                    <div 
                      className="h-full rounded-full transition-all duration-700"
                      style={{ 
                        width: `${sub.percentage}%`,
                        backgroundColor: sub.color
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>{sub.attended} attended / {sub.total} total</span>
                    <span className={isSafe ? 'text-emerald-400 font-medium' : 'text-rose-400 font-bold'}>
                      {isSafe ? 'Eligible (>75%)' : 'Shortage Warning (<75%)'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day of Week Attendance Pattern (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 border-slate-800 space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <FiTrendingUp className="w-5 h-5 text-amber-400" />
            Day-Wise Attendance Pattern
          </h3>
          <p className="text-xs text-slate-400">Attendance percentage broken down by weekday</p>

          <div className="space-y-3 pt-2">
            {dayWiseData.map((d, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">{d.day}</h4>
                  <span className="text-[11px] text-slate-400">{d.attended} of {d.sessions} lectures attended</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${d.rate >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {d.rate}%
                  </span>
                  <span className="block text-[10px] text-slate-400">Attendance</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
