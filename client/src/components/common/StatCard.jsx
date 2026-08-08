import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = '#6366f1', trend }) {
  return (
    <div className="glass-panel p-5 relative overflow-hidden transition-all duration-300 hover:border-indigo-500/30">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold mt-1 text-slate-100">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`text-xs mt-2 font-medium ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.text}
            </div>
          )}
        </div>
        {Icon && (
          <div 
            className="p-3 rounded-xl flex items-center justify-center text-white shadow-lg"
            style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)` }}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      <div 
        className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20"
        style={{ background: color }}
      />
    </div>
  );
}
