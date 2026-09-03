import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBarChart2,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiCalendar,
  FiUsers,
  FiAlertTriangle,
  FiCheckCircle,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiBookOpen,
  FiLayers,
  FiChevronRight,
  FiInfo,
  FiActivity,
  FiArrowUpRight,
  FiArrowDownRight,
  FiUserX,
  FiAward
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  Cell
} from 'recharts';
import { getTeacherAnalyticsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function TeacherAnalytics() {
  const { user: authUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [timeframe, setTimeframe] = useState('all'); // 'all', '30days', 'semester'
  const [activeTab, setActiveTab] = useState('weekday'); // 'weekday', 'lecture', 'students', 'comparison'
  const [studentSubTab, setStudentSubTab] = useState('absent'); // 'absent', 'late'

  useEffect(() => {
    fetchAnalytics();
  }, [selectedSubject, selectedDivision, timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (selectedSubject !== 'ALL') params.subject = selectedSubject;
      if (selectedDivision !== 'ALL') params.division = selectedDivision;
      if (timeframe !== 'all') params.timeframe = timeframe;

      const res = await getTeacherAnalyticsApi(params);
      if (res?.success && res.data) {
        setAnalytics(res.data);
      } else {
        setError('Could not retrieve analytics data.');
      }
    } catch (err) {
      console.error('Failed to load teacher analytics:', err);
      setError(err.message || 'Unable to load teacher analytics.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!analytics) return;

    const rows = [
      ['Attendance Analytics Summary - Faculty Report'],
      ['Teacher', analytics.teacher?.name || 'Faculty Member'],
      ['Department', analytics.teacher?.department || 'Computer Science'],
      ['Generated Date', new Date().toLocaleDateString()],
      [''],
      ['--- 1. OVERALL ATTENDANCE METRICS ---'],
      ['Average Attendance Rate', `${analytics.overallAttendance?.averageRate}%`],
      ['Total Lectures Conducted', analytics.overallAttendance?.totalLecturesConducted],
      ['Total Attendances Recorded', analytics.overallAttendance?.totalStudentAttendances],
      ['Present Count', analytics.overallAttendance?.presentCount],
      ['Absent Count', analytics.overallAttendance?.absentCount],
      ['Late Count', analytics.overallAttendance?.lateCount],
      ['75% Benchmark Status', analytics.overallAttendance?.status],
      [''],
      ['--- 2. ATTENDANCE BY WEEKDAY ---'],
      ['Day', 'Attendance %', 'Conducted Classes', 'Present', 'Absent', 'Late', 'Delta from Avg', 'Status'],
      ...(analytics.attendanceByWeekday || []).map(w => [
        w.dayName,
        `${w.attendanceRate}%`,
        w.conductedLectures,
        w.presentCount,
        w.absentCount,
        w.lateCount,
        `${w.deltaFromAverage}%`,
        w.status
      ]),
      [''],
      ['--- 3. ATTENDANCE BY LECTURE SLOT ---'],
      ['Time Slot', 'Period', 'Attendance %', 'Total Lectures', 'Present', 'Absent', 'Status'],
      ...(analytics.attendanceByLecture || []).map(l => [
        l.slotLabel,
        l.period,
        `${l.attendanceRate}%`,
        l.totalLectures,
        l.presentCount,
        l.absentCount,
        l.status
      ]),
      [''],
      ['--- 4. MOST ABSENT STUDENTS ---'],
      ['Roll Number', 'Student Name', 'Division', 'Total Classes', 'Absent Count', 'Attendance %', 'Classes to 75%', 'Risk Tier'],
      ...(analytics.mostAbsentStudents || []).map(s => [
        s.rollNo,
        s.name,
        s.division,
        s.totalClasses,
        s.absentCount,
        `${s.attendanceRate}%`,
        s.consecutiveNeededTo75,
        s.riskLevel
      ]),
      [''],
      ['--- 5. MOST LATE STUDENTS ---'],
      ['Roll Number', 'Student Name', 'Division', 'Total Classes', 'Late Count', 'Late %', 'Punctuality Tier'],
      ...(analytics.mostLateStudents || []).map(s => [
        s.rollNo,
        s.name,
        s.division,
        s.totalClasses,
        s.lateCount,
        `${s.latePercentage}%`,
        s.punctualityTier
      ]),
      [''],
      ['--- 6. DIVISION COMPARISON ---'],
      ['Division Name', 'Attendance %', 'Enrolled Students', 'Total Sessions', 'Rank', 'Variance from Leader', 'Badge'],
      ...(analytics.divisionComparison || []).map(d => [
        d.divisionName,
        `${d.attendanceRate}%`,
        d.enrolledStudents,
        d.totalSessions,
        d.rank,
        `${d.varianceFromLeader}%`,
        d.badge
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Teacher_Analytics_${(analytics.teacher?.name || 'Faculty').replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm font-medium">Loading faculty analytics & classroom insights...</p>
      </div>
    );
  }

  const {
    teacher = {},
    overallAttendance = {},
    mostAbsentStudents = [],
    mostLateStudents = [],
    attendanceByLecture = [],
    attendanceByWeekday = [],
    weekdayInsights = {},
    subjectAttendance = [],
    divisionComparison = []
  } = analytics || {};

  return (
    <div className="space-y-6">
      
      {/* Top Header Banner */}
      <div className="glass-panel p-6 border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="badge badge-primary text-xs uppercase tracking-wider font-semibold">
              Phase 28 Faculty Hub
            </span>
            {overallAttendance.delta >= 0 ? (
              <span className="badge badge-present text-xs flex items-center gap-1 font-medium">
                <FiCheckCircle className="w-3.5 h-3.5" /> +{overallAttendance.delta}% above 75% standard
              </span>
            ) : (
              <span className="badge badge-absent text-xs flex items-center gap-1 font-medium">
                <FiAlertTriangle className="w-3.5 h-3.5" /> {overallAttendance.delta}% below 75% standard
              </span>
            )}
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Teacher Analytics & <span className="gradient-text">Classroom Insights</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Diagnose attendance trends, detect weekday behavioral patterns (such as Friday drops), track chronic absentees and late arrivals, and evaluate performance across divisions.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="btn btn-secondary py-2 px-3.5 text-xs flex items-center gap-2"
            title="Refresh Analytics"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="btn btn-primary py-2 px-3.5 text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20"
            title="Download CSV Summary"
          >
            <FiDownload className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Global Filter Bar */}
      <div className="glass-panel p-4 border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <FiFilter className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Filter Scope:</span>
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="input-field py-1.5 px-3 text-xs bg-slate-900 border-slate-700 text-slate-200 rounded-lg"
          >
            <option value="ALL">All Subjects (Combined)</option>
            {subjectAttendance.map(s => (
              <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
            ))}
          </select>

          {/* Division Filter */}
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="input-field py-1.5 px-3 text-xs bg-slate-900 border-slate-700 text-slate-200 rounded-lg"
          >
            <option value="ALL">All Divisions</option>
            {divisionComparison.map(d => (
              <option key={d.shortCode || d.divisionName} value={d.shortCode || d.divisionName}>
                {d.divisionName}
              </option>
            ))}
          </select>
        </div>

        {/* Timeframe Filter */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-stretch sm:self-auto justify-center">
          <button
            onClick={() => setTimeframe('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              timeframe === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setTimeframe('30days')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              timeframe === '30days'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Past 30 Days
          </button>
          <button
            onClick={() => setTimeframe('semester')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              timeframe === 'semester'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Semester Term
          </button>
        </div>
      </div>

      {/* 4 Core Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Average Class Attendance */}
        <div className="glass-panel p-5 border-slate-800 relative overflow-hidden hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Class Attendance</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FiBarChart2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {overallAttendance.averageRate || 0}%
            </span>
            <span className={`text-xs font-bold ${overallAttendance.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {overallAttendance.delta >= 0 ? `+${overallAttendance.delta}%` : `${overallAttendance.delta}%`} vs 75%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Weighted across {overallAttendance.totalStudentAttendances || 0} student check-ins
          </p>
        </div>

        {/* 2. Total Sessions Conducted */}
        <div className="glass-panel p-5 border-slate-800 relative overflow-hidden hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lectures Conducted</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <FiCalendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {overallAttendance.totalLecturesConducted || 0}
            </span>
            <span className="text-xs text-slate-400 font-medium">Sessions</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {overallAttendance.presentCount || 0} Present • {overallAttendance.absentCount || 0} Absent • {overallAttendance.lateCount || 0} Late
          </p>
        </div>

        {/* 3. Most Absent / Defaulter Students */}
        <div className="glass-panel p-5 border-slate-800 relative overflow-hidden hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Defaulter Students</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <FiUserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {mostAbsentStudents.length}
            </span>
            <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
              Below 75%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Flagged for institutional attendance shortage deficit
          </p>
        </div>

        {/* 4. Chronic Late Arrivals */}
        <div className="glass-panel p-5 border-slate-800 relative overflow-hidden hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Late Arrivals Count</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FiClock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {overallAttendance.lateCount || 0}
            </span>
            <span className="text-xs text-amber-400 font-medium">
              {mostLateStudents.length} Students
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Factor 0.8x weight applied per institutional rule
          </p>
        </div>

      </div>

      {/* Weekday Pattern & Behavioral Insights Callout Banner */}
      {weekdayInsights.fridayDrop && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/20 border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-rose-950/30">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 shrink-0 mt-0.5">
              <FiAlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white tracking-wide">
                  {weekdayInsights.patternHeadline || 'Poor Friday Attendance Pattern Detected'}
                </h4>
                <span className="badge badge-absent text-[10px] font-bold uppercase">Critical Pattern</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                {weekdayInsights.insightSummary}
              </p>
              <p className="text-xs text-amber-300 font-medium flex items-center gap-1.5 pt-1">
                <FiInfo className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span><strong className="text-white">Recommendation:</strong> {weekdayInsights.actionableAdvice}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('weekday')}
            className="btn btn-secondary text-xs py-2 px-4 whitespace-nowrap self-start md:self-auto border-rose-500/40 hover:bg-rose-500/10 text-rose-200"
          >
            <span>Inspect Weekdays</span>
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Interactive Navigation Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('weekday')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'weekday'
              ? 'border-indigo-500 text-white bg-indigo-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <FiCalendar className="w-4 h-4" />
          <span>Attendance by Weekday</span>
          {weekdayInsights.fridayDrop && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('lecture')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'lecture'
              ? 'border-indigo-500 text-white bg-indigo-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <FiClock className="w-4 h-4" />
          <span>Attendance by Lecture Slot</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'students'
              ? 'border-indigo-500 text-white bg-indigo-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <FiUsers className="w-4 h-4" />
          <span>Most Absent & Late Students</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
            {mostAbsentStudents.length + mostLateStudents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('comparison')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'comparison'
              ? 'border-indigo-500 text-white bg-indigo-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <FiLayers className="w-4 h-4" />
          <span>Subject & Division Comparison</span>
        </button>
      </div>

      {/* TAB CONTENT 1: ATTENDANCE BY WEEKDAY */}
      {activeTab === 'weekday' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Chart Column */}
            <div className="lg:col-span-7 glass-panel p-6 border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FiCalendar className="w-5 h-5 text-indigo-400" />
                    Weekday Attendance Pattern
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Evaluates student attendance percentage across days of the week (Monday to Friday)
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span className="text-slate-400 text-[11px]">75% Benchmark</span>
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceByWeekday} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="shortDay" stroke="#64748b" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                      formatter={(val) => [`${val}%`, 'Attendance Rate']}
                      labelFormatter={(label) => `Day: ${label}`}
                    />
                    <ReferenceLine y={75} stroke="#10b981" strokeDasharray="4 4" label={{ value: '75% Min', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }} />
                    <Bar dataKey="attendanceRate" radius={[8, 8, 0, 0]}>
                      {attendanceByWeekday.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.dayName === 'Friday' && entry.attendanceRate < 75 ? '#f43f5e' : (entry.attendanceRate >= 90 ? '#10b981' : '#6366f1')}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Real-time Weekday ASCII / Rate Strip matching prompt */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Weekly Rate Breakdown:</span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2">
                  {attendanceByWeekday.map(w => (
                    <div
                      key={w.dayName}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        w.dayName === 'Friday' && w.attendanceRate < 75
                          ? 'bg-rose-950/30 border-rose-500/40 text-rose-300 ring-1 ring-rose-500/30'
                          : 'bg-slate-950/60 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="text-[11px] font-semibold text-slate-400">{w.dayName}</div>
                      <div className={`text-lg font-extrabold mt-0.5 ${
                        w.attendanceRate >= 90 ? 'text-emerald-400' : (w.attendanceRate < 75 ? 'text-rose-400' : 'text-white')
                      }`}>
                        {w.attendanceRate}%
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {w.deltaFromAverage >= 0 ? `+${w.deltaFromAverage}%` : `${w.deltaFromAverage}%`} avg
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pattern Analysis Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="glass-panel p-6 border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FiActivity className="w-5 h-5 text-indigo-400" />
                  Behavioral Pattern Diagnostics
                </h3>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">Peak Attendance Day</span>
                      <span className="badge badge-present text-[10px] font-bold">Highest Engagement</span>
                    </div>
                    <div className="text-base font-bold text-white flex items-center gap-2">
                      <span>{weekdayInsights.highestDay || 'Tuesday'}</span>
                      <span className="text-emerald-400 font-extrabold">({weekdayInsights.highestRate || 91}%)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Midweek lectures exhibit the highest attendance consistency and punctuality.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">Lowest Attendance Day</span>
                      <span className="badge badge-absent text-[10px] font-bold">Deficit Warning</span>
                    </div>
                    <div className="text-base font-bold text-white flex items-center gap-2">
                      <span>{weekdayInsights.lowestDay || 'Friday'}</span>
                      <span className="text-rose-400 font-extrabold">({weekdayInsights.lowestRate || 69}%)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Significant absenteeism occurs before weekends. Attendance drops by {Math.abs(weekdayInsights.fridayDelta || 12.2)}% relative to weekly average.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-1">
                    <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <FiTrendingUp className="w-3.5 h-3.5" />
                      Actionable Academic Interventions
                    </div>
                    <ul className="text-[11px] text-slate-300 space-y-1.5 list-disc list-inside pt-1">
                      <li>Avoid scheduling passive lectures on Friday afternoons.</li>
                      <li>Incorporate collaborative group activities or programming labs on Fridays.</li>
                      <li>Assign continuous evaluation marks or short check-in quizzes on pre-weekend slots.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT 2: ATTENDANCE BY LECTURE SLOT */}
      {activeTab === 'lecture' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Slot Chart */}
            <div className="lg:col-span-7 glass-panel p-6 border-slate-800 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FiClock className="w-5 h-5 text-indigo-400" />
                  Attendance by Lecture Time Slot
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparison between morning, midday, and afternoon lecture sessions
                </p>
              </div>

              <div className="h-64 sm:h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceByLecture} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="period" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                      formatter={(val) => [`${val}%`, 'Attendance Rate']}
                    />
                    <ReferenceLine y={75} stroke="#10b981" strokeDasharray="4 4" />
                    <Bar dataKey="attendanceRate" radius={[8, 8, 0, 0]} fill="#06b6d4">
                      {attendanceByLecture.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.attendanceRate >= 85 ? '#10b981' : (entry.attendanceRate >= 75 ? '#06b6d4' : '#f59e0b')}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Slot Details Table */}
            <div className="lg:col-span-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Slot Breakdown Details</h4>
              {attendanceByLecture.map(slot => (
                <div key={slot.slotLabel} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white">{slot.slotLabel}</span>
                      <span className="block text-[11px] text-slate-400">{slot.period} • {slot.totalLectures} sessions</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-base font-extrabold ${slot.attendanceRate >= 85 ? 'text-emerald-400' : (slot.attendanceRate >= 75 ? 'text-cyan-400' : 'text-amber-400')}`}>
                        {slot.attendanceRate}%
                      </span>
                      <span className="block text-[10px] text-slate-500">{slot.status}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                    {slot.note}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT 3: MOST ABSENT & MOST LATE STUDENTS */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          
          {/* Sub Tab Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setStudentSubTab('absent')}
                className={`flex items-center gap-2 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all ${
                  studentSubTab === 'absent'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FiUserX className="w-3.5 h-3.5" />
                <span>Most Absent Students ({mostAbsentStudents.length})</span>
              </button>
              <button
                onClick={() => setStudentSubTab('late')}
                className={`flex items-center gap-2 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all ${
                  studentSubTab === 'late'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FiClock className="w-3.5 h-3.5" />
                <span>Most Late Students ({mostLateStudents.length})</span>
              </button>
            </div>

            <span className="text-xs text-slate-400 hidden sm:inline-block">
              Sorted by frequency in your assigned classes
            </span>
          </div>

          {/* Sub-Tab 1: Most Absent */}
          {studentSubTab === 'absent' && (
            <div className="glass-panel border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Roll Number</th>
                      <th className="py-3 px-4">Division</th>
                      <th className="py-3 px-4 text-center">Total Classes</th>
                      <th className="py-3 px-4 text-center">Absences</th>
                      <th className="py-3 px-4 text-center">Current %</th>
                      <th className="py-3 px-4 text-center">Deficit (to 75%)</th>
                      <th className="py-3 px-4 text-center">Risk Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {mostAbsentStudents.map((s, idx) => (
                      <tr key={s.id || idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-800 text-[11px] flex items-center justify-center text-slate-400">
                              {idx + 1}
                            </span>
                            <div>
                              <span>{s.name}</span>
                              <span className="block text-[10px] text-slate-500">{s.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">{s.rollNo}</td>
                        <td className="py-3 px-4 text-slate-400">{s.division}</td>
                        <td className="py-3 px-4 text-center text-slate-300">{s.totalClasses}</td>
                        <td className="py-3 px-4 text-center font-bold text-rose-400">{s.absentCount}</td>
                        <td className="py-3 px-4 text-center font-bold">
                          <span className={s.attendanceRate < 65 ? 'text-rose-400' : (s.attendanceRate < 75 ? 'text-amber-400' : 'text-emerald-400')}>
                            {s.attendanceRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {s.consecutiveNeededTo75 > 0 ? (
                            <span className="badge badge-absent text-[10px] font-bold">
                              {s.consecutiveNeededTo75} consecutive
                            </span>
                          ) : (
                            <span className="text-emerald-400 text-[11px] font-semibold">On Track</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.riskLevel === 'Critical Risk'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {s.riskLevel}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {mostAbsentStudents.length === 0 && (
                      <tr>
                        <td colSpan="8" className="py-8 text-center text-xs text-slate-400">
                          No chronic defaulter students recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-Tab 2: Most Late */}
          {studentSubTab === 'late' && (
            <div className="glass-panel border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Roll Number</th>
                      <th className="py-3 px-4">Division</th>
                      <th className="py-3 px-4 text-center">Total Classes</th>
                      <th className="py-3 px-4 text-center">Late Count</th>
                      <th className="py-3 px-4 text-center">Late Rate %</th>
                      <th className="py-3 px-4 text-center">Overall %</th>
                      <th className="py-3 px-4 text-center">Punctuality Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {mostLateStudents.map((s, idx) => (
                      <tr key={s.id || idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-800 text-[11px] flex items-center justify-center text-slate-400">
                              {idx + 1}
                            </span>
                            <div>
                              <span>{s.name}</span>
                              <span className="block text-[10px] text-slate-500">{s.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">{s.rollNo}</td>
                        <td className="py-3 px-4 text-slate-400">{s.division}</td>
                        <td className="py-3 px-4 text-center text-slate-300">{s.totalClasses}</td>
                        <td className="py-3 px-4 text-center font-bold text-amber-400">{s.lateCount}</td>
                        <td className="py-3 px-4 text-center text-amber-300 font-bold">{s.latePercentage}%</td>
                        <td className="py-3 px-4 text-center font-bold text-white">{s.attendanceRate}%</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.punctualityTier === 'High Lateness Risk'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : (s.punctualityTier === 'Frequent Latecomer' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30')
                          }`}>
                            {s.punctualityTier}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {mostLateStudents.length === 0 && (
                      <tr>
                        <td colSpan="8" className="py-8 text-center text-xs text-slate-400">
                          No chronic late arrivals recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB CONTENT 4: SUBJECT ATTENDANCE & DIVISION COMPARISON */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          
          {/* Division Comparison Section */}
          <div className="glass-panel p-6 border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FiLayers className="w-5 h-5 text-indigo-400" />
                  Division & Section Comparison
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparative performance across different sections taught by faculty
                </p>
              </div>
              <span className="badge badge-primary text-xs">
                {divisionComparison.length} Active Divisions
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {divisionComparison.map((div, idx) => (
                <div
                  key={div.divisionName}
                  className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all relative overflow-hidden space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center">
                        #{div.rank || idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-white">{div.divisionName}</h4>
                    </div>
                    <span className="badge badge-present text-[10px] font-bold">
                      {div.badge}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-3xl font-extrabold text-white tracking-tight">
                      {div.attendanceRate}%
                    </span>
                    <span className={`text-xs font-bold ${div.varianceFromLeader >= 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {div.varianceFromLeader >= 0 ? 'Leader' : `${div.varianceFromLeader}% from #1`}
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${div.attendanceRate}%`,
                        backgroundColor: div.color || '#6366f1'
                      }}
                    ></div>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-800/60">
                    <div className="flex justify-between">
                      <span>Enrolled Capacity:</span>
                      <span className="text-slate-200 font-semibold">{div.enrolledStudents} students</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Sessions:</span>
                      <span className="text-slate-200 font-semibold">{div.totalSessions} classes</span>
                    </div>
                    {div.highestSubject && (
                      <div className="flex justify-between text-indigo-300">
                        <span>Top Course:</span>
                        <span className="font-semibold truncate max-w-[140px]">{div.highestSubject}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Attendance Cards */}
          <div className="glass-panel p-6 border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FiBookOpen className="w-5 h-5 text-indigo-400" />
                Course Subject Attendance Breakdown
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Detailed attendance rates and class counts across all assigned subjects
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {subjectAttendance.map((sub) => (
                <div
                  key={sub.code}
                  className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-indigo-400">{sub.code}</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{sub.name}</h4>
                    </div>
                    <span className={`badge text-[10px] font-bold ${
                      sub.status === 'Healthy' ? 'badge-present' : (sub.status === 'Satisfactory' ? 'badge-late' : 'badge-absent')
                    }`}>
                      {sub.status}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-2xl font-extrabold text-white">
                      {sub.attendanceRate}%
                    </span>
                    <span className={`text-xs font-semibold ${sub.benchmarkDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {sub.benchmarkDelta >= 0 ? `+${sub.benchmarkDelta}%` : `${sub.benchmarkDelta}%`} vs 75%
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${sub.attendanceRate}%`,
                        backgroundColor: sub.color || '#6366f1'
                      }}
                    ></div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <span>{sub.totalClasses} classes conducted</span>
                    <span>{sub.enrolledStudents} students</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
