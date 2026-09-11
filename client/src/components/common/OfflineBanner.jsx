import React, { useState, useEffect } from 'react';
import { FiWifiOff, FiWifi, FiX } from 'react-icons/fi';
import useNetworkStatus from '../../hooks/useNetworkStatus';

export default function OfflineBanner() {
  const { isOnline, wasOffline } = useNetworkStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnected) return null;
  if (!isOnline && dismissed) return null;

  return (
    <div
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 transform ${
        !isOnline ? 'bg-amber-600/95 text-amber-50' : 'bg-emerald-600/95 text-emerald-50'
      } backdrop-blur-md px-4 py-2 text-xs shadow-lg flex items-center justify-between font-medium`}
    >
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        {!isOnline ? (
          <>
            <FiWifiOff className="w-4 h-4 flex-shrink-0 animate-pulse text-amber-200" />
            <span className="truncate">
              <strong>Offline Shell Active:</strong> Showing cached timetable & records. Camera QR scans will queue until reconnect.
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
