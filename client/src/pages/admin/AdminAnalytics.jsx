import React, { useEffect, useState } from 'react';
import { FiUsers, FiUserCheck, FiCalendar, FiClock, FiTrendingUp, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import StatCard from '../../components/common/StatCard';
import { getAdminAnalyticsApi } from '../../services/api';
import { adminAnalyticsData } from '../../data/mockData';

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await getAdminAnalyticsApi();
      if (res?.success && res?.data) {
        setStats(res.data);
      } else {
        setStats(adminAnalyticsData);
      }
    } catch (err) {
      console.warn('Backend offline or failed, using initial stats fallback', err);
      setStats(adminAnalyticsData);
    } finally {
      setLoading(false);
    }
  };

  const data = stats || adminAnalyticsData;
  const today = data.today || { total: 42, present: 38, absent: 3, late: 1, rate: 90.5 };
  const monthly = data.monthly || { total: 840, present: 742, absent: 68, late: 30, rate: 88.3 };
  const monthlyTrend = data.monthlyTrend || [
    { month: 'Jan', rate: 88.2 },
    { month: 'Feb', rate: 87.5 },
    { month: 'Mar', rate: 85.0 },
    { month: 'Apr', rate: 89.1 },
    { month: 'May', rate: 86.8 },
    { month: 'Jun', rate: 84.4 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Institute Attendance <span className="gradient-text">Analytics Console</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Real-time attendance metrics across departments and academic programs</p>
        </div>
        <button 
          onClick={fetchStats} 
          disabled={loading}
          className="btn btn-secondary text-xs px-3 py-1.5"
        >
          {loading ? 'Refreshing...' : 'Refresh Stats'}
        </button>
      </div>

      {/* Main Stats Row - 4 Key Phase 5 Requirements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Students Stat Card */}
        <StatCard 
          title="Total Students" 
          value={(data.totalStudents || 0).toLocaleString()} 
          subtitle="Enrolled Roster" 
          icon={FiUsers} 
          color="#6366f1" 
        />

        {/* 2. Teachers Stat Card */}
        <StatCard 
          title="Total Faculty Teachers" 
          value={(data.totalTeachers || 0).toLocaleString()} 
          subtitle="Assigned Instructors" 
          icon={FiUserCheck} 
          color="#06b6d4" 
        />

        {/* 3. Today's Attendance Stat Card */}
        <StatCard 
          title="Today's Attendance" 
          value={`${today.rate || 0}%`} 
          subtitle={`${today.present || 0} Present / ${today.total || 0} Marked`} 
          icon={FiCalendar} 
          color="#10b981" 
        />

        {/* 4. Monthly Attendance Stat Card */}
        <StatCard 
          title="Monthly Attendance" 
          value={`${monthly.rate || 0}%`} 
          subtitle={`${monthly.present || 0} Present / ${monthly.total || 0} Total`} 
          icon={FiClock} 
          color="#f59e0b" 
        />
      </div>

      {/* Detailed Attendance Breakdowns: Today's vs Monthly */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Today's Attendance Breakdown Widget */}
        <div className="glass-panel p-6 border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <FiCalendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Today's Attendance Overview</h3>
                <p className="text-[11px] text-slate-400">Summary of attendance recorded today</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
              {today.rate}% Rate
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1 text-center">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 mb-1 font-medium">
                <FiCheckCircle className="w-4 h-4" /> Present
              </div>
              <div className="text-xl font-extrabold text-white">{today.present || 0}</div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 mb-1 font-medium">
                <FiClock className="w-4 h-4" /> Late
              </div>
              <div className="text-xl font-extrabold text-white">{today.late || 0}</div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 mb-1 font-medium">
                <FiXCircle className="w-4 h-4" /> Absent
              </div>
              <div className="text-xl font-extrabold text-white">{today.absent || 0}</div>
            </div>
          </div>
        </div>

        {/* Monthly Attendance Breakdown Widget */}
        <div className="glass-panel p-6 border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <FiClock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Monthly Attendance Summary</h3>
                <p className="text-[11px] text-slate-400">Cumulative metrics for current month</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
              {monthly.rate}% Rate
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1 text-center">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 mb-1 font-medium">
                <FiCheckCircle className="w-4 h-4" /> Present
              </div>
              <div className="text-xl font-extrabold text-white">{monthly.present || 0}</div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 mb-1 font-medium">
                <FiClock className="w-4 h-4" /> Late
              </div>
              <div className="text-xl font-extrabold text-white">{monthly.late || 0}</div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 mb-1 font-medium">
                <FiXCircle className="w-4 h-4" /> Absent
              </div>
              <div className="text-xl font-extrabold text-white">{monthly.absent || 0}</div>
            </div>
          </div>
        </div>

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
            {monthlyTrend.map((m, idx) => (
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
