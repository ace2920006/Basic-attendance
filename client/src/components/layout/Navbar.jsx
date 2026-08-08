import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiCheckSquare, FiMenu, FiX, FiUserCheck, FiShield } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi2';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-cyan-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/25">
              <HiOutlineAcademicCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tight">Attend<span className="gradient-text">Pro</span></span>
              <span className="block text-[10px] text-indigo-300 tracking-wider font-semibold uppercase">Smart Attendance System</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="/" className={`transition-colors ${isActive('/') ? 'text-indigo-400 font-semibold' : 'text-slate-300 hover:text-white'}`}>
              Home
            </Link>
            <a href="#about" className="text-slate-300 hover:text-white transition-colors">
              About
            </a>
            <a href="#features" className="text-slate-300 hover:text-white transition-colors">
              Features
            </a>
            <a href="#contact" className="text-slate-300 hover:text-white transition-colors">
              Contact
            </a>
          </nav>

          {/* Action CTAs & Portal Quick Switchers */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs">
              <Link to="/student" className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all flex items-center gap-1.5">
                <HiOutlineAcademicCap className="w-3.5 h-3.5 text-indigo-400" /> Student
              </Link>
              <Link to="/teacher" className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all flex items-center gap-1.5">
                <FiUserCheck className="w-3.5 h-3.5 text-cyan-400" /> Teacher
              </Link>
              <Link to="/admin" className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all flex items-center gap-1.5">
                <FiShield className="w-3.5 h-3.5 text-emerald-400" /> Admin
              </Link>
            </div>

            <Link to="/login" className="btn btn-secondary py-2 text-xs">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary py-2 text-xs">
              Get Started
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 space-y-3">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 font-medium">Home</Link>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800">About</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800">Features</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800">Contact</a>
            
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-slate-400 px-3 uppercase tracking-wider">Demo Dashboards</div>
              <div className="grid grid-cols-3 gap-2 px-3">
                <Link to="/student" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 bg-slate-800 rounded text-center text-xs text-indigo-300 font-medium">Student</Link>
                <Link to="/teacher" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 bg-slate-800 rounded text-center text-xs text-cyan-300 font-medium">Teacher</Link>
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 bg-slate-800 rounded text-center text-xs text-emerald-300 font-medium">Admin</Link>
              </div>
              <div className="flex gap-2 px-3 pt-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-1/2 btn btn-secondary text-center text-xs">Sign In</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-1/2 btn btn-primary text-center text-xs">Register</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
