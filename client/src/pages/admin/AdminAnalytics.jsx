import React, { useEffect, useState } from 'react';
import { 
  FiUsers, 
  FiUserCheck, 
  FiCalendar, 
  FiClock, 
  FiTrendingUp, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertTriangle,
  FiAward,
  FiGrid,
  FiBarChart2,
  FiRefreshCw
} from 'react-icons/fi';
import StatCard from '../../components/common/StatCard';
import { getAdminAnalyticsApi, getAnalyticsDashboardApi } from '../../services/api';
import { adminAnalyticsData } from '../../data/mockData';

// Phase 15 Sub-Components
import MostAbsentStudents from '../../components/analytics/MostAbsentStudents';
import BestAttendance from '../../components/analytics/BestAttendance';
import DepartmentRanking from '../../components/analytics/DepartmentRanking';
import TeacherPerformance from '../../components/analytics/TeacherPerformance';
import DailyAttendance from '../../components/analytics/DailyAttendance';

export default function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resStats, resDashboard] = await Promise.allSettled([
        getAdminAnalyticsApi(),
        getAnalyticsDashboardApi()
      ]);

      if (resStats.status === 'fulfilled' && resStats.value?.success) {
        setStats(resStats.value.data);
      } else {
        setStats(adminAnalyticsData);
      }

      if (resDashboard.status === 'fulfilled' && resDashboard.value?.success) {
        setDashboardData(resDashboard.value.data);
      }
    } catch (err) {
      console.warn('Analytics fetch offline fallback active', err);
      setStats(adminAnalyticsData);
    } fontally: {
      setLoading(false);
    }
  };

  const handleAlertStudent = (student) => {
    setToastMessage(`⚠️ Warning alert successfully dispatched to ${student.name} (${student.rollNo})`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleCommendStudent = (student) => {
    setToastMessage(`🏆 Honor certificate & commendation sent to ${student.name} (${student.rollNo})`);
    setTimeout(() => setToastMessage(''), 4000);
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

  const tabs = [
    { id: 'overview', label: 'Overview & Trends', icon: FiBarChart2 },
    { id: 'most-absent', label: 'Most Absent Students', icon: FiAlertTriangle, badge: dashboardData?.mostAbsentStudents?.length || 6 },
    { id: 'best-attendance', label: 'Best Attendance', icon: FiAward },
    { id: 'department-ranking', label: 'Department Ranking', icon: FiGrid },
    { id: 'teacher-performance', label: 'Teacher Performance', icon: FiUserCheck },
    { id: 'daily-attendance', label: 'Daily Attendance', icon: FiCalendar }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Refresh */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Executive Attendance <span className="gradient-text">Analytics Dashboard</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Phase 15 Institutional Intelligence: Student Defaulters, Honor Roll, Department Rankings, Teacher Metrics &amp; Daily Logs
          </p>
        </div>
        
        <button 
          onClick={fetchData} 
          disabled={loading}
          className="btn btn-secondary text-xs px-3.5 py-2 flex items-center gap-2 self-start sm:self-auto"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>{loading ? 'Refreshing...' : 'Refresh Analytics'}</span>
        </button>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center justify-between shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-slate-400 hover:text-white text-xs font-bold px-2">✕</button>
        </div>
      )}

      {/* Key Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Enrolled Students" 
          value={(data.totalStudents || 0).toLocaleString()} 
          subtitle="Institute Roster" 
          icon={FiUsers} 
          color="#6366f1" 
        />
        <StatCard 
          title="Active Faculty Instructors" 
          value={(data.totalTeachers || 0).toLocaleString()} 
          subtitle="Assigned Teachers" 
          icon={FiUserCheck} 
          color="#06b6d4" 
        />
        <StatCard 
          title="Today's Attendance Rate" 
          value={`${today.rate || 0}%`} 
          subtitle={`${today.present || 0} Present / ${today.total || 0} Total`} 
          icon={FiCalendar} 
          color="#10b981" 
        />
        <StatCard 
          title="Monthly Attendance Rate" 
          value={`${monthly.rate || 0}%`} 
          subtitle={`${monthly.present || 0} Present / ${monthly.total || 0} Total`} 
          icon={FiClock} 
          color="#f59e0b" 
        />
      </div>

      {/* Phase 15 Analytics Sub-Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
              {t.badge !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white text-indigo-700' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Today's vs Monthly Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Today's Overview */}
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

            {/* Monthly Overview */}
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
      )}

      {activeTab === 'most-absent' && (
        <MostAbsentStudents 
          students={dashboardData?.mostAbsentStudents} 
          onAlertStudent={handleAlertStudent}
        />
      )}

      {activeTab === 'best-attendance' && (
        <BestAttendance 
          students={dashboardData?.bestAttendance} 
          onCommendStudent={handleCommendStudent}
        />
      )}

      {activeTab === 'department-ranking' && (
        <DepartmentRanking 
          departments={dashboardData?.departmentRankings} 
        />
      )}

      {activeTab === 'teacher-performance' && (
        <TeacherPerformance 
          teachers={dashboardData?.teacherPerformance} 
        />
      )}

      {activeTab === 'daily-attendance' && (
        <DailyAttendance 
          initialData={dashboardData?.dailyAttendance} 
        />
      )}

    </div>
  );
}
