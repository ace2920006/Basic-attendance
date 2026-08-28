import React, { useState, useEffect } from 'react';
import {
  FiSliders,
  FiShield,
  FiCheckCircle,
  FiAlertTriangle,
  FiRotateCcw,
  FiSave,
  FiPlay,
  FiClock,
  FiMapPin,
  FiInfo,
  FiLayers,
  FiActivity
} from 'react-icons/fi';
import { HiOutlineQrCode } from 'react-icons/hi2';
import {
  getAttendanceRulesApi,
  updateAttendanceRulesApi,
  resetAttendanceRulesApi,
  evaluateRuleSandboxApi
} from '../../services/api';

const DEFAULT_STATUS_CONFIGS = [
  { status: 'Present', label: 'Present', countsAsAttended: true, countsAsConducted: true, attendanceWeight: 1.0, badgeColor: '#10B981', description: 'On time attendance' },
  { status: 'Absent', label: 'Absent', countsAsAttended: false, countsAsConducted: true, attendanceWeight: 0.0, badgeColor: '#EF4444', description: 'Unexcused absence' },
  { status: 'Late', label: 'Late Arrival', countsAsAttended: true, countsAsConducted: true, attendanceWeight: 0.8, badgeColor: '#F59E0B', description: 'Arrived past grace period' },
  { status: 'Excused', label: 'Excused Absence', countsAsAttended: true, countsAsConducted: true, attendanceWeight: 1.0, badgeColor: '#8B5CF6', description: 'Approved official exception' },
  { status: 'On Leave', label: 'On Approved Leave', countsAsAttended: false, countsAsConducted: false, attendanceWeight: 0.0, badgeColor: '#3B82F6', description: 'Approved leave of absence' },
  { status: 'Holiday', label: 'Institutional Holiday', countsAsAttended: false, countsAsConducted: false, attendanceWeight: 0.0, badgeColor: '#6B7280', description: 'Scheduled holiday' },
  { status: 'Cancelled Lecture', label: 'Cancelled Lecture', countsAsAttended: false, countsAsConducted: false, attendanceWeight: 0.0, badgeColor: '#EC4899', description: 'Lecture cancelled' }
];

