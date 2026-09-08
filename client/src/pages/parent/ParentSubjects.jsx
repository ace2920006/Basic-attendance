import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FiBookOpen,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiMail,
  FiUser,
  FiInfo,
  FiGrid,
  FiList
} from 'react-icons/fi';
import { getParentSubjectsApi } from '../../services/api';
import { studentSubjects } from '../../data/mockData';

export default function ParentSubjects() {
  const context = useOutletContext();
  const activeWard = context?.activeWard;

  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getParentSubjectsApi(activeWard?._id)
      .then((res) => {
        if (isMounted && res?.success && res.data && res.data.length > 0) {
          setSubjects(res.data);
        } else {
          // Fallback to rich mock subject dataset
          setSubjects(
            studentSubjects.map((s) => ({
              id: s.id,
              name: s.name,
              code: s.code,
              instructor: s.instructor,
              instructorEmail: 'faculty@university.edu',
              totalClasses: s.total,
              attended: s.attended,
              absent: s.total - s.attended,
              late: 1,
              percentage: s.percentage,
              consecutiveNeeded: s.percentage < 75 ? Math.ceil((75 * s.total - 100 * s.attended) / 25) : 0,
              safeMisses: s.percentage >= 75 ? Math.floor((100 * s.attended - 75 * s.total) / 75) : 0,
              status: s.percentage >= 75 ? 'Safe Zone' : s.percentage >= 65 ? 'Shortage Warning' : 'Critical Defaulter',
              color: s.color
            }))
          );
        }
      })
      .catch(() => {
        setSubjects(
          studentSubjects.map((s) => ({
            id: s.id,
            name: s.name,
            code: s.code,
            instructor: s.instructor,
            instructorEmail: 'faculty@university.edu',
            totalClasses: s.total,
            attended: s.attended,
            absent: s.total - s.attended,
            late: 1,
            percentage: s.percentage,
            consecutiveNeeded: s.percentage < 75 ? Math.ceil((75 * s.total - 100 * s.attended) / 25) : 0,
            safeMisses: s.percentage >= 75 ? Math.floor((100 * s.attended - 75 * s.total) / 75) : 0,
            status: s.percentage >= 75 ? 'Safe Zone' : s.percentage >= 65 ? 'Shortage Warning' : 'Critical Defaulter',
            color: s.color
          }))
        );
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeWard?._id]);

  const safeCount = subjects.filter((s) => s.percentage >= 75).length;
  const shortageCount = subjects.length - safeCount;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 border-slate-800 bg-gradient-to-r from-slate-900/90 via-indigo-950/30 to-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Subject-Wise Attendance</h2>
            <span className="badge bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              {activeWard?.name || 'Alex Rivera'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Individual course breakdown with recovery targets, safe absences, and professor contacts.
          </p>
        </div>

        {/* View Switcher & Status Counter */}
        <div className="flex items-center gap-3 self-start md:self-center">
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FiGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition ${
                viewMode === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FiList className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stat Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-white">{subjects.length}</span>
            <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              Enrolled Courses
            </span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FiBookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-emerald-400">{safeCount}</span>
            <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              Safe Zone (&gt;75%)
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FiCheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-rose-400">{shortageCount}</span>
            <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              Shortage Warning (&lt;75%)
            </span>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <FiAlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* View: Cards Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {subjects.map((sub, idx) => {
            const isSafe = sub.percentage >= 75;
            const isWarning = sub.percentage >= 65 && sub.percentage < 75;
            const isCritical = sub.percentage < 65;

            return (
              <div
                key={sub.id || idx}
                className="glass-panel p-6 border-slate-800 space-y-4 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {sub.code}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{sub.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <FiUser className="w-3.5 h-3.5 text-slate-500" />
                      <span>{sub.instructor || 'Faculty Member'}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-2xl font-extrabold block ${
                        isSafe ? 'text-emerald-400' : isWarning ? 'text-amber-400' : 'text-rose-400'
                      }`}
                    >
                      {sub.percentage}%
                    </span>
                    <span
                      className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 ${
                        isSafe
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : isWarning
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSafe
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : isWarning
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          : 'bg-gradient-to-r from-rose-600 to-red-500'
                      }`}
                      style={{ width: `${Math.min(100, sub.percentage)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Attended: <strong className="text-white">{sub.attended}</strong> of {sub.totalClasses} classes</span>
                    <span>Missed: <strong className="text-rose-400">{sub.absent || 0}</strong></span>
                  </div>
                </div>

                {/* Recovery / Safe Miss Insight Box */}
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    isSafe
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/5 border-rose-500/20 text-rose-300'
                  }`}
                >
                  {isSafe ? (
                    <>
                      <FiCheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>
                        Attendance is in the safe zone. Your ward can safely miss <strong>{sub.safeMisses || 0} classes</strong> and remain above 75%.
                      </span>
                    </>
                  ) : (
                    <>
                      <FiAlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>
                        Shortage alert: Must attend the next <strong>{sub.consecutiveNeeded || 2} consecutive classes</strong> to reach 75%.
                      </span>
                    </>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* View: Table */
        <div className="glass-panel overflow-hidden border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Code & Subject</th>
                  <th className="px-5 py-3.5">Instructor</th>
                  <th className="px-5 py-3.5 text-center">Conducted</th>
                  <th className="px-5 py-3.5 text-center">Attended</th>
                  <th className="px-5 py-3.5 text-center">Absent</th>
                  <th className="px-5 py-3.5 text-center">Percentage</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5">Target Advisory</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {subjects.map((sub, idx) => {
                  const isSafe = sub.percentage >= 75;
                  return (
                    <tr key={sub.id || idx} className="hover:bg-slate-900/40 transition">
                      <td className="px-5 py-3.5 font-semibold text-white">
                        <span className="block">{sub.name}</span>
                        <span className="text-[10px] text-indigo-400 font-mono">{sub.code}</span>
                      </td>

                      <td className="px-5 py-3.5 text-slate-300">
                        {sub.instructor}
                      </td>

                      <td className="px-5 py-3.5 text-center font-bold text-white">
                        {sub.totalClasses}
                      </td>

                      <td className="px-5 py-3.5 text-center font-bold text-emerald-400">
                        {sub.attended}
                      </td>

                      <td className="px-5 py-3.5 text-center font-bold text-rose-400">
                        {sub.absent || 0}
                      </td>

                      <td className="px-5 py-3.5 text-center font-extrabold text-white text-sm">
                        {sub.percentage}%
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isSafe
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-[11px] text-slate-400">
                        {isSafe ? (
                          <span className="text-emerald-400">Safe: {sub.safeMisses || 0} misses remaining</span>
                        ) : (
                          <span className="text-rose-400 font-semibold">Deficit: Need {sub.consecutiveNeeded || 2} classes</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
