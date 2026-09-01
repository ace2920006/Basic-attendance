import React, { useState, useEffect } from 'react';
import {
  FiTrendingUp,
  FiCheckCircle,
  FiAlertTriangle,
  FiClock,
  FiSlash,
  FiSliders,
  FiInfo,
  FiZap,
  FiBookOpen,
  FiRefreshCw,
  FiCalendar,
  FiMinusCircle,
  FiPlusCircle,
  FiArrowRight,
  FiTarget,
  FiShield,
  FiActivity
} from 'react-icons/fi';
import { getStudentForecastApi, calculateForecastApi } from '../../services/api';

export default function AttendancePrediction() {
  const [loading, setLoading] = useState(true);
  const [forecastData, setForecastData] = useState(null);
  const [error, setError] = useState(null);

  // Global settings
  const [targetPercent, setTargetPercent] = useState(75);
  const [futureHorizon, setFutureHorizon] = useState(15);
  const [activeTab, setActiveTab] = useState('can_i_skip'); // 'can_i_skip' | 'safe_misses' | 'recovery_planner'

  // Tab 1: "Can I Skip?" State
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [skipCount, setSkipCount] = useState(2);
  const [attendCount, setAttendCount] = useState(0);
  const [customAttended, setCustomAttended] = useState(17);
  const [customTotal, setCustomTotal] = useState(25);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  // Tab 2: "How Many Can I Miss?" Custom Sandbox
  const [missSandboxAttended, setMissSandboxAttended] = useState(18);
  const [missSandboxTotal, setMissSandboxTotal] = useState(20);

  // Tab 3: "How Many Must I Attend?" Custom Sandbox
  const [attendSandboxAttended, setAttendSandboxAttended] = useState(17);
  const [attendSandboxTotal, setAttendSandboxTotal] = useState(25);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStudentForecastApi({
        target: targetPercent,
        future: futureHorizon
      });
      if (res?.success && res?.data) {
        setForecastData(res.data);
      } else {
        setError('Failed to compute attendance forecast.');
      }
    } catch (err) {
      setError(err.message || 'Error fetching forecast data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [targetPercent, futureHorizon]);

  // Run "Can I Skip?" calculation
  const runSkipSimulation = async () => {
    setSimLoading(true);
    try {
      let P = customAttended;
      let T = customTotal;
      let subjName = 'Custom Scenario';

      if (!isCustomMode && forecastData) {
        if (selectedSubjectId === 'all') {
          P = forecastData.overallForecast.current.attended;
          T = forecastData.overallForecast.current.conducted;
          subjName = 'Overall Cumulative Attendance';
        } else {
          const matched = forecastData.subjects.find((s) => s.subject === selectedSubjectId);
          if (matched) {
            P = matched.current.attended;
            T = matched.current.conducted;
            subjName = matched.subject;
          }
        }
      }

      const res = await calculateForecastApi({
        attended: P,
        total: T,
        targetPercentage: targetPercent,
        futureClasses: futureHorizon,
        skipCount,
        attendCount,
        subject: subjName
      });

      if (res?.success && res?.data) {
        setSimResult(res.data.canSkipAnalysis);
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimLoading(false);
    }
  };

  useEffect(() => {
    if (forecastData || isCustomMode) {
      runSkipSimulation();
    }
  }, [selectedSubjectId, skipCount, attendCount, isCustomMode, customAttended, customTotal, targetPercent, forecastData]);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl animate-spin">
          <FiZap className="w-8 h-8 text-indigo-400" />
        </div>
        <p className="text-sm font-medium text-slate-400">Computing Attendance Forecasting Trajectories & Scenarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl inline-block">
          <FiAlertTriangle className="w-8 h-8 text-rose-400" />
        </div>
        <h3 className="text-lg font-bold text-white">Forecasting Computation Failed</h3>
        <p className="text-xs text-slate-400">{error}</p>
        <button
          onClick={fetchForecast}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { summary, overallForecast, subjects = [] } = forecastData || {};

  // Pure helper calculations for Sandboxes
  const calculateSandboxMisses = (P, T, r) => {
    if (T === 0 || (P * 100) < r * T) return 0;
    return Math.max(0, Math.floor((100 * P - r * T) / r));
  };

  const calculateSandboxNeeded = (P, T, r) => {
    if (T === 0 || (P * 100) >= r * T) return 0;
    if (r >= 100) return P === T ? 0 : Infinity;
    return Math.max(1, Math.ceil((r * T - 100 * P) / (100 - r)));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Guaranteed':
        return <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold flex items-center gap-1.5"><FiCheckCircle className="w-3.5 h-3.5" /> Safe & Compliant</span>;
      case 'Achievable':
        return <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-full text-xs font-bold flex items-center gap-1.5"><FiTrendingUp className="w-3.5 h-3.5" /> Target Achievable</span>;
      case 'At Risk':
        return <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-bold flex items-center gap-1.5"><FiAlertTriangle className="w-3.5 h-3.5" /> Shortage Warning</span>;
      default:
        return <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-full text-xs font-bold flex items-center gap-1.5"><FiSlash className="w-3.5 h-3.5" /> Critical / Unreachable</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <FiActivity className="w-4 h-4" /> Phase 26 Engine
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Attendance <span className="gradient-text">Forecasting Engine 📈</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Go beyond current percentages. Simulate skip scenarios, calculate safe lecture miss limits, and plan recovery trajectories.
          </p>
        </div>

        {/* Global Benchmark Selectors */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Target:</span>
            <div className="flex items-center gap-1">
              {[75, 80, 85, 90].map((val) => (
                <button
                  key={val}
                  onClick={() => setTargetPercent(val)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    targetPercent === val
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <button
            onClick={fetchForecast}
            title="Refresh calculations"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Metric Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Overall Attendance</span>
            <FiTrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {summary?.overallPercentage}%
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {overallForecast?.current.attended} present / {overallForecast?.current.conducted} conducted
          </div>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Safe Miss Buffer</span>
            <FiShield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {summary?.overallSafeMisses} <span className="text-sm font-medium text-slate-400">classes</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Can safely miss while staying $\ge {targetPercent}\%$
          </div>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Recovery Needed</span>
            <FiTarget className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            {summary?.overallConsecutiveNeeded} <span className="text-sm font-medium text-slate-400">classes</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Consecutive attendances to reach {targetPercent}%
          </div>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Subjects Status</span>
            <FiBookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">
            <span className="text-emerald-400">{summary?.safeSubjectsCount}</span>
            <span className="text-slate-500 mx-1">/</span>
            <span>{summary?.totalSubjects}</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {summary?.belowTargetCount > 0 ? (
              <span className="text-amber-400">{summary?.belowTargetCount} subject(s) below {targetPercent}%</span>
            ) : (
              <span className="text-emerald-400">All subjects compliant</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Interactive Forecasting Tabs */}
      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        {/* Tab Navigation Bar */}
        <div className="flex border-b border-slate-800/80 bg-slate-950/60 p-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('can_i_skip')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'can_i_skip'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FiZap className="w-4 h-4 text-indigo-400" />
            <span>1. "Can I Skip?" Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('safe_misses')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'safe_misses'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FiShield className="w-4 h-4 text-emerald-400" />
            <span>2. "How Many Can I Miss?" Safe Buffer</span>
          </button>

          <button
            onClick={() => setActiveTab('recovery_planner')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'recovery_planner'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FiTarget className="w-4 h-4 text-amber-400" />
            <span>3. "How Many Must I Attend?" Recovery</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6">
          {/* TAB 1: CAN I SKIP SIMULATOR */}
          {activeTab === 'can_i_skip' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Controls (5 cols) */}
                <div className="lg:col-span-5 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <FiSliders className="w-4 h-4 text-indigo-400" /> Configure Skip Scenario
                    </h3>
                    <button
                      onClick={() => setIsCustomMode(!isCustomMode)}
                      className="text-[11px] text-indigo-400 hover:underline font-semibold"
                    >
                      {isCustomMode ? 'Use Enrolled Subjects' : 'Custom Numbers Mode'}
                    </button>
                  </div>

                  {/* Subject or Custom Mode Inputs */}
                  {!isCustomMode ? (
                    <div>
                      <label className="text-xs font-medium text-slate-400 block mb-1.5">Select Subject:</label>
                      <select
                        value={selectedSubjectId}
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="all">Overall Combined Attendance ({summary?.overallPercentage}%)</option>
                        {subjects.map((s) => (
                          <option key={s.subject} value={s.subject}>
                            {s.subject} ({s.current.percentage}% - {s.current.attended}/{s.current.conducted})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <div>
                        <label className="text-[11px] text-slate-400 font-medium block mb-1">Attended (P):</label>
                        <input
                          type="number"
                          min="0"
                          value={customAttended}
                          onChange={(e) => setCustomAttended(Math.max(0, parseInt(e.target.value, 10) || 0))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 font-medium block mb-1">Total Classes (T):</label>
                        <input
                          type="number"
                          min="1"
                          value={customTotal}
                          onChange={(e) => setCustomTotal(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Classes to Skip Stepper */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-slate-300">Proposed Classes to Skip (b):</label>
                      <span className="text-xs font-black text-rose-400">{skipCount} classes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSkipCount(Math.max(0, skipCount - 1))}
                        className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 transition-colors"
                      >
                        <FiMinusCircle className="w-4 h-4" />
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={skipCount}
                        onChange={(e) => setSkipCount(parseInt(e.target.value, 10))}
                        className="flex-1 accent-rose-500 cursor-pointer"
                      />
                      <button
                        onClick={() => setSkipCount(skipCount + 1)}
                        className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 transition-colors"
                      >
                        <FiPlusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Classes to Attend Stepper */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-slate-300">Proposed Classes to Attend (a):</label>
                      <span className="text-xs font-black text-emerald-400">{attendCount} classes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setAttendCount(Math.max(0, attendCount - 1))}
                        className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 transition-colors"
                      >
                        <FiMinusCircle className="w-4 h-4" />
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={attendCount}
                        onChange={(e) => setAttendCount(parseInt(e.target.value, 10))}
                        className="flex-1 accent-emerald-500 cursor-pointer"
                      />
                      <button
                        onClick={() => setAttendCount(attendCount + 1)}
                        className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 transition-colors"
                      >
                        <FiPlusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] text-slate-400 bg-slate-900/40 p-3 rounded-xl border border-slate-800/50 flex items-start gap-2">
                    <FiInfo className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>Formula: $\text{Projected } \% = \frac{P + a}{T + a + b} \times 100$. Evaluated against your {targetPercent}% target.</span>
                  </div>
                </div>

                {/* Right Simulation Outcome (7 cols) */}
                <div className="lg:col-span-7 bg-gradient-to-br from-slate-950/90 via-slate-900 to-indigo-950/30 p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between space-y-6">
                  {simLoading ? (
                    <div className="py-12 text-center text-slate-400">Computing scenario...</div>
                  ) : simResult ? (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/60">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Scenario Outcome</span>
                          <h2 className="text-xl font-extrabold text-white mt-0.5">
                            {simResult.projected.canSkip ? (
                              <span className="text-emerald-400">✅ Safe to Skip</span>
                            ) : (
                              <span className="text-rose-400">⛔ Skipping Drops You Below {targetPercent}%</span>
                            )}
                          </h2>
                        </div>
                        <div className="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider self-start sm:self-auto bg-slate-900 border border-slate-700">
                          {simResult.projected.statusText}
                        </div>
                      </div>

                      {/* Percentage Shift Display */}
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Current</span>
                          <div className="text-xl font-black text-white mt-1">
                            {simResult.current.percentage}%
                          </div>
                          <span className="text-[10px] text-slate-400">({simResult.current.attended}/{simResult.current.total})</span>
                        </div>

                        <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-800/40 flex flex-col justify-center items-center">
                          <span className="text-[10px] text-indigo-300 uppercase font-semibold">Shift Delta</span>
                          <div className={`text-xl font-black mt-1 ${simResult.projected.percentageDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {simResult.projected.percentageDelta > 0 ? `+${simResult.projected.percentageDelta}%` : `${simResult.projected.percentageDelta}%`}
                          </div>
                        </div>

                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Projected</span>
                          <div className={`text-xl font-black mt-1 ${simResult.projected.canSkip ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {simResult.projected.percentage}%
                          </div>
                          <span className="text-[10px] text-slate-400">({simResult.projected.attended}/{simResult.projected.total})</span>
                        </div>
                      </div>

                      {/* Actionable Advice Banner */}
                      <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                        simResult.projected.canSkip
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      }`}>
                        <div className="font-bold mb-1">
                          {simResult.projected.canSkip ? 'Safe Scenario Analysis:' : 'Risk Warning & Penalty Analysis:'}
                        </div>
                        {simResult.projected.actionableAdvice}
                      </div>

                      {/* Bottom Key Metric Pills */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {simResult.projected.canSkip ? (
                          <span className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300">
                            🛡️ Buffer after this: <strong className="text-emerald-400">{simResult.projected.bufferAfter} more skips</strong>
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300">
                            🎯 Recovery penalty: <strong className="text-rose-400">{simResult.projected.penaltyAfter} consecutive classes</strong>
                          </span>
                        )}
                        <span className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300">
                          🎯 Goal: <strong className="text-white">{targetPercent}% minimum</strong>
                        </span>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SAFE MISS ALLOWANCE (HOW MANY CAN I MISS?) */}
          {activeTab === 'safe_misses' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
                <FiShield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Safe Miss Allowance Theorem:</strong>
                  For any attendance record with $P$ attended out of $T$ conducted, the maximum consecutive lectures you can miss without dropping below target $r$ is:
                  <code className="text-emerald-400 font-bold ml-1">$m = \lfloor \frac{P - rT}{r} \rfloor$</code>.
                </div>
              </div>

              {/* Subject Safe Miss Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((subj) => (
                  <div key={subj.subject} className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{subj.subject}</h4>
                        <span className="text-[11px] text-slate-400">
                          {subj.current.attended} attended / {subj.current.conducted} classes
                        </span>
                      </div>
                      <div className={`text-base font-black ${subj.current.percentage >= targetPercent ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {subj.current.percentage}%
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Safe Miss Allowance</span>
                      <div className="text-2xl font-black text-emerald-400 mt-0.5">
                        {subj.metrics.safeMisses} <span className="text-xs font-normal text-slate-400">consecutive lectures</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {subj.current.percentage >= targetPercent ? (
                        subj.metrics.safeMisses > 0 ? (
                          `You can miss up to ${subj.metrics.safeMisses} consecutive lectures in ${subj.subject} and stay above ${targetPercent}%.`
                        ) : (
                          `You are at exactly ${subj.current.percentage}%. Any absence will drop your ratio below ${targetPercent}%.`
                        )
                      ) : (
                        `Currently below target. 0 safe skips allowed until attendance is restored.`
                      )}
                    </p>
                  </div>
                ))}
              </div>

              {/* Interactive Custom Miss Sandbox */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FiSliders className="w-4 h-4 text-emerald-400" /> Interactive Safe Miss Calculator
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Attended Classes (P):</label>
                    <input
                      type="number"
                      min="0"
                      value={missSandboxAttended}
                      onChange={(e) => setMissSandboxAttended(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Total Classes (T):</label>
                    <input
                      type="number"
                      min="1"
                      value={missSandboxTotal}
                      onChange={(e) => setMissSandboxTotal(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/30 text-center flex flex-col justify-center">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Computed Safe Skips</span>
                    <div className="text-xl font-black text-white">
                      {calculateSandboxMisses(missSandboxAttended, missSandboxTotal, targetPercent)} lectures
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RECOVERY PLANNER (HOW MANY MUST I ATTEND?) */}
          {activeTab === 'recovery_planner' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
                <FiTarget className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Recovery Formula Theorem:</strong>
                  For any shortage where attendance $< r$, the minimum consecutive lectures you must attend with zero absences to recover to $r$ is:
                  <code className="text-amber-400 font-bold ml-1">$x = \lceil \frac{rT - P}{1 - r} \rceil$</code>.
                </div>
              </div>

              {/* Subject Recovery Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((subj) => (
                  <div key={subj.subject} className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{subj.subject}</h4>
                        <span className="text-[11px] text-slate-400">
                          {subj.current.attended} attended / {subj.current.conducted} classes
                        </span>
                      </div>
                      <div className={`text-base font-black ${subj.current.percentage >= targetPercent ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {subj.current.percentage}%
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Recovery Lectures Needed</span>
                      <div className="text-2xl font-black text-amber-400 mt-0.5">
                        {subj.metrics.consecutiveNeeded} <span className="text-xs font-normal text-slate-400">consecutive</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {subj.metrics.consecutiveNeeded > 0 ? (
                        `You must attend the next ${subj.metrics.consecutiveNeeded} consecutive lectures in ${subj.subject} to restore attendance to ${targetPercent}%.`
                      ) : (
                        `Already above ${targetPercent}%. No recovery lectures required.`
                      )}
                    </p>
                  </div>
                ))}
              </div>

              {/* Milestone Ladder Table */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FiTrendingUp className="w-4 h-4 text-indigo-400" /> Milestone Trajectory Ladder (Cumulative)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {overallForecast?.milestones.map((m) => (
                    <div key={m.target} className={`p-3.5 rounded-xl border text-center ${
                      m.isMet
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-slate-900 border-slate-800'
                    }`}>
                      <span className="text-xs font-extrabold text-white">{m.target}% Goal</span>
                      <div className="mt-1 text-sm font-black text-indigo-400">
                        {m.isMet ? (
                          <span className="text-emerald-400 text-xs">Achieved ✅</span>
                        ) : (
                          <span>+{m.consecutiveNeeded} classes</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {m.isMet ? `${m.safeMisses} safe skips` : 'consecutive'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Custom Recovery Sandbox */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FiSliders className="w-4 h-4 text-amber-400" /> Interactive Recovery Calculator
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Attended Classes (P):</label>
                    <input
                      type="number"
                      min="0"
                      value={attendSandboxAttended}
                      onChange={(e) => setAttendSandboxAttended(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Total Classes (T):</label>
                    <input
                      type="number"
                      min="1"
                      value={attendSandboxTotal}
                      onChange={(e) => setAttendSandboxTotal(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="bg-amber-950/30 p-3 rounded-xl border border-amber-500/30 text-center flex flex-col justify-center">
                    <span className="text-[10px] text-amber-400 font-bold uppercase">Consecutive Needed</span>
                    <div className="text-xl font-black text-white">
                      {calculateSandboxNeeded(attendSandboxAttended, attendSandboxTotal, targetPercent)} lectures
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Semester Trajectory Forecast Scenarios Table */}
      <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-indigo-400" /> Future Classes Trajectory Scenarios
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulated projections based on your future attendance performance across remaining classes (~{futureHorizon} per subject).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-emerald-400">100% Future Attendance</span>
            <div className="text-2xl font-black text-white mt-1">
              {overallForecast?.trajectories.maxPossiblePercent}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Best possible final percentage if you attend every remaining class.
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-cyan-400">{targetPercent}% Future Attendance</span>
            <div className="text-2xl font-black text-white mt-1">
              {overallForecast?.trajectories.targetFuturePercent}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Projected final percentage if you maintain exactly your target rate.
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-amber-400">50% Future Attendance</span>
            <div className="text-2xl font-black text-white mt-1">
              {overallForecast?.trajectories.halfFuturePercent}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Projected final percentage if you miss half of upcoming classes.
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-rose-400">0% Future Attendance (Floor)</span>
            <div className="text-2xl font-black text-white mt-1">
              {overallForecast?.trajectories.minFloorPercent}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Absolute minimum percentage floor if you miss all remaining classes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
