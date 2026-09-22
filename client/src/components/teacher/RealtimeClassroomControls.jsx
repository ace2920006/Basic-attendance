import React, { useState } from 'react';
import { 
  Radio, 
  Clock, 
  Users, 
  Play, 
  Square, 
  UserCheck, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  RefreshCw,
  QrCode
} from 'lucide-react';
import { useRealtimeClassroom } from '../../context/RealtimeClassroomContext';
import QRAttendanceModal from './QRAttendanceModal';

export default function RealtimeClassroomControls({ defaultClass = null }) {
  const {
    activeSession,
    isSessionActive,
    livePresent,
    liveTotal,
    startSession,
    stopSession,
    simulateCheckIn,
    recentCheckins,
    loading
  } = useRealtimeClassroom();

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const subject = activeSession?.subject || defaultClass?.subject || 'Database Systems';
  const subjectCode = activeSession?.subjectCode || defaultClass?.subjectCode || 'CS401';
  const timeSlot = activeSession?.timeSlot || defaultClass?.timeSlot || '10:00 - 11:00';
  const room = activeSession?.room || defaultClass?.room || '302-B';
  const division = activeSession?.division || defaultClass?.section || 'Sec A';
  const percentage = liveTotal > 0 ? Math.min(100, Math.round((livePresent / liveTotal) * 100)) : 0;

  const handleStart = async () => {
    try {
      await startSession({
        subject: defaultClass?.subject || 'Database Systems',
        subjectCode: defaultClass?.subjectCode || 'CS401',
        timeSlot: defaultClass?.timeSlot || '10:00 - 11:00',
        totalStudents: defaultClass?.studentsCount || 55,
        room: defaultClass?.room || '302-B',
        division: defaultClass?.section || 'Sec A',
        classId: defaultClass?._id || defaultClass?.id
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleStop = async () => {
    if (window.confirm('Are you sure you want to end this attendance session?')) {
      await stopSession();
    }
  };

  const handleSimulateCheckIn = async () => {
    setSimulating(true);
    try {
      await simulateCheckIn();
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setSimulating(false), 300);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-md p-5 shadow-xl transition-all">
      
      {/* Session Active View */}
      {isSessionActive ? (
        <div className="space-y-4">
          
          {/* Top Banner & Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
                    🔴 Attendance Session Active
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                    Live Broadcast
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  <strong className="text-slate-200">{subject}</strong> ({subjectCode}) • {division} • {timeSlot}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="btn btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>Show QR Screen</span>
              </button>
              <button
                onClick={handleStop}
                disabled={loading}
                className="py-1.5 px-3 rounded-xl text-xs font-bold bg-red-600/80 hover:bg-red-500 text-white transition flex items-center gap-1.5 shadow-md shadow-red-600/20"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>End Session</span>
              </button>
            </div>
          </div>

          {/* Live Metric Gauge Row: Present: 42 / 55 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Live Count Display */}
            <div className="md:col-span-6 p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Live Attendance Check-Ins
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  Live Socket Stream
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-emerald-400 font-mono tracking-tight">
                  Present: {livePresent}
                </span>
                <span className="text-2xl font-extrabold text-slate-500 font-mono">
                  / {liveTotal}
                </span>
                <span className="ml-auto text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg">
                  {percentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700/50">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* Quick Simulation & Testing Actions */}
            <div className="md:col-span-6 p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div>
                <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Live Classroom Testing & Roll Call
                </h5>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Simulate live student check-ins to verify real-time Socket.IO count updates.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSimulateCheckIn}
                  disabled={simulating}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-indigo-600/80 hover:bg-indigo-500 text-white border border-indigo-400/30 transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${simulating ? 'animate-spin' : ''}`} />
                  <span>+ Simulate Student Check-In</span>
                </button>
              </div>
            </div>

          </div>

          {/* Recent Live Check-In Roll Call Feed */}
          {recentCheckins.length > 0 && (
            <div className="pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Live Check-In Roll Call ({recentCheckins.length} recent):
              </span>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
                {recentCheckins.slice(0, 8).map((chk, i) => (
                  <span 
                    key={i} 
                    className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 animate-fadeIn"
                  >
                    <UserCheck className="w-3 h-3 text-emerald-400" />
                    <strong>{chk.name}</strong>
                    <span className="text-slate-500 font-mono">({chk.rollNo})</span>
                    <span className="text-[10px] text-emerald-400">{chk.time}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Session Inactive: Quick Start Classroom Mode */
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white tracking-tight">
                  Real-Time Classroom Mode ⚡
                </h4>
                <p className="text-xs text-slate-400">
                  Broadcast live session to student devices with instant roll call & live present counter.
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1 pl-11">
              <span className="text-cyan-300 font-semibold">{subject} ({subjectCode})</span>
              <span>•</span>
              <span className="text-amber-300 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {timeSlot}
              </span>
              <span>•</span>
              <span className="text-slate-400">Target Roster: 55 Enrolled</span>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-500 hover:from-indigo-500 hover:to-blue-500 transition-all shadow-lg shadow-indigo-600/30 border border-indigo-400/30 self-start sm:self-auto shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Live Classroom Mode</span>
          </button>
        </div>
      )}

      {/* QR Attendance Modal */}
      {isQrModalOpen && (
        <QRAttendanceModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          classSession={{
            _id: activeSession?.class || defaultClass?._id,
            subject,
            subjectCode,
            room,
            section: division,
            timeSlot
          }}
        />
      )}

    </div>
  );
}
