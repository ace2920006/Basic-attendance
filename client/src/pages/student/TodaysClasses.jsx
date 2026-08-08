import React from 'react';
import { FiClock, FiMapPin, FiUser, FiCheckCircle } from 'react-icons/fi';
import AttendanceBadge from '../../components/common/AttendanceBadge';
import { studentTodaysClasses } from '../../data/mockData';

export default function TodaysClasses() {
  return (
    <div className="glass-panel p-6 border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <FiClock className="w-5 h-5 text-cyan-400" />
          Today's Schedule & Classes
        </h3>
        <span className="text-xs text-slate-400 font-medium">3 Scheduled Sessions</span>
      </div>

      <div className="space-y-3 pt-2">
        {studentTodaysClasses.map((cls) => (
          <div 
            key={cls.id} 
            className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{cls.code}</span>
                <h4 className="text-sm font-semibold text-white">{cls.subject}</h4>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1.5"><FiClock className="w-3.5 h-3.5 text-cyan-400" /> {cls.time}</span>
                <span className="flex items-center gap-1.5"><FiMapPin className="w-3.5 h-3.5 text-amber-400" /> {cls.room}</span>
                <span className="flex items-center gap-1.5"><FiUser className="w-3.5 h-3.5 text-indigo-400" /> {cls.instructor}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 capitalize">{cls.status}</span>
              <AttendanceBadge status={cls.attendance} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
