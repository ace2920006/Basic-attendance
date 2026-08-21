import React, { useState } from 'react';
import { FiUserCheck, FiBookOpen, FiClock, FiCheckSquare, FiSearch, FiFilter } from 'react-icons/fi';

export default function TeacherPerformance({ teachers = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || t.departmentCode === selectedDept || t.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const getRatingBadge = (score) => {
    if (score >= 94) {
      return { label: 'Outstanding', colorClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    } else if (score >= 90) {
      return { label: 'Excellent', colorClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };
    } else if (score >= 82) {
      return { label: 'Good', colorClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    } else {
      return { label: 'Needs Support', colorClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    }
  };

  return (
    <div className="glass-panel p-6 border-slate-800 space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FiUserCheck className="w-5 h-5 text-cyan-400" />
            Teacher &amp; Faculty Performance Analytics
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate instructor class conduction efficiency, attendance marking punctuality, and class attendance averages
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 text-xs text-white rounded-xl pl-9 pr-3 py-2 w-48 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="relative flex items-center">
            <FiFilter className="absolute left-3 text-slate-400 w-3.5 h-3.5" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 text-xs text-white rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="All">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="ME">ME</option>
              <option value="CE">CE</option>
              <option value="IT">IT</option>
            </select>
          </div>
        </div>
      </div>

      {/* Faculty Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map((t) => {
          const rating = getRatingBadge(t.performanceScore);
          return (
            <div key={t.id} className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
              
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">{t.name}</h4>
                  <div className="text-xs text-slate-400 mt-0.5">{t.designation}</div>
                  <span className="inline-block mt-2 text-[10px] font-semibold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {t.departmentCode || t.department}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${rating.colorClass}`}>
                  {rating.label}
                </span>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800/80 text-center">
                
                {/* Classes Taken */}
                <div className="p-2 bg-slate-900/60 rounded-xl">
                  <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mb-1">
                    <FiBookOpen className="w-3 h-3 text-indigo-400" /> Classes
                  </div>
                  <div className="text-base font-extrabold text-white">{t.classesConducted}</div>
                </div>

                {/* On-Time Marking % */}
                <div className="p-2 bg-slate-900/60 rounded-xl">
                  <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mb-1">
                    <FiClock className="w-3 h-3 text-amber-400" /> On-Time %
                  </div>
                  <div className="text-base font-extrabold text-amber-400">{t.onTimeMarkingRate}%</div>
                </div>

                {/* Avg Class Attendance */}
                <div className="p-2 bg-slate-900/60 rounded-xl">
                  <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mb-1">
                    <FiCheckSquare className="w-3 h-3 text-emerald-400" /> Avg Student %
                  </div>
                  <div className="text-base font-extrabold text-emerald-400">{t.avgStudentAttendance}%</div>
                </div>

              </div>

              {/* Rating Progress */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Faculty Rating Index</span>
                  <span className="font-bold text-white font-mono">{t.performanceScore}/100</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                    style={{ width: `${t.performanceScore}%` }}
                  />
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
