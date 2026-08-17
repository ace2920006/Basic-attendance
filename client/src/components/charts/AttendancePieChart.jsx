import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  Legend as RechartsLegend, 
  ResponsiveContainer 
} from 'recharts';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartJSTooltip,
  Legend as ChartJSLegend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, ChartJSTooltip, ChartJSLegend);

export default function AttendancePieChart({ stats, engine = 'recharts' }) {
  const { present = 128, absent = 15, late = 7, attendanceRate = 88.5 } = stats || {};

  const rechartsData = [
    { name: 'Present', value: present, color: '#10b981' },
    { name: 'Absent', value: absent, color: '#f43f5e' },
    { name: 'Late', value: late, color: '#f59e0b' }
  ];

  const chartJsData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [
      {
        data: [present, absent, late],
        backgroundColor: ['rgba(16, 185, 129, 0.85)', 'rgba(244, 63, 94, 0.85)', 'rgba(245, 158, 11, 0.85)'],
        borderColor: ['#10b981', '#f43f5e', '#f59e0b'],
        borderWidth: 2,
        hoverOffset: 6
      }
    ]
  };

  const chartJsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          font: { size: 12, weight: '500' },
          padding: 16
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(51, 65, 85, 0.6)',
        borderWidth: 1,
        padding: 10
      }
    },
    cutout: '70%'
  };

  const isEligible = attendanceRate >= 75;

  return (
    <div className="glass-panel p-6 border-slate-800 space-y-4 flex flex-col justify-between h-full relative">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Attendance % Ratio</h3>
          <p className="text-xs text-slate-400">Distribution of present, absent, and late sessions</p>
        </div>
        <span className={`badge px-3 py-1 text-xs font-semibold ${isEligible ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'}`}>
          {isEligible ? 'Eligible (≥75%)' : 'Shortage (<75%)'}
        </span>
      </div>

      <div className="h-64 relative flex items-center justify-center pt-2">
        
        {/* Center Percentage Display Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 pb-6">
          <span className={`text-3xl font-extrabold tracking-tight ${isEligible ? 'text-emerald-400' : 'text-rose-400'}`}>
            {attendanceRate}%
          </span>
          <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">Overall Rate</span>
        </div>

        {engine === 'recharts' ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rechartsData}
                cx="50%"
                cy="45%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {rechartsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderColor: 'rgba(51, 65, 85, 0.8)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <RechartsLegend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Doughnut data={chartJsData} options={chartJsOptions} />
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <span className="block text-xs font-semibold text-emerald-400">{present}</span>
          <span className="text-[10px] text-slate-400">Present</span>
        </div>
        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
          <span className="block text-xs font-semibold text-rose-400">{absent}</span>
          <span className="text-[10px] text-slate-400">Absent</span>
        </div>
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <span className="block text-xs font-semibold text-amber-400">{late}</span>
          <span className="text-[10px] text-slate-400">Late</span>
        </div>
      </div>
    </div>
  );
}
