import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  getAllQueuedBatches,
  enqueueAttendanceBatch,
  updateQueuedBatch,
  removeQueuedBatch,
  clearSyncedBatches,
  logSyncHistory,
  getStorageDiagnostics
} from '../utils/offlineAttendanceDB';
import { syncOfflineAttendanceApi, resolveAttendanceConflictsApi } from '../services/api';
import useNetworkStatus from '../hooks/useNetworkStatus';

const OfflineSyncContext = createContext();

export function OfflineSyncProvider({ children }) {
  const { isOnline } = useNetworkStatus();
  const [queue, setQueue] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncFeedback, setSyncFeedback] = useState(null); // { type: 'success' | 'warning' | 'error', message }
  
  // Modals state
  const [activeConflictBatch, setActiveConflictBatch] = useState(null);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [isSyncCenterOpen, setIsSyncCenterOpen] = useState(false);
  
  // Storage diagnostics
  const [diagnostics, setDiagnostics] = useState(null);

  const isSyncingRef = useRef(false);

  // Load / Refresh queue from IndexedDB
  const refreshQueue = useCallback(async () => {
    try {
      const batches = await getAllQueuedBatches();
      setQueue(batches);
      const diag = await getStorageDiagnostics();
      setDiagnostics(diag);
    } catch (e) {
      console.warn('[OfflineSyncContext] Failed to refresh queue:', e);
    }
  }, []);

  useEffect(() => {
    refreshQueue();
  }, [refreshQueue]);

  // Derived counts
  const pendingBatches = queue.filter(
    (b) => b.syncStatus === 'pending' || b.syncStatus === 'failed'
  );
  const conflictedBatches = queue.filter((b) => b.syncStatus === 'conflict');
  const pendingCount = pendingBatches.length;
  const conflictCount = conflictedBatches.length;

  /**
   * Enqueue a new attendance roster taken locally
   */
  const queueAttendance = async (batchData) => {
    const saved = await enqueueAttendanceBatch(batchData);
    await refreshQueue();

    // If online at the time of taking attendance, attempt immediate sync
    if (isOnline) {
      syncBatch(saved.id, 'detect_only');
    }
    return saved;
  };

  /**
   * Synchronize a specific batch with the server
   */
  const syncBatch = async (batchId, strategy = 'detect_only') => {
    const batch = queue.find((b) => b.id === batchId);
    if (!batch) return null;

    try {
      await updateQueuedBatch(batchId, { syncStatus: 'syncing', lastError: null });
      await refreshQueue();

      const payload = {
        batchId: batch.id,
        subject: batch.subject,
        subjectCode: batch.subjectCode,
        section: batch.section,
        date: batch.date,
        clientTimestamp: batch.clientTimestamp,
        classId: batch.classId,
        sessionId: batch.sessionId,
        conflictStrategy: strategy,
        records: batch.records
      };

      const res = await syncOfflineAttendanceApi(payload);

      if (res?.success) {
        if (res.hasConflicts) {
          // Conflicts detected! Mark batch as 'conflict' and store server conflict details
          await updateQueuedBatch(batchId, {
            syncStatus: 'conflict',
            conflictData: {
              conflicts: res.conflicts || [],
              conflictsCount: res.conflictsCount || 0,
              syncedCount: res.syncedCount || 0
            }
          });
          await refreshQueue();

          setSyncFeedback({
            type: 'warning',
            message: `⚠️ Sync paused: ${res.conflictsCount} conflict(s) detected for ${batch.subject}. Review required.`
          });

          // Open conflict resolution modal automatically
          setActiveConflictBatch({
            ...batch,
            conflictData: {
              conflicts: res.conflicts || [],
              conflictsCount: res.conflictsCount || 0
            }
          });
          setIsConflictModalOpen(true);
          return { status: 'conflict', data: res };
        } else {
          // Clean sync completed!
          await updateQueuedBatch(batchId, {
            syncStatus: 'synced',
            conflictData: null
          });
          await logSyncHistory({
            batchId: batch.id,
            subject: batch.subject,
            section: batch.section,
            syncedCount: res.syncedCount || batch.records.length,
            conflictsResolved: res.conflictsResolved || 0,
            strategy,
            message: res.message || 'Synced cleanly'
          });

          setLastSyncTime(Date.now());
          await refreshQueue();

          setSyncFeedback({
            type: 'success',
            message: `✅ Successfully synced ${batch.subject} (${res.syncedCount || batch.records.length} students).`
          });
          setTimeout(() => setSyncFeedback(null), 5000);
          return { status: 'synced', data: res };
        }
      } else {
        throw new Error(res?.message || 'Sync failed on server');
      }
    } catch (err) {
      console.warn(`[OfflineSync] Batch ${batchId} sync error:`, err);
      await updateQueuedBatch(batchId, {
        syncStatus: 'failed',
        retryCount: (batch.retryCount || 0) + 1,
        lastError: err.message || 'Network error'
      });
      await refreshQueue();
      setSyncFeedback({
        type: 'error',
        message: `❌ Sync failed for ${batch.subject}: ${err.message || 'Network unavailable'}`
      });
      return { status: 'failed', error: err };
    }
  };

  /**
   * Sync all pending batches in queue
   */
  const syncAllPending = useCallback(async (strategy = 'detect_only') => {
    if (isSyncingRef.current || !isOnline) return;
    isSyncingRef.current = true;
    setIsSyncing(true);

    try {
      const allBatches = await getAllQueuedBatches();
      const eligible = allBatches.filter(
        (b) => b.syncStatus === 'pending' || b.syncStatus === 'failed'
      );

      for (const b of eligible) {
        await syncBatch(b.id, strategy);
      }
    } finally {
      setIsSyncing(false);
      isSyncingRef.current = false;
      await refreshQueue();
    }
  }, [isOnline, refreshQueue]);

  /**
   * Explicitly resolve conflicts for a batch
   */
  const resolveBatchConflicts = async (batchId, chosenStrategy, customResolutions = []) => {
    const batch = queue.find((b) => b.id === batchId);
    if (!batch) return null;

    try {
      setIsSyncing(true);

      let res;
      if (chosenStrategy === 'custom_resolved') {
        res = await resolveAttendanceConflictsApi({
          batchId,
          subject: batch.subject,
          subjectCode: batch.subjectCode,
          date: batch.date,
          classId: batch.classId,
          sessionId: batch.sessionId,
          resolvedConflicts: customResolutions
        });
      } else {
        res = await syncOfflineAttendanceApi({
          batchId,
          subject: batch.subject,
          subjectCode: batch.subjectCode,
          section: batch.section,
          date: batch.date,
          classId: batch.classId,
          sessionId: batch.sessionId,
          conflictStrategy: chosenStrategy,
          records: batch.records
        });
      }

      if (res?.success) {
        await updateQueuedBatch(batchId, {
          syncStatus: 'synced',
          conflictData: null
        });
        await logSyncHistory({
          batchId,
          subject: batch.subject,
          section: batch.section,
          syncedCount: batch.records.length,
          conflictsResolved: customResolutions.length || (batch.conflictData?.conflictsCount || 1),
          strategy: chosenStrategy,
          message: `Conflicts resolved using ${chosenStrategy}`
        });

        setIsConflictModalOpen(false);
        setActiveConflictBatch(null);
        setLastSyncTime(Date.now());
        await refreshQueue();

        setSyncFeedback({
          type: 'success',
          message: `✅ Conflicts for ${batch.subject} resolved & synchronized successfully!`
        });
        setTimeout(() => setSyncFeedback(null), 5000);
        return res;
      }
    } catch (err) {
      console.error('[OfflineSync] Conflict resolution failed:', err);
      setSyncFeedback({
        type: 'error',
        message: `Failed to apply conflict resolution: ${err.message}`
      });
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Discard a batch from local queue
   */
  const discardBatch = async (batchId) => {
    await removeQueuedBatch(batchId);
    if (activeConflictBatch?.id === batchId) {
      setIsConflictModalOpen(false);
      setActiveConflictBatch(null);
    }
    await refreshQueue();
  };

  /**
   * Clear all synced batches
   */
  const clearSynced = async () => {
    await clearSyncedBatches();
    await refreshQueue();
  };

  /**
   * Open conflict modal for a batch
   */
  const openConflictModal = (batch) => {
    setActiveConflictBatch(batch);
    setIsConflictModalOpen(true);
  };

  const closeConflictModal = () => {
    setIsConflictModalOpen(false);
    setActiveConflictBatch(null);
  };

  // Auto-sync listener: Trigger synchronization when connection restores
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncingRef.current) {
      const timer = setTimeout(() => {
        syncAllPending('detect_only');
      }, 1500); // Debounce 1.5s to allow connection stability
      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingCount, syncAllPending]);

  return (
    <OfflineSyncContext.Provider
      value={{
        isOnline,
        queue,
        pendingBatches,
        conflictedBatches,
        pendingCount,
        conflictCount,
        isSyncing,
        lastSyncTime,
        syncFeedback,
        activeConflictBatch,
        isConflictModalOpen,
        isSyncCenterOpen,
        diagnostics,
        queueAttendance,
        syncBatch,
        syncAllPending,
        resolveBatchConflicts,
        discardBatch,
        clearSynced,
        openConflictModal,
        closeConflictModal,
        openSyncCenter: () => setIsSyncCenterOpen(true),
        closeSyncCenter: () => setIsSyncCenterOpen(false),
        refreshQueue
      }}
    >
      {children}
    </OfflineSyncContext.Provider>
  );
}

export function useOfflineSync() {
  const context = useContext(OfflineSyncContext);
  if (!context) {
    throw new Error('useOfflineSync must be used within an OfflineSyncProvider');
  }
  return context;
}
