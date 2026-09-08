import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FiAlertTriangle,
  FiTrendingUp,
  FiCheckCircle,
  FiShield,
  FiPhone,
  FiMail,
  FiCalendar,
  FiClock,
  FiInfo,
  FiHelpCircle
} from 'react-icons/fi';
import { getParentWarningsApi } from '../../services/api';

export default function ParentWarnings() {
  const context = useOutletContext();
  const activeWard = context?.activeWard;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getParentWarningsApi(activeWard?._id)
      .then((res) => {
        if (isMounted && res?.success && res.data) {
          setData(res.data);
        }
      })
      .catch(() => {
        // Fallback demo data
        if (isMounted) {
          setData({
            ward: {
              _id: activeWard?._id || 'mock_alex',
              name: activeWard?.name || 'Alex Rivera',
              rollNo: activeWard?.rollNo || 'CS-2024-089',
              department: 'Computer Science & Engineering',
              semester: 'Semester 4'
            },
            attendance: {
              percentage: 68.5,
              totalClasses: 120,
              totalAttended: 82,
              minRequiredPercentage: 75,
              isShortage: true,
              consecutiveNeeded: 32
            },
            activeTier: {
              tier: 'SERIOUS_WARNING',
              label: 'Serious Attendance Warning',
              description: 'Attendance below 70%. Mandatory academic counseling session scheduled.',
              severity: 'warning'
            },
            advisor: {
              name: 'Dr. Sarah Jenkins',
              role: 'Class Advisor & Associate Professor',
              department: 'Computer Science & Engineering',
              email: 'sarah.jenkins@university.edu',
              phone: '+1 (555) 234-8900',
              office: 'Academic Block A, Room 304',
              officeHours: 'Mon - Fri: 03:00 PM - 05:00 PM'
            },
            thresholdTiers: [
              { tier: 'WARNING', cutoff: 75, label: 'Warning (<75%)' },
              { tier: 'SERIOUS_WARNING', cutoff: 70, label: 'Serious Warning (<70%)' },
              { tier: 'ADMIN_ALERT', cutoff: 65, label: 'Admin Alert (<65%)' },
              { tier: 'PARENT_ALERT', cutoff: 60, label: 'Parent Alert (<60%)' }
            ]
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

  const ward = data?.ward || activeWard;
  const attendance = data?.attendance || { percentage: 88.5, minRequiredPercentage: 75, consecutiveNeeded: 0 };
  const activeTier = data?.activeTier;
  const advisor = data?.advisor || {
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@university.edu',
    phone: '+1 (555) 234-8900',
    office: 'Academic Block A, Room 304'
  };

  const isSafe = attendance.percentage >= (attendance.minRequiredPercentage || 75);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 border-slate-800 bg-gradient-to-r from-slate-900/90 via-amber-950/30 to-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Defaulter Escalation & Attendance Warnings</h2>
            <span className="badge bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              {ward?.name || 'Alex Rivera'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Official institutional tracking of academic attendance shortages, examination debarment risks, and recovery guidelines.
          </p>
        </div>

        {/* Current Risk Level Badge */}
        <div className="self-start md:self-center">
          <span
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
              isSafe
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : activeTier?.tier === 'PARENT_ALERT'
                ? 'bg-rose-600/30 text-rose-300 border border-rose-500 animate-pulse'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            {isSafe ? <FiCheckCircle className="w-4 h-4" /> : <FiAlertTriangle className="w-4 h-4" />}
            <span>{isSafe ? 'Good Standing: Safe Zone' : activeTier?.label || 'Attendance Shortage'}</span>
          </span>
        </div>
      </div>

      {/* 4-Tier Escalation Meter */}
      <div className="glass-panel p-6 border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FiShield className="w-4 h-4 text-amber-400" />
            <span>4-Tier University Escalation Framework</span>
          </h3>
          <span className="text-xs text-slate-400">Current Attendance: <strong className="text-white">{attendance.percentage}%</strong></span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          
          {/* Tier 1: Warning */}
          <div
            className={`p-4 rounded-xl border transition ${
              activeTier?.tier === 'WARNING'
                ? 'bg-yellow-500/15 border-yellow-500/60 shadow-lg shadow-yellow-500/10'
                : 'bg-slate-900/40 border-slate-800 opacity-75'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                Tier 1 &bull; &lt;75%
              </span>
              {activeTier?.tier === 'WARNING' && (
                <span className="h-2 w-2 rounded-full bg-yellow-400 animate-ping" />
              )}
            </div>
            <h4 className="text-sm font-bold text-white">Initial Shortage</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Automated advisory warning sent to student portal. Subject instructors notified.
            </p>
          </div>

          {/* Tier 2: Serious Warning */}
          <div
            className={`p-4 rounded-xl border transition ${
              activeTier?.tier === 'SERIOUS_WARNING'
                ? 'bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10'
                : 'bg-slate-900/40 border-slate-800 opacity-75'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Tier 2 &bull; &lt;70%
              </span>
              {activeTier?.tier === 'SERIOUS_WARNING' && (
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </div>
            <h4 className="text-sm font-bold text-white">Serious Warning</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Mandatory counseling with class advisor. Warning issued to official student record.
            </p>
          </div>

          {/* Tier 3: Admin Alert */}
          <div
            className={`p-4 rounded-xl border transition ${
              activeTier?.tier === 'ADMIN_ALERT'
                ? 'bg-rose-500/15 border-rose-500/60 shadow-lg shadow-rose-500/10'
                : 'bg-slate-900/40 border-slate-800 opacity-75'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                Tier 3 &bull; &lt;65%
              </span>
              {activeTier?.tier === 'ADMIN_ALERT' && (
                <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" />
              )}
            </div>
            <h4 className="text-sm font-bold text-white">Admin / Dean Escalation</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Flagged on Dean of Academics dashboard. Formal debarment warning issued.
            </p>
          </div>

          {/* Tier 4: Parent Alert */}
          <div
            className={`p-4 rounded-xl border transition ${
              activeTier?.tier === 'PARENT_ALERT'
                ? 'bg-red-950/60 border-red-500 shadow-xl shadow-red-500/20'
                : 'bg-slate-900/40 border-slate-800 opacity-75'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                Tier 4 &bull; &lt;60%
              </span>
              {activeTier?.tier === 'PARENT_ALERT' && (
                <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />
              )}
            </div>
            <h4 className="text-sm font-bold text-white">Critical Parent Alert</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Direct postal/email dispatch to registered guardians. Formal debarment hearing.
            </p>
          </div>

        </div>
      </div>

      {/* Recovery Blueprint & Mathematical Projection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recovery Blueprint (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5 text-cyan-400" />
              <span>Attendance Recovery Target</span>
            </h3>
            <span className="text-xs text-slate-400">Statutory Benchmark: 75%</span>
          </div>

          {isSafe ? (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold">
                <FiCheckCircle className="w-5 h-5 text-emerald-400" />
                <span>No Immediate Recovery Action Required</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your ward is currently compliant with the 75% institutional attendance policy. Ensure they maintain regularity to avoid dropping into shortage during upcoming test weeks.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-rose-300">
                  <FiAlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>Required Consecutive Attendance: {attendance.consecutiveNeeded || 5} Lectures</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Based on the university's statutory formula <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">x = ceil((0.75*T - P) / 0.25)</code>, your ward must attend the next <strong>{attendance.consecutiveNeeded || 5} consecutive scheduled classes</strong> without a single absence to reach the 75% threshold.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px] uppercase">Current Level</span>
                  <span className="text-xl font-bold text-white mt-0.5 block">{attendance.percentage}%</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px] uppercase">Target Level</span>
                  <span className="text-xl font-bold text-emerald-400 mt-0.5 block">75.0%</span>
                </div>
              </div>
            </div>
          )}

          {/* Institutional Regulations Note */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
            <span className="font-semibold text-white block flex items-center gap-1.5">
              <FiInfo className="w-3.5 h-3.5 text-indigo-400" />
              <span>University Examination Regulations (Ordinance 7)</span>
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Any student with cumulative semester attendance falling below 75% shall be debarred from taking end-semester theory and practical examinations. Condonation up to 10% may be granted strictly on verified medical grounds approved by the Academic Council.
            </p>
          </div>
        </div>

        {/* Academic Counselor & Support Cell (5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-6 border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FiPhone className="w-5 h-5 text-rose-400" />
            <span>Academic Counseling Cell</span>
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            If your ward has experienced health challenges, family emergencies, or requires an individualized attendance rehabilitation schedule, contact the department advisors immediately:
          </p>

          <div className="space-y-3 pt-1">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-white block text-sm">{advisor.name}</span>
              <span className="text-[11px] text-rose-300 block">{advisor.role}</span>
              
              <div className="pt-2 space-y-1.5 text-slate-300">
                <div className="flex items-center gap-2">
                  <FiMail className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`mailto:${advisor.email}`} className="text-indigo-400 hover:underline">
                    {advisor.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <FiPhone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{advisor.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] text-slate-400">{advisor.officeHours}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-400">
              <strong className="text-white block mb-1">Dean of Student Affairs:</strong>
              <span>Dean's Office, Main Administration Wing &bull; Hotline: +1 (555) 234-9900</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