export default function AdminRulesEngine() {
  const [activeTab, setActiveTab] = useState('thresholds');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState(null);

  // System Rules Form State
  const [rules, setRules] = useState({
    minAttendancePercentage: 75,
    lateThresholdMinutes: 10,
    gracePeriodMinutes: 5,
    qrValidityMinutes: 1,
    gpsRadiusMeters: 100,
    autoMarkAbsentMinutes: 30,
    allowStudentSelfCheckIn: true,
    consecutiveAbsentAlertThreshold: 3,
    statusConfigs: DEFAULT_STATUS_CONFIGS
  });

  // Sandbox Simulator State
  const [simForm, setSimForm] = useState({
    delayMinutes: 3,
    gpsDistance: 45,
    qrAgeSeconds: 20
  });
  const [simResult, setSimResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await getAttendanceRulesApi();
      if (res.success && res.data) {
        setRules({
          ...res.data,
          statusConfigs: res.data.statusConfigs?.length ? res.data.statusConfigs : DEFAULT_STATUS_CONFIGS
        });
      }
    } catch (err) {
      showToast(err.message || 'Failed to load system attendance rules', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRules = async () => {
    try {
      setSaving(true);
      const res = await updateAttendanceRulesApi(rules);
      if (res.success) {
        showToast('Attendance Rules & Status Matrix saved successfully!');
        if (res.data) {
          setRules(res.data);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to save attendance rules', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Are you sure you want to reset all attendance rules to factory default settings?')) {
      return;
    }
    try {
      setResetting(true);
      const res = await resetAttendanceRulesApi();
      if (res.success) {
        showToast('Rules reset to factory default configurations!');
        if (res.data) setRules(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to reset rules', 'error');
    } finally {
      setResetting(false);
    }
  };

  const handleStatusConfigChange = (index, field, value) => {
    const updated = [...rules.statusConfigs];
    updated[index] = { ...updated[index], [field]: value };
    setRules({ ...rules, statusConfigs: updated });
  };

  const handleRunSimulator = async () => {
    try {
      setSimulating(true);
      const now = new Date();
      const classStartTime = new Date(now.getTime() - simForm.delayMinutes * 60 * 1000).toISOString();
      const qrTimestamp = new Date(now.getTime() - simForm.qrAgeSeconds * 1000).toISOString();

      const res = await evaluateRuleSandboxApi({
        classStartTime,
        checkInTime: now.toISOString(),
        gpsDistance: Number(simForm.gpsDistance),
        qrTimestamp
      });

      if (res.success && res.data) {
        setSimResult(res.data.evaluationResult);
      }
    } catch (err) {
      showToast(err.message || 'Simulation execution failed', 'error');
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] text-gray-500">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium">Loading Rules Engine Console...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-xl flex items-center space-x-3 text-white text-sm font-medium transition-all ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
          }`}
        >
          {toast.type === 'error' ? <FiAlertTriangle className="w-5 h-5" /> : <FiCheckCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-indigo-900/40">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 bg-indigo-600/30 rounded-xl border border-indigo-500/40 text-indigo-400">
            <FiSliders className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Advanced Attendance Rules Engine
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Phase 19 Active
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Configure institution-wide attendance thresholds, GPS geofencing, QR code validity, and 7-status rule weights.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={handleResetDefaults}
            disabled={resetting || saving}
            className="flex-1 md:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium border border-slate-700/60 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <FiRotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleSaveRules}
            disabled={saving || resetting}
            className="flex-1 md:flex-none px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Rules'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-xl px-3 pt-2 shadow-sm space-x-2">
        <button
          onClick={() => setActiveTab('thresholds')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'thresholds'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FiClock className="w-4 h-4" />
          <span>Thresholds & Timings</span>
        </button>
        <button
          onClick={() => setActiveTab('statusMatrix')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'statusMatrix'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FiLayers className="w-4 h-4" />
          <span>Status Matrix Rules (7 Statuses)</span>
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'simulator'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FiActivity className="w-4 h-4" />
          <span>Rule Simulator / Sandbox</span>
        </button>
      </div>

      {/* TAB 1: THRESHOLDS & TIMING RULES */}
      {activeTab === 'thresholds' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Minimum Attendance Percentage */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <FiShield className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-emerald-600">
                {rules.minAttendancePercentage}%
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Minimum Required Attendance</h3>
              <p className="text-xs text-gray-500 mt-1">
                Threshold for exam eligibility and low-attendance defaulter warnings.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <input
                type="range"
                min="50"
                max="100"
                step="1"
                value={rules.minAttendancePercentage}
                onChange={(e) => setRules({ ...rules, minAttendancePercentage: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>50%</span>
                <span>75% (Standard)</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Card 2: Late Cutoff Threshold */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <FiClock className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-amber-600">
                {rules.lateThresholdMinutes} mins
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Late Cutoff Threshold</h3>
              <p className="text-xs text-gray-500 mt-1">
                Check-in delay past this threshold automatically flags arrival as Absent.
              </p>
            </div>
            <div className="pt-2">
              <input
                type="number"
                min="0"
                max="60"
                value={rules.lateThresholdMinutes}
                onChange={(e) => setRules({ ...rules, lateThresholdMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Card 3: On-Time Grace Period */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <FiCheckCircle className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-indigo-600">
                {rules.gracePeriodMinutes} mins
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">On-Time Grace Period</h3>
              <p className="text-xs text-gray-500 mt-1">
                Arrivals within this grace period are marked 100% Present.
              </p>
            </div>
            <div className="pt-2">
              <input
                type="number"
                min="0"
                max="30"
                value={rules.gracePeriodMinutes}
                onChange={(e) => setRules({ ...rules, gracePeriodMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Card 4: Dynamic QR Token Validity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                <HiOutlineQrCode className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-purple-600">
                {rules.qrValidityMinutes} min ({Math.round(rules.qrValidityMinutes * 60)}s)
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">QR Code Validity Duration</h3>
              <p className="text-xs text-gray-500 mt-1">
                Life span of generated dynamic QR codes before token refresh is required.
              </p>
            </div>
            <div className="pt-2">
              <input
                type="number"
                step="0.25"
                min="0.25"
                max="10"
                value={rules.qrValidityMinutes}
                onChange={(e) => setRules({ ...rules, qrValidityMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Card 5: GPS Campus Geofence Radius */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <FiMapPin className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {rules.gpsRadiusMeters} meters
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">GPS Geofence Allowed Radius</h3>
              <p className="text-xs text-gray-500 mt-1">
                Maximum allowed distance from classroom location for GPS verification.
              </p>
            </div>
            <div className="pt-2">
              <input
                type="number"
                min="10"
                max="2000"
                step="10"
                value={rules.gpsRadiusMeters}
                onChange={(e) => setRules({ ...rules, gpsRadiusMeters: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Card 6: Auto-Mark Absent Timing */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                <FiAlertTriangle className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-rose-600">
                {rules.autoMarkAbsentMinutes} mins
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Auto-Absent Enforcement Delay</h3>
              <p className="text-xs text-gray-500 mt-1">
                Minutes after lecture start when remaining uncheck-in students flag Absent.
              </p>
            </div>
            <div className="pt-2">
              <input
                type="number"
                min="5"
                max="120"
                value={rules.autoMarkAbsentMinutes}
                onChange={(e) => setRules({ ...rules, autoMarkAbsentMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Card 7: Student Self Check-in Toggle */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4 lg:col-span-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <FiInfo className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Student Self-Service QR & GPS Check-In</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Allow students to scan QR codes and submit GPS verification from their personal mobile/desktop web devices.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rules.allowStudentSelfCheckIn}
                onChange={(e) => setRules({ ...rules, allowStudentSelfCheckIn: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      )}

      {/* TAB 2: ADVANCED STATUS MATRIX RULES */}
      {activeTab === 'statusMatrix' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Advanced 7-Status Attendance Matrix</h2>
            <p className="text-xs text-gray-500 mt-1">
              Configure attendance calculation inclusion (`countsAsAttended`, `countsAsConducted`), weighting, and badge colors.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 bg-slate-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Status Key</th>
                  <th className="py-3 px-4">Display Label</th>
                  <th className="py-3 px-4 text-center">Attended?</th>
                  <th className="py-3 px-4 text-center">Conducted?</th>
                  <th className="py-3 px-4">Weight (0-1.0)</th>
                  <th className="py-3 px-4">Badge Color</th>
                  <th className="py-3 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {rules.statusConfigs.map((cfg, index) => (
                  <tr key={cfg.status} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-gray-800">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cfg.badgeColor }}
                        ></span>
                        <span>{cfg.status}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <input
                        type="text"
                        value={cfg.label}
                        onChange={(e) => handleStatusConfigChange(index, 'label', e.target.value)}
                        className="px-2.5 py-1 border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-indigo-500 w-36"
                      />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={cfg.countsAsAttended}
                        onChange={(e) => handleStatusConfigChange(index, 'countsAsAttended', e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={cfg.countsAsConducted}
                        onChange={(e) => handleStatusConfigChange(index, 'countsAsConducted', e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2 w-32">
                        <input
                          type="range"
                          min="0"
                          max="1.0"
                          step="0.1"
                          value={cfg.attendanceWeight}
                          onChange={(e) => handleStatusConfigChange(index, 'attendanceWeight', Number(e.target.value))}
                          className="w-full accent-indigo-600"
                        />
                        <span className="text-xs font-semibold w-8 text-right">{cfg.attendanceWeight}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={cfg.badgeColor}
                          onChange={(e) => handleStatusConfigChange(index, 'badgeColor', e.target.value)}
                          className="w-7 h-7 rounded border-none cursor-pointer"
                        />
                        <span className="text-xs font-mono text-gray-500">{cfg.badgeColor}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500">
                      <input
                        type="text"
                        value={cfg.description}
                        onChange={(e) => handleStatusConfigChange(index, 'description', e.target.value)}
                        className="px-2.5 py-1 border border-gray-200 rounded-lg text-xs w-full focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RULE SIMULATOR / SANDBOX */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Simulator Controls */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <FiPlay className="w-5 h-5 text-indigo-600" />
                <span>Interactive Check-In Rule Sandbox</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Test how the attendance engine evaluates check-in attempts given specific delay times, GPS distances, and QR token ages.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Arrival Delay (Minutes since Lecture Start)
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={simForm.delayMinutes}
                  onChange={(e) => setSimForm({ ...simForm, delayMinutes: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Current Grace Period: {rules.gracePeriodMinutes}m | Late Cutoff: {rules.lateThresholdMinutes}m
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Student GPS Distance from Classroom (Meters)
                </label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={simForm.gpsDistance}
                  onChange={(e) => setSimForm({ ...simForm, gpsDistance: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Current Allowed GPS Radius: {rules.gpsRadiusMeters} meters
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  QR Token Age (Seconds since QR Generation)
                </label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={simForm.qrAgeSeconds}
                  onChange={(e) => setSimForm({ ...simForm, qrAgeSeconds: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Current QR Expiry: {rules.qrValidityMinutes * 60} seconds
                </p>
              </div>

              <button
                onClick={handleRunSimulator}
                disabled={simulating}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <FiPlay className="w-4 h-4" />
                <span>{simulating ? 'Evaluating...' : 'Run Check-In Evaluation'}</span>
              </button>
            </div>
          </div>

          {/* Simulation Output Panel */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-5 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-200 text-sm flex items-center space-x-2">
                  <FiActivity className="w-4 h-4 text-emerald-400" />
                  <span>Evaluation Output</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">Status Output</span>
              </div>

              {simResult ? (
                <div className="space-y-4 mt-4">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase shadow-md ${
                        simResult.status === 'Present'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : simResult.status === 'Late'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-red-500/20 text-red-400 border border-red-500/40'
                      }`}
                    >
                      {simResult.status}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Valid: {simResult.isValid ? 'YES' : 'NO'}
                    </span>
                  </div>

                  <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 space-y-2 text-xs text-slate-300">
                    <p className="font-medium text-slate-200">{simResult.message}</p>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/60 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-400">Delay:</span> {simResult.delayMinutes} mins
                      </div>
                      <div>
                        <span className="text-slate-400">GPS Distance:</span> {Math.round(simResult.distanceMeters)}m
                      </div>
                      <div>
                        <span className="text-slate-400">Grace Check:</span> {simResult.isWithinGracePeriod ? 'Passed' : 'Exceeded'}
                      </div>
                      <div>
                        <span className="text-slate-400">Late Cutoff Check:</span> {simResult.isWithinLateThreshold ? 'Passed' : 'Exceeded'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Click "Run Check-In Evaluation" to simulate rules execution.
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2">
              <FiInfo className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>Rules evaluate in real-time on student QR scan and teacher attendance submissions.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
