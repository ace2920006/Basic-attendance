import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiShield, FiTrendingUp, FiZap } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi2';

export default function HeroSection() {
  return (
    <section className="relative pt-20 pb-24 overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <FiZap className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Next-Gen Attendance Automation</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              Real-Time Campus <br />
              <span className="gradient-text">Attendance & Insights</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Streamline attendance recording for teachers, give students instant clarity on eligibility thresholds, and empower administrators with actionable analytics.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link to="/register" className="btn btn-primary px-7 py-3 text-base shadow-xl shadow-indigo-600/30 group">
                <span>Start Free Demo</span>
                <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#features" className="btn btn-secondary px-6 py-3 text-base">
                Explore Features
              </a>
            </div>

            {/* Quick Metrics Pills */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0">
              <div>
                <h4 className="text-2xl font-bold text-white">99.8%</h4>
                <p className="text-xs text-slate-400 mt-0.5">Tracking Accuracy</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-cyan-400">50,000+</h4>
                <p className="text-xs text-slate-400 mt-0.5">Active Students</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-emerald-400">100+</h4>
                <p className="text-xs text-slate-400 mt-0.5">Institutions</p>
              </div>
            </div>

          </div>

          {/* Right Visual Glassmorphic Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="glass-panel p-6 border-slate-700/80 shadow-2xl relative z-10 transform lg:rotate-1 hover:rotate-0 transition-transform duration-500">
              
              {/* Top Header Card */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-600/30 rounded-xl border border-indigo-500/40">
                    <HiOutlineAcademicCap className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">CS401 - Database Systems</h3>
                    <p className="text-xs text-slate-400">Instructor: Dr. John Smith</p>
                  </div>
                </div>
                <span className="badge badge-present">Active Session</span>
              </div>

              {/* Progress Ring Simulation */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">Session Attendance</span>
                  <span className="text-sm font-bold text-emerald-400">93.3%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full w-[93%]" />
                </div>
              </div>

              {/* Attendance Roster Preview */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 bg-slate-950/40 rounded-lg border border-slate-800/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold flex items-center justify-center text-xs">AR</div>
                    <span className="text-xs font-medium text-slate-200">Alex Rivera (CS-089)</span>
                  </div>
                  <span className="badge badge-present text-[10px]">Present</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-950/40 rounded-lg border border-slate-800/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold flex items-center justify-center text-xs">BT</div>
                    <span className="text-xs font-medium text-slate-200">Bella Thorne (CS-002)</span>
                  </div>
                  <span className="badge badge-present text-[10px]">Present</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-950/40 rounded-lg border border-slate-800/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 font-semibold flex items-center justify-center text-xs">CG</div>
                    <span className="text-xs font-medium text-slate-200">Carlos Gomez (CS-003)</span>
                  </div>
                  <span className="badge badge-late text-[10px]">Late (10:15)</span>
                </div>
              </div>

              {/* Floating Quick Action Card */}
              <div className="absolute -bottom-6 -left-6 bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-xl flex items-center gap-3 backdrop-blur-md">
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                  <FiCheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-white">Automated Reports</span>
                  <span className="block text-[10px] text-slate-400">Instant PDF & CSV Export</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
