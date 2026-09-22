import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import MobileBottomNav from '../../components/layout/MobileBottomNav';
import { currentUser } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useRealtimeClassroom } from '../../context/RealtimeClassroomContext';
import { Zap, CheckCircle2, Radio } from 'lucide-react';

export default function StudentLayout() {
  const { user: authUser } = useAuth();
  const user = authUser || currentUser.student;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isSessionActive, activeSession, livePresent, liveTotal, hasCheckedIn, checkIn, checkingIn } = useRealtimeClassroom();

  const isDashboard = location.pathname === '/student' || location.pathname === '/student/';

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar 
        role="student" 
        user={user} 
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header 
          title="Student Attendance Portal" 
          subtitle="Real-time attendance score, schedule & notification logs" 
          user={user} 
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        />

        {/* Persistent Floating Live Session Alert when browsing other student sub-pages */}
        {isSessionActive && !isDashboard && (
          <div className="mx-3 sm:mx-6 mt-4 p-3 rounded-xl border border-red-500/50 bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-red-950/30 animate-fadeIn">
            <div className="flex items-center gap-2.5 text-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="font-extrabold text-red-400 uppercase tracking-wider">🔴 Attendance Session Active:</span>
              <strong className="text-white">{activeSession?.subject || 'Database Systems'}</strong>
              <span className="text-slate-400">({activeSession?.timeSlot || '10:00 - 11:00'})</span>
              <span className="text-emerald-400 font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Present: {livePresent} / {liveTotal}
              </span>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              {hasCheckedIn ? (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Marked Present
                </span>
              ) : (
                <button
                  onClick={() => checkIn()}
                  disabled={checkingIn}
                  className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition flex items-center gap-1 shadow-sm"
                >
                  <Zap className="w-3 h-3" />
                  <span>Check In</span>
                </button>
              )}
              <Link to="/student" className="text-xs text-slate-400 hover:text-white underline">
                View Classroom
              </Link>
            </div>
          </div>
        )}

        <main className="flex-1 p-3 sm:p-6 pb-24 md:pb-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav role="student" />
    </div>
  );
}
