import React, { useState, useEffect } from 'react';
import {
  FiShield,
  FiActivity,
  FiClock,
  FiAlertTriangle,
  FiSearch,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiUser,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiTerminal,
  FiGlobe,
  FiLogIn,
  FiLogOut,
  FiUserPlus,
  FiUserMinus,
  FiCheckSquare,
  FiEdit3,
  FiFileText,
  FiSettings,
  FiArrowRight,
  FiFile,
  FiCheck,
  FiSlash
} from 'react-icons/fi';
import { getAuditLogsApi, getAuditLogStatsApi, exportAuditLogsApi } from '../../services/api';

const ACTION_FILTERS = [
  { id: '', label: 'All Actions', icon: FiActivity, color: 'text-slate-300' },
  { id: 'LOGIN', label: 'LOGIN', icon: FiLogIn, color: 'text-emerald-400' },
  { id: 'LOGOUT', label: 'LOGOUT', icon: FiLogOut, color: 'text-slate-400' },
  { id: 'CREATE_STUDENT', label: 'CREATE_STUDENT', icon: FiUserPlus, color: 'text-cyan-400' },
  { id: 'DELETE_STUDENT', label: 'DELETE_STUDENT', icon: FiUserMinus, color: 'text-rose-400' },
  { id: 'MARK_ATTENDANCE', label: 'MARK_ATTENDANCE', icon: FiCheckSquare, color: 'text-blue-400' },
  { id: 'EDIT_ATTENDANCE', label: 'EDIT_ATTENDANCE', icon: FiEdit3, color: 'text-amber-400' },
  { id: 'APPROVE_LEAVE', label: 'APPROVE_LEAVE', icon: FiCheck, color: 'text-emerald-400' },
  { id: 'REJECT_LEAVE', label: 'REJECT_LEAVE', icon: FiSlash, color: 'text-rose-400' },
  { id: 'EXPORT_REPORT', label: 'EXPORT_REPORT', icon: FiFileText, color: 'text-purple-400' },
  { id: 'CHANGE_SETTINGS', label: 'CHANGE_SETTINGS', icon: FiSettings, color: 'text-indigo-400' }
];

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    todayEvents: 0,
    failedEvents: 0,
    warningEvents: 0,
    actionCounts: {}
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchStats = async () => {
    try {
      const res = await getAuditLogStatsApi();
      if (res?.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching audit stats:', err);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        search: search.trim(),
        action: selectedAction,
        status: statusFilter,
        role: roleFilter,
        startDate,
        endDate
      };
      const res = await getAuditLogsApi(params);
      if (res?.success) {
        setLogs(res.data || []);
        setTotalPages(res.pages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [page, selectedAction, statusFilter, roleFilter, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleActionSelect = (actionId) => {
    setSelectedAction(actionId);
    setPage(1);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportAuditLogsApi();
    } catch (err) {
      alert('Failed to export audit logs. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FiCheckCircle className="w-3 h-3" />
            SUCCESS
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <FiXCircle className="w-3 h-3" />
            FAILED
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <FiAlertTriangle className="w-3 h-3" />
            WARNING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <FiInfo className="w-3 h-3" />
            {status}
          </span>
        );
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">Admin</span>;
      case 'teacher':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">Teacher</span>;
      case 'student':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">Student</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300 uppercase tracking-wider">Guest</span>;
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'LOGIN':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5"><FiLogIn className="w-3.5 h-3.5" /> LOGIN</span>;
      case 'LOGOUT':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-500/15 text-slate-300 border border-slate-500/30 flex items-center gap-1.5"><FiLogOut className="w-3.5 h-3.5" /> LOGOUT</span>;
      case 'CREATE_STUDENT':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5"><FiUserPlus className="w-3.5 h-3.5" /> CREATE_STUDENT</span>;
      case 'DELETE_STUDENT':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1.5"><FiUserMinus className="w-3.5 h-3.5" /> DELETE_STUDENT</span>;
      case 'MARK_ATTENDANCE':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1.5"><FiCheckSquare className="w-3.5 h-3.5" /> MARK_ATTENDANCE</span>;
      case 'EDIT_ATTENDANCE':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5"><FiEdit3 className="w-3.5 h-3.5" /> EDIT_ATTENDANCE</span>;
      case 'APPROVE_LEAVE':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5"><FiCheck className="w-3.5 h-3.5" /> APPROVE_LEAVE</span>;
      case 'REJECT_LEAVE':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1.5"><FiSlash className="w-3.5 h-3.5" /> REJECT_LEAVE</span>;
      case 'EXPORT_REPORT':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1.5"><FiFileText className="w-3.5 h-3.5" /> EXPORT_REPORT</span>;
      case 'CHANGE_SETTINGS':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5"><FiSettings className="w-3.5 h-3.5" /> CHANGE_SETTINGS</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">{action}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-600/30 border border-indigo-500/30">
              <FiShield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Audit Logging & Inspection Ledger
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Phase 24 Complete Audit
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Track and inspect critical institutional actions: Logins, Roster changes, Attendance adjustments, Leave approvals, and Setting updates.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchStats(); fetchLogs(); }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors border border-slate-700 shadow-sm"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all border border-emerald-500/30"
          >
            <FiDownload className="w-4 h-4" />
            <span>{exporting ? 'Exporting...' : 'Export Audit CSV'}</span>
          </button>
        </div>
      </div>

      {/* Security & Audit Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Events */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Logged Events</span>
            <div className="text-2xl font-bold text-white mt-1">{stats.totalEvents || 0}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Full institutional audit trail</span>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <FiActivity className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Today's Events */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Today's Activity</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.todayEvents || 0}</div>
            <span className="text-[11px] text-emerald-400 mt-1 block">Monitored live</span>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <FiClock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Attendance Edits */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Attendance Edits</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">{stats.actionCounts?.EDIT_ATTENDANCE || 0}</div>
            <span className="text-[11px] text-amber-400 mt-1 block">State diffs & verified reasons</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <FiEdit3 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Failed / Denied */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Failed / Denied Events</span>
            <div className="text-2xl font-bold text-rose-400 mt-1">{stats.failedEvents || 0}</div>
            <span className="text-[11px] text-rose-400 mt-1 block">Security & auth violations</span>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <FiAlertTriangle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 10 Tracked Action Quick-Filter Bar */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Quick Action Filter:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {ACTION_FILTERS.map((action) => {
            const Icon = action.icon;
            const isSelected = selectedAction === action.id;
            const count = action.id ? stats.actionCounts?.[action.id] : null;

            return (
              <button
                key={action.id}
                onClick={() => handleActionSelect(action.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/30 border border-indigo-400'
                    : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : action.color}`} />
                <span>{action.label}</span>
                {count !== undefined && count !== null && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-5 rounded-2xl space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Actor, Student, Action, Reason (e.g. 'Medical document verified'), or IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700/80 text-white text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
            />
          </div>

          {/* Status Select */}
          <div className="w-full md:w-44">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-950/80 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAILED">FAILED</option>
              <option value="WARNING">WARNING</option>
            </select>
          </div>

          {/* Role Select */}
          <div className="w-full md:w-44">
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-950/80 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="anonymous">Anonymous / Guest</option>
            </select>
          </div>

          {/* Start Date */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="bg-slate-950/80 border border-slate-700/80 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
            title="Start Date"
          />

          {/* End Date */}
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="bg-slate-950/80 border border-slate-700/80 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
            title="End Date"
          />

          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            <FiFilter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
        </form>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiTerminal className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Audit Event Ledger ({totalCount} entries)
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Page {page} of {totalPages}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <FiRefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-3" />
            <p className="text-sm">Loading audit records...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FiShield className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <p className="text-sm font-semibold text-slate-300">No audit logs found matching criteria</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting the action filter, search keywords, or date range.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor / Performed By</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target / State Transition</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4">IP & Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {logs.map((log) => {
                  const dateStr = new Date(log.createdAt).toLocaleString();
                  const targetName = log.targetUserName || log.details?.studentName || (log.targetUser && log.targetUser.name) || '';
                  const targetRoll = log.targetUserRollNo || log.details?.studentRollNo || (log.targetUser && log.targetUser.rollNo) || '';
                  const transition = log.transition || log.details?.transition || '';
                  const reason = log.reason || log.details?.reason || log.details?.notes || '';

                  return (
                    <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {dateStr}
                      </td>

                      {/* Actor */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-700">
                            {log.userName?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-white truncate max-w-[130px]">{log.userName || 'Anonymous'}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              {getRoleBadge(log.userRole)}
                              <span className="truncate max-w-[110px]">{log.userEmail || ''}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>

                      {/* Target / State Transition */}
                      <td className="py-3.5 px-4">
                        {log.action === 'EDIT_ATTENDANCE' || transition ? (
                          <div className="space-y-1">
                            {targetName && (
                              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                                <span className="text-slate-400 font-normal">Student:</span>
                                <span>{targetName}</span>
                                {targetRoll && <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">({targetRoll})</span>}
                              </div>
                            )}
                            {transition && (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px]">
                                {transition.includes('→') ? (
                                  <>
                                    <span className="text-rose-400 font-bold">{transition.split('→')[0].trim()}</span>
                                    <FiArrowRight className="w-3 h-3 text-amber-400" />
                                    <span className="text-emerald-400 font-bold">{transition.split('→')[1].trim()}</span>
                                  </>
                                ) : (
                                  transition
                                )}
                              </div>
                            )}
                          </div>
                        ) : targetName ? (
                          <div>
                            <div className="font-semibold text-white">{targetName}</div>
                            {targetRoll && <div className="text-[10px] text-slate-400">Roll: {targetRoll}</div>}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] font-mono">{log.resource}</span>
                        )}
                      </td>

                      {/* Reason / Notes */}
                      <td className="py-3.5 px-4">
                        {reason ? (
                          <div className="max-w-[200px]">
                            <span className="inline-block px-2 py-1 rounded bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 font-medium italic truncate max-w-full">
                              "{reason}"
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[11px]">—</span>
                        )}
                      </td>

                      {/* IP & Endpoint */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        <div className="flex items-center gap-1">
                          <FiGlobe className="w-3 h-3 text-slate-500" />
                          <span>{log.ipAddress || '127.0.0.1'}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase truncate max-w-[120px]">{log.method} {log.endpoint}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(log.status)}
                      </td>

                      {/* Inspect Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 text-[11px] font-semibold rounded-lg border border-slate-700 transition-colors inline-flex items-center gap-1"
                        >
                          <FiInfo className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Showing <span className="font-semibold text-white">{logs.length}</span> of <span className="font-semibold text-white">{totalCount}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page <= 1}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors border border-slate-700"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-300 px-2">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors border border-slate-700"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Log Detail Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                  <FiTerminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Audit Event Inspector
                    {getActionBadge(selectedLog.action)}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {selectedLog._id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Special Highlight for Attendance Edits & State Transitions */}
            {(selectedLog.action === 'EDIT_ATTENDANCE' || selectedLog.transition) && (
              <div className="bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-500/30 p-4 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  State Mutation & Change Audit Record
                </span>
                
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="text-slate-300">
                    <strong className="text-white">{selectedLog.userName}</strong> changed <strong className="text-white">{selectedLog.targetUserName || selectedLog.details?.studentName || 'Student'}</strong>:
                  </span>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950 border border-amber-500/30 font-mono text-xs font-bold">
                    <span className="text-rose-400">{selectedLog.originalValue || selectedLog.details?.oldStatus || 'Old'}</span>
                    <FiArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-emerald-400">{selectedLog.newValue || selectedLog.details?.newStatus || 'New'}</span>
                  </div>
                </div>

                {(selectedLog.reason || selectedLog.details?.reason) && (
                  <div className="pt-2 border-t border-slate-800/80 text-xs">
                    <span className="font-semibold text-slate-400">Reason: </span>
                    <span className="text-emerald-300 font-medium">"{selectedLog.reason || selectedLog.details?.reason}"</span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs">
              {/* Actor Identity */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block uppercase text-[10px] font-bold">Actor / Performer</span>
                <div className="text-white font-semibold mt-1">{selectedLog.userName}</div>
                <div className="text-slate-400">{selectedLog.userEmail}</div>
                <div className="mt-1">{getRoleBadge(selectedLog.userRole)}</div>
              </div>

              {/* Target User */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block uppercase text-[10px] font-bold">Target Student / Entity</span>
                <div className="text-white font-semibold mt-1">
                  {selectedLog.targetUserName || selectedLog.details?.studentName || 'N/A (System / Self)'}
                </div>
                {selectedLog.targetUserRollNo && (
                  <div className="text-slate-400">Roll: {selectedLog.targetUserRollNo}</div>
                )}
                <div className="text-slate-500 text-[10px] mt-1">Resource: {selectedLog.resource}</div>
              </div>

              {/* Status & Timestamp */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block uppercase text-[10px] font-bold">Status & Timestamp</span>
                <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
                <div className="text-slate-300 mt-2 font-mono">{new Date(selectedLog.createdAt).toLocaleString()}</div>
              </div>

              {/* Network & Endpoint */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block uppercase text-[10px] font-bold">Network & Endpoint</span>
                <div className="text-slate-300 font-mono mt-1">IP: {selectedLog.ipAddress || '127.0.0.1'}</div>
                <div className="text-slate-400 font-mono text-[10px]">{selectedLog.method} {selectedLog.endpoint}</div>
              </div>
            </div>

            {/* Technical Details JSON Payload */}
            <div>
              <span className="text-slate-400 text-xs font-semibold block mb-2">Technical Details Payload:</span>
              <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-xs font-mono border border-slate-800 overflow-x-auto max-h-48">
                {JSON.stringify(selectedLog.details || {}, null, 2)}
              </pre>
            </div>

            {/* User Agent */}
            <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-3 flex items-center gap-2 truncate">
              <span className="font-semibold text-slate-400">User-Agent:</span>
              <span className="truncate">{selectedLog.userAgent}</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors border border-slate-700"
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
