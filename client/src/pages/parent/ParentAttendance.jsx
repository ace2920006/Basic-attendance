import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FiClock,
  FiCalendar,
  FiFilter,
  FiRotateCcw,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiLock,
  FiInfo,
  FiTrendingUp
} from 'react-icons/fi';
import { getParentAttendanceApi } from '../../services/api';
import { studentAttendanceHistory, studentSubjects } from '../../data/mockData';

export default function ParentAttendance() {
  const context = useOutletContext();
  const activeWard = context?.activeWard;

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ percentage: 88.5, totalClasses: 120, attendedClasses: 106, absentClasses: 14, lateClasses: 5 });
  const [monthlyTrend, setMonthlyTrend] = useState([]);

  // Filter states
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchAttendance = () => {
    setLoading(true);
    const params = {};
    if (selectedSubject !== 'all') params.subject = selectedSubject;
    if (selectedStatus !== 'all') params.status = selectedStatus;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    getParentAttendanceApi(activeWard?._id, params)
      .then((res) => {
        if (res?.success && res.data) {
          setRecords(res.data);
          if (res.stats) setStats(res.stats);
          if (res.monthlyTrend) setMonthlyTrend(res.monthlyTrend);
        }
      })
      .catch(() => {
        // Fallback filter on mock data
        let filtered = [...studentAttendanceHistory];
        if (selectedSubject !== 'all') {
          filtered = filtered.filter((r) => r.subject === selectedSubject || r.code === selectedSubject);
        }
        if (selectedStatus !== 'all') {
          filtered = filtered.filter((r) => r.status.toLowerCase() === selectedStatus.toLowerCase());
        }
        setRecords(filtered);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAttendance();
  }, [activeWard?._id, selectedSubject, selectedStatus, startDate, endDate]);

  const handleResetFilters = () => {
    setSelectedSubject('all');
    setSelectedStatus('all');
    setStartDate('');
    setEndDate('');
  };

  const isHealthy = stats.percentage >= 75;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 border-slate-800 bg-gradient-to-r from-slate-900/90 via-cyan-950/20 to-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Ward Attendance Records</h2>
            <span className="badge bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              {activeWard?.name || 'Alex Rivera'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete day-by-day timestamped attendance entries certified by university academic staff.
          </p>
        </div>

        {/* Read-Only Guarantee Tag */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400 self-start md:self-center">
          <FiLock className="w-3.5 h-3.5 text-amber-400" />
          <span>Read-Only Official Log</span>
        </div>
      </div>

      {/* Summary Score Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 border-slate-800 text-center">
          <span className="text-2xl font-bold text-white">{stats.percentage}%</span>
          <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
            Cumulative Score
          </span>
        </div>

        <div className="glass-panel p-4 border-slate-800 text-center">
          <span className="text-2xl font-bold text-emerald-400">{stats.attendedClasses || records.filter(r => r.status === 'Present').length}</span>
          <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
            Classes Attended
          </span>
        </div>

        <div className="glass-panel p-4 border-slate-800 text-center">
          <span className="text-2xl font-bold text-rose-400">{stats.absentClasses || records.filter(r => r.status === 'Absent').length}</span>
          <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
            Classes Absent
          </span>
        </div>

        <div className="glass-panel p-4 border-slate-800 text-center">
          <span className="text-2xl font-bold text-amber-400">{stats.lateClasses || records.filter(r => r.status === 'Late').length}</span>
          <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
            Late Sessions
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Subject Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <FiFilter className="w-3.5 h-3.5" />
            <span>Subject:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-slate-900 text-white rounded-lg px-2.5 py-1.5 border border-slate-700 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Subjects</option>
              {studentSubjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-900 text-white rounded-lg px-2.5 py-1.5 border border-slate-700 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Excused">Excused / On Leave</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-900 text-white rounded-lg px-2 py-1 border border-slate-700 text-xs focus:outline-none focus:border-cyan-500"
            />
            <span>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-900 text-white rounded-lg px-2 py-1 border border-slate-700 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

        </div>

        {/* Reset Filter Button */}
        {(selectedSubject !== 'all' || selectedStatus !== 'all' || startDate || endDate) && (
          <button
            onClick={handleResetFilters}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
          >
            <FiRotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Attendance Log Table */}
      <div className="glass-panel overflow-hidden border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Date & Time</th>
                <th className="px-5 py-3.5">Subject & Code</th>
                <th className="px-5 py-3.5">Instructor</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-center">Verification</th>
                <th className="px-5 py-3.5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading attendance history...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length > 0 ? (
                records.map((rec, idx) => {
                  const isPresent = rec.status === 'Present';
                  const isLate = rec.status === 'Late';
                  const isAbsent = rec.status === 'Absent';
                  const isExcused = rec.status === 'Excused' || rec.status === 'On Leave' || rec.status === 'Leave';

                  return (
                    <tr key={rec._id || rec.id || idx} className="hover:bg-slate-900/40 transition">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-semibold text-white block">
                          {new Date(rec.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {rec.timeSlot || rec.arrivalTime || 'Class Schedule'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-white block">{rec.subject}</span>
                        <span className="text-[11px] text-cyan-400 font-mono">{rec.subjectCode || rec.code || 'CS-GEN'}</span>
                      </td>

                      <td className="px-5 py-3.5 text-slate-300">
                        {rec.markedBy?.name || rec.instructor || 'Class Professor'}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isPresent
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : isLate
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : isAbsent
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {isPresent && <FiCheckCircle className="w-3 h-3" />}
                          {isAbsent && <FiXCircle className="w-3 h-3" />}
                          {isLate && <FiClock className="w-3 h-3" />}
                          {isExcused && <FiInfo className="w-3 h-3" />}
                          <span>{rec.status}</span>
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-center text-[11px] text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          {rec.verificationMethod || 'Biometric / Manual'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-slate-400 text-[11px]">
                        {rec.notes || '--'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">
                    No attendance records found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
