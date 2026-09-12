import React, { useState } from 'react';
import {
  FiCloud,
  FiCloudOff,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertTriangle,
  FiTrash2,
  FiDatabase,
  FiClock,
  FiLayers,
  FiX,
  FiChevronRight,
  FiUserCheck,
  FiShield
} from 'react-icons/fi';
import { useOfflineSync } from '../../context/OfflineSyncContext';

export default function OfflineSyncCenterModal() {
  const {
    isOnline,
    queue,
    pendingBatches,
    conflictedBatches,
    pendingCount,
    conflictCount,
    isSyncing,
    lastSyncTime,
    isSyncCenterOpen,
    closeSyncCenter,
    syncBatch,
    syncAllPending,
    discardBatch,
    clearSynced,
    openConflictModal,
    diagnostics,
    refreshQueue
  } = useOfflineSync();

  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'history' | 'storage'

  if (!isSyncCenterOpen) return null;

  const syncedBatches = queue.filter((b) => b.syncStatus === 'synced');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel max-w-3xl w-full max-h-[85vh] flex flex-col border border-slate-800 shadow-2xl rounded-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              !isOnline
                ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                : pendingCount > 0
                ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
            }`}>
              {!isOnline ? <FiCloudOff className="w-5 h-5" /> : <FiCloud className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Offline Attendance Sync Center</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  !isOnline
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {isOnline ? 'Online' : 'Offline Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                IndexedDB attendance queue, auto-sync telemetry, and conflict management
              </p>
            </div>
          </div>

          <button
            onClick={closeSyncCenter}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('queue')}
              className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
                activeTab === 'queue'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FiLayers className="w-3.5 h-3.5" />
              <span>Queue ({queue.length})</span>
              {pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 text-[10px]">
                  {pendingCount}
                </span>
              )}
              {conflictCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold animate-pulse">
                  {conflictCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('storage')}
              className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
                activeTab === 'storage'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FiDatabase className="w-3.5 h-3.5" />
              <span>Diagnostics & Cache</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshQueue}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Refresh Queue"
            >
              <FiRefreshCw className="w-3.5 h-3.5" />
            </button>
            {isOnline && pendingCount > 0 && (
              <button
                onClick={() => syncAllPending('detect_only')}
                disabled={isSyncing}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <FiRefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync All</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* TAB 1: QUEUE */}
          {activeTab === 'queue' && (
            <>
              {queue.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/30 rounded-xl border border-slate-800/80 space-y-2">
                  <FiCheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-semibold text-white">Queue is Empty</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    All classroom attendance logs are fully synchronized with the central campus database.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {queue.map((batch) => {
                    const isConflict = batch.syncStatus === 'conflict';
                    const isSynced = batch.syncStatus === 'synced';
                    const isFailed = batch.syncStatus === 'failed';
                    const isProcessing = batch.syncStatus === 'syncing';

                    return (
                      <div
                        key={batch.id}
                        className={`p-4 rounded-xl border transition ${
                          isConflict
                            ? 'bg-amber-500/5 border-amber-500/30'
                            : isSynced
                            ? 'bg-emerald-500/5 border-emerald-500/20'
                            : isFailed
                            ? 'bg-rose-500/5 border-rose-500/20'
                            : 'bg-slate-900/60 border-slate-800'
                        } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">
                              {batch.subject}
                            </span>
                            <span className="text-xs text-slate-400">
                              ({batch.section || 'All Sections'})
                            </span>
                            
                            {/* Status Pill */}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isConflict
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : isSynced
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : isProcessing
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse'
                                : isFailed
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}>
                              {isConflict ? '⚠️ Discrepancy Found' :
                               isSynced ? '✓ Synced' :
                               isProcessing ? 'Syncing...' :
                               isFailed ? 'Sync Failed' : 'Pending Sync'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <FiClock className="w-3 h-3 text-slate-500" />
                              {new Date(batch.clientTimestamp || batch.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span>•</span>
                            <span className="font-mono text-slate-300">
                              {batch.records?.length || 0} Students Marked
                            </span>
                            {batch.lastError && (
                              <>
                                <span>•</span>
                                <span className="text-rose-400 truncate max-w-xs">{batch.lastError}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Batch Action Buttons */}
                        <div className="flex items-center gap-2">
                          {isConflict ? (
                            <button
                              type="button"
                              onClick={() => openConflictModal(batch)}
                              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                            >
                              <FiAlertTriangle className="w-3.5 h-3.5" />
                              <span>Resolve Conflicts</span>
                            </button>
                          ) : !isSynced ? (
                            <button
                              type="button"
                              onClick={() => syncBatch(batch.id, 'detect_only')}
                              disabled={isSyncing || !isOnline}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                            >
                              <FiRefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                              <span>Sync</span>
                            </button>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => discardBatch(batch.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Discard batch"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

              {syncedBatches.length > 0 && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={clearSynced}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                    <span>Clear {syncedBatches.length} Synced Log{syncedBatches.length === 1 ? '' : 's'}</span>
                  </button>
                </div>
              )}
            </>
          )}

          {/* TAB 2: STORAGE & DIAGNOSTICS */}
          {activeTab === 'storage' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
                  <span className="block text-xl font-bold text-white">
                    {diagnostics?.isIndexedDBSupported ? 'Active' : 'Fallback'}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">IndexedDB Status</span>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
                  <span className="block text-xl font-bold text-indigo-400">
                    {diagnostics?.cachedRosterCount || 0}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Cached Class Rosters</span>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
                  <span className="block text-xl font-bold text-emerald-400">
                    {diagnostics?.storageQuota?.percentUsed || '< 1'}%
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Storage Quota</span>
                </div>
              </div>

              <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
                <h5 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <FiShield className="w-4 h-4 text-indigo-400" />
                  <span>Offline Resilience Architecture (Phase 34)</span>
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When network disconnects, your device shifts instantly into local-first mode. All student attendance marks are cryptographically queued in browser IndexedDB (<code className="text-indigo-300">CampusAttendOfflineDB</code>). As soon as Wi-Fi or Cellular connection returns, records automatically sync to the server with conflict resolution.
                </p>
              </div>

              {lastSyncTime && (
                <div className="text-xs text-slate-500 text-center">
                  Last successful sync: {new Date(lastSyncTime).toLocaleTimeString()}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {pendingCount} Pending • {conflictCount} Conflicts • {syncedBatches.length} Synced
          </span>
          <button
            type="button"
            onClick={closeSyncCenter}
            className="btn btn-secondary px-4 py-1.5 text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
