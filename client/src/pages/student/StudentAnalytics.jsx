import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiActivity,
  FiTrendingUp,
  FiTrendingDown,
  FiCheckCircle,
  FiAlertTriangle,
  FiCalendar,
  FiClock,
  FiBookOpen,
  FiStar,
  FiAward,
  FiDownload,
  FiRefreshCw,
  FiShield,
  FiChevronRight,
  FiFilter,
  FiInfo,
  FiUserCheck,
  FiFileText,
  FiZap,
  FiArrowUpRight,
  FiArrowDownRight,
  FiLayers
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  Legend as RechartsLegend
} from 'recharts';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartJSTooltip,
  Legend as ChartJSLegend,
  Filler
} from 'chart.js';
import { Line as ChartJSLine, Bar as ChartJSBar } from 'react-chartjs-2';
import { getStudentPersonalAnalyticsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartJSTooltip,
  ChartJSLegend,
  Filler
);

export default function StudentAnalytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [engine, setEngine] = useState('recharts');
  const [timeframe, setTimeframe] = useState('6M');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState('pct-desc');

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getStudentPersonalAnalyticsApi();
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load personal student analytics:', err);
      setError(err.message || 'Unable to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const overall = data?.overallAttendance || {
    percentage: 85.5,
    rawPercentage: 86.2,
    totalClasses: 152,
    conductedClasses: 152,
    attendedClasses: 129,
    absentClasses: 20,
    lateClasses: 6,
    leaveClasses: 3,
    benchmark: 75,
    delta: 10.5,
    isEligible: true,
    status: 'Eligible',
    safetyMargin: '+10.5% above minimum requirement'
  };

  const bestSubject = data?.bestSubject || {
    code: 'CS302',
    name: 'Database Management Systems',
    percentage: 93.8,
    attended: 30,
    totalClasses: 32,
    delta: 18.8,
    safeMisses: 8
  };

  const worstSubject = data?.worstSubject || {
    code: 'CS305',
    name: 'Software Engineering',
    percentage: 69.2,
    attended: 18,
    totalClasses: 26,
    delta: -5.8,
    consecutiveNeeded: 6
  };

  const lateCount = data?.lateCount || {
    total: 6,
    percentage: 3.9,
    weightFactor: 0.8,
    punctualityRating: 'Excellent',
    subjectBreakdown: []
  };

  const absentCount = data?.absentCount || {
    total: 20,
    percentage: 13.2,
    unexcused: 17,
    excused: 3,
    subjectBreakdown: []
  };

  const leaveCount = data?.leaveCount || {
    total: 3,
    approved: 3,
    pending: 0,
    types: { Medical: 2, 'Personal Emergency': 1, 'Official Event': 0, 'Duty Leave': 0 }
  };

  const allSubjects = data?.subjectAttendance || [];

  // Filter and sort subjects
  const filteredSubjects = allSubjects
    .filter((sub) => {
      if (subjectFilter === 'safe') return sub.percentage >= 75;
      if (subjectFilter === 'risk') return sub.percentage < 75;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'pct-desc') return b.percentage - a.percentage;
      if (sortBy === 'pct-asc') return a.percentage - b.percentage;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  // Monthly trend dataset (filter by timeframe)
  const fullMonthlyTrend = data?.monthlyTrend || [];
  const monthlyTrendData =
    timeframe === '3M' ? fullMonthlyTrend.slice(-3) : fullMonthlyTrend;

  // Chart.js Monthly Line config
  const chartJsMonthlyData = {
    labels: monthlyTrendData.map((d) => d.month),
    datasets: [
      {
        fill: true,
        label: 'Attendance %',
        data: monthlyTrendData.map((d) => d.percentage),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.15)',
        tension: 0.35,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#0f172a',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      },
      {
        label: '75% Minimum Requirement',
        data: monthlyTrendData.map(() => 75),
        borderColor: '#f43f5e',
        borderDash: [6, 6],
        borderWidth: 2,
        pointRadius: 0,
        fill: false
      }
    ]
  };

  const chartJsMonthlyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { color: '#94a3b8', font: { size: 11 } }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(51, 65, 85, 0.8)',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}%`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.2)' },
        ticks: { color: '#94a3b8', font: { size: 11 } }
      },
      y: {
        min: 60,
        max: 100,
        grid: { color: 'rgba(51, 65, 85, 0.2)' },
        ticks: { color: '#94a3b8', font: { size: 11 }, callback: (v) => `${v}%` }
      }
    }
  };

  // Weekly Trend Chart.js config
  const weeklyData = data?.weeklyTrend || [];
  const chartJsWeeklyData = {
    labels: weeklyData.map((w) => w.shortLabel || w.weekLabel),
    datasets: [
      {
        label: 'Weekly Attendance Rate %',
        data: weeklyData.map((w) => w.percentage),
        backgroundColor: weeklyData.map((w) => (w.percentage >= 75 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(244, 63, 94, 0.8)')),
        borderRadius: 8
      }
    ]
  };

  const chartJsWeeklyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        callbacks: {
          label: (ctx) => `Rate: ${ctx.parsed.y}%`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11 } }
      },
      y: {
        min: 50,
        max: 100,
        grid: { color: 'rgba(51, 65, 85, 0.2)' },
        ticks: { color: '#94a3b8', font: { size: 11 }, callback: (v) => `${v}%` }
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header Banner */}
      <div className="glass-panel p-6 border-slate-800 bg-gradient-to-r from-slate-900/95 via-indigo-950/40 to-slate-900/95 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-teal-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
              <FiActivity className="w-7 h-7 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Advanced Student <span className="gradient-text">Analytics Dashboard</span>
              </h1>
              <span className="badge bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                Phase 27
              </span>
              {data?.isDemo && (
                <span className="badge bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full">
                  Demo Baseline Mode
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Personalized multi-metric evaluation, weekly & monthly attendance trajectories, and minimum threshold tracking.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Engine Switcher */}
          <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setEngine('recharts')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                engine === 'recharts'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Recharts
            </button>
            <button
              onClick={() => setEngine('chartjs')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                engine === 'chartjs'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Chart.js
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setTimeframe('3M')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                timeframe === '3M'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Jun-Aug (3M)
            </button>
            <button
              onClick={() => setTimeframe('6M')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                timeframe === '6M'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              6 Months
            </button>
          </div>

          <button
            onClick={loadAnalytics}
            disabled={loading}
            className="btn btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
            title="Refresh Analytics"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handlePrint}
            className="btn btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
            title="Export Report"
          >
            <FiDownload className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* 2. Top KPI Cards Grid (The Core Requested Metrics) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Metric 1: Overall Attendance Card */}
        <div className="glass-panel p-6 border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/30 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <FiAward className="w-4 h-4 text-indigo-400" />
                Overall Attendance
              </span>
              <span
                className={`badge text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  overall.percentage >= 75
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {overall.percentage >= 75 ? 'Exam Eligible' : 'Shortage Warning'}
              </span>
            </div>

            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-5xl font-black text-white tracking-tight">
                {overall.percentage}%
              </span>
              <span
                className={`text-xs font-semibold flex items-center gap-0.5 ${
                  overall.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {overall.delta >= 0 ? <FiArrowUpRight className="w-4 h-4" /> : <FiArrowDownRight className="w-4 h-4" />}
                {overall.delta >= 0 ? `+${overall.delta}%` : `${overall.delta}%`} vs 75% Min
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Weighted attendance score evaluated against institutional minimum requirement.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 mt-4">
            <span>Attended: <strong className="text-emerald-400">{overall.attendedClasses}</strong> / {overall.conductedClasses}</span>
            <span>Raw: <strong className="text-white">{overall.rawPercentage}%</strong></span>
          </div>
        </div>

        {/* Metric 2: Best Subject Highlight */}
        <div className="glass-panel p-6 border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-teal-950/30 flex flex-col justify-between relative overflow-hidden group hover:border-teal-500/40 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <FiStar className="w-4 h-4 text-teal-400" />
                Best Subject
              </span>
              <span className="badge bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                Highest %
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-bold text-white line-clamp-1">{bestSubject.name}</h3>
              <span className="text-xs text-teal-300/80 font-mono font-semibold">{bestSubject.code}</span>
            </div>

            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-4xl font-black text-teal-400">{bestSubject.percentage}%</span>
              <span className="text-xs text-slate-400">
                ({bestSubject.attended} / {bestSubject.totalClasses} classes)
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 mt-4">
            <span className="text-teal-400 font-semibold flex items-center gap-1">
              <FiCheckCircle className="w-3.5 h-3.5" />
              Safe Buffer: {bestSubject.safeMisses} misses allowed
            </span>
            <span className="text-emerald-400 font-bold">+{bestSubject.delta}% above 75%</span>
          </div>
        </div>

        {/* Metric 3: Worst Subject & Deficit Alert */}
        <div className="glass-panel p-6 border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-rose-950/30 flex flex-col justify-between relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <FiAlertTriangle className="w-4 h-4 text-rose-400" />
                Worst Subject
              </span>
              <span className={`badge text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                worstSubject.percentage >= 75
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {worstSubject.percentage >= 75 ? 'Safe Zone' : 'Below 75% Target'}
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-bold text-white line-clamp-1">{worstSubject.name}</h3>
              <span className="text-xs text-rose-300/80 font-mono font-semibold">{worstSubject.code}</span>
            </div>

            <div className="flex items-baseline gap-3 mt-2">
              <span className={`text-4xl font-black ${worstSubject.percentage >= 75 ? 'text-amber-400' : 'text-rose-400'}`}>
                {worstSubject.percentage}%
              </span>
              <span className="text-xs text-slate-400">
                ({worstSubject.attended} / {worstSubject.totalClasses} classes)
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 mt-4">
            {worstSubject.consecutiveNeeded > 0 ? (
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                <FiTrendingUp className="w-3.5 h-3.5" />
                Need {worstSubject.consecutiveNeeded} consecutive classes to reach 75%
              </span>
            ) : (
              <span className="text-amber-400 font-semibold">
                Buffer: {worstSubject.safeMisses || 0} misses remaining
              </span>
            )}
            <span className="text-rose-400 font-bold">{worstSubject.delta}%</span>
          </div>
        </div>

      </div>

      {/* 3. Status Trio: Late Count, Absent Count, Leave Count */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 4: Late Count */}
        <div className="glass-panel p-5 border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <FiClock className="w-4 h-4" />
              Late Count
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{lateCount.total}</span>
              <span className="text-xs text-slate-400">sessions</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Punctuality Rating: <strong className="text-amber-300">{lateCount.punctualityRating}</strong> ({lateCount.percentage}% rate)
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <FiClock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 5: Absent Count */}
        <div className="glass-panel p-5 border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <FiAlertTriangle className="w-4 h-4" />
              Absent Count
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{absentCount.total}</span>
              <span className="text-xs text-slate-400">unattended</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Absence Rate: <strong className="text-rose-300">{absentCount.percentage}%</strong> across all courses
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <FiAlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 6: Leave Count */}
        <div className="glass-panel p-5 border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <FiCalendar className="w-4 h-4" />
              Leave Count
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{leaveCount.total}</span>
              <span className="text-xs text-slate-400">approved</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Medical: <strong className="text-purple-300">{leaveCount.types?.Medical || 0}</strong> • Personal: <strong className="text-purple-300">{leaveCount.types?.['Personal Emergency'] || 0}</strong>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <FiCalendar className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 4. VISUAL ATTENDANCE CURVE & 75% MINIMUM BENCHMARK (Exact Prompt Replica & Modern Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Interactive Area Curve with 75% Minimum Reference Line */}
        <div className="lg:col-span-8 glass-panel p-6 border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FiTrendingUp className="w-5 h-5 text-cyan-400" />
                  Monthly Attendance Progression Curve
                </h2>
                <span className="badge bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[11px] px-2 py-0.5 rounded-full">
                  Visual Trend
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Visualizing student attendance curve with the official <strong>75% Minimum Benchmark</strong> threshold line.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 font-semibold">
                <span className="w-2.5 h-0.5 bg-rose-500 rounded-full inline-block" />
                <span>75% Minimum Line</span>
              </div>
            </div>
          </div>

          {/* Chart Container */}
          <div className="h-72 w-full pt-2">
            {engine === 'recharts' ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="studentCurveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.25)" />
                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                  />
                  <YAxis
                    domain={[60, 100]}
                    stroke="#94a3b8"
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    unit="%"
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: 'rgba(51, 65, 85, 0.8)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(val) => [`${val}%`, 'Attendance Rate']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  {/* 75% Minimum Benchmark Line */}
                  <ReferenceLine
                    y={75}
                    stroke="#f43f5e"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{
                      value: '75% Minimum Requirement',
                      fill: '#f43f5e',
                      fontSize: 11,
                      position: 'top',
                      fontWeight: 'bold'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="percentage"
                    stroke="#06b6d4"
                    strokeWidth={3.5}
                    fillOpacity={1}
                    fill="url(#studentCurveGradient)"
                    activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ChartJSLine data={chartJsMonthlyData} options={chartJsMonthlyOptions} />
            )}
          </div>

          {/* Prompt Visual Recreation Callout Banner */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Current Status: <strong className="text-emerald-400 font-semibold">{overall.safetyMargin}</strong></span>
            </div>
            <div className="text-slate-400 font-mono text-[11px]">
              Min Target: <span className="text-rose-400 font-bold">75.0%</span> • Current: <span className="text-cyan-400 font-bold">{overall.percentage}%</span>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Stylized ASCII/Retro Representation matching Prompt */}
        <div className="lg:col-span-4 glass-panel p-6 border-slate-800 flex flex-col justify-between space-y-4 bg-slate-950/60">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FiZap className="w-4 h-4 text-cyan-400" />
                Visual Threshold Matrix
              </h3>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                ASCII SPEC
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Direct rendering of the attendance curve visual specification:
            </p>
          </div>

          {/* ASCII / Monospace Visual Box */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs leading-relaxed text-slate-300 select-none overflow-x-auto shadow-inner">
            <div className="text-slate-400 text-[11px] font-bold mb-1">Attendance</div>
            <div className="text-cyan-400">100% ┤</div>
            <div className="text-cyan-300"> 90% ┤       ╭──╮</div>
            <div className="text-teal-300"> 80% ┤   ╭───╯  ╰──╮</div>
            <div className="text-rose-400 font-bold bg-rose-500/10 px-1 rounded inline-block w-full">
              75% ┼───┼──────────┼── Minimum
            </div>
            <div className="text-amber-400"> 70% ┤</div>
            <div className="text-slate-500">     └───────────────</div>
            <div className="text-indigo-300 font-bold pl-7">   Jun  Jul  Aug</div>
          </div>

          {/* Dynamic Monthly Nodes */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Recent Quarter Performance
            </span>
            <div className="grid grid-cols-3 gap-2">
              {data?.visualCurve?.points?.map((pt, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center"
                >
                  <span className="block text-[11px] text-slate-400">{pt.month}</span>
                  <span
                    className={`block text-sm font-bold ${
                      pt.percentage >= 75 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {pt.percentage}%
                  </span>
                  <span className="block text-[9px] text-slate-500">
                    {pt.percentage >= 75 ? 'Above 75%' : 'Below 75%'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* 5. Weekly Trend Progression (Rolling 6 Weeks) */}
      <div className="glass-panel p-6 border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FiCalendar className="w-5 h-5 text-indigo-400" />
              Weekly Attendance Trend & Trajectory
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Week-over-week attendance velocity, conducted vs attended breakdown, and delta velocity.
            </p>
          </div>
          <div className="text-xs text-slate-400">
            Rolling 6 Weeks Window
          </div>
        </div>

        {/* Weekly Cards Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {weeklyData.map((wk, i) => {
            const isWeekSafe = wk.percentage >= 75;
            return (
              <div
                key={i}
                className={`p-3.5 rounded-xl border transition-all ${
                  isWeekSafe
                    ? 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    : 'bg-rose-950/20 border-rose-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">{wk.shortLabel || wk.weekLabel}</span>
                  <span
                    className={`text-[10px] font-bold flex items-center ${
                      wk.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {wk.delta >= 0 ? `+${wk.delta}%` : `${wk.delta}%`}
                  </span>
                </div>

                <div className="mt-2">
                  <span className={`text-2xl font-black ${isWeekSafe ? 'text-white' : 'text-rose-400'}`}>
                    {wk.percentage}%
                  </span>
                </div>

                <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span>Attended:</span>
                  <strong className="text-slate-200">{wk.attended}/{wk.conducted}</strong>
                </div>
              </div>
            );
          })}
        </div>

        {/* Weekly Bar Chart Representation */}
        <div className="h-48 w-full pt-3">
          {engine === 'recharts' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.2)" />
                <XAxis dataKey="shortLabel" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis domain={[50, 100]} stroke="#94a3b8" tick={{ fontSize: 11, fill: '#94a3b8' }} unit="%" />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(51, 65, 85, 0.8)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                  formatter={(val) => [`${val}%`, 'Weekly Rate']}
                />
                <ReferenceLine y={75} stroke="#f43f5e" strokeDasharray="4 4" />
                <Bar dataKey="percentage" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartJSBar data={chartJsWeeklyData} options={chartJsWeeklyOptions} />
          )}
        </div>
      </div>

      {/* 6. Subject Attendance Detailed Explorer & Calculator */}
      <div className="glass-panel p-6 border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FiBookOpen className="w-5 h-5 text-teal-400" />
              Subject-Wise Attendance Breakdown & Recovery Calculator
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Individual course evaluation with safe miss allowance and consecutive lectures recovery calculator.
            </p>
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setSubjectFilter('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  subjectFilter === 'all'
                    ? 'bg-slate-800 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({allSubjects.length})
              </button>
              <button
                onClick={() => setSubjectFilter('safe')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  subjectFilter === 'safe'
                    ? 'bg-emerald-600/80 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Safe (&ge; 75%)
              </button>
              <button
                onClick={() => setSubjectFilter('risk')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  subjectFilter === 'risk'
                    ? 'bg-rose-600/80 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                At Risk (&lt; 75%)
              </button>
            </div>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="pct-desc">Sort: Highest % First</option>
              <option value="pct-asc">Sort: Lowest % First</option>
              <option value="name">Sort: Subject Name</option>
            </select>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSubjects.map((sub) => {
            const isSubSafe = sub.percentage >= 75;
            return (
              <div
                key={sub.id || sub.code}
                className={`p-5 rounded-2xl border transition-all ${
                  isSubSafe
                    ? 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                    : 'bg-rose-950/10 border-rose-500/30 hover:border-rose-500/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white line-clamp-1">{sub.name}</h3>
                      <span className="text-xs font-mono font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {sub.code}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 mt-0.5 block">{sub.instructor}</span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xl font-black ${
                        isSubSafe ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {sub.percentage}%
                    </span>
                    <span
                      className={`block text-[10px] font-semibold ${
                        sub.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {sub.delta >= 0 ? `+${sub.delta}% above 75%` : `${sub.delta}% below 75%`}
                    </span>
                  </div>
                </div>

                {/* Progress Bar with 75% indicator line */}
                <div className="relative w-full bg-slate-900 rounded-full h-2.5 overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, sub.percentage)}%`,
                      backgroundColor: sub.color || (isSubSafe ? '#10b981' : '#f43f5e')
                    }}
                  />
                  {/* 75% Marker Pin */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white/70"
                    style={{ left: '75%' }}
                    title="75% Requirement Pin"
                  />
                </div>

                {/* Quick Session Stats */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs py-2 px-3 rounded-xl bg-slate-900/60 border border-slate-800/80 mb-3">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase">Conducted</span>
                    <span className="font-bold text-white">{sub.conducted || sub.totalClasses}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-emerald-400 uppercase">Attended</span>
                    <span className="font-bold text-emerald-400">{sub.attended}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-rose-400 uppercase">Absent</span>
                    <span className="font-bold text-rose-400">{sub.absent}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-amber-400 uppercase">Late</span>
                    <span className="font-bold text-amber-400">{sub.late}</span>
                  </div>
                </div>

                {/* Safe Buffer or Consecutive Needed Banner */}
                <div className="flex items-center justify-between text-xs pt-1">
                  {isSubSafe ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <FiCheckCircle className="w-3.5 h-3.5" />
                      Safe Buffer: Can miss {sub.safeMisses || 0} more lectures
                    </span>
                  ) : (
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      <FiAlertTriangle className="w-3.5 h-3.5" />
                      Deficit: Must attend {sub.consecutiveNeeded || 1} consecutive lectures
                    </span>
                  )}

                  <Link
                    to="/student/predict"
                    className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 text-[11px]"
                  >
                    <span>Simulate</span>
                    <FiChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Bottom Navigation Linkage */}
      <div className="glass-panel p-6 border-slate-800 bg-gradient-to-r from-slate-900/90 via-cyan-950/20 to-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FiZap className="w-5 h-5 text-amber-400" />
            Explore More AI & Forecasting Tools
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Simulate "Can I Skip?" scenarios, calculate future milestone projections, or chat with the AI Attendance Assistant.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/student/predict"
            className="btn btn-secondary py-2 px-4 text-xs font-semibold flex items-center gap-2"
          >
            <FiTrendingUp className="w-4 h-4 text-indigo-400" />
            <span>AI Predictor & Simulator</span>
          </Link>
          <Link
            to="/student/ai-chat"
            className="btn btn-primary py-2 px-4 text-xs font-semibold flex items-center gap-2"
          >
            <FiZap className="w-4 h-4 text-amber-400" />
            <span>Chat Assistant</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
