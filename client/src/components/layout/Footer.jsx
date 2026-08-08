import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineAcademicCap } from 'react-icons/hi2';
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-indigo-600 to-cyan-500 p-2 rounded-xl shadow-lg">
                <HiOutlineAcademicCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Attend<span className="gradient-text">Pro</span></span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Empowering educational institutions with real-time automated attendance tracking, detailed analytics, and seamless student-teacher workflows.
            </p>
            <div className="flex gap-4 pt-1">
              <a href="#" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                <FiGithub className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                <FiTwitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                <FiLinkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                <FiMail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link></li>
              <li><a href="#about" className="hover:text-indigo-400 transition-colors">About System</a></li>
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">Platform Features</a></li>
              <li><a href="#contact" className="hover:text-indigo-400 transition-colors">Contact Support</a></li>
              <li><Link to="/login" className="hover:text-indigo-400 transition-colors">Account Login</Link></li>
            </ul>
          </div>

          {/* Col 3: Portals */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">User Portals</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/student" className="hover:text-cyan-400 transition-colors">Student Dashboard</Link></li>
              <li><Link to="/teacher" className="hover:text-cyan-400 transition-colors">Teacher Management</Link></li>
              <li><Link to="/admin" className="hover:text-cyan-400 transition-colors">Administrator Console</Link></li>
              <li><Link to="/register" className="hover:text-cyan-400 transition-colors">New Registration</Link></li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Stay Informed</h4>
            <p className="text-xs text-slate-400 mb-3">Subscribe to updates regarding system upgrades and timetable feature releases.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter email address..." 
                className="input-field py-2 text-xs bg-slate-900 border-slate-800"
              />
              <button className="btn btn-primary py-2 text-xs px-3">Join</button>
            </div>
          </div>

        </div>

        <div className="border-t border-slate-900 pt-6 text-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} AttendPro Attendance Management System. All rights reserved. Built for Phase 2 UI Demonstration.</p>
        </div>
      </div>
    </footer>
  );
}
