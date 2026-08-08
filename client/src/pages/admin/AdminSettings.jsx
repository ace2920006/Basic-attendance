import React, { useState } from 'react';
import { FiSettings, FiSliders, FiShield, FiSave, FiCheckCircle } from 'react-icons/fi';

export default function AdminSettings() {
  const [threshold, setThreshold] = useState(75);
  const [academicTerm, setAcademicTerm] = useState('Fall Semester 2026');
  const [autoAlerts, setAutoAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      <div className="glass-panel p-6 border-slate-800 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiSettings className="w-5 h-5 text-indigo-400" />
            System Configuration & Policy Controls
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Configure global attendance thresholds and notification rules</p>
        </div>

        {saved && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2">
            <FiCheckCircle className="w-4 h-4" />
            <span>System Rules & Thresholds Saved Successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6 pt-2">
          
          {/* Threshold Slider */}
          <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-white flex items-center gap-2">
                <FiSliders className="w-4 h-4 text-cyan-400" />
                Minimum Attendance Eligibility Threshold
              </label>
              <span className="text-lg font-bold text-indigo-400">{threshold}%</span>
            </div>
            
            <input 
              type="range" 
              min="50" 
              max="90" 
              step="5"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>50% (Lenient)</span>
              <span>75% (Standard Benchmark)</span>
              <span>90% (Strict)</span>
            </div>
          </div>

          {/* Academic Term */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="input-group mb-0">
              <label className="input-label">Current Academic Session</label>
              <input 
                type="text" 
                value={academicTerm}
                onChange={(e) => setAcademicTerm(e.target.value)}
                className="input-field text-xs"
              />
            </div>

            <div className="input-group mb-0">
              <label className="input-label">Automated Low-Attendance Warnings</label>
              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                  <input 
                    type="checkbox"
                    checked={autoAlerts}
                    onChange={(e) => setAutoAlerts(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                  />
                  <span>Dispatch automatic emails when student score &lt; 75%</span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-right">
            <button type="submit" className="btn btn-primary px-6 py-2.5 text-xs font-semibold shadow-lg shadow-indigo-600/30">
              <FiSave className="w-4 h-4" />
              <span>Save System Configuration</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
