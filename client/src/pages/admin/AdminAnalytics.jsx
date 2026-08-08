import React from 'react';
import { FiUsers, FiUserCheck, FiGrid, FiTrendingUp, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import StatCard from '../../components/common/StatCard';
import { adminAnalyticsData } from '../../data/mockData';

export default function AdminAnalytics() {
  const data = adminAnalyticsData;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Institute Attendance <span className="gradient-text">Analytics Console</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Real-time attendance metrics across departments and academic programs</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Enrolled Students" value={data.totalStudents.toLocaleString()} subtitle="Across 5 Departments" icon={FiUsers} color="#6366f1" />
        <StatCard title="Active Faculty Teachers" value={data.totalTeachers} subtitle="Assigned Instructors" icon={FiUserCheck} color="#06b6d4" />
        <StatCard title="Average Attendance Rate" value={`${data.overallAttendanceRate}%`} subtitle="Above global target (80%)" icon={FiTrendingUp} color="#10b981" />
        <StatCard title="Flagged Low Attendance" value={data.flaggedStudentsCount} subtitle="Students under 75%" icon={FiAlertTriangle} color="#f43f5e" />
      </div>

      {/* Monthly Trend Visual Chart */}
      <div className="glass-panel p-6 border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <FiTrendingUp className="w-5 h-5 text-emerald-400" />
            6-Month Aggregate Attendance Trend
          </h3>
          <span className="text-xs text-slate-400">Academic Year 2026</span>
        </div>

        <div className="pt-6 pb-2">
          <div className="h-44 flex items-end justify-between gap-4 px-6">
            {data.monthlyTrend.map((m, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-xs font-bold text-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  {m.rate}%
                </span>
                <div 
                  className="w-full bg-gradient-to-t from-cyan-600 to-emerald-400 rounded-t-xl transition-all duration-500 group-hover:brightness-125"
                  style={{ height: `${m.rate}%` }}
                />
                <span className="text-xs font-semibold text-slate-400">{m.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
