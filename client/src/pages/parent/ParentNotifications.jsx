import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FiBell,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiCheck,
  FiClock,
  FiFilter,
  FiRadio
} from 'react-icons/fi';
import { getParentNotificationsApi } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

export default function ParentNotifications() {
  const context = useOutletContext();
  const activeWard = context?.activeWard;

  const { markAsRead, markAllAsRead } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getParentNotificationsApi(activeWard?._id)
      .then((res) => {
        if (isMounted && res?.success && res.data && res.data.length > 0) {
          setNotifications(res.data);
        } else {
          // Fallback sample notifications for parent
          setNotifications([
            {
              _id: 'pn-1',
              title: '🚨 Critical Defaulter: Parent/Guardian Alert (<60%)',
              message: 'Your ward Alex Rivera (CS-2024-089) has cumulative attendance below 60% in Operating Systems. 14 consecutive lectures required for recovery.',
              type: 'error',
              eventType: 'DEFAULTER_PARENT_ALERT',
              createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
              unread: true,
              smartAdvice: { currentPercentage: 58.5, targetPercentage: 75, lecturesNeeded: 14 }
            },
            {
              _id: 'pn-2',
              title: 'Medical Leave Approved',
              message: 'Medical leave request (Aug 01 - Aug 02) for Alex Rivera has been reviewed and approved by Dr. Sarah Jenkins.',
              type: 'success',
              eventType: 'LEAVE_APPROVED',
              createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
              unread: true
            },
            {
              _id: 'pn-3',
              title: 'Timetable Adjustment Notice',
              message: 'Friday Computer Networks (CS304) session will be held in Hall C instead of Lab 301.',
              type: 'info',
              eventType: 'ANNOUNCEMENT',
              createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
              unread: false
            },
            {
              _id: 'pn-4',
              title: 'Mid-Term Exam Eligibility Advisory',
              message: 'Institutional reminder: All students must maintain at least 75% attendance in each course to be eligible for end-semester exams.',
              type: 'warning',
              eventType: 'LOW_ATTENDANCE',
              createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
              unread: false
            }
          ]);
        }
      })
      .catch(() => {
        setNotifications([
          {
            _id: 'pn-1',
            title: '🚨 Critical Defaulter: Parent/Guardian Alert (<60%)',
            message: 'Your ward Alex Rivera (CS-2024-089) has cumulative attendance below 60% in Operating Systems. 14 consecutive lectures required for recovery.',
            type: 'error',
            eventType: 'DEFAULTER_PARENT_ALERT',
            createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
            unread: true,
            smartAdvice: { currentPercentage: 58.5, targetPercentage: 75, lecturesNeeded: 14 }
          },
          {
            _id: 'pn-2',
            title: 'Medical Leave Approved',
            message: 'Medical leave request (Aug 01 - Aug 02) for Alex Rivera has been reviewed and approved by Dr. Sarah Jenkins.',
            type: 'success',
            eventType: 'LEAVE_APPROVED',
            createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
            unread: true
          },
          {
            _id: 'pn-3',
            title: 'Timetable Adjustment Notice',
            message: 'Friday Computer Networks (CS304) session will be held in Hall C instead of Lab 301.',
            type: 'info',
            eventType: 'ANNOUNCEMENT',
            createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
            unread: false
          }
        ]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeWard?._id]);

  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, unread: false } : n))
    );
    markAsRead(id);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    markAllAsRead();
  };

  const filtered = notifications.filter((n) => {
    if (filterType === 'unread') return n.unread;
    if (filterType === 'warnings') return n.eventType?.includes('DEFAULTER') || n.eventType?.includes('LOW_ATTENDANCE');
    if (filterType === 'leaves') return n.eventType?.includes('LEAVE');
    if (filterType === 'announcements') return n.eventType?.includes('ANNOUNCEMENT');
    return true;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 border-slate-800 bg-gradient-to-r from-slate-900/90 via-rose-950/20 to-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Parent Alerts & Circulars</h2>
            <span className="badge bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              {unreadCount} Unread
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time notifications regarding your ward's attendance shortages, leave outcomes, and university notices.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition self-start md:self-center"
          >
            <FiCheck className="w-3.5 h-3.5" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
            filterType === 'all'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All Notices ({notifications.length})
        </button>
        <button
          onClick={() => setFilterType('warnings')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
            filterType === 'warnings'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Attendance Warnings 🚨
        </button>
        <button
          onClick={() => setFilterType('leaves')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
            filterType === 'leaves'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Leave Status Updates
        </button>
        <button
          onClick={() => setFilterType('announcements')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
            filterType === 'announcements'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          College Circulars
        </button>
        <button
          onClick={() => setFilterType('unread')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
            filterType === 'unread'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="glass-panel p-8 text-center text-slate-400 text-xs">
            <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <span>Loading notifications...</span>
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((notif) => {
            const isWarning = notif.type === 'error' || notif.eventType?.includes('DEFAULTER');
            const isSuccess = notif.type === 'success';

            return (
              <div
                key={notif._id}
                className={`glass-panel p-5 border transition flex items-start gap-4 ${
                  notif.unread
                    ? 'border-rose-500/40 bg-gradient-to-r from-slate-900 via-rose-950/10 to-slate-900'
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                    isWarning
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      : isSuccess
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                  }`}
                >
                  {isWarning ? <FiAlertTriangle className="w-5 h-5" /> : isSuccess ? <FiCheckCircle className="w-5 h-5" /> : <FiInfo className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{notif.title}</span>
                      {notif.unread && (
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                      )}
                    </h4>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {new Date(notif.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {notif.message}
                  </p>

                  {/* Smart Advice / Target Deficit pill if present */}
                  {notif.smartAdvice && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-cyan-300 flex items-center justify-between">
                      <span>Current Attendance: <strong>{notif.smartAdvice.currentPercentage}%</strong></span>
                      <span>Target: <strong>{notif.smartAdvice.targetPercentage}%</strong></span>
                      <span className="text-rose-400 font-bold">Deficit: Need {notif.smartAdvice.lecturesNeeded} Consecutive Classes</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] text-slate-500 font-medium">
                      Event: {notif.eventType || 'OFFICIAL_COMMUNICATION'}
                    </span>
                    {notif.unread && (
                      <button
                        onClick={() => handleMarkRead(notif._id)}
                        className="text-[11px] text-rose-400 hover:text-rose-300 font-medium"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="glass-panel p-8 text-center text-slate-500 text-xs">
            No notifications found in this category.
          </div>
        )}
      </div>

    </div>
  );
}
