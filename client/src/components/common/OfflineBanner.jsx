import React, { useState, useEffect } from 'react';
import { FiWifiOff, FiWifi, FiX, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import useNetworkStatus from '../../hooks/useNetworkStatus';
import { useOfflineSync } from '../../context/OfflineSyncContext';

export default function OfflineBanner() {
  const { isOnline, wasOffline } = useNetworkStatus();
  const { pendingCount, conflictCount, isSyncing, openSyncCenter, openConflictModal, conflictedBatches } = useOfflineSync();
  const [showReconnected, setShowReconnected] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnected && conflictCount === 0) return null;
  if (!isOnline && dismissed) return null;

  return (
    <div
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 transform ${
        conflictCount > 0
          ? 'bg-amber-600/95 text-amber-50'
          : !isOnline
          ? 'bg-slate-900/95 text-amber-300 border-b border-amber-500/30'
          : isSyncing
          ? 'bg-blue-600/95 text-blue-50'
          : 'bg-emerald-600/95 text-emerald-50'
      } backdrop-blur-md px-4 py-2 text-xs shadow-lg flex items-center justify-between font-medium`}
    >
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        {conflictCount > 0 ? (
          <>
            <FiAlertTriangle className="w-4 h-4 flex-shrink-0 animate-pulse text-amber-200" />
            <span className="truncate">
              <strong>Offline Attendance Conflicts:</strong> {conflictCount} batch(es) have conflicting student records.
            </span>
            <button
              onClick={() => {
                if (conflictedBatches.length > 0) openConflictModal(conflictedBatches[0]);
                else openSyncCenter();
              }}
              className="ml-2 px-2 py-0.5 rounded bg-black/30 hover:bg-black/40 text-amber-100 underline text-[11px] font-bold"
            >
              Resolve Conflicts Now
            </button>
          </>
        ) : !isOnline ? (
          <>
            <FiWifiOff className="w-4 h-4 flex-shrink-0 animate-pulse text-amber-400" />
            <span className="truncate">
              <strong>Offline Mode Active:</strong> Attendance continues locally via IndexedDB. {pendingCount > 0 ? `${pendingCount} batch(es) queued for automatic cloud sync.` : 'All actions cached locally.'}
            </span>
            {pendingCount > 0 && (
              <button
                onClick={openSyncCenter}
                className="ml-2 px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-semibold"
              >
                View Queue ({pendingCount})
              </button>
            )}
          </>
        ) : isSyncing ? (
          <>
            <FiRefreshCw className="w-4 h-4 flex-shrink-0 animate-spin text-blue-200" />
            <span className="truncate">
              <strong>Back Online!</strong> Synchronizing queued offline attendance records with campus server...
            </span>
          </>
        ) : (
          <>
            <FiWifi className="w-4 h-4 flex-shrink-0 text-emerald-200" />
            <span className="truncate">
              <strong>Back Online!</strong> Connection restored. CampusAttend records synchronized.
            </span>
          </>
        )}
      </div>

      {!isOnline && (
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-md hover:bg-black/20 text-amber-200 hover:text-white transition ml-2 flex-shrink-0"
          title="Dismiss banner"
        >
          <FiX className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
