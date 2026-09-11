import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiCalendar,
  FiCheckSquare,
  FiUser,
  FiBarChart2,
  FiClock,
  FiActivity,
  FiBookOpen
} from 'react-icons/fi';
import { QrCode, Camera } from 'lucide-react';
import StudentQRScannerModal from '../student/StudentQRScannerModal';

export default function MobileBottomNav({ role = 'student' }) {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Student navigation items
  const renderStudentNav = () => (
    <>
      <NavLink
        to="/student"
        end
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition ${
            isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <FiHome className="w-5 h-5 mb-0.5" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/student/classes"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition ${
            isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <FiCalendar className="w-5 h-5 mb-0.5" />
        <span>Classes</span>
      </NavLink>

      {/* Prominent Floating Center Action Button for Scan QR */}
      <div className="flex-1 flex items-center justify-center -mt-5">
        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          className="relative group p-3.5 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-950/60 border-4 border-slate-950 transform active:scale-95 transition-all hover:shadow-emerald-500/30"
          title="Scan QR Attendance"
          aria-label="Scan QR Attendance"
        >
          <div className="absolute inset-0 rounded-full bg-emerald-400 opacity-20 animate-ping pointer-events-none" />
          <QrCode className="w-6 h-6 text-white" />
        </button>
      </div>

      <NavLink
        to="/student/leave"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition ${
            isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <FiCheckSquare className="w-5 h-5 mb-0.5" />
        <span>Leaves</span>
      </NavLink>

      <NavLink
        to="/student/profile"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition ${
            isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <FiUser className="w-5 h-5 mb-0.5" />
        <span>Profile</span>
      </NavLink>

      {/* Student QR Scanner Modal */}
      <StudentQRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </>
  );

  // Teacher navigation items
  const renderTeacherNav = () => (
    <>
      <NavLink
        to="/teacher"
        end
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition ${
            isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <FiHome className="w-5 h-5 mb-0.5" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/teacher/take-attendance"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition ${
            isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <FiCalendar className="w-5 h-5 mb-0.5" />
        <span>Mark</span>
      </NavLink>

      <NavLink
        to="/teacher/analytics"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition ${
            isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <FiActivity className="w-5 h-5 mb-0.5" />
        <span>Analytics</span>
      </NavLink>

      <NavLink
        to="/teacher/history"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition ${
            isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <FiClock className="w-5 h-5 mb-0.5" />
        <span>History</span>
      </NavLink>

      <NavLink
        to="/teacher/leave"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition ${
            isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <FiCheckSquare className="w-5 h-5 mb-0.5" />
        <span>Leaves</span>
      </NavLink>
    </>
  );

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1 flex items-center justify-around shadow-2xl"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
    >
      {role === 'teacher' ? renderTeacherNav() : renderStudentNav()}
    </nav>
  );
}
