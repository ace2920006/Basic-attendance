import React, { useState } from 'react';
import { 
  FiCheckSquare, 
  FiBarChart2, 
  FiUsers, 
  FiBell, 
  FiFileText, 
  FiSliders,
  FiArrowRight
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function FeaturesSection() {
  const [activeTab, setActiveTab] = useState('student');

  const features = [
    {
      id: 'student',
      title: 'Student Experience',
      badge: 'For Students',
      icon: FiUsers,
      items: [
        { title: 'Personalized Attendance Graph', desc: 'Visual subject-by-subject percentage charts with progress bars.' },
        { title: "Today's Class Timetable", desc: 'Real-time schedule with room numbers and class statuses.' },
        { title: 'Instant Threshold Warnings', desc: 'Proactive alerts before falling below mandatory attendance minimums.' },
        { title: 'Leave Application Portal', desc: 'Submit medical and official leave requests directly to course instructors.' }
      ]
    },
    {
      id: 'teacher',
      title: 'Teacher Tools',
      badge: 'For Faculty',
      icon: FiCheckSquare,
      items: [
        { title: 'One-Click Attendance Sheet', desc: 'Fast roster marking with Present, Absent, and Late status toggles.' },
        { title: 'Bulk Attendance Actions', desc: 'Mark all students present with one tap to save class time.' },
        { title: 'Class History Logs', desc: 'Search and filter past class sessions by date, code, and room.' },
        { title: 'At-Risk Student Reports', desc: 'Identify students with low attendance and send automated notices.' }
      ]
    },
    {
      id: 'admin',
      title: 'Admin Oversight',
      badge: 'For Administrators',
      icon: FiBarChart2,
      items: [
        { title: 'Institute Analytics Console', desc: 'Macro attendance trends, department comparisons, and active user stats.' },
        { title: 'Department & Faculty Setup', desc: 'Manage departments, assign subjects, and add faculty profiles.' },
        { title: 'Master Student Directory', desc: 'Searchable database of enrolled students with semester filter.' },
        { title: 'System Rule Controls', desc: 'Set global threshold rules, academic terms, and security policies.' }
      ]
    }
  ];

  const currentFeature = features.find(f => f.id === activeTab);

  return (
    <section id="features" className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">Platform Features</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
            Tailored Experiences for Every Stakeholder
          </h3>
          <p className="text-slate-400 text-sm sm:text-base">
            Switch between roles to explore how AttendPro empowers students, teachers, and administrators.
          </p>
        </div>

        {/* Role Filter Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <button
                  key={feat.id}
                  onClick={() => setActiveTab(feat.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    activeTab === feat.id
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-600/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{feat.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentFeature.items.map((item, index) => (
            <div 
              key={index}
              className="glass-panel p-6 border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-sm font-bold">{index + 1}</span>
              </div>
              <h4 className="text-base font-semibold text-white mb-2">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{item.desc}</p>
              <div className="pt-2 text-xs font-semibold text-indigo-400 group-hover:text-cyan-300 flex items-center gap-1">
                <span>Included in Demo</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Call to Portal Link */}
        <div className="mt-12 text-center">
          <Link 
            to={`/${activeTab}`} 
            className="inline-flex items-center gap-2 btn btn-primary px-6 py-2.5 text-xs font-semibold"
          >
            <span>Test {currentFeature.badge} Portal Live</span>
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
