import React, { useState } from 'react';
import { FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiCheckSquare, FiTrendingUp } from 'react-icons/fi';

export default function DailyAttendance({ initialData, onDateChange }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(initialData?.date || todayStr);

  const data = initialData || {
    date: selectedDate,
    totalClassesHeld: 14,
    totalStudentsMarked: 480,
    overallPresentRate: 88.5,
    summary: { present: 425, absent: 38, late: 17 },
    hourlyDistribution: [
      { timeSlot: '08:00 AM - 09:30 AM', sessionCount: 4, presentRate: 85.2, present: 120, absent: 15, late: 6 },
      { timeSlot: '09:30 AM - 11:00 AM', sessionCount: 5, presentRate: 91.4, present: 160, absent: 10, late: 5 },
      { timeSlot: '11:15 AM - 12:45 PM', sessionCount: 3, presentRate: 89.0, present: 95, absent: 8, late: 4 },
      { timeSlot: '02:00 PM - 03:30 PM', sessionCount: 2, presentRate: 86.0, present: 50, absent: 5, late: 2 }
    ],
    subjectSessions: []
  };

  const handleDateSubmit = (e) => {
    const val = e.target.value;
    setSelectedDate(val);
    if (onDateChange) {
      onDateChange(val);
    }
  };

  return (
    <div className="glass-panel p-6 border-slate-800 space-y-6">
      
      {/* Header & Date Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FiCalendar className="w-5 h-5 text-emerald-400" />
            Daily Attendance Inspector &amp; Session Breakdown
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Real-time session-by-session attendance logs and time slot metrics for selected date
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5">
          <FiCalendar className="text-emerald-400 w-4 h-4" />
          <span className="text-xs text-slate-400 font-medium">Select Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateSubmit}
            className="bg-transparent text-xs text-white font-mono focus:outline-none"
          />
        </div>
      </div>

      {/* Daily Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Classes Conducted</div>
            <div className="text-xl font-extrabold text-white mt-1">{data.totalClassesHeld} Sessions</div>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <FiCheckSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Present Students</div>
            <div className="text-xl font-extrabold text-emerald-400 mt-1">{data.summary.present}</div>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <FiCheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Late Arrivals</div>
            <div className="text-xl font-extrabold text-amber-400 mt-1">{data.summary.late}</div>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <FiClock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Absent Count</div>
            <div className="text-xl font-extrabold text-rose-400 mt-1">{data.summary.absent}</div>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
            <FiXCircle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Hourly Time Slot Distribution Graph */}
      <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <FiTrendingUp className="w-4 h-4 text-emerald-400" />
            Session Attendance Rate by Time Slot
          </h4>
          <span className="text-xs text-emerald-400 font-mono font-bold">
            Daily Average: {data.overallPresentRate}%
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {data.hourlyDistribution.map((slot, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">{slot.timeSlot} ({slot.sessionCount} Classes)</span>
                <span className="font-mono font-bold text-emerald-400">{slot.presentRate}%</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-emerald-500 rounded-l-full" 
                  style={{ width: `${(slot.present / (slot.present + slot.absent + slot.late)) * 100}%` }}
                />
                <div 
                  className="h-full bg-amber-400" 
                  style={{ width: `${(slot.late / (slot.present + slot.absent + slot.late)) * 100}%` }}
                />
                <div 
                  className="h-full bg-rose-500 rounded-r-full" 
                  style={{ width: `${(slot.absent / (slot.present + slot.absent + slot.late)) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Session Table for Date */}
      {data.subjectSessions && data.subjectSessions.length > 0 && (
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Subject &amp; Code</th>
                <th className="py-3 px-4">Instructor</th>
                <th className="py-3 px-4 text-center">Time Slot</th>
                <th className="py-3 px-4 text-center">Enrolled</th>
                <th className="py-3 px-4 text-center">Present / Absent / Late</th>
                <th className="py-3 px-4 text-center">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {data.subjectSessions.map((ss) => (
                <tr key={ss.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{ss.subjectName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{ss.subjectCode} • {ss.department}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-medium">{ss.instructor}</td>
                  <td className="py-3 px-4 text-center text-slate-300 font-mono">{ss.timeSlot}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-white">{ss.totalEnrolled}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-emerald-400 font-bold">{ss.present} P</span> /{' '}
                    <span className="text-rose-400 font-bold">{ss.absent} A</span> /{' '}
                    <span className="text-amber-400 font-bold">{ss.late} L</span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400 text-sm">
                    {ss.rate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
