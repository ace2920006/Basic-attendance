import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip as ChartJSTooltip,
  Legend as ChartJSLegend
} from 'chart.js';
import { Bar as ChartJSBar } from 'react-chartjs-2';
import { FiAward, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartJSTooltip, ChartJSLegend);

export default function StudentRankingChart({ rankings, engine = 'recharts' }) {
  const [activeTab, setActiveTab] = useState('top'); // 'top' | 'atRisk'

  const defaultTop = [
    { id: 's1', name: 'Aarav Sharma', rollNo: 'CS-001', department: 'CSE', attendanceRate: 98.2, status: 'Eligible' },
    { id: 's2', name: 'Priya Patel', rollNo: 'CS-014', department: 'CSE', attendanceRate: 96.5, status: 'Eligible' },
    { id: 's3', name: 'Rohan Gupta', rollNo: 'IT-008', department: 'IT', attendanceRate: 95.0, status: 'Eligible' },
    { id: 's4', name: 'Sneha Verma', rollNo: 'EC-022', department: 'ECE', attendanceRate: 93.8, status: 'Eligible' },
    { id: 's5', name: 'Vikram Singh', rollNo: 'CS-045', department: 'CSE', attendanceRate: 92.4, status: 'Eligible' }
  ];

  const defaultRisk = [
    { id: 'w1', name: 'Rahul Joshi', rollNo: 'ME-019', department: 'ME', attendanceRate: 68.5, status: 'Warning' },
    { id: 'w2', name: 'Ananya Roy', rollNo: 'CE-004', department: 'CE', attendanceRate: 71.0, status: 'Warning' },
    { id: 'w3', name: 'Karan Malhotra', rollNo: 'CS-088', department: 'CSE', attendanceRate: 73.2, status: 'Warning' }
  ];

  const topStudents = rankings?.topStudents?.length > 0 ? rankings.topStudents : defaultTop;
  const atRiskStudents = rankings?.atRiskStudents?.length > 0 ? rankings.atRiskStudents : defaultRisk;

  const currentList = activeTab === 'top' ? topStudents : atRiskStudents;

  const getRankBadge = (idx) => {
    if (activeTab === 'atRisk') {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">Risk #{idx + 1}</span>;
    }
    if (idx === 0) return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">🥇 1st</span>;
    if (idx === 1) return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-400/20 text-slate-200 border border-slate-400/30">🥈 2nd</span>;
    if (idx === 2) return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-700/20 text-amber-500 border border-amber-700/30">🥉 3rd</span>;
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">#{idx + 1}</span>;
  };

  const chartJsData = {
    labels: currentList.map((s) => s.name.split(' ')[0]),
    datasets: [
      {
        label: 'Attendance Rate %',
        data: currentList.map((s) => s.attendanceRate),
        backgroundColor: activeTab === 'top' ? 'rgba(16, 185, 129, 0.85)' : 'rgba(244, 63, 94, 0.85)',
        borderColor: activeTab === 'top' ? '#10b981' : '#f43f5e',
        borderRadius: 6
      }
    ]
  };

  const chartJsOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1'
      }
    },
    scales: {
      x: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(51, 65, 85, 0.2)' },
        ticks: { color: '#94a3b8', font: { size: 11 }, callback: (val) => `${val}%` }
      },
      y: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11 } }
      }
    }
  };

  return (
    <div className="glass-panel p-6 border-slate-800 space-y-4 h-full flex flex-col justify-between">
      
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <FiAward className="w-5 h-5 text-amber-400" />
            Student Attendance Ranking
          </h3>
          <p className="text-xs text-slate-400">Leaderboard of top performers & shortage warnings</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('top')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'top'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Top Performers
          </button>
          <button
            onClick={() => setActiveTab('atRisk')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'atRisk'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            At Risk (&lt;75%)
          </button>
        </div>
      </div>

      {/* Graphical Leaderboard Chart */}
      <div className="h-56 pt-2">
        {engine === 'recharts' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              layout="vertical" 
              data={currentList} 
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.3)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11, fill: '#94a3b8' }} unit="%" />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="#94a3b8" 
                tick={{ fontSize: 11, fill: '#cbd5e1' }} 
                width={100}
                tickFormatter={(val) => val.split(' ')[0]}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderColor: 'rgba(51, 65, 85, 0.8)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
                formatter={(value, name, item) => [`${value}% Attendance`, `${item.payload.name} (${item.payload.rollNo})`]}
              />
              <Bar dataKey="attendanceRate" radius={[0, 6, 6, 0]}>
                {currentList.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={activeTab === 'top' ? '#10b981' : '#f43f5e'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ChartJSBar data={chartJsData} options={chartJsOptions} />
        )}
      </div>

      {/* Quick Roster List underneath */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        {currentList.slice(0, 3).map((st, idx) => (
          <div key={st.id || idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              {getRankBadge(idx)}
              <span className="font-semibold text-slate-200 truncate">{st.name}</span>
              <span className="text-[11px] text-slate-400">({st.rollNo})</span>
            </div>
            <span className={`font-bold ${activeTab === 'top' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {st.attendanceRate}%
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
