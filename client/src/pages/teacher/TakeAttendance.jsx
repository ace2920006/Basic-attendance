import React, { useState, useEffect } from 'react';
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiSave,
  FiCheckSquare,
  FiMessageSquare,
  FiCloud,
  FiCloudOff,
  FiRefreshCw,
  FiAlertTriangle,
  FiDatabase,
  FiCheck
} from 'react-icons/fi';
import { QrCode } from 'lucide-react';
import { mockStudentsList } from '../../data/mockData';
import { markBulkAttendanceApi, syncOfflineAttendanceApi } from '../../services/api';
import { cacheRoster, getCachedRoster } from '../../utils/offlineAttendanceDB';
import { useOfflineSync } from '../../context/OfflineSyncContext';
import { useAuth } from '../../context/AuthContext';
import QRAttendanceModal from '../../components/teacher/QRAttendanceModal';

export default function TakeAttendance() {
  const { user } = useAuth();
  const {
    isOnline,
    queueAttendance,
    pendingCount,
    conflictCount,
    openSyncCenter,
    openConflictModal,
    conflictedBatches
  } = useOfflineSync();

  const [selectedSubject, setSelectedSubject] = useState('CS401');
  const [selectedSection, setSelectedSection] = useState('Section A');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  
  const [students, setStudents] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null); // { mode: 'online' | 'offline' | 'fallback_offline', message: string }
  const [error, setError] = useState('');

  const activeClassMock = {
    _id: 'class-cs401-secA',
    subject: 'Database Systems',
    subjectCode: selectedSubject,
    room: '302-B',
    section: selectedSection
  };

  // Load roster with offline IndexedDB caching
  useEffect(() => {
    async function loadRoster() {
      // 1. Try retrieving from offline cache first
      const cached = await getCachedRoster(selectedSubject, selectedSection);
      if (cached && cached.length > 0) {
        setStudents(cached);
        return;
      }

      // 2. Fallback to default list & populate offline cache
      const initialList = mockStudentsList.map((s) => ({
        ...s,
        attendance: 'Present',
        remarks: ''
      }));

      setStudents(initialList);
      // Cache this roster in IndexedDB so it's always available when offline
      cacheRoster(selectedSubject, selectedSection, initialList);
    }

    loadRoster();
  }, [selectedSubject, selectedSection]);

  const toggleStatus = (id, newStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, attendance: newStatus } : s))
    );
  };

  const handleRemarkChange = (id, newRemark) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, remarks: newRemark } : s))
    );
  };

  const markAll = (status) => {
    setStudents((prev) => prev.map((s) => ({ ...s, attendance: status })));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaveResult(null);

    const clientTimestamp = new Date().toISOString();
    const batchId = `offline_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const records = students.map((s) => ({
      studentId: s.id,
      name: s.name,
      rollNo: s.rollNo,
      subject: selectedSubject,
      subjectCode: selectedSubject,
      status: s.attendance,
      notes: s.remarks || '',
      clientMarkedAt: clientTimestamp
    }));

    // CASE A: TEACHER IS OFFLINE
    if (!isOnline) {
      try {
        await queueAttendance({
          id: batchId,
          batchId,
          subject: selectedSubject,
          subjectCode: selectedSubject,
          section: selectedSection,
          classId: activeClassMock._id,
          date: clientTimestamp,
          clientTimestamp,
          teacherId: user?._id || 'teacher_local',
          teacherName: user?.name || 'Faculty',
          records
        });

        // Also update cached roster with latest remarks/attendance
        await cacheRoster(selectedSubject, selectedSection, students);

        setSaveResult({
          mode: 'offline',
          message: `Saved to Offline Queue (IndexedDB)! ${records.length} records safely stored on this device. Attendance will automatically synchronize once internet returns.`
        });
        setTimeout(() => setSaveResult(null), 8000);
      } catch (err) {
        setError(`Failed to save offline log: ${err.message}`);
      } finally {
        setSaving(false);
      }
      return;
    }

    // CASE B: TEACHER IS ONLINE
    try {
      try {
        const res = await syncOfflineAttendanceApi({
          batchId,
          subject: selectedSubject,
          subjectCode: selectedSubject,
          section: selectedSection,
          date: clientTimestamp,
          clientTimestamp,
          classId: activeClassMock._id,
          conflictStrategy: 'detect_only',
          records
        });

        if (res?.hasConflicts) {
          // Conflicts detected directly on submit: queue with conflict status
          await queueAttendance({
            id: batchId,
            batchId,
            subject: selectedSubject,
            subjectCode: selectedSubject,
            section: selectedSection,
            date: clientTimestamp,
            clientTimestamp,
            records
          });

          setSaveResult({
            mode: 'conflict',
            message: `Submission received with ${res.conflictsCount} conflict(s). Please review and resolve discrepancies.`
          });
        } else {
          setSaveResult({
            mode: 'online',
            message: `Attendance Sheet for ${selectedSubject} (${selectedSection}) submitted and synchronized with server successfully!`
          });
          setTimeout(() => setSaveResult(null), 6000);
        }
      } catch (networkErr) {
        console.warn('Network call failed, falling back to IndexedDB offline queue:', networkErr);
        // Fallback gracefully to offline IndexedDB queue
        await queueAttendance({
          id: batchId,
          batchId,
          subject: selectedSubject,
          subjectCode: selectedSubject,
          section: selectedSection,
          classId: activeClassMock._id,
          date: clientTimestamp,
          clientTimestamp,
          teacherId: user?._id || 'teacher_local',
          teacherName: user?.name || 'Faculty',
          records
        });

        setSaveResult({
          mode: 'fallback_offline',
          message: `Network drop detected during submission: ${records.length} records automatically captured in local IndexedDB offline queue. Auto-sync will run upon reconnect.`
        });
        setTimeout(() => setSaveResult(null), 8000);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter((s) => s.attendance === 'Present').length;
  const absentCount = students.filter((s) => s.attendance === 'Absent').length;
  const lateCount = students.filter((s) => s.attendance === 'Late').length;

  return (
    <div className="space-y-6">
      
      {/* Phase 34: Offline Sync Live Mode Notification Card */}
      <div className={`p-4 rounded-2xl border transition-all ${
        !isOnline
          ? 'bg-amber-500/10 border-amber-500/30'
          : pendingCount > 0
          ? 'bg-blue-500/10 border-blue-500/30'
          : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              !isOnline
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {!isOnline ? <FiCloudOff className="w-4 h-4" /> : <FiCloud className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {!isOnline ? 'Offline Attendance Mode Active' : 'Live Cloud Sync Connected'}
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  IndexedDB Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {!isOnline
                  ? 'No internet required. Take attendance normally — records queue locally and auto-sync when connection returns.'
                  : 'Teacher records stream in real-time. Offline fallback is primed in case of connectivity drops.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {conflictCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (conflictedBatches.length > 0) openConflictModal(conflictedBatches[0]);
                  else openSyncCenter();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 animate-pulse transition"
              >
                <FiAlertTriangle className="w-3.5 h-3.5" />
                <span>Resolve Conflicts ({conflictCount})</span>
              </button>
            )}

            <button
              type="button"
              onClick={openSyncCenter}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <FiDatabase className="w-3.5 h-3.5 text-indigo-400" />
              <span>Queue Status {pendingCount > 0 ? `(${pendingCount})` : ''}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subject & Section Header Bar */}
      <div className="glass-panel p-6 border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FiCheckSquare className="w-5 h-5 text-indigo-400" />
              Class Attendance Roster Sheet
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Select class details and record individual student attendance with remarks</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Subject</label>
              <select 
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="input-field text-xs py-1.5 bg-slate-900 w-auto"
              >
                <option value="CS401">CS401 - Database Systems</option>
                <option value="CS403">CS403 - Web Application Dev</option>
                <option value="CS502">CS502 - Software Architecture</option>
                <option value="CS601">CS601 - Advanced Machine Learning</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Section</label>
              <select 
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="input-field text-xs py-1.5 bg-slate-900 w-auto"
              >
                <option value="Section A">Section A</option>
                <option value="Section B">Section B</option>
                <option value="Lab Batch 1">Lab Batch 1</option>
              </select>
            </div>

            <div className="pt-4 sm:pt-0">
              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all border border-blue-400/30"
              >
                <QrCode className="w-4 h-4" />
                <span>Start QR Attendance</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
            <span className="block text-2xl font-extrabold text-emerald-400">{presentCount}</span>
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">Present</span>
          </div>
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
            <span className="block text-2xl font-extrabold text-rose-400">{absentCount}</span>
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">Absent</span>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
            <span className="block text-2xl font-extrabold text-amber-400">{lateCount}</span>
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">Late</span>
          </div>
        </div>
      </div>

      {/* Main Roster Table */}
      <div className="glass-panel p-6 border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Student Roster ({students.length} Enrolled)
          </span>

          {/* Bulk Actions */}
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={() => markAll('Present')}
              className="px-3 py-1.5 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors font-medium"
            >
              Mark All Present
            </button>
            <button 
              type="button" 
              onClick={() => markAll('Absent')}
              className="px-3 py-1.5 text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg transition-colors font-medium"
            >
              Mark All Absent
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-semibold text-rose-400">
            {error}
          </div>
        )}

        {saveResult && (
          <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 text-center ${
            saveResult.mode === 'online'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : saveResult.mode === 'conflict'
              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
              : 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-300'
          }`}>
            {saveResult.mode === 'online' ? (
              <FiCheckCircle className="w-4 h-4 flex-shrink-0" />
            ) : saveResult.mode === 'conflict' ? (
              <FiAlertTriangle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <FiDatabase className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{saveResult.message}</span>
          </div>
        )}

        {/* Student List Grid */}
        <div className="divide-y divide-slate-800/80">
          {students.map((stu) => (
            <div key={stu.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Student Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white block">{stu.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                    (stu.attendanceRate || 85) >= 75 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {stu.attendanceRate || 85}% Avg
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">{stu.rollNo} • {stu.email}</span>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleStatus(stu.id, 'Present')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    stu.attendance === 'Present'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/50'
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
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-400/50'
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
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-2 ring-amber-400/50'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <FiClock className="w-3.5 h-3.5" /> Late
                </button>
              </div>

              {/* Remarks Input */}
              <div className="w-full md:w-64">
                <div className="relative">
                  <FiMessageSquare className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5" />
                  <input
                    type="text"
                    placeholder="Add remarks (e.g. 15m late, sick note)..."
                    value={stu.remarks || ''}
                    onChange={(e) => handleRemarkChange(stu.id, e.target.value)}
                    className="input-field pl-8 text-xs py-1.5 bg-slate-950 border-slate-800"
                  />
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Submit Attendance Bar */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-slate-400">
            {presentCount} Present, {absentCount} Absent, {lateCount} Late
          </span>
          <button 
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`btn px-6 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-lg transition ${
              !isOnline
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                : 'btn-primary shadow-indigo-600/30'
            }`}
          >
            {saving ? (
              <>
                <FiRefreshCw className="w-4 h-4 animate-spin" />
                <span>Recording...</span>
              </>
            ) : !isOnline ? (
              <>
                <FiDatabase className="w-4 h-4" />
                <span>Save to Offline Queue ({students.length} Students)</span>
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                <span>Submit Class Attendance</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Dynamic 30-Second QR Attendance Modal */}
      <QRAttendanceModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        classSession={activeClassMock}
      />

    </div>
  );
}
