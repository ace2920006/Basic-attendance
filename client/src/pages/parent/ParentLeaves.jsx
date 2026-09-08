import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FiFileText,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiPaperclip,
  FiShield,
  FiInfo,
  FiFilter
} from 'react-icons/fi';
import { getParentLeavesApi } from '../../services/api';
import { studentLeaves } from '../../data/mockData';

export default function ParentLeaves() {
  const context = useOutletContext();
  const activeWard = context?.activeWard;

  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getParentLeavesApi(activeWard?._id)
      .then((res) => {
        if (isMounted && res?.success && res.data) {
          setLeaves(res.data);
        } else {
          setLeaves(studentLeaves);
        }
      })
      .catch(() => {
        setLeaves(studentLeaves);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeWard?._id]);

  const filteredLeaves =
    filterStatus === 'all'
      ? leaves
      : leaves.filter((l) => l.status?.toLowerCase() === filterStatus.toLowerCase());

  const approvedCount = leaves.filter((l) => l.status === 'Approved').length;
  const pendingCount = leaves.filter((l) => l.status === 'Pending').length;
  const rejectedCount = leaves.filter((l) => l.status === 'Rejected').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 border-slate-800 bg-gradient-to-r from-slate-900/90 via-emerald-950/20 to-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Ward Leave Applications & Status</h2>
            <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              {activeWard?.name || 'Alex Rivera'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Official records of medical, emergency, and sanctioned duty leaves submitted by your ward.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs self-start md:self-center">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterStatus === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({leaves.length})
          </button>
          <button
            onClick={() => setFilterStatus('Approved')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterStatus === 'Approved' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setFilterStatus('Pending')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterStatus === 'Pending' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending ({pendingCount})
          </button>
        </div>
      </div>

      {/* Institutional Policy Notice */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
        <FiInfo className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-white block">Student Leave Submission Protocol</span>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Leave requests are submitted directly by students accompanied by physician certificates or event credentials.
            Parent portal users have read-only visibility into application progress, dates, and administrative remarks.
          </p>
        </div>
      </div>

      {/* Summary Count Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-emerald-400">{approvedCount}</span>
            <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              Approved Leaves
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FiCheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-amber-400">{pendingCount}</span>
            <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              Pending Under Review
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <FiClock className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-rose-400">{rejectedCount}</span>
            <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              Rejected Requests
            </span>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <FiXCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Leave Application Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="glass-panel p-8 text-center text-slate-400 text-xs">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <span>Loading leave history...</span>
          </div>
        ) : filteredLeaves.length > 0 ? (
          filteredLeaves.map((item, idx) => {
            const isApproved = item.status === 'Approved';
            const isPending = item.status === 'Pending';
            const isRejected = item.status === 'Rejected';

            const startStr = new Date(item.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const endStr = new Date(item.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            return (
              <div
                key={item._id || item.id || idx}
                className="glass-panel p-6 border-slate-800 space-y-4 hover:border-slate-700 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <span className="badge bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-2.5 py-1 rounded-lg font-bold">
                      {item.leaveType}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <FiCalendar className="w-3.5 h-3.5 text-slate-500" />
                      <strong className="text-white">{startStr}</strong> &bull; to &bull; <strong className="text-white">{endStr}</strong>
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-auto ${
                      isApproved
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : isPending
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {isApproved && <FiCheckCircle className="w-3.5 h-3.5" />}
                    {isPending && <FiClock className="w-3.5 h-3.5" />}
                    {isRejected && <FiXCircle className="w-3.5 h-3.5" />}
                    <span>{item.status}</span>
                  </span>
                </div>

                {/* Reason Body */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Application Reason
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                    {item.reason}
                  </p>
                </div>

                {/* Supporting Document & Reviewer Remarks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                  {/* Document Attachment */}
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <FiPaperclip className="w-4 h-4 text-indigo-400 shrink-0" />
                    {item.documentUrl || item.documentName ? (
                      <a
                        href={item.documentUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-300 hover:text-indigo-200 underline font-medium truncate"
                      >
                        {item.documentName || 'Attached Medical Proof (PDF)'}
                      </a>
                    ) : (
                      <span className="text-slate-500">No medical certificate attached</span>
                    )}
                  </div>

                  {/* Reviewer Details */}
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
                    <FiShield className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">
                      Reviewed by: <strong className="text-white">{item.reviewedBy?.name || item.reviewedBy || 'Academic Dean / Mentor'}</strong>
                      {item.remarks ? ` — "${item.remarks}"` : ''}
                    </span>
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="glass-panel p-8 text-center text-slate-500 text-xs">
            No leave requests found for the selected filter.
          </div>
        )}
      </div>

    </div>
  );
}
