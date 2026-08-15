import React, { useState, useEffect } from 'react';
import { 
  FiCalendar, 
  FiClock, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiMapPin, 
  FiUser, 
  FiBookOpen,
  FiSearch,
  FiGrid,
  FiFilter
} from 'react-icons/fi';
import CreateTimetableModal from '../../components/teacher/CreateTimetableModal';
import { getTimetablesApi, deleteTimetableApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_MOCK_SLOTS = [
  {
    id: 'M1',
    day: 'Monday',
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    timeSlot: '09:00 AM - 10:30 AM',
    subject: 'Database Management Systems',
    subjectCode: 'CS401',
    room: 'Lab 301',
    section: 'Sec A',
    instructor: 'Dr. John Smith',
    color: '#6366f1'
  },
  {
    id: 'M2',
    day: 'Monday',
    startTime: '11:00 AM',
    endTime: '12:30 PM',
    timeSlot: '11:00 AM - 12:30 PM',
    subject: 'Web Application Development',
    subjectCode: 'CS403',
    room: 'Room 204',
    section: 'Sec A',
    instructor: 'Dr. Sarah Jenkins',
    color: '#10b981'
  },
  {
    id: 'T1',
    day: 'Tuesday',
    startTime: '09:30 AM',
    endTime: '11:00 AM',
    timeSlot: '09:30 AM - 11:00 AM',
    subject: 'Data Structures & Algorithms',
    subjectCode: 'CS402',
    room: 'Lab 102',
    section: 'Sec A',
    instructor: 'Prof. Sarah Connor',
    color: '#06b6d4'
  },
  {
    id: 'W1',
    day: 'Wednesday',
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    timeSlot: '09:00 AM - 10:30 AM',
    subject: 'Web Application Development',
    subjectCode: 'CS403',
    room: 'Room 204',
    section: 'Sec A',
    instructor: 'Dr. Sarah Jenkins',
    color: '#10b981'
  },
  {
    id: 'TH1',
    day: 'Thursday',
    startTime: '01:30 PM',
    endTime: '03:00 PM',
    timeSlot: '01:30 PM - 03:00 PM',
    subject: 'Database Management Systems',
    subjectCode: 'CS401',
    room: 'Lab 301',
    section: 'Sec A',
    instructor: 'Dr. John Smith',
    color: '#6366f1'
  },
  {
    id: 'F1',
    day: 'Friday',
    startTime: '11:00 AM',
    endTime: '12:30 PM',
    timeSlot: '11:00 AM - 12:30 PM',
    subject: 'Web Application Development',
    subjectCode: 'CS403',
    room: 'Room 204',
    section: 'Sec A',
    instructor: 'Dr. Sarah Jenkins',
    color: '#10b981'
  }
];

export default function TeacherTimetable() {
  const { user } = useAuth();
  const [timetableSlots, setTimetableSlots] = useState(DEFAULT_MOCK_SLOTS);
  const [selectedDay, setSelectedDay] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const res = await getTimetablesApi();
      if (res?.success && res.data.length > 0) {
        const formatted = res.data.map(item => ({
          id: item._id || item.id,
          _id: item._id,
          day: item.day,
          startTime: item.startTime,
          endTime: item.endTime,
          timeSlot: item.timeSlot,
          subject: item.subject,
          subjectCode: item.subjectCode,
          room: item.room,
          section: item.section,
          department: item.department,
          instructor: item.instructor,
          color: item.color || '#6366f1'
        }));
        setTimetableSlots(formatted);
      }
    } catch (err) {
      console.warn('Using default mock timetable data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingSlot(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slot) => {
    setEditingSlot(slot);
    setIsModalOpen(true);
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Are you sure you want to remove this timetable slot?')) return;

    try {
      await deleteTimetableApi(id);
    } catch (err) {
      console.warn('Backend delete failed, removing locally:', err);
    }

    setTimetableSlots(prev => prev.filter(s => s.id !== id && s._id !== id));
  };

  const handleSavedSlot = (savedData) => {
    const formatted = {
      id: savedData._id || savedData.id || 'TT-' + Date.now(),
      _id: savedData._id,
      day: savedData.day,
      startTime: savedData.startTime,
      endTime: savedData.endTime,
      timeSlot: savedData.timeSlot || `${savedData.startTime} - ${savedData.endTime}`,
      subject: savedData.subject,
      subjectCode: savedData.subjectCode,
      room: savedData.room,
      section: savedData.section,
      department: savedData.department,
      instructor: savedData.instructor,
      color: savedData.color || '#6366f1'
    };

    if (editingSlot) {
      setTimetableSlots(prev => prev.map(s => (s.id === formatted.id || s._id === formatted.id ? formatted : s)));
    } else {
      setTimetableSlots(prev => [...prev, formatted]);
    }
  };

  // Filter slots
  const filteredSlots = timetableSlots.filter(slot => {
    const matchesDay = selectedDay === 'All' || slot.day === selectedDay;
    const matchesSearch = searchTerm === '' || 
      slot.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slot.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slot.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slot.section.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDay && matchesSearch;
  });

  const totalSlotsCount = timetableSlots.length;
  const uniqueSubjectsCount = new Set(timetableSlots.map(s => s.subjectCode)).size;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 border-slate-800 bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Faculty Timetable Management
            </h2>
            <span className="badge bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              Weekly Master Schedule
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Create, edit, and organize weekly lecture schedules for students and courses
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn btn-primary px-4 py-2.5 text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 self-start md:self-auto"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Timetable Slot</span>
        </button>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FiCalendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Total Timetable Slots</div>
            <div className="text-xl font-bold text-white">{totalSlotsCount} Classes Scheduled</div>
          </div>
        </div>

        <div className="glass-panel p-4 border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <FiBookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Unique Subjects</div>
            <div className="text-xl font-bold text-white">{uniqueSubjectsCount} Active Subjects</div>
          </div>
        </div>

        <div className="glass-panel p-4 border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FiGrid className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Master Section</div>
            <div className="text-xl font-bold text-white">Sec A / CSE Dept</div>
          </div>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="glass-panel p-4 border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Day Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedDay('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedDay === 'All'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All Days
          </button>
          {DAYS.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedDay === d
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <FiSearch className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search subject, code, room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field text-xs pl-9 py-2 bg-slate-900 border-slate-800"
          />
        </div>
      </div>

      {/* Weekly Schedule View / Day View */}
      {selectedDay === 'All' ? (
        /* Weekly Organized View */
        <div className="space-y-6">
          {DAYS.map(dayName => {
            const daySlots = filteredSlots.filter(s => s.day === dayName);
            if (daySlots.length === 0 && searchTerm) return null;

            return (
              <div key={dayName} className="glass-panel p-5 border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FiCalendar className="w-4 h-4 text-indigo-400" />
                    {dayName}
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">
                    {daySlots.length} Class {daySlots.length === 1 ? 'Slot' : 'Slots'}
                  </span>
                </div>

                {daySlots.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {daySlots.map(slot => (
                      <div
                        key={slot.id}
                        className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 relative overflow-hidden"
                        style={{ borderLeftColor: slot.color, borderLeftWidth: '4px' }}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span 
                              className="text-[11px] font-bold px-2 py-0.5 rounded border"
                              style={{ 
                                color: slot.color, 
                                backgroundColor: `${slot.color}15`, 
                                borderColor: `${slot.color}30` 
                              }}
                            >
                              {slot.subjectCode}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                              {slot.section}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-white pt-1">{slot.subject}</h4>

                          <div className="space-y-1 pt-1 text-xs text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <FiClock className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{slot.timeSlot || `${slot.startTime} - ${slot.endTime}`}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <FiMapPin className="w-3.5 h-3.5 text-amber-400" />
                              <span>{slot.room}</span>
                            </div>
                            {slot.instructor && (
                              <div className="flex items-center gap-1.5">
                                <FiUser className="w-3.5 h-3.5 text-indigo-400" />
                                <span>{slot.instructor}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(slot)}
                            className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                            title="Edit Slot"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete Slot"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-slate-500 italic">
                    No classes scheduled for {dayName}.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Selected Day Filtered View */
        <div className="glass-panel p-6 border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FiCalendar className="w-5 h-5 text-indigo-400" />
              Schedule for {selectedDay}
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {filteredSlots.length} Classes Scheduled
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {filteredSlots.map(slot => (
              <div
                key={slot.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                style={{ borderLeftColor: slot.color, borderLeftWidth: '4px' }}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-xs font-bold px-2 py-0.5 rounded border"
                      style={{ 
                        color: slot.color, 
                        backgroundColor: `${slot.color}15`, 
                        borderColor: `${slot.color}30` 
                      }}
                    >
                      {slot.subjectCode}
                    </span>
                    <h4 className="text-sm font-bold text-white">{slot.subject}</h4>
                    <span className="text-xs text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                      {slot.section}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <FiClock className="w-3.5 h-3.5 text-cyan-400" />
                      {slot.timeSlot || `${slot.startTime} - ${slot.endTime}`}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiMapPin className="w-3.5 h-3.5 text-amber-400" />
                      {slot.room}
                    </span>
                    {slot.instructor && (
                      <span className="flex items-center gap-1.5">
                        <FiUser className="w-3.5 h-3.5 text-indigo-400" />
                        {slot.instructor}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(slot)}
                    className="btn btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
                  >
                    <FiEdit2 className="w-3.5 h-3.5 text-indigo-400" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete Slot"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {filteredSlots.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No classes found for {selectedDay}. Click "Add Timetable Slot" to schedule a class.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal dialog for Add / Edit */}
      <CreateTimetableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSavedSlot}
        editSlot={editingSlot}
      />

    </div>
  );
}
