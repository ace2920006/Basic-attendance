import React, { useState, useEffect } from 'react';
import { 
  FiPieChart, 
  FiBarChart2, 
  FiTrendingUp, 
  FiAward, 
  FiFilter, 
  FiRefreshCw, 
  FiLayers, 
  FiCheckCircle 
} from 'react-icons/fi';
import { getChartAnalyticsApi } from '../../services/api';
import AttendancePieChart from '../../components/charts/AttendancePieChart';
import DeptComparisonChart from '../../components/charts/DeptComparisonChart';
import MonthlyTrendChart from '../../components/charts/MonthlyTrendChart';
import SubjectWiseChart from '../../components/charts/SubjectWiseChart';
import StudentRankingChart from '../../components/charts/StudentRankingChart';

export default function ChartsPage() {
  const [engine, setEngine] = useState('recharts'); // 'recharts' | 'chartjs'
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    attendanceStats: null,
    departmentStats: [],
    monthlyTrend: [],
    subjectStats: [],
    studentRankings: { topStudents: [], atRiskStudents: [] }
  });

  const [filters, setFilters] = useState({
    department: '',
    timeframe: '6M'
  });

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const res = await getChartAnalyticsApi(filters);
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load chart analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [filters]);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Banner & Library Engine Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] px-2.5 py-0.5">
              Phase 11 – Charts Engine
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FiPieChart className="w-8 h-8 text-indigo-400" />
            Visual Charts & Analytics Console
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Interactive metrics comparing Attendance %, Department averages, Monthly Trends, Subject breakdowns, and Student Rankings.
          </p>
        </div>

        {/* Engine Switcher Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 self-start lg:self-auto">
          <span className="text-xs font-semibold text-slate-400 pl-2 flex items-center gap-1.5">
            <FiLayers className="w-4 h-4 text-cyan-400" />
            Chart Engine:
          </span>

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setEngine('recharts')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
                engine === 'recharts'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Recharts
            </button>
            <button
              onClick={() => setEngine('chartjs')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
                engine === 'chartjs'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-lg shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Chart.js
            </button>
          </div>

          <button
            onClick={fetchChartData}
            title="Refresh Data"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Analytics Summary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Attendance Rate</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {data.attendanceStats?.attendanceRate || 88.5}%
            </div>
            <span className="text-[11px] text-slate-500">System Campus Benchmark</span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
            <FiTrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Departments</span>
            <div className="text-2xl font-bold text-indigo-400 mt-1">
              {data.departmentStats?.length || 5}
            </div>
            <span className="text-[11px] text-slate-500">Active Academic Programs</span>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
            <FiLayers className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Sessions</span>
            <div className="text-2xl font-bold text-cyan-400 mt-1">
              {data.attendanceStats?.totalSessions || 150}
            </div>
            <span className="text-[11px] text-slate-500">Recorded Lecture Audits</span>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-cyan-400">
            <FiCheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Exam Eligibility</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">
              ≥ 75%
            </div>
            <span className="text-[11px] text-slate-500">Mandatory Attendance Policy</span>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400">
            <FiAward className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Core Grid Section 1: Attendance % Ratio & Department Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <AttendancePieChart stats={data.attendanceStats} engine={engine} />
        </div>
        <div className="lg:col-span-7">
          <DeptComparisonChart data={data.departmentStats} engine={engine} />
        </div>
      </div>

      {/* Core Grid Section 2: Monthly Trend (Full Width) */}
      <div>
        <MonthlyTrendChart data={data.monthlyTrend} engine={engine} />
      </div>

      {/* Core Grid Section 3: Subject Wise & Student Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <SubjectWiseChart data={data.subjectStats} engine={engine} />
        </div>
        <div className="lg:col-span-6">
          <StudentRankingChart rankings={data.studentRankings} engine={engine} />
        </div>
      </div>

    </div>
  );
}
