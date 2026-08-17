import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ReferenceLine, 
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

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartJSTooltip, ChartJSLegend);

export default function DeptComparisonChart({ data, engine = 'recharts' }) {
  const defaultData = [
    { code: 'CSE', name: 'Computer Science', avgAttendance: 89.4, benchmark: 75 },
    { code: 'ECE', name: 'Electronics', avgAttendance: 84.2, benchmark: 75 },
    { code: 'ME', name: 'Mechanical', avgAttendance: 78.6, benchmark: 75 },
    { code: 'CE', name: 'Civil Eng', avgAttendance: 81.0, benchmark: 75 },
    { code: 'IT', name: 'Information Tech', avgAttendance: 91.2, benchmark: 75 }
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  const chartJsData = {
    labels: chartData.map((d) => d.code),
    datasets: [
      {
        label: 'Avg Attendance %',
        data: chartData.map((d) => d.avgAttendance),
        backgroundColor: chartData.map((d) => d.avgAttendance >= 75 ? 'rgba(99, 102, 241, 0.85)' : 'rgba(244, 63, 94, 0.85)'),
        borderColor: chartData.map((d) => d.avgAttendance >= 75 ? '#6366f1' : '#f43f5e'),
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  const chartJsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(51, 65, 85, 0.6)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.2)' },
        ticks: { color: '#94a3b8', font: { size: 11 } }
      },
      y: {
        min: 50,
        max: 100,
        grid: { color: 'rgba(51, 65, 85, 0.2)' },
        ticks: { color: '#94a3b8', font: { size: 11 }, callback: (val) => `${val}%` }
      }
    }
  };

  return (
    <div className="glass-panel p-6 border-slate-800 space-y-4 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Department Comparison</h3>
          <p className="text-xs text-slate-400">Average attendance percentage across academic departments</p>
        </div>
        <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
          Campus Avg
        </span>
      </div>

      <div className="h-64 pt-2">
        {engine === 'recharts' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.3)" />
              <XAxis dataKey="code" stroke="#94a3b8" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis domain={[50, 100]} stroke="#94a3b8" tick={{ fontSize: 12, fill: '#94a3b8' }} unit="%" />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderColor: 'rgba(51, 65, 85, 0.8)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
                formatter={(value) => [`${value}%`, 'Avg Attendance']}
              />
              <ReferenceLine y={75} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: '75% Min', fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }} />
              <Bar dataKey="avgAttendance" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.avgAttendance >= 75 ? 'url(#deptGradient)' : '#f43f5e'} 
                  />
                ))}
              </Bar>
              <defs>
                <linearGradient id="deptGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ChartJSBar data={chartJsData} options={chartJsOptions} />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
        <span>Total Depts: {chartData.length}</span>
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Above 75%
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block ml-2" /> Below 75%
        </span>
      </div>
    </div>
  );
}
