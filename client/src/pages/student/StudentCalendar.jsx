import React, { useState } from 'react';
import { 
  FiCalendar, 
  FiChevronLeft, 
  FiChevronRight, 
  FiClock, 
  FiMapPin, 
  FiUser, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertCircle, 
  FiFileText,
  FiInfo
} from 'react-icons/fi';
import AttendanceBadge from '../../components/common/AttendanceBadge';

export default function StudentCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 7, 1)); // August 2026
  const [selectedDate, setSelectedDate] = useState('2026-08-12');

  // Mock Calendar day records for August 2026
  const calendarRecords = {
    '2026-08-01': { status: 'Leave', label: 'Approved Medical Leave', sessions: [] },
    '2026-08-03': { status: 'Present', label: '3 Sessions Attended', sessions: [
      { code: 'CS401', subject: 'Database Management Systems', time: '09:00 AM - 10:30 AM', room: 'Lab 301', instructor: 'Dr. John Smith', status: 'Present', arrival: '08:57 AM' },
      { code: 'CS402', subject: 'Data Structures & Algorithms', time: '11:00 AM - 12:30 PM', room: 'Room 102', instructor: 'Prof. Sarah Connor', status: 'Present', arrival: '10:59 AM' }
    ]},
    '2026-08-04': { status: 'Present', label: '2 Sessions Attended', sessions: [
      { code: 'CS403', subject: 'Web Application Development', time: '10:00 AM - 11:30 AM', room: 'Room 204', instructor: 'Dr. Sarah Jenkins', status: 'Present', arrival: '09:55 AM' }
    ]},
    '2026-08-05': { status: 'Absent', label: 'Absent in OS Class', sessions: [
      { code: 'CS405', subject: 'Operating Systems', time: '01:30 PM - 03:00 PM', room: 'Hall A', instructor: 'Dr. Linus Torvalds', status: 'Absent', arrival: '--' }
    ]},
    '2026-08-07': { status: 'Present', label: '2 Sessions Attended', sessions: [
      { code: 'CS401', subject: 'Database Management Systems', time: '09:00 AM - 10:30 AM', room: 'Lab 301', instructor: 'Dr. John Smith', status: 'Present', arrival: '08:58 AM' }
    ]},
    '2026-08-08': { status: 'Present', label: '1 Session Attended', sessions: [
      { code: 'CS403', subject: 'Web Application Development', time: '11:00 AM - 12:30 PM', room: 'Room 204', instructor: 'Dr. Sarah Jenkins', status: 'Present', arrival: '10:55 AM' }
    ]},
    '2026-08-10': { status: 'Late', label: 'Arrived Late in Networks', sessions: [
      { code: 'CS404', subject: 'Computer Networks', time: '02:00 PM - 03:30 PM', room: 'Hall B', instructor: 'Prof. Alan Turing', status: 'Late', arrival: '02:18 PM' }
    ]},
    '2026-08-11': { status: 'Absent', label: 'Unexcused Absence', sessions: [
      { code: 'CS405', subject: 'Operating Systems', time: '01:30 PM - 03:00 PM', room: 'Hall A', instructor: 'Dr. Linus Torvalds', status: 'Absent', arrival: '--' }
    ]},
    '2026-08-12': { status: 'Present', label: '2 Sessions Marked', sessions: [
      { code: 'CS401', subject: 'Database Management Systems', time: '09:00 AM - 10:30 AM', room: 'Lab 301', instructor: 'Dr. John Smith', status: 'Present', arrival: '08:58 AM' },
      { code: 'CS403', subject: 'Web Application Development', time: '11:00 AM - 12:30 PM', room: 'Room 204', instructor: 'Dr. Sarah Jenkins', status: 'Present', arrival: '11:02 AM' },
      { code: 'CS404', subject: 'Computer Networks', time: '02:00 PM - 03:30 PM', room: 'Hall B', instructor: 'Prof. Alan Turing', status: 'Pending', arrival: '--' }
    ]},
    '2026-08-15': { status: 'Holiday', label: 'Independence Day Holiday', sessions: [] }
  };

  const daysInMonth = 31;
  const startDayOffset = 6; // Saturday for Aug 1 2026
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Absent': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'Late': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Leave': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Holiday': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const selectedDayRecord = calendarRecords[selectedDate];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FiCalendar className="w-7 h-7 text-indigo-400" />
            Attendance Calendar
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visual day-by-day attendance log, leave records, and class schedules for {monthName}.
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Present
          </span>
          <span className="flex items-center gap-1.5 bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded-full border border-rose-500/20 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span> Absent
          </span>
          <span className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Late
          </span>
          <span className="flex items-center gap-1.5 bg-purple-500/10 text-purple-300 px-2.5 py-1 rounded-full border border-purple-500/20 font-medium">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span> Leave
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Calendar Grid Section (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 border-slate-800 space-y-4">
          
          {/* Month Header Controller */}
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-lg font-bold text-white">{monthName}</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentMonth(new Date(2026, 6, 1))}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                title="Previous Month"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setCurrentMonth(new Date(2026, 7, 1))}
                className="btn btn-secondary text-xs py-1 px-3"
              >
                Today
              </button>
              <button 
                onClick={() => setCurrentMonth(new Date(2026, 8, 1))}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                title="Next Month"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 border-b border-slate-800 pb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty slots before day 1 */}
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 rounded-xl bg-slate-950/20 border border-slate-900/40"></div>
            ))}

            {/* Render Days 1 to 31 */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `2026-08-${dayNum < 10 ? '0' + dayNum : dayNum}`;
              const dayRecord = calendarRecords[dateStr];
              const isSelected = selectedDate === dateStr;
              const isToday = dayNum === 12;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-16 p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all relative overflow-hidden ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-950/40 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500/40' 
                      : dayRecord 
                      ? 'border-slate-800 hover:border-slate-700 bg-slate-950/60' 
                      : 'border-slate-800/40 bg-slate-950/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-bold ${isToday ? 'text-indigo-400 bg-indigo-500/20 px-1.5 py-0.5 rounded' : 'text-slate-200'}`}>
                      {dayNum}
                    </span>
                    {isToday && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>}
                  </div>

                  {dayRecord ? (
                    <div className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border text-center truncate ${getStatusColor(dayRecord.status)}`}>
                      {dayRecord.status}
                    </div>
                  ) : (
                    <span className="text-[9px] text-slate-400 pl-1">--</span>
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Selected Day Inspector Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 border-slate-800 space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Date Inspector</span>
                <h3 className="text-base font-bold text-white">{selectedDate}</h3>
              </div>
              {selectedDayRecord && (
                <span className={`badge text-xs px-2.5 py-1 font-semibold ${getStatusColor(selectedDayRecord.status)}`}>
                  {selectedDayRecord.status}
                </span>
              )}
            </div>

            {selectedDayRecord ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-300 font-medium bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                  📌 {selectedDayRecord.label}
                </p>

                {selectedDayRecord.sessions.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Classes Recorded</h4>
                    {selectedDayRecord.sessions.map((sess, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{sess.code}</span>
                          <AttendanceBadge status={sess.status} />
                        </div>
                        <h5 className="text-sm font-semibold text-white">{sess.subject}</h5>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
                          <span className="flex items-center gap-1"><FiClock className="w-3.5 h-3.5 text-cyan-400" /> {sess.time}</span>
                          <span className="flex items-center gap-1"><FiMapPin className="w-3.5 h-3.5 text-amber-400" /> {sess.room}</span>
                          <span className="flex items-center gap-1"><FiUser className="w-3.5 h-3.5 text-indigo-400" /> {sess.instructor}</span>
                          <span className="flex items-center gap-1"><FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" /> {sess.arrival}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs bg-slate-950/40 rounded-xl border border-slate-800/60">
                    <FiInfo className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                    No scheduled academic lectures marked for this date.
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs bg-slate-950/40 rounded-xl border border-slate-800/60">
                <FiCalendar className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-40" />
                Select any date on the calendar grid to inspect detailed attendance logs.
              </div>
            )}
          </div>

          {/* Monthly Attendance Summary Metrics */}
          <div className="glass-panel p-5 border-slate-800 bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-3">August 2026 Aggregate</h4>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="block text-lg font-bold text-white">18</span>
                <span className="block text-[9px] text-slate-400 uppercase">Sessions</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="block text-lg font-bold text-emerald-400">15</span>
                <span className="block text-[9px] text-slate-400 uppercase">Present</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="block text-lg font-bold text-rose-400">2</span>
                <span className="block text-[9px] text-slate-400 uppercase">Absent</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="block text-lg font-bold text-purple-300">1</span>
                <span className="block text-[9px] text-slate-400 uppercase">Leave</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
