import React from 'react';
import { FiTrendingUp, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { studentSubjects } from '../../data/mockData';

export default function AttendanceCard({ user }) {
  const percentage = user.overallAttendance;
  const isHealthy = percentage >= 75;

  return (
    <div className="space-y-6">
      
      {/* Overview Stat Card */}
      <div className="glass-panel p-6 border-slate-700/80 bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-indigo-950/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Overall Attendance Score</span>
            <div className="flex items-baseline gap-3">
              <h2 className="text-5xl font-extrabold text-white tracking-tight">{percentage}%</h2>
              <span className={`badge ${isHealthy ? 'badge-present' : 'badge-absent'} text-xs py-1 px-3`}>
                {isHealthy ? 'Eligible for Exams (>75%)' : 'Warning: Below Threshold'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Tracked across {user.totalClasses} total lecture sessions for {user.semester}.
            </p>
          </div>

          {/* Quick Metrics Breakdown */}
          <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="text-center px-4 border-r border-slate-800">
              <span className="block text-2xl font-bold text-emerald-400">{user.attendedClasses}</span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Attended</span>
            </div>
            <div className="text-center px-4 border-r border-slate-800">
              <span className="block text-2xl font-bold text-rose-400">{user.absentClasses}</span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Absent</span>
            </div>
            <div className="text-center px-4">
              <span className="block text-2xl font-bold text-cyan-400">120</span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Total</span>
            </div>
          </div>

        </div>
      </div>

      {/* Subject Wise Progress Cards */}
      <div className="glass-panel p-6 border-slate-800 space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <FiTrendingUp className="w-5 h-5 text-indigo-400" />
          Subject-Wise Attendance Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {studentSubjects.map((sub) => {
            const isSubHealthy = sub.percentage >= 75;
            return (
              <div key={sub.id} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{sub.name}</h4>
                    <span className="text-[11px] text-slate-400">{sub.code} • {sub.instructor}</span>
                  </div>
                  <span className={`text-sm font-bold ${isSubHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {sub.percentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${sub.percentage}%`,
                      backgroundColor: sub.color
                    }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Attended: {sub.attended} / {sub.total} sessions</span>
                  <span className={isSubHealthy ? 'text-emerald-400' : 'text-rose-400 font-semibold'}>
                    {isSubHealthy ? 'Safe Zone' : 'Below 75%'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
