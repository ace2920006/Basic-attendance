import React, { useState, useEffect } from 'react';
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiFileText,
  FiShield,
  FiUserCheck,
  FiRefreshCw,
  FiX,
  FiArrowRight,
  FiCheck
} from 'react-icons/fi';
import { useOfflineSync } from '../../context/OfflineSyncContext';

export default function ConflictResolutionModal() {
  const {
    activeConflictBatch,
    isConflictModalOpen,
    closeConflictModal,
    resolveBatchConflicts,
    isSyncing
  } = useOfflineSync();

  const [resolutions, setResolutions] = useState({});
  const [resolutionReasons, setResolutionReasons] = useState({});

  const conflicts = activeConflictBatch?.conflictData?.conflicts || [];

  // Initialize resolutions with smart default: 'local'
  useEffect(() => {
    if (conflicts.length > 0) {
      const initialRes = {};
      const initialReasons = {};
      conflicts.forEach((c) => {
        // If server is approved leave, smart default is 'server'
        if (c.serverStatus === 'On Leave' || c.serverStatus === 'Excused') {
          initialRes[c.studentId] = c.serverStatus;
          initialReasons[c.studentId] = 'Official sanctioned leave takes institutional precedence';
        } else {
          initialRes[c.studentId] = c.localStatus;
          initialReasons[c.studentId] = 'Teacher verified physical presence in class';
        }
      });
      setResolutions(initialRes);
      setResolutionReasons(initialReasons);
    }
  }, [activeConflictBatch, conflicts]);

  if (!isConflictModalOpen || !activeConflictBatch) return null;

  const handleSetStudentStatus = (studentId, status, reason = '') => {
    setResolutions((prev) => ({ ...prev, [studentId]: status }));
    if (reason) {
      setResolutionReasons((prev) => ({ ...prev, [studentId]: reason }));
    }
  };

  const handleApplyAll = (type) => {
    const updated = {};
    const updatedReasons = {};

    conflicts.forEach((c) => {
      if (type === 'local') {
        updated[c.studentId] = c.localStatus;
        updatedReasons[c.studentId] = 'Teacher physical classroom override applied across all';
      } else if (type === 'server') {
        updated[c.studentId] = c.serverStatus;
        updatedReasons[c.studentId] = 'Preserved server record across all';
      } else if (type === 'smart') {
        if (c.serverStatus === 'On Leave' || c.serverStatus === 'Excused') {
          updated[c.studentId] = c.serverStatus;
          updatedReasons[c.studentId] = 'Institutional leave takes precedence';
        } else if (c.serverSource?.includes('QR') && c.localStatus === 'Absent') {
          updated[c.studentId] = 'Present';
          updatedReasons[c.studentId] = 'Verified QR scan accepted';
        } else {
          updated[c.studentId] = c.localStatus;
          updatedReasons[c.studentId] = 'Classroom teacher evaluation applied';
        }
      }
    });

    setResolutions(updated);
    setResolutionReasons(updatedReasons);
  };

  const handleCommitResolutions = async () => {
    const resolvedPayload = conflicts.map((c) => ({
      studentId: c.studentId,
      chosenStatus: resolutions[c.studentId] || c.localStatus,
      chosenReason: resolutionReasons[c.studentId] || 'Manual resolution by teacher',
      originalLocalStatus: c.localStatus,
      originalServerStatus: c.serverStatus
    }));

    await resolveBatchConflicts(
      activeConflictBatch.id,
      'custom_resolved',
      resolvedPayload
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel max-w-4xl w-full max-h-[90vh] flex flex-col border border-amber-500/30 shadow-2xl shadow-amber-500/10 rounded-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <FiAlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Attendance Sync Conflict Resolver</h3>
                <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold rounded-full">
                  {conflicts.length} Discrepanc{conflicts.length === 1 ? 'y' : 'ies'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Class: <strong className="text-slate-200">{activeConflictBatch.subject}</strong> ({activeConflictBatch.section || 'All'}) • Recorded offline on {new Date(activeConflictBatch.clientTimestamp || activeConflictBatch.date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <button
            onClick={closeConflictModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Global Quick Action Toolbar */}
        <div className="px-5 py-3 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-400 font-medium">Batch Quick Resolvers:</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleApplyAll('local')}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold flex items-center gap-1.5 transition"
            >
              <FiUserCheck className="w-3.5 h-3.5" />
              <span>Teacher Authority (All Local)</span>
            </button>
            <button
              onClick={() => handleApplyAll('server')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold flex items-center gap-1.5 transition"
            >
              <FiShield className="w-3.5 h-3.5" />
              <span>Preserve Verified Server (All)</span>
            </button>
            <button
              onClick={() => handleApplyAll('smart')}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1.5 transition"
            >
              <FiCheckCircle className="w-3.5 h-3.5" />
              <span>Smart Precedence (Leave &gt; QR &gt; Local)</span>
            </button>
          </div>
        </div>

        {/* Conflict Items List */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 divide-y divide-slate-800/80">
          {conflicts.map((conflict, idx) => {
            const chosen = resolutions[conflict.studentId] || conflict.localStatus;

            return (
              <div key={conflict.studentId} className={`pt-4 ${idx === 0 ? 'pt-0' : ''} space-y-3`}>
                {/* Student Info & Conflict Reason */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400">
                      {conflict.studentName?.substring(0, 2).toUpperCase() || 'ST'}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">{conflict.studentName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {conflict.rollNo} • {conflict.department || 'Enrolled'}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-amber-400/90 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 flex items-center gap-1.5">
                    <FiAlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{conflict.reason}</span>
                  </div>
                </div>

                {/* Side-by-Side Comparison & Decision Card */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                  
                  {/* Left: Local Teacher Record */}
                  <div className="md:col-span-5 p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                        📱 Teacher Offline Log
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        conflict.localStatus === 'Present' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        conflict.localStatus === 'Absent' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {conflict.localStatus}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Recorded: <span className="font-mono text-slate-400">{new Date(conflict.localTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {conflict.localNotes && (
                      <div className="text-[11px] text-slate-400 italic">
                        "{conflict.localNotes}"
                      </div>
                    )}
                  </div>

                  {/* Center arrow */}
                  <div className="md:col-span-2 flex justify-center text-slate-600">
                    <FiArrowRight className="w-5 h-5 hidden md:block" />
                    <span className="text-xs font-semibold text-slate-500 md:hidden">VS</span>
                  </div>

                  {/* Right: Server Record */}
                  <div className="md:col-span-5 p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                        ☁️ Server / Cloud Record
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        conflict.serverStatus === 'Present' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        conflict.serverStatus === 'On Leave' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                        conflict.serverStatus === 'Absent' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {conflict.serverStatus}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Source: <span className="font-semibold text-slate-300">{conflict.serverSource}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      By: {conflict.serverMarkedBy || 'Institutional System'}
                    </div>
                  </div>

                </div>

                {/* Individual Resolution Selector */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-300">Authoritative Decision:</span>
                    <div className="flex items-center gap-1.5">
                      {['Present', 'Absent', 'Late', 'Excused', 'On Leave'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleSetStudentStatus(conflict.studentId, st)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                            chosen === st
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 max-w-sm">
                    <input
                      type="text"
                      placeholder="Resolution justification note (optional)..."
                      value={resolutionReasons[conflict.studentId] || ''}
                      onChange={(e) =>
                        setResolutionReasons((prev) => ({
                          ...prev,
                          [conflict.studentId]: e.target.value
                        }))
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <button
            type="button"
            onClick={closeConflictModal}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Review Later
          </button>

          <button
            type="button"
            onClick={handleCommitResolutions}
            disabled={isSyncing}
            className="btn btn-primary px-6 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            {isSyncing ? (
              <>
                <FiRefreshCw className="w-4 h-4 animate-spin" />
                <span>Applying Resolutions...</span>
              </>
            ) : (
              <>
                <FiCheck className="w-4 h-4" />
                <span>Commit & Complete Sync ({conflicts.length} Records)</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
