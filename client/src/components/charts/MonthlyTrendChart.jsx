import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ReferenceLine, 
  ResponsiveContainer 
} from 'recharts';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartJSTooltip,
  Legend as ChartJSLegend,
  Filler
} from 'chart.js';
import { Line as ChartJSLine } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartJSTooltip,
  ChartJSLegend,
  Filler
);

export default function MonthlyTrendChart({ data, engine = 'recharts' }) {
  const defaultData = [
    { month: 'Jan', percentage: 84, benchmark: 75 },
    { month: 'Feb', percentage: 88, benchmark: 75 },
    { month: 'Mar', percentage: 86, benchmark: 75 },
    { month: 'Apr', percentage: 92, benchmark: 75 },
    { month: 'May', percentage: 89, benchmark: 75 },
    { month: 'Jun', percentage: 91, benchmark: 75 }
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  const chartJsData = {
    labels: chartData.map((d) => d.month),
    datasets: [
      {
        fill: true,
        label: 'Attendance Rate %',
        data: chartData.map((d) => d.percentage),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.15)',
        tension: 0.4,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#0f172a',
        pointHoverRadius: 6
      },
      {
        label: '75% Benchmark',
        data: chartData.map(() => 75),
        borderColor: '#f43f5e',
        borderDash: [5, 5],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false
      }
    ]
  };

  const chartJsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { color: '#94a3b8', font: { size: 11 } }
      },
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-white">Monthly Attendance Trend</h3>
          <p className="text-xs text-slate-400">Multi-month timeline tracking with 75% exam benchmark line</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> Live Trend
          </span>
        </div>
      </div>

      <div className="h-64 pt-2">
        {engine === 'recharts' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.3)" />
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis domain={[50, 100]} stroke="#94a3b8" tick={{ fontSize: 12, fill: '#94a3b8' }} unit="%" />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderColor: 'rgba(51, 65, 85, 0.8)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
                formatter={(value) => [`${value}%`, 'Attendance Rate']}
              />
              <ReferenceLine 
                y={75} 
                stroke="#f43f5e" 
                strokeDasharray="4 4" 
                label={{ value: '75% Requirement Baseline', fill: '#f43f5e', fontSize: 10, position: 'top' }} 
              />
              <Area 
                type="monotone" 
                dataKey="percentage" 
                stroke="#06b6d4" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTrend)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ChartJSLine data={chartJsData} options={chartJsOptions} />
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
        <span>6-Month Trend Window</span>
        <span className="text-emerald-400 font-semibold flex items-center gap-1">
          ↑ Consistent Performance
        </span>
      </div>
    </div>
  );
}
