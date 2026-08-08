import React from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiCheckSquare, FiFileText, FiBarChart2, FiUsers, FiClock } from 'react-icons/fi';
import StatCard from '../../components/common/StatCard';
import { teacherTodaysClasses, currentUser } from '../../data/mockData';

export default function TeacherDashboard() {
  const user = currentUser.teacher;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Welcome back, <span className="gradient-text">{user.name}</span>!
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {user.designation} • {user.department} Department
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Assigned Courses" value="3 Active" subtitle="Fall Semester 2026" icon={FiBookOpen} color="#6366f1" />
        <StatCard title="Today's Sessions" value="3 Classes" subtitle="1 Marked, 2 Pending" icon={FiClock} color="#06b6d4" />
        <StatCard title="Avg Class Attendance" value="89.5%" subtitle="Across all sections" icon={FiBarChart2} color="#10b981" />
        <StatCard title="At-Risk Students" value="2 Flagged" subtitle="Below 75% threshold" icon={FiUsers} color="#f43f5e" />
      </div>

      {/* Assigned Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-8 glass-panel p-6 border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <FiBookOpen className="w-5 h-5 text-indigo-400" />
              Today's Assigned Classes
            </h3>
            <Link to="/teacher/classes" className="text-xs text-indigo-400 hover:underline">
              View Schedule
            </Link>
          </div>

          <div className="space-y-3 pt-1">
            {teacherTodaysClasses.map((cls) => (
              <div 
                key={cls.id} 
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-sm font-semibold text-white">{cls.subject}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{cls.section} • {cls.time} • {cls.room}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{cls.studentsCount} Students Enrolled</p>
                </div>

                <div className="flex items-center gap-3">
                  {cls.marked ? (
                    <span className="badge badge-present text-xs">Attendance Taken ({cls.present} Present)</span>
                  ) : (
                    <Link to="/teacher/take-attendance" className="btn btn-primary py-1.5 px-3 text-xs">
                      <FiCheckSquare className="w-4 h-4" /> Take Attendance
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-4 glass-panel p-6 border-slate-800 space-y-4">
          <h3 className="text-base font-semibold text-white">Quick Actions</h3>
          <div className="space-y-2">
            <Link to="/teacher/take-attendance" className="btn btn-secondary w-full justify-start text-xs py-2.5">
              <FiCheckSquare className="w-4 h-4 text-indigo-400" />
              <span>Mark Today's Attendance</span>
            </Link>
            <Link to="/teacher/history" className="btn btn-secondary w-full justify-start text-xs py-2.5">
              <FiClock className="w-4 h-4 text-cyan-400" />
              <span>View Past Attendance Logs</span>
            </Link>
            <Link to="/teacher/students" className="btn btn-secondary w-full justify-start text-xs py-2.5">
              <FiUsers className="w-4 h-4 text-emerald-400" />
              <span>Student Roster & Profiles</span>
            </Link>
            <Link to="/teacher/reports" className="btn btn-secondary w-full justify-start text-xs py-2.5">
              <FiFileText className="w-4 h-4 text-amber-400" />
              <span>Export CSV Reports</span>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
