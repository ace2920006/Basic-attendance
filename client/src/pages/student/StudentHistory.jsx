import React, { useState } from 'react';
import { 
  FiClock, 
  FiSearch, 
  FiFilter, 
  FiCalendar, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertCircle, 
  FiDownload,
  FiRefreshCw
} from 'react-icons/fi';
import AttendanceBadge from '../../components/common/AttendanceBadge';
import { studentAttendanceHistory, studentSubjects } from '../../data/mockData';

export default function StudentHistory() {
  const [historyRecords] = useState(studentAttendanceHistory);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter logic
  const filteredRecords = historyRecords.filter((rec) => {
    const matchesSearch = 
      rec.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.instructor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject = selectedSubject === 'ALL' || rec.code === selectedSubject;
    const matchesStatus = selectedStatus === 'ALL' || rec.status.toLowerCase() === selectedStatus.toLowerCase();

    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && new Date(rec.date) >= new Date(startDate);
    }
    if (endDate) {
      matchesDate = matchesDate && new Date(rec.date) <= new Date(endDate);
    }

    return matchesSearch && matchesSubject && matchesStatus && matchesDate;
  });

  const totalFiltered = filteredRecords.length;
  const presentFiltered = filteredRecords.filter(r => r.status === 'Present').length;
  const absentFiltered = filteredRecords.filter(r => r.status === 'Absent').length;
  const lateFiltered = filteredRecords.filter(r => r.status === 'Late').length;
  const filteredPercentage = totalFiltered > 0 ? ((presentFiltered / totalFiltered) * 100).toFixed(1) : 0;

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSubject('ALL');
    setSelectedStatus('ALL');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FiClock className="w-7 h-7 text-amber-400" />
            Attendance History Logs
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, and review all archived lecture attendance sessions.
          </p>
        </div>

        <button onClick={resetFilters} className="btn btn-secondary py-2 px-3 text-xs flex items-center gap-2 self-start sm:self-auto">
          <FiRefreshCw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Filter & Search Bar Panel */}
      <div className="glass-panel p-5 border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search Input */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search subject or teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9 text-xs"
            />
          </div>

          {/* Subject Select */}
          <div>
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="input-field text-xs bg-slate-900"
            >
              <option value="ALL">All Enrolled Subjects</option>
              {studentSubjects.map(sub => (
                <option key={sub.id} value={sub.code}>{sub.code} - {sub.name}</option>
              ))}
            </select>
          </div>

          {/* Status Select */}
          <div>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field text-xs bg-slate-900"
            >
              <option value="ALL">All Statuses</option>
              <option value="present">Present Only</option>
              <option value="absent">Absent Only</option>
              <option value="late">Late Only</option>
              <option value="leave">Leave Only</option>
            </select>
          </div>

          {/* Date Range Inputs */}
          <div className="flex items-center gap-2">
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field text-[11px] p-2"
              title="Start Date"
            />
            <span className="text-slate-500 text-xs">to</span>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field text-[11px] p-2"
              title="End Date"
            />
          </div>

        </div>

        {/* Filter Metrics Summary */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>Showing <strong className="text-white">{totalFiltered}</strong> records</span>
            <span className="text-emerald-400">Present: {presentFiltered}</span>
            <span className="text-rose-400">Absent: {absentFiltered}</span>
            <span className="text-amber-400">Late: {lateFiltered}</span>
          </div>
          <div>
            Filter Attendance Rate: <span className="text-indigo-400 font-bold text-sm">{filteredPercentage}%</span>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="glass-panel overflow-hidden border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <th className="p-4 font-semibold">Date & Time</th>
                <th className="p-4 font-semibold">Subject & Code</th>
                <th className="p-4 font-semibold">Instructor</th>
                <th className="p-4 font-semibold">Arrival Time</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Notes / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-white">{rec.date}</div>
                      <span className="text-[11px] text-slate-400">{rec.timeSlot}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{rec.code}</span>
                        <span className="font-medium text-slate-100">{rec.subject}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{rec.instructor}</td>
                    <td className="p-4 text-slate-300">{rec.arrivalTime}</td>
                    <td className="p-4">
                      <AttendanceBadge status={rec.status} />
                    </td>
                    <td className="p-4 text-slate-400 text-[11px] italic">{rec.notes || '--'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400">
                    No attendance records found matching your filters.
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
