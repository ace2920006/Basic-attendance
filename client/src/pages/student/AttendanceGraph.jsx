import React, { useState, useEffect } from 'react';
import { FiBarChart2, FiTrendingUp, FiCheckCircle, FiAlertTriangle, FiCalendar, FiLayers } from 'react-icons/fi';
import { getChartAnalyticsApi } from '../../services/api';
import AttendancePieChart from '../../components/charts/AttendancePieChart';
import MonthlyTrendChart from '../../components/charts/MonthlyTrendChart';
import SubjectWiseChart from '../../components/charts/SubjectWiseChart';

export default function AttendanceGraph() {
  const [engine, setEngine] = useState('recharts');
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    attendanceStats: null,
    monthlyTrend: [],
    subjectStats: []
  });

  useEffect(() => {
    const loadStudentAnalytics = async () => {
      try {
        setLoading(true);
        const res = await getChartAnalyticsApi();
        if (res?.data) {
          setChartData(res.data);
        }
      } catch (err) {
        console.error('Failed to load student chart analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStudentAnalytics();
  }, []);

  const dayWiseData = [
    { day: 'Monday', rate: 92, sessions: 24, attended: 22 },
    { day: 'Tuesday', rate: 95, sessions: 22, attended: 21 },
    { day: 'Wednesday', rate: 86, sessions: 26, attended: 22 },
    { day: 'Thursday', rate: 88, sessions: 24, attended: 21 },
    { day: 'Friday', rate: 78, sessions: 24, attended: 19 }
  ];

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FiBarChart2 className="w-7 h-7 text-indigo-400" />
            Attendance Visual Graph & Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Performance trend over time, 75% exam benchmark threshold line, and subject ratios.
          </p>
        </div>

        {/* Engine Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <span className="text-[11px] font-semibold text-slate-400 pl-2">Engine:</span>
          <button
            onClick={() => setEngine('recharts')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              engine === 'recharts' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Recharts
          </button>
          <button
            onClick={() => setEngine('chartjs')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              engine === 'chartjs' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Chart.js
          </button>
        </div>
      </div>

      {/* Main Grid: Pie Ratio & Monthly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <AttendancePieChart stats={chartData.attendanceStats} engine={engine} />
        </div>
        <div className="lg:col-span-7">
          <MonthlyTrendChart data={chartData.monthlyTrend} engine={engine} />
        </div>
      </div>

      {/* Two Column Grid: Subject-Wise & Day-Wise Pattern */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Subject Chart (7 cols) */}
        <div className="lg:col-span-7">
          <SubjectWiseChart data={chartData.subjectStats} engine={engine} />
        </div>

        {/* Day of Week Pattern (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5 text-amber-400" />
              Day-Wise Attendance Pattern
            </h3>
            <p className="text-xs text-slate-400">Attendance percentage broken down by weekday</p>
          </div>

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
