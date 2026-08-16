import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiCalendar, 
  FiBarChart2, 
  FiBell, 
  FiCheckSquare, 
  FiClock, 
  FiUsers, 
  FiFileText, 
  FiGrid, 
  FiBookOpen,
  FiBook,
  FiUserCheck,
  FiUser, 
  FiSettings, 
  FiLogOut,
  FiChevronLeft
} from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ role, user: userProp }) {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();

  const activeUser = authUser || userProp;
  const activeRole = role || activeUser?.role || 'student';

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    switch (activeRole) {
      case 'student':
        return [
          { to: '/student', label: 'Dashboard Overview', icon: FiHome, end: true },
          { to: '/student/classes', label: "Today's & Timetable", icon: FiCalendar },
          { to: '/student/calendar', label: 'Attendance Calendar', icon: FiGrid },
          { to: '/student/history', label: 'Attendance History', icon: FiClock },
          { to: '/student/graph', label: 'Attendance Graph', icon: FiBarChart2 },
          { to: '/student/report', label: 'Download Report', icon: FiFileText },
          { to: '/student/leave', label: 'Apply Leave', icon: FiCheckSquare },
          { to: '/student/notifications', label: 'Notifications', icon: FiBell },
          { to: '/student/profile', label: 'Student Profile', icon: FiUser },
        ];
      case 'teacher':
        return [
          { to: '/teacher', label: 'Dashboard', icon: FiHome, end: true },
          { to: '/teacher/classes', label: "Today's Classes", icon: FiCalendar },
          { to: '/teacher/timetable', label: 'Timetable Manager', icon: FiGrid },
          { to: '/teacher/take-attendance', label: 'Take Attendance', icon: FiCheckSquare },
          { to: '/teacher/history', label: 'Attendance History', icon: FiClock },
          { to: '/teacher/students', label: 'Students List', icon: FiUsers },
          { to: '/teacher/reports', label: 'Reports & Export', icon: FiFileText },
        ];
      case 'admin':
        return [
          { to: '/admin', label: 'Analytics Console', icon: FiBarChart2, end: true },
          { to: '/admin/departments', label: 'Departments', icon: FiGrid },
          { to: '/admin/courses', label: 'Courses Management', icon: FiBookOpen },
          { to: '/admin/subjects', label: 'Subjects & Assignments', icon: FiBook },
          { to: '/admin/teachers', label: 'Teachers Management', icon: FiUserCheck },
          { to: '/admin/students', label: 'Students Directory', icon: FiUsers },
          { to: '/admin/reports', label: 'Reports & Export', icon: FiFileText },
          { to: '/admin/settings', label: 'System Settings', icon: FiSettings },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside className="w-64 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800 flex flex-col h-screen sticky top-0 z-40">
      
      {/* Top Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-indigo-600 to-cyan-500 p-2 rounded-xl shadow-lg">
            <HiOutlineAcademicCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">Attend<span className="gradient-text">Pro</span></span>
            <span className="block text-[9px] text-slate-400 uppercase font-semibold tracking-wider">
              {activeRole} Portal
            </span>
          </div>
        </Link>
        <Link to="/" title="Back to Home" className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
          <FiChevronLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* User Info Quick Badge */}
      <div className="p-4 border-b border-slate-800/60 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <img 
            src={activeUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'} 
            alt={activeUser?.name || 'User'} 
            className="w-10 h-10 rounded-xl object-cover border border-indigo-500/30"
          />
          <div className="overflow-hidden">
            <div className="text-sm font-semibold text-white truncate">{activeUser?.name || 'User'}</div>
            <div className="text-[11px] text-slate-400 truncate">{activeUser?.email || ''}</div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Navigation
        </div>
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Portal Switcher & Logout */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">
          Role Switcher
        </div>
        <div className="grid grid-cols-3 gap-1 px-1">
          <Link to="/student" className={`px-2 py-1 rounded text-center text-[10px] font-medium transition-colors ${activeRole === 'student' ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 text-slate-400 hover:text-white'}`}>Student</Link>
          <Link to="/teacher" className={`px-2 py-1 rounded text-center text-[10px] font-medium transition-colors ${activeRole === 'teacher' ? 'bg-cyan-600 text-white' : 'bg-slate-800/80 text-slate-400 hover:text-white'}`}>Teacher</Link>
          <Link to="/admin" className={`px-2 py-1 rounded text-center text-[10px] font-medium transition-colors ${activeRole === 'admin' ? 'bg-emerald-600 text-white' : 'bg-slate-800/80 text-slate-400 hover:text-white'}`}>Admin</Link>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors w-full font-medium"
        >
          <FiLogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

    </aside>
  );
}
