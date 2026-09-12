/**
 * CampusAttend - Offline IndexedDB Attendance Storage Layer
 * Phase 34: Offline Attendance Sync & Queue Manager
 *
 * Provides resilient local persistence for offline attendance logs,
 * cached student class rosters, and synchronization telemetry.
 * Automatically falls back to localStorage if IndexedDB is blocked.
 */

const DB_NAME = 'CampusAttendOfflineDB';
const DB_VERSION = 1;

const STORES = {
  ATTENDANCE_QUEUE: 'attendanceQueue',
  ROSTER_CACHE: 'rosterCache',
  SYNC_HISTORY: 'syncHistory'
};

// Check if IndexedDB is supported
const isIndexedDBSupported = () => {
  return typeof window !== 'undefined' && 'indexedDB' in window;
};

// Open database connection
function openDB() {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBSupported()) {
      return reject(new Error('IndexedDB not supported on this device'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Attendance Queue Store
      if (!db.objectStoreNames.contains(STORES.ATTENDANCE_QUEUE)) {
        const queueStore = db.createObjectStore(STORES.ATTENDANCE_QUEUE, { keyPath: 'id' });
        queueStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        queueStore.createIndex('subject', 'subject', { unique: false });
        queueStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // 2. Roster Cache Store
      if (!db.objectStoreNames.contains(STORES.ROSTER_CACHE)) {
        db.createObjectStore(STORES.ROSTER_CACHE, { keyPath: 'key' });
      }

      // 3. Sync History Store
      if (!db.objectStoreNames.contains(STORES.SYNC_HISTORY)) {
        const historyStore = db.createObjectStore(STORES.SYNC_HISTORY, { keyPath: 'id' });
        historyStore.createIndex('syncedAt', 'syncedAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
  });
}

// LocalStorage Fallback Helpers
const LS_KEYS = {
  QUEUE: 'campusattend_offline_queue',
  ROSTER: 'campusattend_roster_cache',
  HISTORY: 'campusattend_sync_history'
};

function getLs(key, defaultVal = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setLs(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('[OfflineStorage] LocalStorage quota exceeded:', e);
  }
}

// ----------------------------------------------------------------
// 1. Attendance Queue Operations
// ----------------------------------------------------------------

/**
 * Enqueue an attendance batch taken offline
 */
export async function enqueueAttendanceBatch(batchData) {
  const id = batchData.id || `batch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const item = {
    id,
    batchId: id,
    subject: batchData.subject || '',
    subjectCode: batchData.subjectCode || batchData.subject || '',
    section: batchData.section || '',
    classId: batchData.classId || null,
    sessionId: batchData.sessionId || null,
    date: batchData.date || new Date().toISOString(),
    clientTimestamp: batchData.clientTimestamp || new Date().toISOString(),
    teacherId: batchData.teacherId || null,
    teacherName: batchData.teacherName || 'Faculty',
    records: batchData.records || [], // [{ studentId, name, rollNo, status, notes }]
    syncStatus: 'pending', // 'pending' | 'syncing' | 'synced' | 'conflict' | 'failed'
    conflictData: null,
    retryCount: 0,
    lastError: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ATTENDANCE_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.ATTENDANCE_QUEUE);
      const req = store.put(item);
      req.onsuccess = () => resolve(item);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    // Fallback to localStorage
    const queue = getLs(LS_KEYS.QUEUE);
    const existingIdx = queue.findIndex((b) => b.id === id);
    if (existingIdx >= 0) {
      queue[existingIdx] = item;
    } else {
      queue.push(item);
    }
    setLs(LS_KEYS.QUEUE, queue);
    return item;
  }
}

/**
 * Retrieve all batches in the queue
 */
export async function getAllQueuedBatches() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ATTENDANCE_QUEUE, 'readonly');
      const store = tx.objectStore(STORES.ATTENDANCE_QUEUE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    return getLs(LS_KEYS.QUEUE, []);
  }
}

/**
 * Retrieve batches needing sync or review
 */
export async function getPendingBatches() {
  const all = await getAllQueuedBatches();
  return all.filter((b) => b.syncStatus === 'pending' || b.syncStatus === 'failed' || b.syncStatus === 'conflict');
}

/**
 * Retrieve single batch by ID
 */
export async function getBatchById(id) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ATTENDANCE_QUEUE, 'readonly');
      const store = tx.objectStore(STORES.ATTENDANCE_QUEUE);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    const queue = getLs(LS_KEYS.QUEUE, []);
    return queue.find((b) => b.id === id) || null;
  }
}

/**
 * Update a queued batch (e.g. syncStatus, conflicts, retryCount)
 */
export async function updateQueuedBatch(id, updates) {
  try {
    const db = await openDB();
    const current = await getBatchById(id);
    if (!current) throw new Error(`Batch ${id} not found in IndexedDB`);

    const updated = {
      ...current,
      ...updates,
      updatedAt: Date.now()
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ATTENDANCE_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.ATTENDANCE_QUEUE);
      const req = store.put(updated);
      req.onsuccess = () => resolve(updated);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    const queue = getLs(LS_KEYS.QUEUE, []);
    const idx = queue.findIndex((b) => b.id === id);
    if (idx >= 0) {
      queue[idx] = { ...queue[idx], ...updates, updatedAt: Date.now() };
      setLs(LS_KEYS.QUEUE, queue);
      return queue[idx];
    }
    return null;
  }
}

/**
 * Remove a batch from the queue (after confirmed sync or manual discard)
 */
export async function removeQueuedBatch(id) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ATTENDANCE_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.ATTENDANCE_QUEUE);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    let queue = getLs(LS_KEYS.QUEUE, []);
    queue = queue.filter((b) => b.id !== id);
    setLs(LS_KEYS.QUEUE, queue);
    return true;
  }
}

/**
 * Clear all fully synced batches from the queue
 */
export async function clearSyncedBatches() {
  const all = await getAllQueuedBatches();
  for (const item of all) {
    if (item.syncStatus === 'synced') {
      await removeQueuedBatch(item.id);
    }
  }
}

// ----------------------------------------------------------------
// 2. Roster Cache Operations (Enables offline attendance taking)
// ----------------------------------------------------------------

/**
 * Cache student roster for a specific subject and section
 */
export async function cacheRoster(subject, section, students) {
  const key = `${subject}_${section || 'All'}`.toLowerCase();
  const entry = {
    key,
    subject,
    section: section || 'All',
    students,
    cachedAt: Date.now()
  };

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ROSTER_CACHE, 'readwrite');
      const store = tx.objectStore(STORES.ROSTER_CACHE);
      const req = store.put(entry);
      req.onsuccess = () => resolve(entry);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    const rosters = getLs(LS_KEYS.ROSTER, {});
    rosters[key] = entry;
    setLs(LS_KEYS.ROSTER, rosters);
    return entry;
  }
}

/**
 * Retrieve cached roster for a class
 */
export async function getCachedRoster(subject, section) {
  const key = `${subject}_${section || 'All'}`.toLowerCase();
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ROSTER_CACHE, 'readonly');
      const store = tx.objectStore(STORES.ROSTER_CACHE);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.students : null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    const rosters = getLs(LS_KEYS.ROSTER, {});
    return rosters[key]?.students || null;
  }
}

/**
 * Retrieve all cached rosters
 */
export async function getAllCachedRosters() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ROSTER_CACHE, 'readonly');
      const store = tx.objectStore(STORES.ROSTER_CACHE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    const rosters = getLs(LS_KEYS.ROSTER, {});
    return Object.values(rosters);
  }
}

// ----------------------------------------------------------------
// 3. Sync Audit History
// ----------------------------------------------------------------

/**
 * Log completed synchronization session for local transparency
 */
export async function logSyncHistory(syncLog) {
  const entry = {
    id: syncLog.id || `sync_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    batchId: syncLog.batchId,
    subject: syncLog.subject,
    section: syncLog.section || '',
    syncedCount: syncLog.syncedCount || 0,
    conflictsResolved: syncLog.conflictsResolved || 0,
    strategy: syncLog.strategy || 'clean',
    syncedAt: Date.now(),
    message: syncLog.message || ''
  };

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.SYNC_HISTORY, 'readwrite');
      const store = tx.objectStore(STORES.SYNC_HISTORY);
      const req = store.put(entry);
      req.onsuccess = () => resolve(entry);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    const history = getLs(LS_KEYS.HISTORY, []);
    history.unshift(entry);
    if (history.length > 50) history.pop();
    setLs(LS_KEYS.HISTORY, history);
    return entry;
  }
}

