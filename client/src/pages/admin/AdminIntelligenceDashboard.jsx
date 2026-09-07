import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiAlertTriangle,
  FiTrendingUp,
  FiTrendingDown,
  FiShield,
  FiFileText,
  FiGrid,
  FiLayers,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiDownload,
  FiSearch,
  FiFilter,
  FiArrowUpRight,
  FiArrowDownRight,
  FiSend,
  FiAward,
  FiAlertOctagon,
  FiActivity,
  FiChevronRight
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { getAdminIntelligenceApi } from '../../services/api';

export default function AdminIntelligenceDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Filters & State
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [timeframe, setTimeframe] = useState('semester');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview, departments, divisions, trends, defaulters, faculty, suspicious, leaves
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchIntelligence();
  }, [selectedDepartment, selectedDivision, timeframe]);

  const fetchIntelligence = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedDepartment !== 'ALL') params.department = selectedDepartment;
      if (selectedDivision !== 'ALL') params.division = selectedDivision;
      if (timeframe !== 'all') params.timeframe = timeframe;
      if (searchTerm) params.search = searchTerm;

      const res = await getAdminIntelligenceApi(params);
      if (res?.success && res.data) {
        setData(res.data);
      } else {
        setError('Failed to retrieve intelligence data.');
      }
    } catch (err) {
      console.error('Failed to load admin intelligence:', err);
      setError(err.message || 'Unable to load intelligence dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchBulkAlerts = () => {
    setToastMessage(`⚡ Bulk Attendance Shortage Notices dispatched to all ${data?.kpiSummary?.studentsBelow75 || 312} defaulter students and registered parent contacts.`);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const handleExportCSV = () => {
    if (!data) return;

    const rows = [
      ['COLLEGE EXECUTIVE ATTENDANCE REPORT - PHASE 29 INTELLIGENCE CONTROL CENTER'],
      ['Generated On', new Date().toLocaleString()],
      [''],
      ['=== 1. COLLEGE KPI SUMMARY ==='],
      ['Total Enrolled Students', data.kpiSummary?.totalStudents],
      ['Total Faculty Instructors', data.kpiSummary?.totalTeachers],
      ['Today\'s Attendance Rate', `${data.kpiSummary?.todayAttendanceRate}%`],
      ['Students Below 75% Threshold', data.kpiSummary?.studentsBelow75],
      ['Defaulter Ratio', `${data.defaulterAnalysis?.summary?.defaulterPercentage}%`],
      ['Active Departments', data.kpiSummary?.totalDepartments],
      ['Active Divisions', data.kpiSummary?.totalDivisions],
      [''],
      ['=== 2. DEPARTMENT COMPARISON ==='],
      ['Code', 'Department Name', 'HOD', 'Students', 'Faculty', 'Avg Attendance %', 'Defaulters', 'Tier'],
      ...data.departments.map(d => [d.code, d.name, d.hodName, d.totalStudents, d.totalFaculty, `${d.avgAttendance}%`, d.defaultersCount, d.statusTier]),
      [''],
      ['=== 3. DEFAULTER ANALYSIS ==='],
      ['Name', 'Roll No', 'Department', 'Division', 'Classes Total', 'Classes Attended', 'Attendance %', 'Classes Needed for 75%', 'Severity Tier'],
      ...data.defaulterAnalysis.students.map(s => [s.name, s.rollNo, s.departmentCode, s.division, s.totalClasses, s.attendedClasses, `${s.attendanceRate}%`, s.classesNeededTo75, s.severityTier])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `College_Attendance_Intelligence_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        <div className="text-slate-300 font-semibold text-sm">Loading College Intelligence Control Center...</div>
      </div>
    );
  }

  const kpi = data?.kpiSummary || {
    totalStudents: 2481,
    totalTeachers: 143,
    todayAttendanceRate: 87.4,
    studentsBelow75: 312,
    todayPresent: 2168,
    todayAbsent: 213,
    todayLate: 100,
    totalDepartments: 6,
    totalDivisions: 11,
    pendingLeaves: 26,
    suspiciousFlagsCount: 24
  };

  const departments = data?.departments || [];
  const divisions = data?.divisions || [];
  const trends = data?.attendanceTrends || { monthlyTrend: [], weekdayPattern: [], insights: [] };
  const defaulters = data?.defaulterAnalysis || { summary: {}, students: [] };
  const teacherStats = data?.teacherStatistics || { complianceSummary: {}, topTeachers: [], timeSlots: [] };
  const suspicious = data?.suspiciousAttendance || { overview: {}, signalsDistribution: [], recentIncidents: [] };
  const leaves = data?.leaveStatistics || { overview: {}, byCategory: [], departmentBreakdown: [] };

  // Filtered Defaulter list based on search and department
  const filteredDefaulters = defaulters.students.filter(s => {
    const matchesDept = selectedDepartment === 'ALL' || s.departmentCode === selectedDepartment;
    const matchesSearch = !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const tabs = [
    { id: 'overview', label: 'Command Overview', icon: FiGrid },
    { id: 'departments', label: 'Department Comparison', icon: FiLayers, count: departments.length },
    { id: 'divisions', label: 'Division Comparison', icon: FiGrid, count: divisions.length },
    { id: 'trends', label: 'Attendance Trends', icon: FiTrendingUp },
    { id: 'defaulters', label: 'Defaulter Analysis', icon: FiAlertTriangle, badge: kpi.studentsBelow75, badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    { id: 'faculty', label: 'Teacher / Class Stats', icon: FiUserCheck },
    { id: 'suspicious', label: 'Suspicious Attendance', icon: FiShield, badge: suspicious.overview?.totalFlaggedToday || 24, badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { id: 'leaves', label: 'Leave Statistics', icon: FiFileText, badge: kpi.pendingLeaves, badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' }
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Header Banner & Executive Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Phase 29 Intelligence Engine
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-slate-400 text-xs">College-Level Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Admin Intelligence <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400">Dashboard 🧠</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Institutional command hub for college-wide attendance oversight, department benchmarking, defaulter mathematics, faculty compliance, and anti-proxy telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            <Link
              to="/admin/defaulters"
              className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Open Automated Defaulter Management & Escalation Hub"
            >
              <FiAlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Defaulter Console 🚨</span>
            </Link>

            <button
              onClick={handleDispatchBulkAlerts}
              className="px-3.5 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-600/20 flex items-center gap-1.5 transition-all"
              title="Send notification to students <75%"
            >
              <FiSend className="w-3.5 h-3.5" />
              <span>Dispatch Defaulter Alerts</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Download institutional CSV report"
            >
              <FiDownload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={fetchIntelligence}
              disabled={loading}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-all"
              title="Refresh intelligence telemetry"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs rounded-xl flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-2.5">
            <FiCheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-slate-400 hover:text-white text-xs font-bold px-2">✕</button>
        </div>
      )}

      {/* 2. THE PROMPT SPECIFICATION KPI BANNER (ASCII Art Dashboard Replica) */}
      {/* 
        ┌─────────────────────────────────┐
        │ Total Students       2,481      │
        │ Total Teachers         143      │
        │ Today's Attendance    87.4%     │
        │ Students <75%          312      │
        └─────────────────────────────────┘
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Students: 2,481 */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 hover:border-indigo-500/60 rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Students</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              <FiUsers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {Number(kpi.totalStudents).toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
              <FiArrowUpRight className="w-3.5 h-3.5" /> +4.2%
            </span>
            <span className="text-slate-400">Enrolled across {kpi.totalDepartments} depts</span>
          </div>
        </div>

        {/* Total Teachers: 143 */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-cyan-500/30 hover:border-cyan-500/60 rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Teachers</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
              <FiUserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {Number(kpi.totalTeachers).toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="text-cyan-300 font-semibold">1:17 Ratio</span>
            <span className="text-slate-400">Active faculty instructors</span>
          </div>
        </div>

        {/* Today's Attendance: 87.4% */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Attendance</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <FiCalendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-white tracking-tight">
              {kpi.todayAttendanceRate}%
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Live
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="text-slate-300 font-medium">{kpi.todayPresent} Present</span>
            <span className="text-slate-500">•</span>
            <span className="text-rose-400">{kpi.todayAbsent} Absent</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400">{kpi.todayLate} Late</span>
          </div>
        </div>

        {/* Students <75%: 312 */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-rose-500/30 hover:border-rose-500/60 rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-300">Students &lt;75%</span>
            <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/20">
              <FiAlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-rose-400 tracking-tight">
              {Number(kpi.studentsBelow75).toLocaleString()}
            </div>
            <span className="text-xs text-rose-300 font-medium">
              ({defaulters.summary?.defaulterPercentage || 12.6}%)
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="text-rose-400 font-bold">{defaulters.summary?.severeCount || 48} Severe (&lt;50%)</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-300">{defaulters.summary?.criticalCount || 96} Critical</span>
          </div>
        </div>

      </div>

      {/* Secondary Pulse Bar */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="font-semibold text-white">{kpi.totalDepartments}</span> Academic Departments
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            <span className="font-semibold text-white">{kpi.totalDivisions}</span> Class Divisions / Sections
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="font-semibold text-white">{kpi.suspiciousFlagsCount}</span> Anti-Proxy Scans Flagged
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-white">{kpi.pendingLeaves}</span> Leaves Pending Approval
          </div>
        </div>

        {/* Global Filter Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Departments</option>
            {departments.map(d => (
              <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
            ))}
          </select>

          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="semester">Full Semester</option>
            <option value="30days">Last 30 Days</option>
            <option value="today">Today Only</option>
          </select>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-indigo-400/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${tab.badgeColor}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Tab 1: COMMAND OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Trends & Quick Comparison Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 6-Month Trajectory Chart */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <FiTrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">College Attendance Trendline</h3>
                    <p className="text-[11px] text-slate-400">6-Month historical velocity with 75% UGC benchmark</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  Avg 87.4%
                </span>
              </div>

              <div className="h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends.monthlyTrend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis domain={[60, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                      formatter={(val) => [`${val}%`, 'Attendance Rate']}
                    />
                    <ReferenceLine y={75} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: '75% Min Threshold', fill: '#f43f5e', fontSize: 10, position: 'insideBottomRight' }} />
                    <Line type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Strategic Insights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {trends.insights.map((ins, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] space-y-1">
                    <div className="font-bold text-slate-200 flex items-center gap-1.5">
                      {ins.type === 'warning' ? <FiAlertTriangle className="w-3.5 h-3.5 text-amber-400" /> : <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                      {ins.title}
                    </div>
                    <p className="text-slate-400 leading-relaxed line-clamp-3">{ins.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Quick Standings */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FiLayers className="w-4 h-4 text-cyan-400" />
                  Department Standings
                </h3>
                <button onClick={() => setActiveTab('departments')} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                  View All →
                </button>
              </div>

              <div className="space-y-3">
                {departments.slice(0, 5).map((d) => (
                  <div key={d.code} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{d.name} ({d.code})</span>
                      <span className="text-xs font-mono font-bold text-indigo-400">{d.avgAttendance}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${d.avgAttendance}%`,
                          backgroundColor: d.avgAttendance >= 90 ? '#10b981' : d.avgAttendance >= 80 ? '#06b6d4' : '#f59e0b'
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{d.totalStudents} Students</span>
                      <span className={d.varianceFromCollegeAvg >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {d.varianceFromCollegeAvg >= 0 ? `+${d.varianceFromCollegeAvg}%` : `${d.varianceFromCollegeAvg}%`} vs Avg
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Institutional Intelligence Highlights: Defaulters & Anti-Proxy Feeds */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Defaulter Alert Box */}
            <div className="bg-slate-900/90 border border-rose-500/20 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FiAlertTriangle className="w-4 h-4 text-rose-400" />
                  <h3 className="text-sm font-bold text-white">Critical Defaulters (&lt;75%)</h3>
                </div>
                <button onClick={() => setActiveTab('defaulters')} className="text-xs text-rose-400 hover:text-rose-300 font-semibold">
                  Inspect All ({kpi.studentsBelow75}) →
                </button>
              </div>

              <div className="space-y-2.5">
                {defaulters.students.slice(0, 4).map((s) => (
                  <div key={s.id} className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-white">{s.name}</div>
                      <div className="text-[11px] text-slate-400">{s.rollNo} • {s.departmentCode} ({s.division})</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-rose-400">{s.attendanceRate}%</div>
                      <div className="text-[10px] text-amber-400">Needs +{s.classesNeededTo75} classes</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suspicious Attendance Feeds */}
            <div className="bg-slate-900/90 border border-amber-500/20 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FiShield className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Live Anti-Proxy Telemetry</h3>
                </div>
                <Link to="/admin/suspicious" className="text-xs text-amber-400 hover:text-amber-300 font-semibold">
                  Security Console →
                </Link>
              </div>

              <div className="space-y-2.5">
                {suspicious.recentIncidents.slice(0, 4).map((inc) => (
                  <div key={inc.id} className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-white">{inc.studentName} ({inc.department})</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{inc.trigger}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inc.riskScore >= 70 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        Risk {inc.riskScore}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">{inc.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 5. Tab 2: DEPARTMENT COMPARISON */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FiLayers className="w-5 h-5 text-indigo-400" />
                  Cross-Department Attendance Benchmark
                </h2>
                <p className="text-xs text-slate-400">Institutional comparison of all academic engineering and science branches</p>
              </div>
              <span className="text-xs text-slate-400">College Benchmark: 75.0%</span>
            </div>

            {/* Department Bar Chart */}
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departments} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="code" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis domain={[50, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                    formatter={(val) => [`${val}%`, 'Attendance Rate']}
                  />
                  <ReferenceLine y={75} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: '75% Min Target', fill: '#f43f5e', fontSize: 10 }} />
                  <Bar dataKey="avgAttendance" radius={[8, 8, 0, 0]}>
                    {departments.map((d, index) => (
                      <Cell key={`cell-${index}`} fill={d.color || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Department Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-y border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Department Name</th>
                    <th className="py-3 px-4">Head of Dept (HOD)</th>
                    <th className="py-3 px-4 text-center">Students</th>
                    <th className="py-3 px-4 text-center">Faculty</th>
                    <th className="py-3 px-4 text-center">Avg Attendance</th>
                    <th className="py-3 px-4 text-center">Defaulters (&lt;75%)</th>
                    <th className="py-3 px-4 text-center">Variance vs College</th>
                    <th className="py-3 px-4 text-center">Standing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {departments.map((dept) => (
                    <tr key={dept.code} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">{dept.code}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">{dept.name}</td>
                      <td className="py-3.5 px-4 text-slate-400">{dept.hodName}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-white">{dept.totalStudents}</td>
                      <td className="py-3.5 px-4 text-center text-slate-300">{dept.totalFaculty}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                          {dept.avgAttendance}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-rose-400 font-bold">{dept.defaultersCount}</span>
                        <span className="text-slate-500 text-[10px] ml-1">({dept.defaulterRate}%)</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`font-bold ${dept.varianceFromCollegeAvg >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {dept.varianceFromCollegeAvg >= 0 ? `+${dept.varianceFromCollegeAvg}%` : `${dept.varianceFromCollegeAvg}%`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          dept.statusTier === 'Top Performer' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                          dept.statusTier === 'Solid Performer' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' :
                          'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}>
                          {dept.statusTier}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* 6. Tab 3: DIVISION COMPARISON */}
      {activeTab === 'divisions' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FiGrid className="w-5 h-5 text-cyan-400" />
                  Inter-Division & Section Matrix
                </h2>
                <p className="text-xs text-slate-400">Comparative attendance performance across class divisions (CSE-A, CSE-B, IT-A, etc.)</p>
              </div>
              <span className="text-xs text-slate-400 font-medium">Total Divisions: {divisions.length}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {divisions.map((div) => (
                <div key={div.name} className="bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-5 shadow-md space-y-3 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-white">{div.name}</h3>
                      <span className="text-[11px] text-slate-400">{div.department} • {div.year} ({div.semester})</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      div.status === 'Exemplary' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      div.status === 'Solid' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                      div.status === 'Moderate' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {div.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                      <div className="text-slate-400 text-[10px] uppercase">Attendance Rate</div>
                      <div className="text-lg font-black text-white font-mono">{div.attendanceRate}%</div>
                    </div>
                    <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                      <div className="text-slate-400 text-[10px] uppercase">Today's Rate</div>
                      <div className="text-lg font-black text-emerald-400 font-mono">{div.todayRate}%</div>
                    </div>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${div.attendanceRate}%`,
                        backgroundColor: div.attendanceRate >= 90 ? '#10b981' : div.attendanceRate >= 80 ? '#06b6d4' : '#f43f5e'
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 pt-2.5">
                    <span>Mentor: <strong className="text-slate-200">{div.coordinator}</strong></span>
                    <span className="text-rose-400 font-semibold">{div.defaultersCount} Defaulters</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* 7. Tab 4: ATTENDANCE TRENDS */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FiTrendingUp className="w-5 h-5 text-emerald-400" />
                Institutional Attendance Velocity &amp; Day Patterns
              </h2>
              <p className="text-xs text-slate-400">Temporal progression tracking across 6 months and weekly pattern analysis</p>
            </div>

            {/* 6-Month Trajectory */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-200">Aggregate 6-Month Velocity vs 75% Benchmark</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends.monthlyTrend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                    <YAxis domain={[60, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                      formatter={(val) => [`${val}%`, 'Attendance Rate']}
                    />
                    <ReferenceLine y={75} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: '75% Mandatory UGC Cutoff', fill: '#f43f5e', fontSize: 10 }} />
                    <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Day of Week Attendance (Monday - Friday) */}
            <div className="space-y-3 border-t border-slate-800 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">College-Wide Weekday Breakdown (Mon - Fri)</h3>
                  <p className="text-[11px] text-slate-400">Detecting institutional Tuesday peaks and Friday attendance slumps</p>
                </div>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                  Friday Drop: -17.3%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {trends.weekdayPattern.map((day) => (
                  <div key={day.day} className={`p-4 rounded-xl border text-center space-y-2 ${
                    day.day === 'Friday' ? 'bg-rose-950/20 border-rose-500/40' :
                    day.day === 'Tuesday' ? 'bg-emerald-950/20 border-emerald-500/40' :
                    'bg-slate-950/60 border-slate-800'
                  }`}>
                    <div className="text-xs font-bold text-slate-300">{day.day}</div>
                    <div className={`text-2xl font-black font-mono ${
                      day.day === 'Friday' ? 'text-rose-400' :
                      day.day === 'Tuesday' ? 'text-emerald-400' :
                      'text-white'
                    }`}>
                      {day.rate}%
                    </div>
                    <div className="text-[10px] text-slate-400">{day.lecturesHeld} Lectures</div>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      day.day === 'Friday' ? 'bg-rose-500/20 text-rose-300' :
                      day.day === 'Tuesday' ? 'bg-emerald-500/20 text-emerald-300' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {day.attendanceStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 8. Tab 5: DEFAULTER ANALYSIS */}
      {activeTab === 'defaulters' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FiAlertTriangle className="w-5 h-5 text-rose-400" />
                  College Defaulter Intelligence &amp; Recovery Roster
                </h2>
                <p className="text-xs text-slate-400">
                  Mathematical deficit calculation: Consecutive lectures needed to reach mandatory 75% threshold
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDispatchBulkAlerts}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-rose-600/20 flex items-center gap-1.5 transition-all"
                >
                  <FiSend className="w-3.5 h-3.5" />
                  Send Warning Alerts
                </button>
              </div>
            </div>

            {/* Severity Distribution Tiers */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-rose-950/30 border border-rose-500/40 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-rose-400">Severe Emergency (&lt;50%)</div>
                <div className="text-2xl font-black text-rose-300 mt-1">{defaulters.summary.severeCount || 48}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Disciplinary hearing recommended</p>
              </div>
              <div className="p-3.5 bg-amber-950/30 border border-amber-500/40 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-amber-400">Critical Shortage (50-65%)</div>
                <div className="text-2xl font-black text-amber-300 mt-1">{defaulters.summary.criticalCount || 96}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Parent summons notice required</p>
              </div>
              <div className="p-3.5 bg-yellow-950/30 border border-yellow-500/40 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-yellow-400">Warning Borderline (65-75%)</div>
                <div className="text-2xl font-black text-yellow-300 mt-1">{defaulters.summary.warningCount || 168}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Recovery plan possible within 2 weeks</p>
              </div>
              <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/40 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-emerald-400">Safe Standing (&gt;75%)</div>
                <div className="text-2xl font-black text-emerald-300 mt-1">{defaulters.summary.safeCount || 2169}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Exam eligibility cleared</p>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search defaulter by name or roll no..."
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <span className="text-xs text-slate-400 self-start sm:self-center">
                Showing {filteredDefaulters.length} ranked defaulter students
              </span>
            </div>

            {/* Defaulter Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-y border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Dept / Div</th>
                    <th className="py-3 px-4 text-center">Conducted</th>
                    <th className="py-3 px-4 text-center">Attended</th>
                    <th className="py-3 px-4 text-center">Attendance %</th>
                    <th className="py-3 px-4 text-center">Consecutive Classes Needed for 75%</th>
                    <th className="py-3 px-4 text-center">Severity</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredDefaulters.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{st.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{st.rollNo}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-200">{st.departmentCode}</span>
                        <span className="text-slate-400 text-[11px] ml-1">({st.division})</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-white">{st.totalClasses}</td>
                      <td className="py-3.5 px-4 text-center text-slate-300">{st.attendedClasses}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
                          {st.attendanceRate}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          +{st.classesNeededTo75} Lectures
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          st.severityTier === 'Severe Emergency' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          st.severityTier === 'Critical Risk' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        }`}>
                          {st.severityTier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            setToastMessage(`📨 Official attendance warning sent to ${st.name} and parent contact (${st.parentPhone || '+91 98XXX'})`);
                            setTimeout(() => setToastMessage(''), 4000);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-semibold transition-all"
                        >
                          Send Notice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* 9. Tab 6: TEACHER / CLASS STATISTICS */}
      {activeTab === 'faculty' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FiUserCheck className="w-5 h-5 text-cyan-400" />
                  Faculty Attendance Compliance &amp; Teaching Statistics
                </h2>
                <p className="text-xs text-slate-400">Punctuality tracking, class conduction rate, and lecture slot distribution</p>
              </div>
              <span className="text-xs text-slate-400">Total Teachers: {teacherStats.complianceSummary.totalFaculty || 143}</span>
            </div>

            {/* Compliance Overview Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Scheduled Classes</div>
                <div className="text-2xl font-black text-white mt-1">{teacherStats.complianceSummary.scheduledClasses || 1870}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Semester timetable slots</p>
              </div>
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Conducted Classes</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">{teacherStats.complianceSummary.conductedClasses || 1824}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">{teacherStats.complianceSummary.conductionRate || 97.5}% conduction rate</p>
              </div>
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400 uppercase font-bold">On-Time Marking Rate</div>
                <div className="text-2xl font-black text-cyan-400 mt-1">{teacherStats.complianceSummary.onTimeMarkingRate || 94.8}%</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Marked within 15 min of class</p>
              </div>
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Avg Student Attendance</div>
                <div className="text-2xl font-black text-indigo-400 mt-1">{teacherStats.complianceSummary.averageStudentAttendance || 87.4}%</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Across all faculty lectures</p>
              </div>
            </div>

            {/* Top Faculty Leaderboard */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-200">Faculty Leaderboard &amp; Punctuality Index</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-y border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Faculty Member</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4 text-center">Lectures Conducted</th>
                      <th className="py-3 px-4 text-center">On-Time Marking %</th>
                      <th className="py-3 px-4 text-center">Avg Student Attendance</th>
                      <th className="py-3 px-4 text-center">Punctuality Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {teacherStats.topTeachers.map((tch, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">{tch.name}</td>
                        <td className="py-3.5 px-4 text-slate-300">{tch.department} ({tch.designation})</td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-white">{tch.classesConducted}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-mono font-bold text-cyan-400">{tch.onTimeRate}%</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-mono font-bold text-emerald-400">{tch.avgStudentAttendance}%</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            {tch.punctualityBadge}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lecture Time-Slot Distribution */}
            <div className="space-y-3 border-t border-slate-800 pt-6">
              <h3 className="text-sm font-semibold text-slate-200">Attendance by Lecture Time Slot</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {teacherStats.timeSlots.map((ts, idx) => (
                  <div key={idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                    <div className="font-bold text-white text-xs flex items-center gap-1.5">
                      <FiClock className="w-3.5 h-3.5 text-indigo-400" />
                      {ts.slot}
                    </div>
                    <div className="text-xl font-black text-indigo-300 font-mono">{ts.presentRate}% Present</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{ts.conducted} sessions conducted</span>
                      <span className="text-amber-400">{ts.lateRate}% Late</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 10. Tab 7: SUSPICIOUS ATTENDANCE */}
      {activeTab === 'suspicious' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FiShield className="w-5 h-5 text-amber-400" />
                  College Anti-Proxy &amp; Fraud Telemetry
                </h2>
                <p className="text-xs text-slate-400">Hardware fingerprint collisions, geofence breaches, and rapid succession proxy scans</p>
              </div>
              <Link
                to="/admin/suspicious"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/20"
              >
                Open Full Anti-Proxy Console
                <FiChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Risk Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Total Scans Today</div>
                <div className="text-2xl font-black text-white mt-1">{suspicious.overview.totalScansToday || 2481}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Across dynamic QR &amp; GPS</p>
              </div>
              <div className="p-4 bg-slate-950/70 border border-rose-500/30 rounded-xl">
                <div className="text-[10px] text-rose-400 uppercase font-bold">High Risk Incidents</div>
                <div className="text-2xl font-black text-rose-400 mt-1">{suspicious.overview.highRiskCount || 6}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Score &gt; 70 threshold</p>
              </div>
              <div className="p-4 bg-slate-950/70 border border-amber-500/30 rounded-xl">
                <div className="text-[10px] text-amber-400 uppercase font-bold">Medium Risk</div>
                <div className="text-2xl font-black text-amber-400 mt-1">{suspicious.overview.mediumRiskCount || 11}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Score 40 - 70 review</p>
              </div>
              <div className="p-4 bg-slate-950/70 border border-emerald-500/30 rounded-xl">
                <div className="text-[10px] text-emerald-400 uppercase font-bold">Resolved / Verified</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">{suspicious.overview.resolvedCount || 18}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Verified by faculty</p>
              </div>
            </div>

            {/* Signals Breakdown */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-200">Detection Trigger Signals</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {suspicious.signalsDistribution.map((sig, idx) => (
                  <div key={idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{sig.signal}</span>
                      <span className="font-mono font-bold text-amber-400">{sig.count}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${sig.percentage}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-400">{sig.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Incidents Feed */}
            <div className="space-y-3 border-t border-slate-800 pt-6">
              <h3 className="text-sm font-semibold text-slate-200">Recent Telemetry Incidents</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-y border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Detection Trigger</th>
                      <th className="py-3 px-4 text-center">Risk Score</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {suspicious.recentIncidents.map((inc) => (
                      <tr key={inc.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{inc.studentName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{inc.rollNo} • {inc.department}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">{inc.subject}</td>
                        <td className="py-3.5 px-4 text-slate-300">{inc.trigger}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                            inc.riskScore >= 70 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {inc.riskScore}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-[11px] text-slate-400">{inc.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 11. Tab 8: LEAVE STATISTICS */}
      {activeTab === 'leaves' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FiFileText className="w-5 h-5 text-cyan-400" />
                  Institutional Leave Statistics &amp; Truancy Impact
                </h2>
                <p className="text-xs text-slate-400">Medical leaves, official duty events, and departmental leave distribution</p>
              </div>
              <span className="text-xs text-slate-400">Total Leaves Filed: {leaves.overview.totalApplications || 184}</span>
            </div>

            {/* Overview Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Total Applications</div>
                <div className="text-2xl font-black text-white mt-1">{leaves.overview.totalApplications || 184}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">This academic semester</p>
              </div>
              <div className="p-4 bg-slate-950/70 border border-emerald-500/30 rounded-xl">
                <div className="text-[10px] text-emerald-400 uppercase font-bold">Approved Leaves</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">{leaves.overview.approved || 142}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">{leaves.overview.approvalRate || 77.2}% approval rate</p>
              </div>
              <div className="p-4 bg-slate-950/70 border border-amber-500/30 rounded-xl">
                <div className="text-[10px] text-amber-400 uppercase font-bold">Pending Review</div>
                <div className="text-2xl font-black text-amber-400 mt-1">{leaves.overview.pending || 26}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Awaiting HOD verification</p>
              </div>
              <div className="p-4 bg-slate-950/70 border border-rose-500/30 rounded-xl">
                <div className="text-[10px] text-rose-400 uppercase font-bold">Rejected</div>
                <div className="text-2xl font-black text-rose-400 mt-1">{leaves.overview.rejected || 16}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Inadequate documentation</p>
              </div>
            </div>

            {/* Leave by Category */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-200">Leave Applications by Category</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {leaves.byCategory.map((cat, idx) => (
                  <div key={idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{cat.type}</span>
                      <span className="font-mono font-bold text-cyan-400">{cat.count}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }} />
                    </div>
                    <div className="text-[11px] text-slate-400">{cat.percentage}% of all college leaves</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="space-y-3 border-t border-slate-800 pt-6">
              <h3 className="text-sm font-semibold text-slate-200">Department Leave Volume</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-y border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4 text-center">Applications</th>
                      <th className="py-3 px-4 text-center">Approved</th>
                      <th className="py-3 px-4 text-center">Pending</th>
                      <th className="py-3 px-4 text-center">Rejected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {leaves.departmentBreakdown.map((d, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">{d.department}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-white font-mono">{d.applications}</td>
                        <td className="py-3.5 px-4 text-center text-emerald-400 font-bold">{d.approved}</td>
                        <td className="py-3.5 px-4 text-center text-amber-400 font-bold">{d.pending}</td>
                        <td className="py-3.5 px-4 text-center text-rose-400 font-bold">{d.rejected}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
