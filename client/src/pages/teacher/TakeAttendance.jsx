import React, { useState } from 'react';
import { FiCheckCircle, FiXCircle, FiClock, FiSave, FiCheckSquare } from 'react-icons/fi';
import { mockStudentsList } from '../../data/mockData';

export default function TakeAttendance() {
  const [selectedSubject, setSelectedSubject] = useState('CS401');
  const [selectedSection, setSelectedSection] = useState('Section A');
  const [students, setStudents] = useState(
    mockStudentsList.map(s => ({ ...s, attendance: 'Present' }))
  );
  const [saved, setSaved] = useState(false);

  const toggleStatus = (id, newStatus) => {
    setStudents(students.map(s => s.id === id ? { ...s, attendance: newStatus } : s));
  };

  const markAll = (status) => {
    setStudents(students.map(s => ({ ...s, attendance: status })));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const presentCount = students.filter(s => s.attendance === 'Present').length;
  const absentCount = students.filter(s => s.attendance === 'Absent').length;
  const lateCount = students.filter(s => s.attendance === 'Late').length;

  return (
    <div className="space-y-6">
      
      {/* Subject Selector Bar */}
      <div className="glass-panel p-6 border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FiCheckSquare className="w-5 h-5 text-indigo-400" />
              Mark Attendance Roster
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Record attendance for today's active session</p>
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="input-field text-xs py-2 bg-slate-900 w-auto"
            >
              <option value="CS401">CS401 - Database Systems</option>
              <option value="CS403">CS403 - Web Application Dev</option>
              <option value="CS502">CS502 - Software Architecture</option>
            </select>

            <select 
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="input-field text-xs py-2 bg-slate-900 w-auto"
            >
              <option value="Section A">Section A</option>
              <option value="Section B">Section B</option>
            </select>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
            <span className="block text-xl font-bold text-emerald-400">{presentCount}</span>
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">Present</span>
          </div>
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
            <span className="block text-xl font-bold text-rose-400">{absentCount}</span>
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">Absent</span>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
            <span className="block text-xl font-bold text-amber-400">{lateCount}</span>
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">Late</span>
          </div>
        </div>
      </div>

      {/* Roster Sheet */}
      <div className="glass-panel p-6 border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Student Roster ({students.length} Enrolled)
          </span>

          {/* Bulk Actions */}
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={() => markAll('Present')}
              className="px-2.5 py-1 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors"
            >
              Mark All Present
            </button>
            <button 
              type="button" 
              onClick={() => markAll('Absent')}
              className="px-2.5 py-1 text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg transition-colors"
            >
              Mark All Absent
            </button>
          </div>
        </div>

        {saved && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2">
            <FiCheckCircle className="w-4 h-4" />
            <span>Attendance Sheet Submitted & Synchronized Successfully!</span>
          </div>
        )}

        <div className="divide-y divide-slate-800/80">
          {students.map((stu) => (
            <div key={stu.id} className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-white block">{stu.name}</span>
                <span className="text-[11px] text-slate-400">{stu.rollNo} • {stu.email}</span>
              </div>

              {/* Status Selector Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleStatus(stu.id, 'Present')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    stu.attendance === 'Present'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <FiCheckCircle className="w-3.5 h-3.5" /> Present
                </button>
                <button
                  type="button"
                  onClick={() => toggleStatus(stu.id, 'Absent')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    stu.attendance === 'Absent'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <FiXCircle className="w-3.5 h-3.5" /> Absent
                </button>
                <button
                  type="button"
                  onClick={() => toggleStatus(stu.id, 'Late')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    stu.attendance === 'Late'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <FiClock className="w-3.5 h-3.5" /> Late
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-800 text-right">
          <button 
            type="button"
            onClick={handleSave}
            className="btn btn-primary px-6 py-2.5 text-xs font-semibold shadow-lg shadow-indigo-600/30"
          >
            <FiSave className="w-4 h-4" />
            <span>Submit Attendance Log</span>
          </button>
        </div>

      </div>

    </div>
  );
}
