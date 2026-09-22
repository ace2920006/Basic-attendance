import React, { useState } from 'react';
import { 
  Radio, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Zap, 
  Sparkles, 
  QrCode, 
  ShieldCheck,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useRealtimeClassroom } from '../../context/RealtimeClassroomContext';
import StudentQRScannerModal from './StudentQRScannerModal';

export default function RealtimeClassroomBanner() {
  const { 
    activeSession, 
    isSessionActive, 
    livePresent, 
    liveTotal, 
    hasCheckedIn, 
    checkIn, 
    checkingIn,
    latestStudent,
    recentCheckins 
  } = useRealtimeClassroom();

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [justCheckedInLocal, setJustCheckedInLocal] = useState(false);

  if (!isSessionActive || !activeSession) {
    return null;
  }

  const subject = activeSession.subject || 'Database Systems';
  const subjectCode = activeSession.subjectCode || 'CS401';
  const timeSlot = activeSession.timeSlot || '10:00 - 11:00';
  const room = activeSession.room || '302-B';
  const teacher = activeSession.teacherName || 'Faculty';
  const division = activeSession.division || 'Sec A';

  const percentage = liveTotal > 0 ? Math.min(100, Math.round((livePresent / liveTotal) * 100)) : 0;

  const handleDirectCheckIn = async () => {
    try {
      await checkIn();
      setJustCheckedInLocal(true);
      setTimeout(() => setJustCheckedInLocal(false), 4000);
    } catch (e) {
      console.error('Check-in error:', e);
    }
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border-2 border-red-500/50 bg-gradient-to-r from-slate-950 via-red-950/25 to-slate-950 p-5 shadow-2xl shadow-red-950/40 backdrop-blur-xl transition-all animate-fade-in">
        
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-400 to-rose-500 animate-pulse" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          {/* Left Section: Live Pulsing Status & Class Details */}
          <div className="space-y-3">
            
            {/* Live Indicator Pill */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase bg-red-600/20 text-red-400 border border-red-500/40 shadow-sm shadow-red-600/30">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span>🔴 Attendance Session Active</span>
              </span>

              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-900/90 text-slate-300 border border-slate-700">
                {division} • Room {room}
              </span>

              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" />
                Socket.IO Live
              </span>
            </div>

            {/* Subject Title & Lecture Timing */}
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {subject}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {subjectCode}
                </span>
              </div>

              {/* Time Slot & Instructor */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-1.5">
                <span className="flex items-center gap-1.5 text-amber-300 font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {timeSlot}
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Room: <strong className="text-white">{room}</strong>
                </span>
                <span className="text-slate-400">
                  Instructor: <strong className="text-slate-200">{teacher}</strong>
                </span>
              </div>
            </div>

            {/* Live Roll Call Ticker (Recent Check-in) */}
            {latestStudent && (
              <div className="flex items-center gap-2 text-xs text-slate-400 pt-0.5 animate-fadeIn">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Sparkles className="w-3 h-3" />
                  Just Checked In
                </span>
                <span className="text-slate-300 font-medium truncate max-w-xs">
                  <strong className="text-white">{latestStudent.name}</strong> ({latestStudent.rollNo})
                </span>
                <span className="text-[10px] text-slate-500">{latestStudent.time}</span>
              </div>
            )}
          </div>

          {/* Right Section: Live Present Counter & Check-In Trigger */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 lg:gap-6 bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-inner">
            
            {/* Live Counter Display */}
            <div className="text-left sm:text-right pr-0 sm:pr-2 space-y-1">
              <div className="flex items-baseline sm:justify-end gap-1.5">
                <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
                  Present:
                </span>
                <span className="text-3xl font-black text-white font-mono tracking-tight text-emerald-400">
                  {livePresent}
                </span>
                <span className="text-xl font-bold text-slate-500 font-mono">
                  / {liveTotal}
                </span>
              </div>

              {/* Glowing Animated Progress Bar */}
              <div className="w-full sm:w-44 h-2.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60 p-0.5">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-700 ease-out shadow-sm shadow-emerald-500/50"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 text-[10px] text-slate-400 font-mono pt-0.5">
                <span>{percentage}% Class Attendance</span>
                <span className="text-emerald-400 font-bold">• Live via Socket</span>
              </div>
            </div>

            {/* Check-In Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {hasCheckedIn ? (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />
                  <div className="text-left">
                    <p className="text-xs font-bold leading-tight">Marked Present!</p>
                    <p className="text-[10px] text-emerald-400/80">Attendance Verified</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Direct 1-Click Instant Check-In Button */}
                  <button
                    onClick={handleDirectCheckIn}
                    disabled={checkingIn}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-600/30 border border-emerald-400/30 active:scale-95"
                  >
                    <Zap className={`w-4 h-4 text-amber-300 ${checkingIn ? 'animate-spin' : 'animate-pulse'}`} />
                    <span>{checkingIn ? 'Verifying...' : 'Check In Now'}</span>
                  </button>

                  {/* QR Scanner Trigger Button */}
                  <button
                    onClick={() => setIsScannerOpen(true)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-sm hover:text-white"
                    title="Scan QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* QR Scanner Modal for Camera-Based Check-in */}
      <StudentQRScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)}
      />
    </>
  );
}
