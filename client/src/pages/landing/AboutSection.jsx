import React from 'react';
import { FiCheckCircle, FiShield, FiTrendingUp, FiLayers } from 'react-icons/fi';

export default function AboutSection() {
  const points = [
    { title: 'Automated Real-Time Tracking', desc: 'No manual paper sheets. Instant attendance marking with live synchronized logs for students and faculty.' },
    { title: 'Smart Low-Attendance Alerts', desc: 'Automatic warning notifications when a student drops near or below the mandatory 75% eligibility threshold.' },
    { title: 'Department-Level Governance', desc: 'Detailed hierarchical oversight for Heads of Departments and Deans to monitor term-wide trends.' },
    { title: 'Role-Based Access & Security', desc: 'Encrypted multi-tier access tailored specifically for Students, Faculty Instructors, and System Admins.' }
  ];

  return (
    <section id="about" className="py-20 bg-slate-950/60 border-y border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">About AttendPro</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
            Designed to Transform Academic Attendance Management
          </h3>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Eliminate administrative overhead, prevent attendance proxy issues, and give every stakeholder full clarity on attendance metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* Left Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {points.map((pt, idx) => (
              <div key={idx} className="glass-panel p-5 border-slate-800 hover:border-indigo-500/40 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4">
                  <FiCheckCircle className="w-5 h-5" />
                </div>
                <h4 className="text-base font-semibold text-white mb-2">{pt.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{pt.desc}</p>
              </div>
            ))}
          </div>

          {/* Right Feature Highlight Box */}
          <div className="glass-panel p-8 border-indigo-500/20 bg-gradient-to-br from-slate-900/90 to-indigo-950/30 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold mb-4">
              <FiTrendingUp className="w-3.5 h-3.5" /> High Impact Solution
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Zero Delays, Full Transparency for Students and Teachers
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
              With AttendPro, students never have to guess whether they meet exam eligibility criteria. Faculty can record attendance in under 30 seconds per session, freeing up precious lecture time for teaching.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Seamless integration with university timetable schedules</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Customizable threshold rules (60%, 75%, 85%)</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Leave request workflows with faculty approval tracking</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
