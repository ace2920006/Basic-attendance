import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLock, FiMail, FiArrowRight, FiShield, FiUserCheck } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi2';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('alex.rivera@university.edu');
  const [password, setPassword] = useState('password123');

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === 'student') setEmail('alex.rivera@university.edu');
    else if (newRole === 'teacher') setEmail('sarah.jenkins@university.edu');
    else if (newRole === 'admin') setEmail('admin.marcus@university.edu');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Direct navigate to chosen role dashboard
    navigate(`/${role}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4 py-12 relative overflow-hidden">
        {/* Glow Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-md glass-panel p-8 border-slate-800 shadow-2xl relative z-10">
          
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-indigo-600/20 rounded-2xl border border-indigo-500/30 text-indigo-400 mb-3">
              <HiOutlineAcademicCap className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Welcome Back</h2>
            <p className="text-xs text-slate-400 mt-1">Sign in to access your AttendPro portal</p>
          </div>

          {/* Role Switcher Pills */}
          <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 mb-6">
            <button
              onClick={() => handleRoleChange('student')}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                role === 'student' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HiOutlineAcademicCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>
            <button
              onClick={() => handleRoleChange('teacher')}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                role === 'teacher' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FiUserCheck className="w-3.5 h-3.5" />
              <span>Teacher</span>
            </button>
            <button
              onClick={() => handleRoleChange('admin')}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                role === 'admin' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FiShield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="input-group">
              <label className="input-label">University Email or User ID</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-9 text-xs"
                  placeholder="name@university.edu"
                />
              </div>
            </div>

            <div className="input-group">
              <div className="flex items-center justify-between mb-1">
                <label className="input-label">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-indigo-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-9 text-xs"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0" />
                <span>Remember me on this device</span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary w-full py-3 text-xs font-semibold shadow-lg shadow-indigo-600/30">
              <span>Sign In to {role.charAt(0).toUpperCase() + role.slice(1)} Portal</span>
              <FiArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 font-semibold hover:underline">
              Create an Account
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
