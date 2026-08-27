import React, { useState, useEffect } from 'react';
import {
  FiShield,
  FiAlertTriangle,
  FiSmartphone,
  FiMapPin,
  FiClock,
  FiGlobe,
  FiActivity,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiRefreshCw,
  FiUser,
  FiCheckSquare,
  FiLayers
} from 'react-icons/fi';
import { HiOutlineQrCode } from 'react-icons/hi2';
import {
  getFlaggedAntiProxyRecordsApi,
  reviewAntiProxyRecordApi,
  bulkReviewAntiProxyRecordsApi,
  getAntiProxyAnalyticsApi,
  getDeviceSharingClustersApi
} from '../../services/api';

export default function SuspiciousDetection() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // View state
  const [viewTab, setViewTab] = useState('records'); // 'records', 'clusters', 'analytics'
  const [riskFilter, setRiskFilter] = useState('all'); // 'all', 'High Risk', 'Suspicious', 'Normal'
  const [statusFilter, setStatusFilter] = useState('Pending'); // 'all', 'Pending', 'Approved', 'Rejected'
  const [searchTerm, setSearchTerm] = useState('');

  // Review drawer/modal state
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState([]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [flaggedRes, analyticsRes, clustersRes] = await Promise.all([
        getFlaggedAntiProxyRecordsApi({
          riskLevel: riskFilter,
          reviewStatus: statusFilter,
          search: searchTerm
        }),
        getAntiProxyAnalyticsApi(),
        getDeviceSharingClustersApi()
      ]);

      if (flaggedRes.success) {
        setRecords(flaggedRes.data || []);
        setSummary(flaggedRes.summary || {});
      }
      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (clustersRes.success) setClusters(clustersRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load anti-proxy security data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [riskFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleReviewAction = async (action) => {
    if (!selectedRecord) return;
    setActionLoading(true);
    try {
      const res = await reviewAntiProxyRecordApi(selectedRecord._id, {
        action,
        notes: reviewNotes
      });
      if (res.success) {
        showToast(res.message, action === 'approve' ? 'success' : 'warning');
        setSelectedRecord(null);
        setReviewNotes('');
        loadData();
      }
    } catch (err) {
      showToast(err.message || 'Error processing review action', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    try {
      const res = await bulkReviewAntiProxyRecordsApi({
        recordIds: selectedIds,
        action,
        notes: `Bulk ${action}d from review console`
      });
      if (res.success) {
        showToast(res.message, action === 'approve' ? 'success' : 'warning');
        setSelectedIds([]);
        loadData();
      }
    } catch (err) {
      showToast(err.message || 'Error executing bulk action', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map((r) => r._id));
    }
  };

  const toggleSelectRecord = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const getRiskBadge = (level, score) => {
    if (level === 'High Risk' || score >= 70) {
      return (
        <span className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-extrabold rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
          <FiAlertTriangle className="w-3 h-3 text-rose-400" />
          High Risk ({score || 70}/100)
        </span>
      );
    }
    if (level === 'Suspicious' || score >= 30) {
      return (
        <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
          <FiShield className="w-3 h-3 text-amber-400" />
          Suspicious ({score || 45}/100)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
        <FiCheckCircle className="w-3 h-3 text-emerald-400" />
        Normal ({score || 10}/100)
      </span>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-lg uppercase">Approved</span>;
      case 'Rejected':
        return <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold rounded-lg uppercase">Rejected (Absent)</span>;
      default:
        return <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold rounded-lg uppercase animate-pulse">Pending Review</span>;
    }
  };

  const getSignalIcon = (sigName) => {
    switch (sigName) {
      case 'QR Token': return <HiOutlineQrCode className="w-3.5 h-3.5 text-cyan-400" />;
      case 'GPS': return <FiMapPin className="w-3.5 h-3.5 text-rose-400" />;
      case 'Time': return <FiClock className="w-3.5 h-3.5 text-amber-400" />;
      case 'Device': return <FiSmartphone className="w-3.5 h-3.5 text-purple-400" />;
      case 'IP': return <FiGlobe className="w-3.5 h-3.5 text-blue-400" />;
      case 'Pattern': return <FiActivity className="w-3.5 h-3.5 text-emerald-400" />;
      default: return <FiShield className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-700 text-emerald-200' : 'bg-rose-950/90 border-rose-700 text-rose-200'
        }`}>
          {toast.type === 'success' ? <FiCheckCircle className="w-4 h-4 text-emerald-400" /> : <FiAlertTriangle className="w-4 h-4 text-rose-400" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">
            <FiShield className="w-4 h-4" /> Multi-Signal Security Console • Phase 21
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Anti-Proxy <span className="gradient-text">Attendance Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Multi-signal proxy detection pipeline evaluating QR Tokens, GPS Geofencing, Time Windows, Device Fingerprints, IP Bursts, and Pattern Anomalies.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-semibold flex items-center gap-2 border border-slate-700/60 transition-all shadow-md self-start md:self-auto"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Refresh Anti-Proxy Logs</span>
        </button>
      </div>

      {/* Live Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <span className="block text-[10px] text-slate-400 uppercase font-semibold">Total Evaluated</span>
          <span className="text-2xl font-extrabold text-white mt-1 block">{analytics?.totalScans || summary.totalRecords || 0}</span>
          <span className="text-[10px] text-indigo-400 font-medium">Scans Scored</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-amber-500/30 rounded-2xl bg-amber-500/5">
          <span className="block text-[10px] text-amber-400 uppercase font-semibold">Pending Review</span>
          <span className="text-2xl font-extrabold text-amber-400 mt-1 block">{analytics?.pendingCount || summary.totalPending || 0}</span>
          <span className="text-[10px] text-amber-300">Requires Review</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-rose-500/30 rounded-2xl bg-rose-500/5">
          <div className="flex items-center justify-between">
            <span className="block text-[10px] text-rose-400 uppercase font-semibold">High Risk</span>
            <FiAlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <span className="text-2xl font-extrabold text-rose-400 mt-1 block">{analytics?.riskLevelDistribution?.highRisk || summary.highRiskCount || 0}</span>
          <span className="text-[10px] text-rose-300">Score $\ge$ 70</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-purple-500/30 rounded-2xl bg-purple-500/5">
          <div className="flex items-center justify-between">
            <span className="block text-[10px] text-purple-400 uppercase font-semibold">Device Clusters</span>
            <FiSmartphone className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <span className="text-2xl font-extrabold text-purple-400 mt-1 block">{clusters.length || 0}</span>
          <span className="text-[10px] text-purple-300">Shared Devices</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">GPS Violations</span>
            <FiMapPin className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-2xl font-extrabold text-amber-400 mt-1 block">{analytics?.signalBreakdown?.GPS || 0}</span>
          <span className="text-[10px] text-slate-400">Out of Campus</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-emerald-500/30 rounded-2xl bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <span className="block text-[10px] text-emerald-400 uppercase font-semibold">Prevention Rate</span>
            <FiShield className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">{analytics?.proxyPreventionRate || 98.5}%</span>
          <span className="text-[10px] text-emerald-300">Clean Scans</span>
        </div>
      </div>

      {/* Main Mode Navigation & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setViewTab('records')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              viewTab === 'records'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            <FiShield className="w-3.5 h-3.5" />
            <span>Flagged Records ({records.length})</span>
          </button>

          <button
            onClick={() => setViewTab('clusters')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              viewTab === 'clusters'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            <FiSmartphone className="w-3.5 h-3.5 text-purple-400" />
            <span>Device Clusters ({clusters.length})</span>
          </button>

          <button
            onClick={() => setViewTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              viewTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            <FiActivity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Signal Analytics</span>
          </button>
        </div>

        {/* Filters & Search Form */}
        {viewTab === 'records' && (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none"
            >
              <option value="all">Risk Level: All</option>
              <option value="High Risk">High Risk (Score $\ge$ 70)</option>
              <option value="Suspicious">Suspicious (Score 30-69)</option>
              <option value="Normal">Normal (Score $<$ 30)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none"
            >
              <option value="all">Review Status: All</option>
              <option value="Pending">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected (Absent)</option>
            </select>

            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search student or roll no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none w-48"
              />
              <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            </form>
          </div>
        )}
      </div>

      {/* VIEW TAB 1: FLAGGED RECORDS REVIEW TABLE & CARDS */}
      {viewTab === 'records' && (
        <div className="space-y-4">
          {/* Bulk Selection Action Bar */}
          {selectedIds.length > 0 && (
            <div className="p-3 bg-indigo-950/80 border border-indigo-700/60 rounded-2xl flex items-center justify-between shadow-xl">
              <span className="text-xs font-bold text-indigo-200">
                {selectedIds.length} record(s) selected for bulk action
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={actionLoading}
                  onClick={() => handleBulkAction('approve')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1"
                >
                  <FiCheckCircle className="w-3.5 h-3.5" />
                  <span>Bulk Approve</span>
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() => handleBulkAction('reject')}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1"
                >
                  <FiXCircle className="w-3.5 h-3.5" />
                  <span>Bulk Reject & Mark Absent</span>
                </button>

                <button
                  onClick={() => setSelectedIds([])}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Records List Container */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <FiShield className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-xs font-semibold">Evaluating Multi-Signal Risk Engine Logs...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="p-12 bg-slate-900/40 rounded-3xl border border-slate-800 text-center space-y-3">
              <FiCheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No Flagged Suspicious Records Found</h3>
              <p className="text-xs text-slate-400">All attendance records match verification guidelines without risk triggers.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {records.map((item) => (
                <div
                  key={item._id}
                  className={`p-5 bg-slate-900/90 border rounded-3xl backdrop-blur-xl transition-all space-y-4 ${
                    selectedIds.includes(item._id) ? 'border-indigo-500 bg-indigo-950/20' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Bar: Checkbox + Student + Risk Score */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item._id)}
                        onChange={() => toggleSelectRecord(item._id)}
                        className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                      />

                      <img
                        src={item.student?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                        alt={item.student?.name || 'Student'}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow-md"
                      />

                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{item.student?.name || 'Unknown Student'}</span>
                          <span className="text-xs font-normal text-slate-400">({item.student?.rollNo || 'N/A'})</span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-slate-300">{item.subject} ({item.subjectCode})</span>
                          <span>•</span>
                          <span>{new Date(item.date).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      {getRiskBadge(item.riskLevel, item.riskScore)}
                      {getStatusBadge(item.reviewStatus)}
                    </div>
                  </div>

                  {/* Multi-Signal Badges Grid */}
                  <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">Signals:</span>
                    {item.riskSignals && item.riskSignals.length > 0 ? (
                      item.riskSignals.map((sig, idx) => (
                        <div
                          key={idx}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 border ${
                            sig.status === 'FLAGGED'
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                              : sig.status === 'WARNING'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {getSignalIcon(sig.signal)}
                          <span>{sig.signal}</span>
                          {sig.status === 'FLAGGED' && <span className="font-extrabold text-rose-400">❌</span>}
                          {sig.status === 'WARNING' && <span className="font-extrabold text-amber-400">⚠️</span>}
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">No signal flags</span>
                    )}
                  </div>

                  {/* Reasons Summary */}
                  {item.riskSignals?.some((s) => s.status !== 'PASSED') && (
                    <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Risk Signal Reasons:</span>
                      <ul className="space-y-1">
                        {item.riskSignals
                          .filter((s) => s.status !== 'PASSED')
                          .map((sig, sIdx) => (
                            <li key={sIdx} className="text-xs text-slate-300 flex items-start gap-1.5">
                              <span className="text-rose-400 font-bold">•</span>
                              <span>{sig.reason}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        setSelectedRecord(item);
                        setReviewNotes(item.reviewNotes || '');
                      }}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <FiInfo className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Inspect Signal Breakdown</span>
                    </button>

                    {item.reviewStatus === 'Pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedRecord(item);
                            handleReviewAction('approve');
                          }}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                        >
                          <FiCheckCircle className="w-3.5 h-3.5" />
                          <span>Approve Attendance</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedRecord(item);
                            handleReviewAction('reject');
                          }}
                          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                        >
                          <FiXCircle className="w-3.5 h-3.5" />
                          <span>Reject & Mark Absent</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW TAB 2: DEVICE SHARING CLUSTERS */}
      {viewTab === 'clusters' && (
        <div className="space-y-4">
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-xs text-purple-200">
            <span className="font-bold text-purple-300 block mb-0.5">Physical Device Sharing Protection ⚠️</span>
            These physical devices (identified via device fingerprints/browser IDs) were used to submit attendance for multiple different student accounts today.
          </div>

          {clusters.length === 0 ? (
            <div className="p-12 bg-slate-900/40 rounded-3xl border border-slate-800 text-center space-y-3">
              <FiCheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No Multi-Account Device Clusters Detected</h3>
              <p className="text-xs text-slate-400">All scanned devices belong to unique single-student accounts.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clusters.map((cluster, idx) => (
                <div key={idx} className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl backdrop-blur-xl space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
                        <FiSmartphone className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Shared Device Fingerprint</span>
                        <span className="text-[10px] font-mono text-purple-300">{cluster.deviceFingerprint?.substring(0, 20)}...</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold rounded-full uppercase">
                      {cluster.uniqueStudentsCount} Accounts Shared
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Student Accounts Scanning from Device:</span>
                    {cluster.students.map((st, sIdx) => (
                      <div key={sIdx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={st.student?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                            alt="Student"
                            className="w-7 h-7 rounded-lg object-cover"
                          />
                          <div>
                            <span className="font-bold text-white block">{st.student?.name}</span>
                            <span className="text-[10px] text-slate-400">Roll: {st.student?.rollNo} • Dept: {st.student?.department}</span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 bg-slate-800 text-indigo-300 rounded-md text-[10px] font-mono">
                          {st.scanCount} Scans
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW TAB 3: SIGNAL ANALYTICS */}
      {viewTab === 'analytics' && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FiActivity className="w-5 h-5 text-indigo-400" />
              Multi-Signal Violation Breakdown
            </h3>

            <div className="space-y-3">
              {Object.keys(analytics.signalBreakdown || {}).map((sig, idx) => {
                const count = analytics.signalBreakdown[sig];
                const total = analytics.totalScans || 1;
                const pct = Math.min(100, Math.round((count / total) * 100));

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        {getSignalIcon(sig)} {sig} Signal Violations
                      </span>
                      <span className="font-mono text-indigo-400">{count} flagged</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-rose-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct || 15}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FiShield className="w-5 h-5 text-emerald-400" />
              Risk Score Distribution
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-emerald-400 block text-sm">Normal Risk ($<$ 30)</span>
                  <span className="text-slate-400 text-[11px]">Valid scans auto-approved</span>
                </div>
                <span className="text-2xl font-extrabold text-white">{analytics.riskLevelDistribution?.normal || 0}</span>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-amber-400 block text-sm">Suspicious Risk (30-69)</span>
                  <span className="text-slate-400 text-[11px]">Single signal violation pending review</span>
                </div>
                <span className="text-2xl font-extrabold text-amber-400">{analytics.riskLevelDistribution?.suspicious || 0}</span>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-rose-400 block text-sm">High Risk ($\ge$ 70)</span>
                  <span className="text-slate-400 text-[11px]">Multiple severe violations</span>
                </div>
                <span className="text-2xl font-extrabold text-rose-400">{analytics.riskLevelDistribution?.highRisk || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED INSPECTION & REVIEW MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FiShield className="w-5 h-5 text-rose-400" />
                Anti-Proxy Signal Inspector & Review
              </h3>
              <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-white p-1">
                ✕
              </button>
            </div>

            {/* Student & Class Header */}
            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={selectedRecord.student?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                  alt="Student"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedRecord.student?.name}</h4>
                  <p className="text-xs text-slate-400">Roll: {selectedRecord.student?.rollNo} • Dept: {selectedRecord.student?.department}</p>
                  <p className="text-[11px] text-indigo-400 font-semibold mt-0.5">{selectedRecord.subject} ({selectedRecord.subjectCode})</p>
                </div>
              </div>

              <div>{getRiskBadge(selectedRecord.riskLevel, selectedRecord.riskScore)}</div>
            </div>

            {/* Signal Breakdown List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Evaluated Signal Contributions:</span>
              <div className="space-y-2">
                {selectedRecord.riskSignals?.map((sig, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">{getSignalIcon(sig.signal)}</div>
                      <div>
                        <span className="font-bold text-white block">{sig.signal} Signal</span>
                        <span className="text-slate-300">{sig.reason}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      sig.status === 'FLAGGED' ? 'bg-rose-500/20 text-rose-300' : sig.status === 'WARNING' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      +{sig.scoreContribution} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Metadata */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Device Fingerprint</span>
                <span className="font-mono text-cyan-300">{selectedRecord.deviceInfo?.deviceFingerprint || 'N/A'}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">IP Address</span>
                <span className="font-mono text-cyan-300">{selectedRecord.deviceInfo?.ipAddress || '127.0.0.1'}</span>
              </div>
            </div>

            {/* Instructor Notes Input */}
            {selectedRecord.reviewStatus === 'Pending' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">Instructor Review Notes:</label>
                <textarea
                  rows="2"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Enter reason for approval or proxy rejection..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>

              {selectedRecord.reviewStatus === 'Pending' && (
                <>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleReviewAction('approve')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                  >
                    <FiCheckCircle className="w-4 h-4" />
                    <span>Approve Attendance</span>
                  </button>

                  <button
                    disabled={actionLoading}
                    onClick={() => handleReviewAction('reject')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                  >
                    <FiXCircle className="w-4 h-4" />
                    <span>Reject & Mark Absent</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
