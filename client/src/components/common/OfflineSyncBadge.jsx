import React from 'react';
import { FiCloud, FiCloudOff, FiRefreshCw, FiAlertTriangle, FiCheck } from 'react-icons/fi';
import { useOfflineSync } from '../../context/OfflineSyncContext';

export default function OfflineSyncBadge({ showDetails = false }) {
  const {
    isOnline,
    pendingCount,
    conflictCount,
    isSyncing,
    openSyncCenter,
    openConflictModal,
    activeConflictBatch,
    conflictedBatches
  } = useOfflineSync();

  const handleClick = (e) => {
    e.stopPropagation();
    if (conflictCount > 0 && conflictedBatches.length > 0) {
      openConflictModal(conflictedBatches[0]);
    } else {
      openSyncCenter();
    }
  };

  // 1. Conflict Warning State
  if (conflictCount > 0) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-sm shadow-amber-500/10 animate-pulse transition"
        title="Sync conflicts detected. Click to review and resolve."
      >
        <FiAlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        <span>{conflictCount} Conflict{conflictCount === 1 ? '' : 's'}</span>
      </button>
    );
  }

  // 2. Offline Mode State
  if (!isOnline) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition"
        title="Offline Mode Active. Attendance records are saved locally in IndexedDB."
      >
        <FiCloudOff className="w-3.5 h-3.5 text-amber-400" />
        <span>Offline {pendingCount > 0 ? `(${pendingCount} Queued)` : ''}</span>
      </button>
    );
  }

  // 3. Syncing In Progress State
  if (isSyncing) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5 transition"
        title="Synchronizing offline records..."
      >
        <FiRefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
        <span>Syncing...</span>
      </button>
    );
  }

  // 4. Pending Queue State (Online, awaiting sync)
  if (pendingCount > 0) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 transition"
        title="Offline attendance records awaiting cloud sync. Click to open Sync Center."
      >
        <FiCloud className="w-3.5 h-3.5 text-indigo-400" />
        <span>{pendingCount} Queued</span>
      </button>
    );
  }

  // 5. Default Online & Synced State
  if (showDetails) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 flex items-center gap-1.5 transition"
        title="Offline Attendance Sync Center"
      >
        <FiCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Offline Sync</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-800 transition"
      title="Offline Sync Ready (IndexedDB Connected)"
    >
      <FiCloud className="w-4 h-4 text-emerald-400/80" />
    </button>
  );
}