/**
 * Get sync history
 */
export async function getSyncHistory() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.SYNC_HISTORY, 'readonly');
      const store = tx.objectStore(STORES.SYNC_HISTORY);
      const req = store.getAll();
      req.onsuccess = () => {
        const sorted = (req.result || []).sort((a, b) => b.syncedAt - a.syncedAt);
        resolve(sorted);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    return getLs(LS_KEYS.HISTORY, []);
  }
}

/**
 * Get storage diagnostics
 */
export async function getStorageDiagnostics() {
  const batches = await getAllQueuedBatches();
  const rosters = await getAllCachedRosters();
  const history = await getSyncHistory();

  let quotaEstimate = null;
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      quotaEstimate = await navigator.storage.estimate();
    } catch (e) {
      // Ignore
    }
  }

  return {
    isIndexedDBSupported: isIndexedDBSupported(),
    totalBatches: batches.length,
    pendingBatches: batches.filter((b) => b.syncStatus === 'pending').length,
    conflictedBatches: batches.filter((b) => b.syncStatus === 'conflict').length,
    syncedBatches: batches.filter((b) => b.syncStatus === 'synced').length,
    cachedRosterCount: rosters.length,
    historyCount: history.length,
    storageQuota: quotaEstimate
      ? {
          usageBytes: quotaEstimate.usage,
          quotaBytes: quotaEstimate.quota,
          percentUsed: ((quotaEstimate.usage / quotaEstimate.quota) * 100).toFixed(2)
        }
      : null
  };
}
