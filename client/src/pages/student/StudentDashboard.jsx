import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiClock, 
  FiMapPin, 
  FiUser, 
  FiCalendar, 
  FiTrendingUp, 
  FiBell, 
  FiPlus, 
  FiCheckCircle, 
  FiAlertTriangle,
  FiArrowRight,
  FiFileText,
  FiActivity,
  FiShield
} from 'react-icons/fi';
import { QrCode } from 'lucide-react';

import AttendanceCard from './AttendanceCard';
import NotificationsList from './NotificationsList';
import StudentQRScannerModal from '../../components/student/StudentQRScannerModal';
import { 
  currentUser, 
  studentTodaysClasses, 
  studentUpcomingLecture, 
  studentLeaves 
} from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import AttendanceBadge from '../../components/common/AttendanceBadge';
import { getStudentDefaulterStatusApi } from '../../services/api';

export default function StudentDashboard() {
  const { user: authUser } = useAuth();
  const user = authUser || currentUser.student;
  const upcoming = studentUpcomingLecture;
  const leaves = studentLeaves;
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [defaulterData, setDefaulterData] = useState(null);

  useEffect(() => {
    getStudentDefaulterStatusApi(user?._id)
      .then((res) => {
        if (res?.success && res.data) {
          setDefaulterData(res.data);
        }
      })
      .catch(() => {});
  }, [user?._id]);

  const activeDefaulter = defaulterData?.currentRecord;

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Banner */}
      <div className="glass-panel p-6 border-slate-800 bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img 
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'} 
            alt={user.name} 
            className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-lg shadow-indigo-500/10"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Welcome back, <span className="gradient-text">{user.name}</span> 👋
              </h2>
              <span className="badge bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                {user.semester || 'Semester 4'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Roll No: <span className="text-indigo-300 font-semibold">{user.rollNo || 'CS-2024-089'}</span> • {user.department || 'Computer Science'} • {user.course || 'B.Tech CSE'}
            </p>
          </div>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all border border-emerald-400/30"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR Attendance</span>
          </button>
          <Link to="/student/analytics" className="btn btn-secondary py-2 px-3.5 text-xs flex items-center gap-2">
            <FiActivity className="w-4 h-4 text-cyan-400" />
            <span>Personal Analytics</span>
          </Link>
          <Link to="/student/calendar" className="btn btn-secondary py-2 px-3.5 text-xs flex items-center gap-2">
            <FiCalendar className="w-4 h-4 text-cyan-400" />
            <span>Calendar</span>
          </Link>
          <Link to="/student/history" className="btn btn-secondary py-2 px-3.5 text-xs flex items-center gap-2">
            <FiClock className="w-4 h-4 text-amber-400" />
            <span>History</span>
          </Link>
          <Link to="/student/leave" className="btn btn-primary py-2 px-3.5 text-xs flex items-center gap-2">
            <FiPlus className="w-4 h-4" />
            <span>Apply Leave</span>
          </Link>
        </div>
      </div>

      {/* Phase 30: Automated Defaulter Escalation Warning Banner */}
      {activeDefaulter && (
        <div
          className={`p-5 rounded-2xl border backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slideDown ${
            activeDefaulter.tier === 'PARENT_ALERT'
              ? 'bg-gradient-to-r from-rose-950/80 via-red-950/50 to-slate-900 border-rose-500/50'
              : activeDefaulter.tier === 'ADMIN_ALERT'
              ? 'bg-gradient-to-r from-pink-950/80 via-rose-950/40 to-slate-900 border-pink-500/50'
              : activeDefaulter.tier === 'SERIOUS_WARNING'
              ? 'bg-gradient-to-r from-amber-950/80 via-orange-950/40 to-slate-900 border-amber-500/50'
              : 'bg-gradient-to-r from-yellow-950/80 via-amber-950/40 to-slate-900 border-yellow-500/50'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`p-2.5 rounded-xl border mt-0.5 ${
                activeDefaulter.tier === 'PARENT_ALERT'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : activeDefaulter.tier === 'ADMIN_ALERT'
                  ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              <FiAlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-white">
                  {activeDefaulter.tier === 'PARENT_ALERT'
                    ? '🚨 Critical Defaulter: Parental Alert Dispatched'
                    : activeDefaulter.tier === 'ADMIN_ALERT'
                    ? '🛑 High-Priority Admin Defaulter Alert'
                    : activeDefaulter.tier === 'SERIOUS_WARNING'
                    ? '⚠️ Serious Attendance Warning: Mentor Meeting Required'
                    : '⚠️ Attendance Warning: Shortage Detected'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-900/80 text-white border border-slate-700">
                  {activeDefaulter.attendancePercentage}% (Min {activeDefaulter.targetPercentage || 75}%)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Your cumulative attendance has dropped below the threshold. You must attend the next{' '}
                <strong className="text-cyan-300 underline font-bold">
                  {activeDefaulter.classesNeededToTarget} consecutive lectures
                </strong>{' '}
                without missing any sessions to clear this status and qualify for semester examinations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <Link
              to="/student/predict"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center gap-1.5 shadow-sm"
            >
              <FiTrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulate Recovery</span>
            </Link>
          </div>
        </div>
      )}

      {/* Metric Section: Attendance % Score & Breakdown */}
      <AttendanceCard user={user} />

      {/* Main Grid: Today's Lecture, Upcoming Lecture, Notifications & Leave Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Upcoming Lecture & Today's Schedule */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Upcoming Lecture Card */}
          {upcoming && (
            <div className="glass-panel p-5 border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-slate-900 to-indigo-950/30 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Upcoming Next Lecture</span>
                </div>
                <span className="text-[11px] font-semibold text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                  Starts in {upcoming.startsIn}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {upcoming.code}
                    </span>
                    <h4 className="text-base font-bold text-white">{upcoming.subject}</h4>
                  </div>
                  <p className="text-xs text-slate-300">Topic: <span className="text-slate-100 font-medium">{upcoming.topic}</span></p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1"><FiClock className="w-3.5 h-3.5 text-cyan-400" /> {upcoming.time}</span>
                    <span className="flex items-center gap-1"><FiMapPin className="w-3.5 h-3.5 text-amber-400" /> {upcoming.room}</span>
                    <span className="flex items-center gap-1"><FiUser className="w-3.5 h-3.5 text-indigo-400" /> {upcoming.instructor}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Today's Lectures */}
          <div className="glass-panel p-6 border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <FiClock className="w-5 h-5 text-indigo-400" />
                Today's Lectures & Timetable
              </h3>
              <Link to="/student/classes" className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium">
                <span>View Full Schedule</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3 pt-1">
              {studentTodaysClasses.map((cls) => (
                <div 
                  key={cls.id} 
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{cls.code}</span>
                      <h4 className="text-sm font-semibold text-white">{cls.subject}</h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1"><FiClock className="w-3.5 h-3.5 text-cyan-400" /> {cls.time}</span>
                      <span className="flex items-center gap-1"><FiMapPin className="w-3.5 h-3.5 text-amber-400" /> {cls.room}</span>
                      <span className="flex items-center gap-1"><FiUser className="w-3.5 h-3.5 text-indigo-400" /> {cls.instructor}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      cls.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      cls.status === 'Ongoing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {cls.status}
                    </span>
                    <AttendanceBadge status={cls.attendance} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (5 cols): Notifications & Leave Status */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Leave Status Widget */}
          <div className="glass-panel p-6 border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <FiFileText className="w-5 h-5 text-amber-400" />
                Leave Status
              </h3>
              <Link to="/student/leave" className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium">
                <span>View All</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3 pt-1">
              {leaves.slice(0, 3).map((leave) => (
                <div key={leave.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{leave.leaveType}</span>
                    <span className={`badge text-[10px] px-2 py-0.5 ${
                      leave.status === 'Approved' ? 'badge-present' :
                      leave.status === 'Pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'badge-absent'
                    }`}>
                      {leave.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex justify-between items-center">
                    <span>Dates: <strong className="text-slate-300">{leave.startDate}</strong> to <strong className="text-slate-300">{leave.endDate}</strong></span>
                    <span className="text-slate-400">{leave.id}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 italic">"{leave.reason}"</p>
                </div>
              ))}

              <Link 
                to="/student/leave" 
                className="w-full btn btn-secondary py-2 text-xs flex items-center justify-center gap-2 mt-2"
              >
                <FiPlus className="w-4 h-4 text-indigo-400" />
                <span>Apply New Leave Request</span>
              </Link>
            </div>
          </div>

          {/* System Notifications Widget */}
          <NotificationsList />

        </div>

      </div>

      {/* Student QR Scanner Modal */}
      <StudentQRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />

    </div>
  );
}
