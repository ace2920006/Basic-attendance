import React, { useState } from 'react';
import { FiSearch, FiAlertTriangle, FiBell, FiFilter, FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function MostAbsentStudents({ students = [], onAlertStudent }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [alertedIds, setAlertedIds] = useState([]);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || s.departmentCode === selectedDept || s.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleSendAlert = (student) => {
    if (!alertedIds.includes(student.id)) {
      setAlertedIds(prev => [...prev, student.id]);
    }
    if (onAlertStudent) {
      onAlertStudent(student);
    }
  };

  return (
    <div className="glass-panel p-6 border-slate-800 space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FiAlertTriangle className="w-5 h-5 text-rose-400" />
            Most Absent & Defaulter Students (<span className="text-rose-400">&lt; 75% Attendance</span>)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Identify students at risk of exam disqualification with shortage deficit metrics
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search student or roll no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 text-xs text-white rounded-xl pl-9 pr-3 py-2 w-48 focus:outline-none focus:border-rose-500/50"
            />
          </div>

          {/* Department Filter */}
          <div className="relative flex items-center">
            <FiFilter className="absolute left-3 text-slate-400 w-3.5 h-3.5" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 text-xs text-white rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-rose-500/50"
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

      {/* Summary Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between">
          <span className="text-xs font-semibold text-rose-300">Critical Risk (&lt; 65%)</span>
          <span className="text-lg font-bold text-rose-400">
            {students.filter(s => s.attendanceRate < 65).length}
          </span>
        </div>
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-300">Warning Zone (65 - 74%)</span>
          <span className="text-lg font-bold text-amber-400">
            {students.filter(s => s.attendanceRate >= 65 && s.attendanceRate < 75).length}
          </span>
        </div>
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Total Defaulters Listed</span>
          <span className="text-lg font-bold text-white">{filteredStudents.length}</span>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="py-3 px-4">Student Details</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4 text-center">Classes (Att/Tot)</th>
              <th className="py-3 px-4 text-center">Attendance %</th>
              <th className="py-3 px-4 text-center">Classes Deficit (to 75%)</th>
              <th className="py-3 px-4 text-center">Shortage Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((st) => {
                const isAlerted = alertedIds.includes(st.id);
                return (
                  <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Student Info */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{st.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{st.rollNo}</div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300">
                        {st.departmentCode || st.department}
                      </span>
                    </td>

                    {/* Classes Count */}
                    <td className="py-3 px-4 text-center">
                      <span className="text-emerald-400 font-medium">{st.presentCount}</span> /{' '}
                      <span className="text-slate-400">{st.totalClasses}</span>
                      <div className="text-[10px] text-rose-400 font-medium mt-0.5">{st.absentCount} Absences</div>
                    </td>

                    {/* Attendance % Rate */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 font-bold text-rose-400 font-mono text-sm">
                        {st.attendanceRate}%
                      </div>
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full mx-auto mt-1 overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${Math.min(st.attendanceRate, 100)}%` }}
                        />
                      </div>
                    </td>

                    {/* Deficit / Required Classes */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
                        +{st.requiredClassesTo75} Classes
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">Needed for 75%</div>
                    </td>

                    {/* Shortage Status */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          st.attendanceRate < 65
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {st.status}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleSendAlert(st)}
                        disabled={isAlerted}
                        className={`btn text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 ml-auto transition-all ${
                          isAlerted
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                            : 'btn-secondary hover:border-rose-500/50 hover:text-rose-300'
                        }`}
                      >
                        {isAlerted ? (
                          <>
                            <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Alert Sent</span>
                          </>
                        ) : (
                          <>
                            <FiBell className="w-3.5 h-3.5 text-rose-400" />
                            <span>Issue Warning</span>
                          </>
                        )}
                      </button>
                    </td>

                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-400">
                  No defaulter students found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
