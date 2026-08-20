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
  FiRefreshCw
} from 'react-icons/fi';
import { getAttendancePredictionApi } from '../../services/api';

export default function AttendancePrediction() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [targetPercent, setTargetPercent] = useState(75);
  const [simulateRate, setSimulateRate] = useState(80);

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAttendancePredictionApi({ target: targetPercent, remaining: 15 });
      if (res.success) {
        setData(res);
      } else {
        setError('Failed to calculate attendance predictions');
      }
    } catch (err) {
      setError(err.message || 'Error fetching prediction data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, [targetPercent]);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl animate-spin">
          <FiZap className="w-8 h-8 text-indigo-400" />
        </div>
        <p className="text-sm font-medium text-slate-400">Computing AI Attendance Trajectories & Vector Metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl inline-block">
          <FiAlertTriangle className="w-8 h-8 text-rose-400" />
        </div>
        <h3 className="text-lg font-bold text-white">Prediction Computation Failed</h3>
        <p className="text-xs text-slate-400">{error}</p>
        <button
          onClick={fetchPrediction}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { overall, subjectBreakdown, student } = data || {};

  // Calculate simulated overall % based on slider
  const simulatedAttended = Math.round((simulateRate / 100) * (overall?.remainingLectures || 60));
  const simulatedTotalPresent = (overall?.present || 0) + simulatedAttended;
  const simulatedTotalClasses = (overall?.conducted || 0) + (overall?.remainingLectures || 60);
  const simulatedFinalPercent = Number(((simulatedTotalPresent / simulatedTotalClasses) * 100).toFixed(1));

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Guaranteed':
        return <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold flex items-center gap-1.5"><FiCheckCircle className="w-3.5 h-3.5" /> Safe & Guaranteed</span>;
      case 'Achievable':
        return <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-full text-xs font-bold flex items-center gap-1.5"><FiTrendingUp className="w-3.5 h-3.5" /> Achievable Target</span>;
      case 'At Risk':
        return <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-bold flex items-center gap-1.5"><FiAlertTriangle className="w-3.5 h-3.5" /> High Risk</span>;
      default:
        return <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-full text-xs font-bold flex items-center gap-1.5"><FiSlash className="w-3.5 h-3.5" /> Target Unreachable</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <FiZap className="w-4 h-4" /> AI Predictive Analytics
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Attendance Trajectory & <span className="gradient-text">75% Predictor</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulate future attendance, check skip allowances, and optimize your lecture strategy.
          </p>
        </div>

        {/* Target Threshold Selector */}
        <div className="flex items-center gap-3 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Target Benchmark:</span>
          <div className="flex items-center gap-1">
            {[75, 80, 85].map((val) => (
              <button
                key={val}
                onClick={() => setTargetPercent(val)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  targetPercent === val
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {val}%
              </button>
            ))}
          </div>
          <button
            onClick={fetchPrediction}
            title="Refresh calculation"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main AI Prediction Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Status Banner & Key Stats */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 p-6 rounded-3xl border border-slate-800 relative overflow-hidden flex flex-col justify-between space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Can Student Reach {targetPercent}%?</span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Outcome: <strong className={overall?.canReach75 ? 'text-emerald-400' : 'text-rose-400'}>{overall?.canReach75 ? 'YES, CAN REACH' : 'HIGH RISK / AT RISK'}</strong>
              </h2>
            </div>
            <div>{getStatusBadge(overall?.status)}</div>
          </div>

          {/* Key Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Current Attendance</span>
              <span className={`text-2xl font-extrabold ${overall?.currentPercent >= targetPercent ? 'text-emerald-400' : 'text-amber-400'}`}>
                {overall?.currentPercent}%
              </span>
              <span className="block text-[10px] text-slate-400 mt-0.5">{overall?.present} / {overall?.conducted} conducted</span>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Required to Attend</span>
              <span className="text-2xl font-extrabold text-cyan-400">
                {overall?.requiredToAttend}
              </span>
              <span className="block text-[10px] text-slate-400 mt-0.5">Out of ~{overall?.remainingLectures} remaining</span>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Max Skips Allowed</span>
              <span className="text-2xl font-extrabold text-indigo-400">
                {overall?.maxSkips}
              </span>
              <span className="block text-[10px] text-slate-400 mt-0.5">Safe Bunk Margin</span>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Target Benchmark</span>
              <span className="text-2xl font-extrabold text-purple-400">
                {targetPercent}%
              </span>
              <span className="block text-[10px] text-slate-400 mt-0.5">Mandatory Threshold</span>
            </div>
          </div>

          {/* AI Recommendation Message Banner */}
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-start gap-3">
            <FiInfo className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-indigo-200 leading-relaxed">
              <span className="font-bold text-indigo-300 block mb-0.5">AI Strategic Recommendation:</span>
              {overall?.recommendation}
            </div>
          </div>
        </div>

        {/* Right Col: Interactive "What-If" Simulator Slider */}
        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-5 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FiSliders className="w-4 h-4 text-cyan-400" />
              "What-If" Simulator
            </h3>
            <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
              Interactive
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Future Attendance Rate:</span>
              <span className="text-indigo-400 font-bold text-sm">{simulateRate}%</span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={simulateRate}
              onChange={(e) => setSimulateRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Simulated Final Attendance</span>
              <div className="text-3xl font-extrabold text-white">
                <span className={simulatedFinalPercent >= targetPercent ? 'text-emerald-400' : 'text-rose-400'}>
                  {simulatedFinalPercent}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                If you attend {simulatedAttended} out of remaining {overall?.remainingLectures} lectures.
              </p>
            </div>
          </div>

          {/* Quick Scenario Preset Chips */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Scenario Table:</span>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              {overall?.scenarios?.slice(0, 6).map((sc, idx) => (
                <button
                  key={idx}
                  onClick={() => setSimulateRate(sc.attendRate)}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    simulateRate === sc.attendRate
                      ? 'bg-indigo-600 text-white border-indigo-400'
                      : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="block text-[9px] text-slate-400">{sc.attendRate}% Rate</span>
                  <span className={`font-bold ${sc.meetsTarget ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {sc.projectedFinalPercent}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subject-Wise AI Trajectory Breakdown */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FiBookOpen className="w-5 h-5 text-indigo-400" />
            Subject-Wise Attendance Trajectory & Risk Assessment
          </h2>
          <span className="text-xs text-slate-400">
            {subjectBreakdown?.length || 0} Total Subjects Enrolled
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjectBreakdown?.map((subj, idx) => (
            <div
              key={idx}
              className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl backdrop-blur-xl hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">{subj.subject}</h3>
                  <span className="text-xs text-slate-400">
                    Conducted: {subj.conducted} | Present: {subj.present} | Absent: {subj.absent}
                  </span>
                </div>
                <div>{getStatusBadge(subj.status)}</div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Current Percentage:</span>
                  <span className={subj.currentPercent >= targetPercent ? 'text-emerald-400' : 'text-rose-400'}>
                    {subj.currentPercent}%
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-500 ${
                      subj.currentPercent >= targetPercent
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-rose-500 to-amber-500'
                    }`}
                    style={{ width: `${Math.min(subj.currentPercent, 100)}%` }}
                  />
                </div>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="block text-[9px] text-slate-400 uppercase font-semibold">Must Attend</span>
                  <span className="font-bold text-cyan-400">{subj.requiredToAttend} class(es)</span>
                </div>
                <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="block text-[9px] text-slate-400 uppercase font-semibold">Max Skips</span>
                  <span className="font-bold text-indigo-400">{subj.maxSkips} class(es)</span>
                </div>
                <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="block text-[9px] text-slate-400 uppercase font-semibold">Remaining</span>
                  <span className="font-bold text-slate-200">~{subj.remainingLectures} lectures</span>
                </div>
              </div>

              {/* Recommendation Note */}
              <div className="p-3 bg-slate-950/80 rounded-xl text-xs text-slate-300 border border-slate-800/80 flex items-start gap-2">
                <FiInfo className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <p className="leading-normal">{subj.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
