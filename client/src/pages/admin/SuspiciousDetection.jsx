import React, { useState, useEffect } from 'react';
import {
  FiShield,
  FiAlertTriangle,
  FiSmartphone,
  FiMapPin,
  FiNavigation,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiRefreshCw,
  FiUser
} from 'react-icons/fi';
import { HiOutlineQrCode } from 'react-icons/hi2';
import { getSuspiciousAttendanceApi } from '../../services/api';

export default function SuspiciousDetection() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('all');
  const [activeSeverity, setActiveSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);

  const fetchSuspiciousData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSuspiciousAttendanceApi({
        type: activeTab,
        severity: activeSeverity,
        search: searchTerm
      });
      if (res.success) {
        setData(res);
      } else {
        setError('Failed to fetch proxy detection logs');
      }
    } catch (err) {
      setError(err.message || 'Error fetching suspicious attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuspiciousData();
  }, [activeTab, activeSeverity]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSuspiciousData();
  };

  const getSeverityPill = (severity) => {
    switch (severity) {
      case 'High':
        return <span className="px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-extrabold rounded-full uppercase tracking-wider">High Risk</span>;
      case 'Medium':
        return <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold rounded-full uppercase tracking-wider">Medium Risk</span>;
      default:
        return <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-extrabold rounded-full uppercase tracking-wider">Low Risk</span>;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'REPEATED_SAME_DEVICE':
        return <FiSmartphone className="w-4 h-4 text-purple-400" />;
      case 'OUTSIDE_CAMPUS':
        return <FiMapPin className="w-4 h-4 text-amber-400" />;
      case 'DUPLICATE_QR':
        return <FiQrCode className="w-4 h-4 text-cyan-400" />;
      default:
        return <FiNavigation className="w-4 h-4 text-rose-400" />;
    }
  };

  const summary = data?.summary || {};
  const anomalies = data?.anomalies || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">
            <FiShield className="w-4 h-4" /> Security & Fraud Prevention
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Suspicious Attendance & <span className="gradient-text">Proxy Detection</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            AI anomaly detector identifying proxy logins, same-device sharing, outside campus GPS scans, and impossible travel patterns.
          </p>
        </div>

        <button
          onClick={fetchSuspiciousData}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-semibold flex items-center gap-2 border border-slate-700/60 transition-colors shadow-md self-start md:self-auto"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Re-scan Anomaly Logs</span>
        </button>
      </div>

      {/* Metric Cards Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <span className="block text-[10px] text-slate-400 uppercase font-semibold">Total Flagged</span>
          <span className="text-2xl font-extrabold text-white mt-1 block">{summary.totalFlagged || 0}</span>
          <span className="text-[10px] text-rose-400 font-medium">{summary.highSeverity || 0} High Risk</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">Same Device</span>
            <FiSmartphone className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <span className="text-2xl font-extrabold text-purple-400 mt-1 block">{summary.repeatedSameDevice || 0}</span>
          <span className="text-[10px] text-slate-400">Proxy Fingerprints</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">Outside Campus</span>
            <FiMapPin className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-2xl font-extrabold text-amber-400 mt-1 block">{summary.outsideCampus || 0}</span>
          <span className="text-[10px] text-slate-400">Geofence Violations</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">Duplicate QR</span>
            <FiQrCode className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <span className="text-2xl font-extrabold text-cyan-400 mt-1 block">{summary.duplicateQr || 0}</span>
          <span className="text-[10px] text-slate-400">Token Reuse</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">Impossible Jump</span>
            <FiNavigation className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <span className="text-2xl font-extrabold text-rose-400 mt-1 block">{summary.impossibleLocations || 0}</span>
          <span className="text-[10px] text-slate-400">Velocity Anomaly</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/80">
        {/* Type Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'All Anomalies' },
            { id: 'repeated_same_device', label: 'Repeated Same Device' },
            { id: 'outside_campus', label: 'Outside Campus' },
            { id: 'duplicate_qr', label: 'Duplicate QR' },
            { id: 'impossible_locations', label: 'Impossible Locations' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Search & Severity Filter */}
        <div className="flex items-center gap-2">
          <select
            value={activeSeverity}
            onChange={(e) => setActiveSeverity(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 text-slate-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
          >
            <option value="all">Severity: All</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>

          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search student or roll no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 text-white rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none w-48"
            />
            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          </form>
        </div>
      </div>

      {/* Anomalies List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-3">
          <FiShield className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <p className="text-xs">Scanning Attendance Database for Proxy Patterns...</p>
        </div>
      ) : anomalies.length === 0 ? (
        <div className="p-12 bg-slate-900/40 rounded-3xl border border-slate-800 text-center space-y-3">
          <FiCheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No Suspicious Anomalies Detected</h3>
          <p className="text-xs text-slate-400">All attendance records match verification guidelines and geo-radius boundaries.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {anomalies.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl backdrop-blur-xl hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">{item.typeLabel}</span>
                    <span className="block text-[10px] text-slate-400">
                      {new Date(item.date).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div>{getSeverityPill(item.severity)}</div>
              </div>

              {/* Student Info */}
              <div className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                <img
                  src={item.student?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                  alt={item.student?.name || 'Student'}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                />
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">{item.student?.name || 'Unknown Student'}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 truncate">
                    <span>Roll: {item.student?.rollNo || 'N/A'}</span>
                    <span>•</span>
                    <span>Subj: {item.subject}</span>
                  </div>
                </div>
              </div>

              {/* Reason Explanation */}
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-200 leading-relaxed">
                <span className="font-bold text-rose-300 block mb-0.5">Anomaly Reason:</span>
                {item.reason}
              </div>

              {/* Technical Details Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                {item.details?.deviceFingerprint && (
                  <div className="p-2 bg-slate-950/40 rounded-xl border border-slate-800 truncate">
                    <span className="text-slate-400 block text-[9px]">FINGERPRINT</span>
                    <span className="font-mono">{item.details.deviceFingerprint.substring(0, 14)}...</span>
                  </div>
                )}
                {item.details?.ipAddress && (
                  <div className="p-2 bg-slate-950/40 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[9px]">IP ADDRESS</span>
                    <span className="font-mono">{item.details.ipAddress}</span>
                  </div>
                )}
                {item.details?.distanceMeters !== undefined && (
                  <div className="p-2 bg-slate-950/40 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[9px]">GPS DISTANCE</span>
                    <span className="font-semibold text-amber-400">{item.details.distanceMeters}m outside</span>
                  </div>
                )}
                {item.details?.speedKmH && (
                  <div className="p-2 bg-slate-950/40 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[9px]">IMPOSSIBLE SPEED</span>
                    <span className="font-semibold text-rose-400">{item.details.speedKmH} km/h</span>
                  </div>
                )}
              </div>

              {/* Modal Trigger Action */}
              <button
                onClick={() => setSelectedAnomaly(item)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <FiInfo className="w-3.5 h-3.5 text-indigo-400" />
                <span>Inspect Full Anomaly Metadata</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Inspector Modal */}
      {selectedAnomaly && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FiShield className="w-5 h-5 text-rose-400" />
                Anomaly Log Inspector
              </h3>
              <button
                onClick={() => setSelectedAnomaly(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block">Student:</span>
                <span className="font-bold text-white text-sm">{selectedAnomaly.student?.name} ({selectedAnomaly.student?.rollNo})</span>
              </div>

              <div>
                <span className="text-slate-400 block">Category & Severity:</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-semibold text-white">{selectedAnomaly.typeLabel}</span>
                  {getSeverityPill(selectedAnomaly.severity)}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block">Reason:</span>
                <p className="p-3 bg-slate-950 rounded-xl text-slate-200 mt-1 border border-slate-800">
                  {selectedAnomaly.reason}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Full Technical Metadata JSON:</span>
                <pre className="p-3 bg-slate-950 rounded-xl text-[10px] text-cyan-300 font-mono overflow-x-auto border border-slate-800">
                  {JSON.stringify(selectedAnomaly.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedAnomaly(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
