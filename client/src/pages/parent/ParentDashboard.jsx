import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiCalendar,
  FiBookOpen,
  FiArrowRight,
  FiShield,
  FiPhone,
  FiMail,
  FiActivity,
  FiUserCheck,
  FiFileText,
  FiBell
} from 'react-icons/fi';
import { getParentOverviewApi } from '../../services/api';
import { currentUser, studentSubjects, studentLeaves, studentAttendanceHistory } from '../../data/mockData';

export default function ParentDashboard() {
  const context = useOutletContext();
  const activeWard = context?.activeWard;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getParentOverviewApi(activeWard?._id)
      .then((res) => {
        if (isMounted && res?.success && res.data) {
          setData(res.data);
        }
      })
      .catch(() => {
        // Fallback to rich mock data if backend not reachable
        if (isMounted) {
          setData({
            ward: {
              _id: activeWard?._id || 'mock_alex',
              name: activeWard?.name || currentUser.student.name,
              rollNo: activeWard?.rollNo || currentUser.student.rollNo,
              department: activeWard?.department || currentUser.student.department,
              semester: activeWard?.semester || currentUser.student.semester,
              course: currentUser.student.course,
              avatar: activeWard?.avatar || currentUser.student.avatar,
              advisor: 'Dr. Sarah Jenkins'
            },
            stats: {
              overallPercentage: 88.5,
              totalClasses: 120,
              totalConducted: 120,
              attendedClasses: 106,
              absentClasses: 14,
              lateClasses: 5,
              excusedClasses: 3,
              minRequiredPercentage: 75,
              isEligible: true,
              isShortage: false,
              consecutiveNeeded: 0,
              safeMisses: 21
            },
            activeDefaulter: null,
            subjectSummary: studentSubjects.map((s) => ({
              subject: s.name,
              code: s.code,
              total: s.total,
              attended: s.attended,
              percentage: s.percentage,
              isShortage: s.percentage < 75,
              consecutiveNeeded: s.percentage < 75 ? 3 : 0,
              safeMisses: s.percentage >= 75 ? 4 : 0,
              status: s.percentage >= 75 ? 'Safe' : 'Warning'
            })),
            recentAttendance: studentAttendanceHistory.slice(0, 5),
            recentLeaves: studentLeaves.slice(0, 3)
          });
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeWard?._id]);

  const ward = data?.ward || activeWard || currentUser.student;
  const stats = data?.stats || {
    overallPercentage: 88.5,
    totalClasses: 120,
    attendedClasses: 106,
    absentClasses: 14,
    lateClasses: 5,
    minRequiredPercentage: 75,
    isEligible: true,
    consecutiveNeeded: 0,
    safeMisses: 21
  };
  const activeDefaulter = data?.activeDefaulter;
  const subjects = data?.subjectSummary || [];
  const recentLogs = data?.recentAttendance || [];
  const leaves = data?.recentLeaves || [];

  const isHealthy = (stats.overallPercentage || 0) >= (stats.minRequiredPercentage || 75);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. Ward Profile & Overview Banner */}
      <div className="glass-panel p-6 border-slate-800 bg-gradient-to-r from-slate-900/90 via-rose-950/30 to-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={ward.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt={ward.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-rose-500/40 shadow-lg shadow-rose-500/10"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {ward.name}
              </h2>
              <span className="badge bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                {ward.semester || 'Semester 4'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Roll No: <strong className="text-rose-300">{ward.rollNo || 'CS-2024-089'}</strong> &bull; {ward.department || 'Computer Science & Engineering'} &bull; {ward.course || 'B.Tech CSE'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
              <span>Faculty Advisor: <strong className="text-slate-200">Dr. Sarah Jenkins</strong></span>
              <span>&bull;</span>
              <span>Parent Access Mode: <strong className="text-emerald-400 font-semibold">Verified Guardian</strong></span>
            </p>
          </div>
        </div>

        {/* Quick Navigation Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/parent/attendance"
            className="btn btn-secondary py-2 px-3.5 text-xs flex items-center gap-1.5"
          >
            <FiClock className="w-4 h-4 text-cyan-400" />
            <span>Attendance Log</span>
          </Link>
          <Link
            to="/parent/subjects"
            className="btn btn-secondary py-2 px-3.5 text-xs flex items-center gap-1.5"
          >
            <FiBookOpen className="w-4 h-4 text-indigo-400" />
            <span>Subject-Wise</span>
          </Link>
          <Link
            to="/parent/warnings"
            className="btn btn-secondary py-2 px-3.5 text-xs flex items-center gap-1.5 border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
          >
            <FiAlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Warning Center</span>
          </Link>
          <Link
            to="/parent/leaves"
            className="btn btn-primary py-2 px-3.5 text-xs flex items-center gap-1.5"
          >
            <FiFileText className="w-4 h-4" />
            <span>Leave Requests</span>
          </Link>
        </div>
      </div>

      {/* 2. Automated Attendance Warning / Defaulter Banner */}
      {(activeDefaulter || !isHealthy) && (
        <div className="p-5 rounded-2xl border backdrop-blur-md shadow-xl bg-gradient-to-r from-rose-950/80 via-red-950/50 to-slate-900 border-rose-500/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl border mt-0.5 bg-rose-500/20 text-rose-300 border-rose-500/40 shrink-0">
              <FiAlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-white">
                  {activeDefaulter?.tier === 'PARENT_ALERT' || stats.overallPercentage < 60
                    ? '🚨 Critical Defaulter: Parental Alert Active (<60%)'
                    : stats.overallPercentage < 70
                    ? '⚠️ Serious Attendance Warning (<70%)'
                    : '⚠️ Institutional Attendance Shortage (<75%)'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-900/80 text-rose-300 border border-rose-800">
                  {stats.overallPercentage}% (Min {stats.minRequiredPercentage || 75}%)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Your ward's attendance is below the university's statutory 75% examination eligibility threshold.
                They must attend the next{' '}
                <strong className="text-cyan-300 underline font-bold">
                  {stats.consecutiveNeeded || 5} consecutive lectures
                </strong>{' '}
                without absences to recover and prevent exam debarment.
              </p>
            </div>
          </div>

          <Link
            to="/parent/warnings"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center gap-1.5 self-start md:self-center shrink-0 shadow-sm"
          >
            <span>View Recovery Plan</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 3. Overall Cumulative Score Card & Quick Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Overall Score Highlight (5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-6 border-slate-700/80 bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-rose-950/20 relative overflow-hidden flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
              Ward's Cumulative Attendance
            </span>
            <div className="flex items-baseline gap-3 mt-2">
              <h2 className="text-5xl font-black text-white tracking-tight">
                {stats.overallPercentage}%
              </h2>
              <span className={`badge ${isHealthy ? 'badge-present' : 'badge-absent'} text-xs py-1 px-3`}>
                {isHealthy ? 'Safe Zone (>75%)' : 'Shortage Deficit'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Calculated across <strong className="text-slate-200">{stats.totalClasses || 120} total lectures</strong> conducted this semester.
            </p>
          </div>

          {/* Safe Skips or Classes Needed Insight Pill */}
          <div className="mt-6 pt-4 border-t border-slate-800/80">
            {isHealthy ? (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                <FiCheckCircle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>{stats.safeMisses || 0} safe misses remaining</strong> before dropping below the 75% exam cutoff.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                <FiAlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Requires <strong>{stats.consecutiveNeeded || 1} consecutive sessions</strong> to regain 75% exam eligibility.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Breakdown Metric Tiles (7 Cols) */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel p-4 border-slate-800 bg-slate-900/60 text-center flex flex-col justify-center">
            <span className="text-3xl font-bold text-emerald-400">{stats.attendedClasses || 0}</span>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-1">
              Classes Attended
            </span>
          </div>

          <div className="glass-panel p-4 border-slate-800 bg-slate-900/60 text-center flex flex-col justify-center">
            <span className="text-3xl font-bold text-rose-400">{stats.absentClasses || 0}</span>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-1">
              Classes Missed
            </span>
          </div>

          <div className="glass-panel p-4 border-slate-800 bg-slate-900/60 text-center flex flex-col justify-center">
            <span className="text-3xl font-bold text-amber-400">{stats.lateClasses || 0}</span>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-1">
              Late Arrivals
            </span>
          </div>

          <div className="glass-panel p-4 border-slate-800 bg-slate-900/60 text-center flex flex-col justify-center">
            <span className="text-3xl font-bold text-cyan-400">{stats.excusedClasses || leaves.length || 0}</span>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-1">
              Medical Leaves
            </span>
          </div>

          {/* Regulatory Notice Tile */}
          <div className="col-span-2 sm:col-span-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <FiShield className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>University Academic By-Law 14.2: 75% minimum attendance required for final exam hall ticket.</span>
            </div>
            <Link to="/parent/warnings" className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 shrink-0 ml-2">
              <span>View Policy</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* 4. Subject-Wise Snapshot & Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left (7 Cols): Subject-Wise Attendance Overview */}
        <div className="lg:col-span-7 glass-panel p-6 border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FiBookOpen className="w-5 h-5 text-rose-400" />
              <span>Subject-Wise Attendance Snapshot</span>
            </h3>
            <Link to="/parent/subjects" className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1">
              <span>All Subjects ({subjects.length})</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 pt-2">
            {subjects.slice(0, 4).map((sub, idx) => {
              const isSubHealthy = (sub.percentage || 0) >= 75;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{sub.subject || sub.name}</h4>
                      <span className="text-[11px] text-slate-400">Code: {sub.code} &bull; Attended: {sub.attended} / {sub.total || sub.totalClasses}</span>
                    </div>
                    <span className={`text-sm font-bold ${isSubHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {sub.percentage}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSubHealthy ? 'bg-gradient-to-r from-teal-500 to-emerald-500' : 'bg-gradient-to-r from-amber-500 to-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, sub.percentage)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span className={isSubHealthy ? 'text-emerald-400 font-medium' : 'text-rose-400 font-semibold'}>
                      {isSubHealthy ? '✓ Safe Zone (>75%)' : `⚠️ Shortage: Need ${sub.consecutiveNeeded || 2} more classes`}
                    </span>
                    <span>Required: 75%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right (5 Cols): Recent Attendance Activity Log */}
        <div className="lg:col-span-5 glass-panel p-6 border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FiClock className="w-5 h-5 text-cyan-400" />
              <span>Recent Lecture Records</span>
            </h3>
            <Link to="/parent/attendance" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1">
              <span>View History</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5 pt-2">
            {recentLogs.length > 0 ? (
              recentLogs.slice(0, 5).map((log, idx) => {
                const isPresent = log.status === 'Present';
                const isLate = log.status === 'Late';
                const isAbsent = log.status === 'Absent';
                return (
                  <div
                    key={log._id || idx}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <h5 className="font-semibold text-white">{log.subject}</h5>
                      <span className="text-[11px] text-slate-400">
                        {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} &bull; {log.timeSlot || 'Lecture Session'}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isPresent
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : isLate
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : isAbsent
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">No recent attendance records logged.</p>
            )}
          </div>

          {/* Academic Counseling Tile */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950/30 border border-slate-800 space-y-2 mt-4">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <FiUserCheck className="w-4 h-4 text-indigo-400" />
              <span>Academic Mentorship Contact</span>
            </span>
            <p className="text-[11px] text-slate-300">
              For attendance counseling or special dispensation inquiries, reach out to your ward's class advisor:
            </p>
            <div className="flex flex-col gap-1 text-[11px] text-slate-400 pt-1">
              <div className="flex items-center gap-2">
                <FiMail className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-200">sarah.jenkins@university.edu</span>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-200">+1 (555) 234-8900 &bull; Office 304</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
