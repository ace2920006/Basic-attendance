import React from 'react';
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

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartJSTooltip, ChartJSLegend);

export default function SubjectWiseChart({ data, engine = 'recharts' }) {
  const defaultData = [
    { id: '1', code: 'CS301', name: 'Data Structures', totalClasses: 36, attended: 32, absent: 4, percentage: 88.8, color: '#6366f1' },
    { id: '2', code: 'CS302', name: 'DBMS', totalClasses: 32, attended: 30, absent: 2, percentage: 93.7, color: '#06b6d4' },
    { id: '3', code: 'CS303', name: 'Operating Systems', totalClasses: 30, attended: 24, absent: 6, percentage: 80.0, color: '#ec4899' },
    { id: '4', code: 'CS304', name: 'Computer Networks', totalClasses: 28, attended: 26, absent: 2, percentage: 92.8, color: '#10b981' },
    { id: '5', code: 'CS305', name: 'Software Eng', totalClasses: 24, attended: 17, absent: 7, percentage: 70.8, color: '#f59e0b' }
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  const chartJsData = {
    labels: chartData.map((d) => d.code),
    datasets: [
      {
        label: 'Subject Attendance %',
        data: chartData.map((d) => d.percentage),
        backgroundColor: chartData.map((d) => d.color || '#6366f1'),
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
        min: 0,
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
          <h3 className="text-base font-semibold text-white">Subject-Wise Attendance</h3>
          <p className="text-xs text-slate-400">Attendance percentages categorized per course subject</p>
        </div>
        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
          {chartData.filter(s => s.percentage >= 75).length} / {chartData.length} Compliant
        </span>
      </div>

      <div className="h-64 pt-2">
        {engine === 'recharts' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.3)" />
              <XAxis dataKey="code" stroke="#94a3b8" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 12, fill: '#94a3b8' }} unit="%" />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderColor: 'rgba(51, 65, 85, 0.8)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
                formatter={(value, name, item) => [`${value}% (${item.payload.attended}/${item.payload.totalClasses} classes)`, item.payload.name]}
              />
              <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ChartJSBar data={chartJsData} options={chartJsOptions} />
        )}
      </div>

      {/* Legend list of subjects */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
        {chartData.slice(0, 4).map((sub, i) => (
          <div key={i} className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5 truncate">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sub.color || '#6366f1' }} />
              <span className="truncate">{sub.name}</span>
            </span>
            <span className={`font-semibold ml-2 ${sub.percentage >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {sub.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
