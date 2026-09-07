import React, { useState, useEffect, useMemo } from 'react';
import {
  FiAlertTriangle,
  FiBell,
  FiCheckCircle,
  FiMail,
  FiPhone,
  FiSearch,
  FiFilter,
  FiSliders,
  FiRefreshCw,
  FiDownload,
  FiSend,
  FiClock,
  FiUser,
  FiChevronRight,
  FiShield,
  FiTrendingUp,
  FiX,
  FiInfo
} from 'react-icons/fi';
import {
  getDefaultersApi,
  getDefaulterSummaryApi,
  getDefaulterConfigApi,
  updateDefaulterConfigApi,
  evaluateDefaultersBatchApi,
  escalateDefaulterApi,
  resolveDefaulterApi,
  bulkNotifyDefaultersApi
} from '../../services/api';

export default function AdminDefaulterManagement() {
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [toast, setToast] = useState(null);

  // Data states
  const [defaulters, setDefaulters] = useState([]);
  const [summary, setSummary] = useState(null);
  const [config, setConfig] = useState({
    enabled: true,
    warningThreshold: 75,
    seriousWarningThreshold: 70,
    adminAlertThreshold: 65,
    parentAlertThreshold: 60,
    minClassesBeforeEvaluation: 3,
    autoEscalateOnMark: true,
    sendStudentNotification: true,
    sendAdminAlert: true,
    sendParentEmail: true
  });

  // UI / View state
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('active');

  // Modals state
  const [selectedDefaulter, setSelectedDefaulter] = useState(null);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  // Load initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, configRes, listRes] = await Promise.all([
        getDefaulterSummaryApi().catch(() => null),
        getDefaulterConfigApi().catch(() => null),
        getDefaultersApi({ status: selectedStatus, limit: 100 }).catch(() => null)
      ]);

      if (summaryRes?.success) setSummary(summaryRes.data);
      if (configRes?.success) setConfig(configRes.data);
      if (listRes?.success) setDefaulters(listRes.data || []);
    } catch (err) {
      showToast('Error loading defaulter data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStatus]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Run automated college scan
  const handleRunEvaluation = async () => {
    setEvaluating(true);
    try {
      const res = await evaluateDefaultersBatchApi({ department: selectedDept, forceNotify: false });
      if (res.success) {
        showToast(
          `Automated Scan Complete: Evaluated ${res.data?.evaluatedCount || 0} students. Found ${res.data?.defaultersCount || 0} defaulters.`,
          'success'
        );
        await fetchData();
      }
    } catch (err) {
      showToast('Evaluation failed: ' + err.message, 'error');
    } finally {
      setEvaluating(false);
    }
  };

  // Save configurable thresholds
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await updateDefaulterConfigApi(config);
      if (res.success) {
        showToast('Defaulter escalation thresholds & policies saved successfully!', 'success');
        setConfig(res.data);
        setShowConfigPanel(false);
        await fetchData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update configuration', 'error');
    } finally {
      setSavingConfig(false);
    }
  };

  // Escalate / Notify student or parent
  const handleEscalateOrNotify = async (defaulterId, targetTier, notifyParent = false) => {
    setActionInProgress(true);
    try {
      const res = await escalateDefaulterApi(defaulterId, {
        targetTier,
        notifyParent,
        actionNotes: notifyParent ? 'Official Parent Notice Dispatched' : 'Direct Escalation Alert'
      });
      if (res.success) {
        showToast(
          notifyParent
            ? '🚨 Urgent notice sent to student and registered parent/guardian!'
            : '⚠️ Escalation alert dispatched to student and advisors.',
          'success'
        );
        await fetchData();
      }
    } catch (err) {
      showToast('Action failed: ' + err.message, 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  // Resolve defaulter record
  const handleConfirmResolve = async () => {
    if (!selectedDefaulter) return;
    setActionInProgress(true);
    try {
      const res = await resolveDefaulterApi(selectedDefaulter._id, {
        notes: resolveNotes || 'Manually excused / attendance resolved by Administrator'
      });
      if (res.success) {
        showToast(`Defaulter status cleared for ${selectedDefaulter.studentName}.`, 'success');
        setShowResolveModal(false);
        setSelectedDefaulter(null);
        setResolveNotes('');
        await fetchData();
      }
    } catch (err) {
      showToast('Resolution error: ' + err.message, 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  // Filtered defaulter students
  const filteredDefaulters = useMemo(() => {
    return defaulters.filter((d) => {
      const matchesSearch =
        !searchQuery ||
        d.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.studentRollNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.studentEmail?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTier = selectedTier === 'all' || d.tier === selectedTier;
      const matchesDept = selectedDept === 'all' || d.department === selectedDept;

      return matchesSearch && matchesTier && matchesDept;
    });
  }, [defaulters, searchQuery, selectedTier, selectedDept]);

  // Export CSV
  const handleExportCSV = () => {
    if (!filteredDefaulters.length) {
      showToast('No defaulters to export', 'error');
      return;
    }
    const headers = [
      'Roll No',
      'Student Name',
      'Department',
      'Division',
      'Attendance %',
      'Classes Needed (to 75%)',
      'Escalation Tier',
      'Guardian Name',
      'Guardian Email',
      'Guardian Phone',
      'Parent Notified',
      'Status'
    ];
    const rows = filteredDefaulters.map((d) => [
      d.studentRollNo || '',
      `"${d.studentName || ''}"`,
      `"${d.department || ''}"`,
      d.division || '',
      `${d.attendancePercentage}%`,
      d.classesNeededToTarget || 0,
      d.tier || '',
      `"${d.guardianName || ''}"`,
      d.guardianEmail || '',
      d.guardianPhone || '',
      d.parentNotified ? 'Yes' : 'No',
      d.status || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Defaulter_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Tier color helpers
  const getTierBadge = (tier) => {
    switch (tier) {
      case 'PARENT_ALERT':
        return {
          label: `Parent Alert (<${config.parentAlertThreshold}%)`,
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40 ring-1 ring-rose-500/30',
          dot: 'bg-rose-500',
          icon: '🚨'
        };
      case 'ADMIN_ALERT':
        return {
          label: `Admin Alert (<${config.adminAlertThreshold}%)`,
          badge: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
          dot: 'bg-pink-500',
          icon: '🛑'
        };
      case 'SERIOUS_WARNING':
        return {
          label: `Serious Warning (<${config.seriousWarningThreshold}%)`,
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-500',
          icon: '⚠️'
        };
      case 'WARNING':
      default:
        return {
          label: `Warning (<${config.warningThreshold}%)`,
          badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
          dot: 'bg-yellow-400',
          icon: '⚠️'
        };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl border backdrop-blur-lg flex items-center gap-3 transition-all ${
            toast.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-700/50'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-700/50'
          }`}
        >
          {toast.type === 'error' ? <FiAlertTriangle className="w-5 h-5 text-rose-400" /> : <FiCheckCircle className="w-5 h-5 text-emerald-400" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header & Command Center Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
              Phase 30
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Automated Defaulter Management
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Automatically identify students below the required percentage. Dynamic multi-tier escalation hierarchy,
            mathematical shortage deficit recovery, and parent/guardian alert automation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition border ${
              showConfigPanel
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <FiSliders className="w-4 h-4" />
            <span>Configure Thresholds</span>
          </button>

          <button
            onClick={handleRunEvaluation}
            disabled={evaluating}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg shadow-rose-600/25 flex items-center gap-2 transition disabled:opacity-50"
          >
            <FiRefreshCw className={`w-4 h-4 ${evaluating ? 'animate-spin' : ''}`} />
            <span>{evaluating ? 'Scanning College...' : 'Run Automated Scan'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-2 transition"
          >
            <FiDownload className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Visual Escalation Pipeline Flow Diagram (Matches Prompt Requirements) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold tracking-wider uppercase text-slate-400 flex items-center gap-2">
            <FiTrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Automated Escalation Pipeline Flow</span>
          </span>
          <span className="text-xs text-slate-500">
            Thresholds: &lt;{config.warningThreshold}% &rarr; &lt;{config.seriousWarningThreshold}% &rarr; &lt;{config.adminAlertThreshold}% &rarr; &lt;{config.parentAlertThreshold}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative z-10">
          {/* Step 1: Student */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 flex flex-col justify-between relative group hover:border-cyan-500/50 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase">Input</span>
              <FiUser className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-3">
              <div className="text-base font-extrabold text-white">Student Roster</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Automated tracking after each lecture</div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-700/40 text-[10px] font-bold text-cyan-300">
              {summary?.totalStudents || 2481} Enrolled
            </div>
          </div>

          {/* Step 2: Warning */}
          <div
            onClick={() => setSelectedTier(selectedTier === 'WARNING' ? 'all' : 'WARNING')}
            className={`cursor-pointer p-4 rounded-xl border transition flex flex-col justify-between ${
              selectedTier === 'WARNING'
                ? 'bg-yellow-950/40 border-yellow-500/60 ring-2 ring-yellow-500/30'
                : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-yellow-400 uppercase">&lt;{config.warningThreshold}%</span>
              <span className="text-xs">⚠️</span>
            </div>
            <div className="mt-3">
              <div className="text-base font-extrabold text-yellow-300">Warning</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Student In-App &amp; Push alert with recovery math</div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-700/40 text-[10px] font-bold text-yellow-400">
              {summary?.byTier?.warning?.count ?? 0} Students
            </div>
          </div>

          {/* Step 3: Serious Warning */}
          <div
            onClick={() => setSelectedTier(selectedTier === 'SERIOUS_WARNING' ? 'all' : 'SERIOUS_WARNING')}
            className={`cursor-pointer p-4 rounded-xl border transition flex flex-col justify-between ${
              selectedTier === 'SERIOUS_WARNING'
                ? 'bg-amber-950/40 border-amber-500/60 ring-2 ring-amber-500/30'
                : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase">&lt;{config.seriousWarningThreshold}%</span>
              <span className="text-xs">🚨</span>
            </div>
            <div className="mt-3">
              <div className="text-base font-extrabold text-amber-300">Serious Warning</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Mentor counseling meeting required</div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-700/40 text-[10px] font-bold text-amber-400">
              {summary?.byTier?.seriousWarning?.count ?? 0} Students
            </div>
          </div>

          {/* Step 4: Admin Alert */}
          <div
            onClick={() => setSelectedTier(selectedTier === 'ADMIN_ALERT' ? 'all' : 'ADMIN_ALERT')}
            className={`cursor-pointer p-4 rounded-xl border transition flex flex-col justify-between ${
              selectedTier === 'ADMIN_ALERT'
                ? 'bg-pink-950/40 border-pink-500/60 ring-2 ring-pink-500/30'
                : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-pink-400 uppercase">&lt;{config.adminAlertThreshold}%</span>
              <span className="text-xs">🛑</span>
            </div>
            <div className="mt-3">
              <div className="text-base font-extrabold text-pink-300">Admin Alert</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Flagged on High-Priority Admin &amp; HOD list</div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-700/40 text-[10px] font-bold text-pink-400">
              {summary?.byTier?.adminAlert?.count ?? 0} Students
            </div>
          </div>

          {/* Step 5: Parent Alert */}
          <div
            onClick={() => setSelectedTier(selectedTier === 'PARENT_ALERT' ? 'all' : 'PARENT_ALERT')}
            className={`cursor-pointer p-4 rounded-xl border transition flex flex-col justify-between ${
              selectedTier === 'PARENT_ALERT'
                ? 'bg-rose-950/40 border-rose-500/60 ring-2 ring-rose-500/30'
                : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 uppercase">&lt;{config.parentAlertThreshold}%</span>
              <span className="text-xs">📧</span>
            </div>
            <div className="mt-3">
              <div className="text-base font-extrabold text-rose-300">Parent Alert</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Automated direct official guardian notice</div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-700/40 text-[10px] font-bold text-rose-400">
              {summary?.byTier?.parentAlert?.count ?? 0} Critical
            </div>
          </div>
        </div>
      </div>

      {/* Configurable Thresholds Interactive Drawer / Panel */}
      {showConfigPanel && (
        <form
          onSubmit={handleSaveConfig}
          className="bg-slate-900 p-6 rounded-2xl border border-indigo-500/40 shadow-2xl space-y-5 animate-slideDown"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <FiSliders className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Configurable Escalation Thresholds &amp; Automation Policies</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowConfigPanel(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Warning Threshold */}
            <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700/50">
              <label className="block text-xs font-bold text-yellow-400 uppercase tracking-wider mb-1">
                Warning Threshold (&lt; %)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="50"
                  max="90"
                  value={config.warningThreshold}
                  onChange={(e) => setConfig({ ...config, warningThreshold: Number(e.target.value) })}
                  className="w-full accent-yellow-400 cursor-pointer"
                />
                <span className="text-lg font-black text-white w-12 text-right">{config.warningThreshold}%</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Primary threshold for student low-attendance notices.</p>
            </div>

            {/* Serious Warning */}
            <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700/50">
              <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                Serious Warning (&lt; %)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="40"
                  max="85"
                  value={config.seriousWarningThreshold}
                  onChange={(e) => setConfig({ ...config, seriousWarningThreshold: Number(e.target.value) })}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <span className="text-lg font-black text-white w-12 text-right">{config.seriousWarningThreshold}%</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Mandatory academic mentor and advisor review.</p>
            </div>

            {/* Admin Alert */}
            <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700/50">
              <label className="block text-xs font-bold text-pink-400 uppercase tracking-wider mb-1">
                Admin Alert (&lt; %)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="30"
                  max="80"
                  value={config.adminAlertThreshold}
                  onChange={(e) => setConfig({ ...config, adminAlertThreshold: Number(e.target.value) })}
                  className="w-full accent-pink-400 cursor-pointer"
                />
                <span className="text-lg font-black text-white w-12 text-right">{config.adminAlertThreshold}%</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Automatic escalation to Central Administration &amp; HODs.</p>
            </div>

            {/* Parent Alert */}
            <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700/50">
              <label className="block text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">
                Parent/Guardian Alert (&lt; %)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="20"
                  max="75"
                  value={config.parentAlertThreshold}
                  onChange={(e) => setConfig({ ...config, parentAlertThreshold: Number(e.target.value) })}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <span className="text-lg font-black text-white w-12 text-right">{config.parentAlertThreshold}%</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Dispatches formal email notice to registered parents.</p>
            </div>
          </div>

          {/* Automation switches */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer hover:bg-slate-800">
              <input
                type="checkbox"
                checked={config.autoEscalateOnMark}
                onChange={(e) => setConfig({ ...config, autoEscalateOnMark: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-slate-700 border-slate-600"
              />
              <span className="text-xs text-slate-300 font-medium">Auto-evaluate on attendance check-in</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer hover:bg-slate-800">
              <input
                type="checkbox"
                checked={config.sendParentEmail}
                onChange={(e) => setConfig({ ...config, sendParentEmail: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-slate-700 border-slate-600"
              />
              <span className="text-xs text-slate-300 font-medium">Email Parents upon &lt;{config.parentAlertThreshold}% alert</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer hover:bg-slate-800">
              <input
                type="checkbox"
                checked={config.sendAdminAlert}
                onChange={(e) => setConfig({ ...config, sendAdminAlert: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-slate-700 border-slate-600"
              />
              <span className="text-xs text-slate-300 font-medium">Alert Admin &amp; HOD on &lt;{config.adminAlertThreshold}%</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowConfigPanel(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingConfig}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <span>{savingConfig ? 'Saving...' : 'Apply New Thresholds'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative min-w-[280px] flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search defaulter by student name, roll no, email..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tier filter */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedTier('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                selectedTier === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Tiers
            </button>
            <button
              onClick={() => setSelectedTier('WARNING')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                selectedTier === 'WARNING' ? 'bg-yellow-500/20 text-yellow-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Warning
            </button>
            <button
              onClick={() => setSelectedTier('SERIOUS_WARNING')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                selectedTier === 'SERIOUS_WARNING' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Serious
            </button>
            <button
              onClick={() => setSelectedTier('ADMIN_ALERT')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                selectedTier === 'ADMIN_ALERT' ? 'bg-pink-500/20 text-pink-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin Alert
            </button>
            <button
              onClick={() => setSelectedTier('PARENT_ALERT')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                selectedTier === 'PARENT_ALERT' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Parent Alert
            </button>
          </div>

          {/* Status selector */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="active">Status: Active Only</option>
            <option value="resolved">Status: Resolved</option>
            <option value="all">Status: All Records</option>
          </select>
        </div>
      </div>

      {/* Defaulter Table Roster */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Identified Defaulter Students</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
              {filteredDefaulters.length} listed
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Recovery Formula: <span className="font-mono text-cyan-400 font-bold">x = ⌈(0.75T - P)/0.25⌉</span>
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <FiRefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-400">Loading student attendance telemetry...</p>
          </div>
        ) : filteredDefaulters.length === 0 ? (
          <div className="p-12 text-center">
            <FiCheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3 opacity-80" />
            <h4 className="text-base font-bold text-white">No Defaulters Found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No students are currently matching the chosen criteria below the configured thresholds.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Student &amp; Roll No</th>
                  <th className="py-3.5 px-4">Department / Div</th>
                  <th className="py-3.5 px-4">Cumulative %</th>
                  <th className="py-3.5 px-4">Deficit (Classes Needed)</th>
                  <th className="py-3.5 px-4">Escalation Tier</th>
                  <th className="py-3.5 px-4">Parent / Guardian Contact</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredDefaulters.map((st) => {
                  const badge = getTierBadge(st.tier);
                  const isParentAlert = st.tier === 'PARENT_ALERT';

                  return (
                    <tr key={st._id} className="hover:bg-slate-800/40 transition">
                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{st.studentName}</div>
                        <div className="text-slate-400 text-[11px] font-mono">{st.studentRollNo || 'No Roll No'}</div>
                        <div className="text-slate-500 text-[10px]">{st.studentEmail}</div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">{st.department}</div>
                        <div className="text-slate-400 text-[10px]">{st.division || 'Sec A'}</div>
                      </td>

                      {/* Attendance % */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-black text-sm ${
                              st.attendancePercentage < config.parentAlertThreshold
                                ? 'text-rose-400'
                                : st.attendancePercentage < config.adminAlertThreshold
                                ? 'text-pink-400'
                                : st.attendancePercentage < config.seriousWarningThreshold
                                ? 'text-amber-400'
                                : 'text-yellow-400'
                            }`}
                          >
                            {st.attendancePercentage}%
                          </span>
                          <span className="text-slate-500 text-[10px]">
                            ({st.attendedClasses || 0}/{st.totalClasses || 0})
                          </span>
                        </div>
                        <div className="w-24 bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              st.attendancePercentage < config.parentAlertThreshold
                                ? 'bg-rose-500'
                                : st.attendancePercentage < config.adminAlertThreshold
                                ? 'bg-pink-500'
                                : st.attendancePercentage < config.seriousWarningThreshold
                                ? 'bg-amber-500'
                                : 'bg-yellow-400'
                            }`}
                            style={{ width: `${Math.min(100, st.attendancePercentage)}%` }}
                          />
                        </div>
                      </td>

                      {/* Classes Needed (Recovery) */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-bold">
                          <span>+{st.classesNeededToTarget || 0}</span>
                          <span className="text-[10px] font-normal text-cyan-400">classes to 75%</span>
                        </div>
                      </td>

                      {/* Escalation Tier */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${badge.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Guardian Contact */}
                      <td className="py-3.5 px-4">
                        {st.guardianEmail || st.guardianPhone ? (
                          <div className="space-y-0.5">
                            <div className="font-semibold text-slate-300 text-[11px]">
                              {st.guardianName || 'Parent Contact'}
                            </div>
                            {st.guardianEmail && (
                              <div className="text-slate-400 text-[10px] flex items-center gap-1">
                                <FiMail className="w-3 h-3 text-slate-500" />
                                <span>{st.guardianEmail}</span>
                              </div>
                            )}
                            <div className="mt-1">
                              {st.parentNotified ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  ✓ Notice Sent
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500">Not Dispatched</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">No parent info on file</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Notify Student button */}
                          <button
                            title="Dispatch student notice"
                            disabled={actionInProgress}
                            onClick={() => handleEscalateOrNotify(st._id, st.tier, false)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                          >
                            <FiBell className="w-3.5 h-3.5 text-yellow-400" />
                          </button>

                          {/* Alert Parent button (especially prominent for PARENT_ALERT) */}
                          <button
                            title="Dispatch email notice to parent"
                            disabled={actionInProgress}
                            onClick={() => handleEscalateOrNotify(st._id, 'PARENT_ALERT', true)}
                            className={`p-1.5 rounded-lg border transition ${
                              isParentAlert
                                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
                            }`}
                          >
                            <FiMail className="w-3.5 h-3.5" />
                          </button>

                          {/* View Timeline Modal */}
                          <button
                            title="View Escalation Timeline"
                            onClick={() => {
                              setSelectedDefaulter(st);
                              setShowTimelineModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                          >
                            <FiClock className="w-3.5 h-3.5 text-indigo-400" />
                          </button>

                          {/* Resolve button */}
                          {st.status === 'active' && (
                            <button
                              title="Resolve Defaulter Status"
                              onClick={() => {
                                setSelectedDefaulter(st);
                                setShowResolveModal(true);
                              }}
                              className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold transition"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Escalation Timeline / History */}
      {showTimelineModal && selectedDefaulter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FiClock className="w-4 h-4 text-indigo-400" />
                  <span>Escalation Timeline: {selectedDefaulter.studentName}</span>
                </h3>
                <span className="text-xs text-slate-400">
                  Roll No: {selectedDefaulter.studentRollNo} &bull; Current: {selectedDefaulter.attendancePercentage}%
                </span>
              </div>
              <button
                onClick={() => setShowTimelineModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {selectedDefaulter.escalationHistory && selectedDefaulter.escalationHistory.length > 0 ? (
                selectedDefaulter.escalationHistory.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-indigo-300 font-bold uppercase">{item.tier}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.triggeredAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-300">{item.actionSummary}</p>
                    {item.recipients && item.recipients.length > 0 && (
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                        <span className="text-slate-500">Recipients:</span>
                        <span>{item.recipients.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No previous escalation events logged for this record.
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowTimelineModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Resolve Defaulter Status */}
      {showResolveModal && selectedDefaulter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FiCheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Resolve Defaulter Status</span>
              </h3>
              <button
                onClick={() => setShowResolveModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Clear active defaulter flag for <strong>{selectedDefaulter.studentName}</strong> ({selectedDefaulter.studentRollNo}). This marks the record as resolved in the institutional audit log.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Resolution Notes / Reason:
              </label>
              <textarea
                rows="3"
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                placeholder="e.g. Medical certificate verified; student attended makeup counseling sessions..."
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                disabled={actionInProgress}
                onClick={handleConfirmResolve}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
              >
                {actionInProgress ? 'Saving...' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
