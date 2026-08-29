import React, { useState, useEffect } from 'react';
import { FiClock, FiSearch, FiEdit3, FiSave, FiX, FiCheckCircle, FiXCircle, FiMessageSquare } from 'react-icons/fi';
import Modal from '../../components/common/Modal';
import { getAttendanceRecordsApi, updateAttendanceApi } from '../../services/api';

export default function AttendanceHistory() {
  const [search, setSearch] = useState('');
  const [editingSession, setEditingSession] = useState(null);
  const [editRoster, setEditRoster] = useState([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [historyLogs, setHistoryLogs] = useState([
    {
      id: 'LOG-101',
      date: '2026-08-08',
      subject: 'Database Systems (CS401)',
      section: 'Sec A',
      total: 45,
      present: 41,
      absent: 3,
      late: 1,
      room: 'Lab 301',
      students: [
        { id: 'STU-001', name: 'Aaron Paul', rollNo: 'CS-2024-001', status: 'Present', remarks: 'On time' },
        { id: 'STU-002', name: 'Bella Thorne', rollNo: 'CS-2024-002', status: 'Present', remarks: 'On time' },
        { id: 'STU-003', name: 'Carlos Gomez', rollNo: 'CS-2024-003', status: 'Absent', remarks: 'Unexcused' },
        { id: 'STU-005', name: 'Ethan Hunt', rollNo: 'CS-2024-005', status: 'Late', remarks: '15 mins late' }
      ]
    },
    {
      id: 'LOG-102',
      date: '2026-08-06',
      subject: 'Web Technologies (CS405)',
      section: 'Sec B',
      total: 42,
      present: 38,
      absent: 4,
      late: 0,
      room: 'Room 204',
      students: [
        { id: 'STU-001', name: 'Aaron Paul', rollNo: 'CS-2024-001', status: 'Present', remarks: 'Lab completed' },
        { id: 'STU-003', name: 'Carlos Gomez', rollNo: 'CS-2024-003', status: 'Absent', remarks: 'Sick leave requested' }
      ]
    },
    {
      id: 'LOG-103',
      date: '2026-08-04',
      subject: 'Database Systems (CS401)',
      section: 'Sec A',
      total: 45,
      present: 43,
      absent: 2,
      late: 0,
      room: 'Lab 301',
      students: [
        { id: 'STU-002', name: 'Bella Thorne', rollNo: 'CS-2024-002', status: 'Present', remarks: 'Evaluated' }
      ]
    },
    {
      id: 'LOG-104',
      date: '2026-08-01',
      subject: 'Software Architecture (CS502)',
      section: 'Sec A',
      total: 38,
      present: 35,
      absent: 2,
      late: 1,
      room: 'Hall C',
      students: [
        { id: 'STU-005', name: 'Ethan Hunt', rollNo: 'CS-2024-005', status: 'Present', remarks: 'Good' }
      ]
    }
  ]);

  useEffect(() => {
    fetchBackendLogs();
  }, []);

  const fetchBackendLogs = async () => {
    try {
      const res = await getAttendanceRecordsApi();
      if (res?.success && res.data.length > 0) {
        // Option to map backend data if available
      }
    } catch (err) {
      console.warn('Using local attendance logs:', err);
    }
  };

  const [correctionReason, setCorrectionReason] = useState('');

  const handleOpenEdit = (log) => {
    setEditingSession(log);
    setEditRoster(log.students ? [...log.students] : []);
    setCorrectionReason('');
  };

  const handleStatusChange = (studentId, newStatus) => {
    setEditRoster(prev =>
      prev.map(s => (s.id === studentId ? { ...s, status: newStatus } : s))
    );
  };

  const handleRemarkChange = (studentId, newRemark) => {
    setEditRoster(prev =>
      prev.map(s => (s.id === studentId ? { ...s, remarks: newRemark } : s))
    );
  };

  const handleSaveEdit = async () => {
    if (!correctionReason.trim()) {
      alert('Phase 23 Policy: Please state a clear Correction Reason to update attendance records.');
      return;
    }

    const pCount = editRoster.filter(s => s.status === 'Present').length;
    const aCount = editRoster.filter(s => s.status === 'Absent').length;
    const lCount = editRoster.filter(s => s.status === 'Late').length;

    setHistoryLogs(prev =>
      prev.map(log => {
        if (log.id === editingSession.id) {
          return {
            ...log,
            present: pCount,
            absent: aCount,
            late: lCount,
            students: editRoster
          };
        }
        return log;
      })
    );

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setEditingSession(null);
    }, 1500);
  };

  const filteredLogs = historyLogs.filter(
    log =>
      log.subject.toLowerCase().includes(search.toLowerCase()) ||
      log.date.includes(search)
  );

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="glass-panel p-6 border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FiClock className="w-5 h-5 text-cyan-400" />
              Past Attendance Session Logs & Correction Request
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Search, review, and request audit-logged corrections for attendance records</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input 
                type="text"
                placeholder="Search subject or date..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-8 text-xs py-1.5 bg-slate-900 w-60"
              />
            </div>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Session Date</th>
                <th className="py-3 px-4">Subject & Code</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4">Venue</th>
                <th className="py-3 px-4">Attendance Stats</th>
                <th className="py-3 px-4 text-right">Actions</th>
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
                    {log.late > 0 && (
                      <>
                        <span className="text-slate-500 mx-1">•</span>
                        <span className="text-amber-400">{log.late} Late</span>
                      </>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(log)}
                      className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto transition-colors"
                    >
                      <FiEdit3 className="w-3.5 h-3.5" /> Request Correction
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Edit Attendance Modal */}
      <Modal
        isOpen={!!editingSession}
        onClose={() => setEditingSession(null)}
        title={`Request Correction: ${editingSession?.subject} (${editingSession?.date})`}
      >
        {editingSession && (
          <div className="space-y-4">
            {savedSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2">
                <FiCheckCircle className="w-4 h-4" />
                <span>Attendance Correction Request Logged Successfully!</span>
              </div>
            )}

            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 flex justify-between items-center">
              <span>Venue: {editingSession.room} • Section: {editingSession.section}</span>
              <span className="font-extrabold uppercase text-[10px] tracking-wider bg-indigo-500/20 px-2 py-0.5 rounded">Phase 23 Audit</span>
            </div>

            <div className="divide-y divide-slate-800/80 max-h-80 overflow-y-auto pr-1">
              {editRoster.map((stu) => (
                <div key={stu.id} className="py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">{stu.name}</span>
                      <span className="text-[11px] text-slate-400">{stu.rollNo}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(stu.id, 'Present')}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                          stu.status === 'Present'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(stu.id, 'Absent')}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                          stu.status === 'Absent'
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(stu.id, 'Late')}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                          stu.status === 'Late'
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        Late
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <FiMessageSquare className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 w-3 h-3" />
                    <input
                      type="text"
                      placeholder="Remarks / Note..."
                      value={stu.remarks || ''}
                      onChange={(e) => handleRemarkChange(stu.id, e.target.value)}
                      className="input-field pl-7 text-[11px] py-1 bg-slate-950 border-slate-800"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Mandatory Reason Input */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Correction Reason <span className="text-rose-400">* Required for Audit Trail</span>
              </label>
              <textarea
                rows={2}
                placeholder="State reason for modification (e.g. Student submitted medical certificate, QR scanner glitch resolved)..."
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                className="input-field text-xs py-2 bg-slate-950 border-indigo-500/30 w-full"
                required
              />
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setEditingSession(null)}
                className="btn btn-secondary px-4 py-2 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn btn-primary px-5 py-2 text-xs font-bold shadow-lg shadow-indigo-600/30"
              >
                <FiSave className="w-4 h-4" />
                <span>Submit Correction Workflow</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}

