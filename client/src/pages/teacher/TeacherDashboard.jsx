import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiBookOpen, 
  FiCheckSquare, 
  FiFileText, 
  FiBarChart2, 
  FiUsers, 
  FiClock, 
  FiPlusCircle, 
  FiTrash2,
  FiActivity,
  FiAlertTriangle,
  FiTrendingUp,
  FiChevronRight,
  FiCalendar,
  FiLayers
} from 'react-icons/fi';
import StatCard from '../../components/common/StatCard';
import { teacherTodaysClasses, currentUser } from '../../data/mockData';
import CreateClassModal from '../../components/teacher/CreateClassModal';
import { getClassesApi, deleteClassApi, getTeacherAnalyticsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function TeacherDashboard() {
  const { user: authUser } = useAuth();
  const user = authUser || currentUser.teacher;

  const [classes, setClasses] = useState(teacherTodaysClasses);
  const [analytics, setAnalytics] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await getTeacherAnalyticsApi();
      if (res?.success && res.data) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.warn('Using default analytics preview for dashboard:', err);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await getClassesApi();
      if (res?.success && res.data.length > 0) {
        // Map backend fields to frontend UI format
        const formatted = res.data.map(c => ({
          id: c._id,
          subject: `${c.subject} (${c.subjectCode})`,
          subjectCode: c.subjectCode,
          section: c.section,
          time: c.timeSlot,
          room: c.room,
          studentsCount: c.studentsCount || 40,
          marked: c.marked,
          present: c.present || 0,
          absent: c.absent || 0,
          late: c.late || 0
        }));
        setClasses(formatted);
      }
    } catch (err) {
      console.warn('Using default mock classes for dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClassCreated = (newClass) => {
    setClasses(prev => [newClass, ...prev]);
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Are you sure you want to remove this class session?')) return;
    try {
      await deleteClassApi(id);
    } catch (err) {
      console.warn('Backend delete failed, removing locally:', err);
    }
    setClasses(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Main Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Welcome back, <span className="gradient-text">{user.name || 'Professor'}</span>!
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {user.designation || 'Faculty Member'} • {user.department || 'Computer Science'} Department
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary px-4 py-2 text-xs font-semibold shadow-lg shadow-indigo-600/30 self-start sm:self-auto"
        >
          <FiPlusCircle className="w-4 h-4" />
          <span>Create New Class</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Assigned Courses" 
          value={`${classes.length} Active`} 
          subtitle="Fall Semester 2026" 
          icon={FiBookOpen} 
          color="#6366f1" 
        />
        <StatCard 
          title="Today's Sessions" 
          value={`${classes.length} Classes`} 
          subtitle={`${classes.filter(c => c.marked).length} Marked, ${classes.filter(c => !c.marked).length} Pending`} 
          icon={FiClock} 
          color="#06b6d4" 
        />
        <StatCard 
          title="Avg Class Attendance" 
          value={analytics?.overallAttendance?.averageRate ? `${analytics.overallAttendance.averageRate}%` : "82.5%"} 
          subtitle="Weighted across sections" 
          icon={FiBarChart2} 
          color="#10b981" 
        />
        <StatCard 
          title="At-Risk Students" 
          value={`${analytics?.mostAbsentStudents?.length || 2} Flagged`} 
          subtitle="Below 75% threshold" 
          icon={FiUsers} 
          color="#f43f5e" 
        />
      </div>

      {/* Phase 28: Classroom Analytics & Weekday Insights Panel */}
      <div className="glass-panel p-6 border-slate-800 space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-primary text-[10px] uppercase font-bold tracking-wider">
                Phase 28 Insights
              </span>
              <span className="badge badge-absent text-[10px] font-bold">
                ⚠️ Friday Drop Detected (69%)
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
              <FiActivity className="w-5 h-5 text-indigo-400" />
              Classroom Attendance Insights & Weekday Patterns
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Weekday attendance distributions and behavioral pattern diagnostics across your classes
            </p>
          </div>

          <Link
            to="/teacher/analytics"
            className="btn btn-primary py-2 px-4 text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 self-start sm:self-auto"
          >
            <span>Explore Full Analytics Hub</span>
            <FiChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Weekday Strip matching user prompt */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          {[
            { day: 'Monday', rate: 82, badge: 'Average', color: 'indigo' },
            { day: 'Tuesday', rate: 91, badge: 'Peak Day', color: 'emerald' },
            { day: 'Wednesday', rate: 76, badge: 'Below Avg', color: 'amber' },
            { day: 'Thursday', rate: 88, badge: 'Above Avg', color: 'cyan' },
            { day: 'Friday', rate: 69, badge: 'Friday Slump', color: 'rose' }
          ].map((w) => (
            <div
              key={w.day}
              className={`p-3.5 rounded-xl border transition-all ${
                w.day === 'Friday'
                  ? 'bg-rose-950/30 border-rose-500/50 text-rose-300 ring-1 ring-rose-500/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span>{w.day}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  w.day === 'Friday' ? 'bg-rose-500/20 text-rose-300' : (w.rate >= 90 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300')
                }`}>
                  {w.badge}
                </span>
              </div>
              <div className={`text-2xl font-extrabold mt-1 ${
                w.rate >= 90 ? 'text-emerald-400' : (w.rate < 75 ? 'text-rose-400' : 'text-white')
              }`}>
                {w.rate}%
              </div>
              <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full ${
                    w.rate >= 90 ? 'bg-emerald-400' : (w.rate < 75 ? 'bg-rose-500' : 'bg-indigo-500')
                  }`}
                  style={{ width: `${w.rate}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Insight Diagnostic Callout */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
              <FiAlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white">Pattern Alert: Poor Friday Attendance (69%)</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Attendance drops 12.2% on Fridays ahead of the weekend. Recommendation: Move interactive labs or graded problem sets to Fridays.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="text-[11px] text-slate-400">Division A leads at 86.8%</span>
            <Link to="/teacher/analytics" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              <span>View Details</span>
              <FiChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Assigned Classes List */}
        <div className="lg:col-span-8 glass-panel p-6 border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <FiBookOpen className="w-5 h-5 text-indigo-400" />
              Assigned Class Schedule
            </h3>
            <span className="text-xs text-slate-400">{classes.length} Active Sessions</span>
          </div>

          <div className="space-y-3 pt-1">
            {classes.map((cls) => (
              <div 
                key={cls.id} 
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div>
                  <h4 className="text-sm font-semibold text-white">{cls.subject}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{cls.section} • {cls.time} • {cls.room}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{cls.studentsCount} Students Enrolled</p>
                </div>

                <div className="flex items-center gap-2">
                  {cls.marked ? (
                    <span className="badge badge-present text-xs">Attendance Taken ({cls.present} Present)</span>
                  ) : (
                    <Link to="/teacher/take-attendance" className="btn btn-primary py-1.5 px-3 text-xs">
                      <FiCheckSquare className="w-4 h-4" /> Take Attendance
                    </Link>
                  )}

                  <button
                    onClick={() => handleDeleteClass(cls.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete Class Session"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {classes.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No classes scheduled. Click "Create New Class" to add a session.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-4 glass-panel p-6 border-slate-800 space-y-4">
          <h3 className="text-base font-semibold text-white">Teacher Quick Actions</h3>
          <div className="space-y-2.5">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn btn-secondary w-full justify-start text-xs py-2.5"
            >
              <FiPlusCircle className="w-4 h-4 text-indigo-400" />
              <span>Create New Class Session</span>
            </button>
            <Link to="/teacher/timetable" className="btn btn-secondary w-full justify-start text-xs py-2.5">
              <FiBookOpen className="w-4 h-4 text-indigo-400" />
              <span>Manage Timetable Schedule</span>
            </Link>
            <Link to="/teacher/take-attendance" className="btn btn-secondary w-full justify-start text-xs py-2.5">
              <FiCheckSquare className="w-4 h-4 text-emerald-400" />
              <span>Take Attendance Roster</span>
            </Link>
            <Link to="/teacher/history" className="btn btn-secondary w-full justify-start text-xs py-2.5">
              <FiClock className="w-4 h-4 text-cyan-400" />
              <span>View & Edit Attendance Logs</span>
            </Link>
            <Link to="/teacher/students" className="btn btn-secondary w-full justify-start text-xs py-2.5">
              <FiUsers className="w-4 h-4 text-amber-400" />
              <span>View Enrolled Students Roster</span>
            </Link>
            <Link to="/teacher/analytics" className="btn btn-secondary w-full justify-start text-xs py-2.5 bg-indigo-950/40 border-indigo-500/30 hover:bg-indigo-900/40 text-indigo-300 font-semibold">
              <FiActivity className="w-4 h-4 text-indigo-400" />
              <span>Teacher Analytics & Insights</span>
            </Link>
            <Link to="/teacher/reports" className="btn btn-secondary w-full justify-start text-xs py-2.5">
              <FiFileText className="w-4 h-4 text-rose-400" />
              <span>Generate & Export Reports</span>
            </Link>
          </div>
        </div>

      </div>

      {/* Create Class Modal */}
      <CreateClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClassCreated={handleClassCreated}
      />

    </div>
  );
}
