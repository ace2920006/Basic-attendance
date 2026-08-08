import React, { useState } from 'react';
import { FiClock, FiSearch, FiCalendar, FiFileText } from 'react-icons/fi';
import AttendanceBadge from '../../components/common/AttendanceBadge';

export default function AttendanceHistory() {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const historyLogs = [
    { id: 'LOG-101', date: '2026-08-08', subject: 'Database Systems (CS401)', section: 'Sec A', total: 45, present: 41, absent: 3, late: 1, room: 'Lab 301' },
    { id: 'LOG-102', date: '2026-08-06', subject: 'Web Technologies (CS405)', section: 'Sec B', total: 42, present: 38, absent: 4, late: 0, room: 'Room 204' },
    { id: 'LOG-103', date: '2026-08-04', subject: 'Database Systems (CS401)', section: 'Sec A', total: 45, present: 43, absent: 2, late: 0, room: 'Lab 301' },
    { id: 'LOG-104', date: '2026-08-01', subject: 'Software Architecture (CS502)', section: 'Sec A', total: 38, present: 35, absent: 2, late: 1, room: 'Hall C' }
  ];

  const filteredLogs = historyLogs.filter(log => 
    log.subject.toLowerCase().includes(search.toLowerCase()) ||
    log.date.includes(search)
  );

  return (
    <div className="space-y-6">
      
      <div className="glass-panel p-6 border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FiClock className="w-5 h-5 text-cyan-400" />
              Past Attendance Session Logs
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Search and view submitted attendance records</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input 
                type="text"
                placeholder="Search subject or date..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-8 text-xs py-1.5 bg-slate-900 w-56"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Session Date</th>
                <th className="py-3 px-4">Subject & Code</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4">Venue</th>
                <th className="py-3 px-4">Attendance Stats</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-indigo-300">{log.date}</td>
                  <td className="py-3.5 px-4 font-medium text-white">{log.subject}</td>
                  <td className="py-3.5 px-4 text-slate-300">{log.section}</td>
                  <td className="py-3.5 px-4 text-slate-400">{log.room}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-emerald-400 font-semibold">{log.present} Present</span>
                    <span className="text-slate-500 mx-1">•</span>
                    <span className="text-rose-400">{log.absent} Absent</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium transition-colors">
                      View Roster
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
