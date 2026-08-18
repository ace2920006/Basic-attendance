import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import {
  FiBell,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiX,
  FiVolume2,
  FiVolumeX,
  FiCalendar,
  FiFileText
} from 'react-icons/fi';

export default function ToastContainer() {
  const { toasts, removeToast, soundEnabled, setSoundEnabled } = useNotifications();

  if (!toasts || toasts.length === 0) return null;

  const getEventIcon = (type, eventType) => {
    if (eventType === 'CLASS_CANCELLED') {
      return <FiCalendar className="w-5 h-5 text-amber-400" />;
    }
    if (eventType === 'LOW_ATTENDANCE') {
      return <FiAlertTriangle className="w-5 h-5 text-rose-400" />;
    }
    if (eventType === 'LEAVE_STATUS') {
      return <FiFileText className="w-5 h-5 text-indigo-400" />;
    }
    if (eventType === 'ANNOUNCEMENT') {
      return <FiBell className="w-5 h-5 text-cyan-400 animate-bounce" />;
    }

    switch (type) {
      case 'success':
        return <FiCheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'warning':
        return <FiAlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'error':
        return <FiAlertTriangle className="w-5 h-5 text-rose-400" />;
      default:
        return <FiInfo className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getBorderColor = (type, eventType) => {
    if (eventType === 'LOW_ATTENDANCE' || type === 'error') return 'border-rose-500/50 shadow-rose-950/40';
    if (eventType === 'CLASS_CANCELLED' || type === 'warning') return 'border-amber-500/50 shadow-amber-950/40';
    if (type === 'success') return 'border-emerald-500/50 shadow-emerald-950/40';
    return 'border-indigo-500/50 shadow-indigo-950/40';
  };

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {/* Sound Mute/Unmute Quick Controls */}
      <div className="flex justify-end pointer-events-auto">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1.5 bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800 rounded-lg text-xs flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-colors"
          title={soundEnabled ? 'Mute notification sound' : 'Unmute notification sound'}
        >
          {soundEnabled ? <FiVolume2 className="w-3.5 h-3.5 text-indigo-400" /> : <FiVolumeX className="w-3.5 h-3.5 text-slate-500" />}
          <span className="text-[10px] hidden sm:inline">{soundEnabled ? 'Chime ON' : 'Muted'}</span>
        </button>
      </div>

      {/* Render Active Toasts */}
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto bg-slate-900/95 backdrop-blur-xl border ${getBorderColor(
            toast.type,
            toast.eventType
          )} p-4 rounded-2xl shadow-2xl flex items-start gap-3 transform transition-all duration-300 animate-slide-in hover:scale-[1.02]`}
        >
          <div className="mt-0.5 shrink-0 p-2 bg-slate-950/60 rounded-xl border border-slate-800">
            {getEventIcon(toast.type, toast.eventType)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h5 className="text-xs font-bold text-white tracking-wide truncate">{toast.title}</h5>
              <span className="text-[9px] font-mono text-slate-400">Live</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-snug break-words">{toast.message}</p>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
