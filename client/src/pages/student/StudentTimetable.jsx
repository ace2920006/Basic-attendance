import React, { useState, useEffect } from 'react';
import { 
  FiClock, 
  FiMapPin, 
  FiUser, 
  FiCalendar, 
  FiCheckCircle, 
  FiGrid, 
  FiSun, 
  FiBookOpen,
  FiArrowRight
} from 'react-icons/fi';
import AttendanceBadge from '../../components/common/AttendanceBadge';
import { 
  getTodayTimetableApi, 
  getTomorrowTimetableApi, 
  getWeeklyTimetableApi, 
  getTimetablesApi 
} from '../../services/api';
import { studentTodaysClasses } from '../../data/mockData';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function StudentTimetable() {
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'tomorrow' | 'weekly'
  const [todaySlots, setTodaySlots] = useState([]);
  const [tomorrowSlots, setTomorrowSlots] = useState([]);
  const [weeklySlots, setWeeklySlots] = useState({});
  const [selectedWeeklyDay, setSelectedWeeklyDay] = useState('Monday');
  const [loading, setLoading] = useState(false);
  const [todayName, setTodayName] = useState('');
  const [tomorrowName, setTomorrowName] = useState('');

  useEffect(() => {
    fetchTimetableData();
  }, []);

  const fetchTimetableData = async () => {
    setLoading(true);
    try {
      // Calculate current day and tomorrow
      const now = new Date();
      const dayIndex = now.getDay();
      const currentDay = DAYS[(dayIndex + 6) % 7]; // Convert Sun-Sat (0-6) to Mon-Sun
      const nextDay = DAYS[dayIndex % 7];

      setTodayName(currentDay);
      setTomorrowName(nextDay);

      // Fetch Today's
      try {
        const todayRes = await getTodayTimetableApi(currentDay);
        if (todayRes?.success && todayRes.data.length > 0) {
          setTodaySlots(todayRes.data);
        } else {
          setTodaySlots(fallbackToday(currentDay));
        }
      } catch (err) {
        setTodaySlots(fallbackToday(currentDay));
      }

      // Fetch Tomorrow's
      try {
        const tomorrowRes = await getTomorrowTimetableApi();
        if (tomorrowRes?.success && tomorrowRes.data.length > 0) {
          setTomorrowSlots(tomorrowRes.data);
        } else {
          setTomorrowSlots(fallbackTomorrow(nextDay));
        }
      } catch (err) {
        setTomorrowSlots(fallbackTomorrow(nextDay));
      }

      // Fetch Weekly
      try {
        const weeklyRes = await getWeeklyTimetableApi();
        if (weeklyRes?.success && weeklyRes.data) {
          setWeeklySlots(weeklyRes.data);
        } else {
          setWeeklySlots(fallbackWeekly());
        }
      } catch (err) {
        setWeeklySlots(fallbackWeekly());
      }
    } finally {
      setLoading(false);
    }
  };

  const fallbackToday = (dayName) => {
    return [
      {
        id: 1,
        subject: 'Database Management Systems',
        subjectCode: 'CS401',
        timeSlot: '09:00 AM - 10:30 AM',
        room: 'Lab 301',
        instructor: 'Dr. John Smith',
        status: 'Completed',
        attendance: 'Present',
        color: '#6366f1'
      },
      {
        id: 2,
        subject: 'Web Application Development',
        subjectCode: 'CS403',
        timeSlot: '11:00 AM - 12:30 PM',
        room: 'Room 204',
        instructor: 'Dr. Sarah Jenkins',
        status: 'Ongoing',
        attendance: 'Present',
        color: '#10b981'
      },
      {
        id: 3,
        subject: 'Computer Networks',
        subjectCode: 'CS404',
        timeSlot: '02:00 PM - 03:30 PM',
        room: 'Hall B',
        instructor: 'Prof. Alan Turing',
        status: 'Upcoming',
        attendance: 'Pending',
        color: '#f59e0b'
      }
    ];
  };

  const fallbackTomorrow = (dayName) => {
    return [
      {
        id: 101,
        subject: 'Data Structures & Algorithms',
        subjectCode: 'CS402',
        timeSlot: '09:30 AM - 11:00 AM',
        room: 'Lab 102',
        instructor: 'Prof. Sarah Connor',
        status: 'Scheduled',
        color: '#06b6d4'
      },
      {
        id: 102,
        subject: 'Operating Systems',
        subjectCode: 'CS405',
        timeSlot: '11:30 AM - 01:00 PM',
        room: 'Room 305',
        instructor: 'Dr. Linus Torvalds',
        status: 'Scheduled',
        color: '#f43f5e'
      }
    ];
  };

  const fallbackWeekly = () => {
    return {
      Monday: [
        { id: 'M1', subject: 'Database Systems', subjectCode: 'CS401', timeSlot: '09:00 AM - 10:30 AM', room: 'Lab 301', instructor: 'Dr. John Smith', color: '#6366f1' },
        { id: 'M2', subject: 'Web Technologies', subjectCode: 'CS403', timeSlot: '11:00 AM - 12:30 PM', room: 'Room 204', instructor: 'Dr. Sarah Jenkins', color: '#10b981' },
        { id: 'M3', subject: 'Computer Networks', subjectCode: 'CS404', timeSlot: '02:00 PM - 03:30 PM', room: 'Hall B', instructor: 'Prof. Alan Turing', color: '#f59e0b' }
      ],
      Tuesday: [
        { id: 'T1', subject: 'Data Structures', subjectCode: 'CS402', timeSlot: '09:30 AM - 11:00 AM', room: 'Lab 102', instructor: 'Prof. Sarah Connor', color: '#06b6d4' },
        { id: 'T2', subject: 'Operating Systems', subjectCode: 'CS405', timeSlot: '11:30 AM - 01:00 PM', room: 'Room 305', instructor: 'Dr. Linus Torvalds', color: '#f43f5e' }
      ],
      Wednesday: [
        { id: 'W1', subject: 'Web Technologies', subjectCode: 'CS403', timeSlot: '09:00 AM - 10:30 AM', room: 'Room 204', instructor: 'Dr. Sarah Jenkins', color: '#10b981' },
        { id: 'W2', subject: 'Computer Networks', subjectCode: 'CS404', timeSlot: '11:00 AM - 12:30 PM', room: 'Hall B', instructor: 'Prof. Alan Turing', color: '#f59e0b' }
      ],
      Thursday: [
        { id: 'TH1', subject: 'Operating Systems', subjectCode: 'CS405', timeSlot: '10:00 AM - 11:30 AM', room: 'Room 305', instructor: 'Dr. Linus Torvalds', color: '#f43f5e' },
        { id: 'TH2', subject: 'Database Systems', subjectCode: 'CS401', timeSlot: '01:30 PM - 03:00 PM', room: 'Lab 301', instructor: 'Dr. John Smith', color: '#6366f1' }
      ],
      Friday: [
        { id: 'F1', subject: 'Computer Networks Lab', subjectCode: 'CS404L', timeSlot: '09:00 AM - 10:30 AM', room: 'Lab 202', instructor: 'Prof. Alan Turing', color: '#8b5cf6' },
        { id: 'F2', subject: 'Web Technologies', subjectCode: 'CS403', timeSlot: '11:00 AM - 12:30 PM', room: 'Room 204', instructor: 'Dr. Sarah Jenkins', color: '#10b981' }
      ],
      Saturday: [
        { id: 'S1', subject: 'Capstone Seminar', subjectCode: 'CS400', timeSlot: '10:00 AM - 12:00 PM', room: 'Auditorium A', instructor: 'Dr. Sarah Jenkins', color: '#ec4899' }
      ],
      Sunday: []
    };
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 border-slate-800 bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Student Class Timetable
            </h2>
            <span className="badge bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              Semester 4 • Sec A
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track today's classes, tomorrow's schedule, and full weekly timetable
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 space-x-1">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'today'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FiClock className="w-4 h-4 text-cyan-400" />
            <span>Today's Classes</span>
          </button>

          <button
            onClick={() => setActiveTab('tomorrow')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'tomorrow'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FiSun className="w-4 h-4 text-amber-400" />
            <span>Tomorrow</span>
          </button>

          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'weekly'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FiGrid className="w-4 h-4 text-emerald-400" />
            <span>Weekly Timetable</span>
          </button>
        </div>
      </div>

      {/* TAB 1: TODAY'S CLASSES */}
      {activeTab === 'today' && (
        <div className="glass-panel p-6 border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FiClock className="w-5 h-5 text-indigo-400" />
                Today's Lectures ({todayName || 'Today'})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time lecture schedule and attendance tracking status
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              {todaySlots.length} Scheduled Sessions
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {todaySlots.map((cls) => (
              <div 
                key={cls.id || cls._id} 
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                style={{ borderLeftColor: cls.color || '#6366f1', borderLeftWidth: '4px' }}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-xs font-semibold px-2 py-0.5 rounded border"
                      style={{ 
                        color: cls.color || '#6366f1', 
                        backgroundColor: `${cls.color || '#6366f1'}15`, 
                        borderColor: `${cls.color || '#6366f1'}30` 
                      }}
                    >
                      {cls.subjectCode || cls.code}
                    </span>
                    <h4 className="text-sm font-bold text-white">{cls.subject}</h4>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <FiClock className="w-3.5 h-3.5 text-cyan-400" />
                      {cls.timeSlot || cls.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiMapPin className="w-3.5 h-3.5 text-amber-400" />
                      {cls.room}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiUser className="w-3.5 h-3.5 text-indigo-400" />
                      {cls.instructor}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    cls.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    cls.status === 'Ongoing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {cls.status || 'Scheduled'}
                  </span>
                  {cls.attendance && <AttendanceBadge status={cls.attendance} />}
                </div>
              </div>
            ))}

            {todaySlots.length === 0 && (
              <div className="py-12 text-center space-y-2">
                <FiCheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-sm font-semibold text-white">No classes scheduled for today!</p>
                <p className="text-xs text-slate-400">Enjoy your day off or review your weekly schedule.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TOMORROW */}
      {activeTab === 'tomorrow' && (
        <div className="glass-panel p-6 border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FiSun className="w-5 h-5 text-amber-400" />
                Tomorrow's Lectures ({tomorrowName || 'Tomorrow'})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Upcoming lectures so you can prepare course notes and materials
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              {tomorrowSlots.length} Scheduled Sessions
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {tomorrowSlots.map((cls) => (
              <div 
                key={cls.id || cls._id} 
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                style={{ borderLeftColor: cls.color || '#f59e0b', borderLeftWidth: '4px' }}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-xs font-semibold px-2 py-0.5 rounded border"
                      style={{ 
                        color: cls.color || '#f59e0b', 
                        backgroundColor: `${cls.color || '#f59e0b'}15`, 
                        borderColor: `${cls.color || '#f59e0b'}30` 
                      }}
                    >
                      {cls.subjectCode || cls.code}
                    </span>
                    <h4 className="text-sm font-bold text-white">{cls.subject}</h4>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <FiClock className="w-3.5 h-3.5 text-cyan-400" />
                      {cls.timeSlot || cls.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiMapPin className="w-3.5 h-3.5 text-amber-400" />
                      {cls.room}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiUser className="w-3.5 h-3.5 text-indigo-400" />
                      {cls.instructor}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1 rounded-full font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Tomorrow
                  </span>
                </div>
              </div>
            ))}

            {tomorrowSlots.length === 0 && (
              <div className="py-12 text-center space-y-2">
                <FiSun className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-sm font-semibold text-white">No lectures scheduled for tomorrow!</p>
                <p className="text-xs text-slate-400">Check the weekly timetable for the rest of your week.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: WEEKLY TIMETABLE */}
      {activeTab === 'weekly' && (
        <div className="space-y-6">
          
          {/* Day Selector Pills */}
          <div className="glass-panel p-4 border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-emerald-400" /> Select Day:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {DAYS.map((d) => {
                const count = weeklySlots[d]?.length || 0;
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedWeeklyDay(d)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      selectedWeeklyDay === d
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span>{d}</span>
                    {count > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        selectedWeeklyDay === d ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Timetable List */}
          <div className="glass-panel p-6 border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FiGrid className="w-5 h-5 text-emerald-400" />
                  {selectedWeeklyDay}'s Schedule
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full lecture breakdown for {selectedWeeklyDay}
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {(weeklySlots[selectedWeeklyDay] || []).length} Scheduled Sessions
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {(weeklySlots[selectedWeeklyDay] || []).map((cls) => (
                <div
                  key={cls.id || cls._id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  style={{ borderLeftColor: cls.color || '#10b981', borderLeftWidth: '4px' }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-xs font-semibold px-2 py-0.5 rounded border"
                        style={{ 
                          color: cls.color || '#10b981', 
                          backgroundColor: `${cls.color || '#10b981'}15`, 
                          borderColor: `${cls.color || '#10b981'}30` 
                        }}
                      >
                        {cls.subjectCode || cls.code}
                      </span>
                      <h4 className="text-sm font-bold text-white">{cls.subject}</h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1.5">
                        <FiClock className="w-3.5 h-3.5 text-cyan-400" />
                        {cls.timeSlot || cls.time}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FiMapPin className="w-3.5 h-3.5 text-amber-400" />
                        {cls.room}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FiUser className="w-3.5 h-3.5 text-indigo-400" />
                        {cls.instructor}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-slate-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800 self-start md:self-auto">
                    Weekly Schedule
                  </span>
                </div>
              ))}

              {(weeklySlots[selectedWeeklyDay] || []).length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400">
                  No classes scheduled on {selectedWeeklyDay}.
                </div>
              )}
            </div>
          </div>

          {/* Complete Week Overview Matrix */}
          <div className="glass-panel p-6 border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FiBookOpen className="w-5 h-5 text-indigo-400" />
              Full Weekly Timetable Overview
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {DAYS.map((d) => {
                const slots = weeklySlots[d] || [];
                return (
                  <div key={d} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-xs font-bold text-white">{d}</span>
                      <span className="text-[11px] text-slate-400">{slots.length} Classes</span>
                    </div>

                    {slots.length > 0 ? (
                      <div className="space-y-2">
                        {slots.map((s) => (
                          <div 
                            key={s.id || s._id} 
                            className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-1"
                            style={{ borderLeftColor: s.color || '#6366f1', borderLeftWidth: '3px' }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white truncate max-w-[140px]">{s.subject}</span>
                              <span className="text-[10px] text-indigo-300 font-semibold">{s.subjectCode}</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-400">
                              <span>{s.timeSlot}</span>
                              <span className="text-amber-300">{s.room}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 italic py-2">Off / No Classes</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
