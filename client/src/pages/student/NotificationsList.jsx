import React, { useState } from 'react';
import {
  FiBell,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiPlus,
  FiTrash2,
  FiFilter,
  FiCalendar,
  FiMegaphone,
  FiFileText
} from 'react-icons/fi';
import { useNotifications } from '../../context/NotificationContext';
import Modal from '../../components/common/Modal';
import { applyLeaveApi } from '../../services/api';

export default function NotificationsList() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loading
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'attendance' | 'warning' | 'announcements' | 'leave'
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    leaveType: 'Medical'
  });
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);
  const [leaveError, setLeaveError] = useState(null);

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      setLeaveError(null);
      await applyLeaveApi({
        leaveType: leaveForm.leaveType,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate || leaveForm.startDate,
        reason: leaveForm.reason
      });
      setLeaveSubmitted(true);
      setTimeout(() => {
        setLeaveSubmitted(false);
        setIsLeaveModalOpen(false);
        setLeaveForm({ startDate: '', endDate: '', reason: '', leaveType: 'Medical' });
      }, 1800);
    } catch (error) {
      setLeaveError(error.message || 'Failed to submit leave request');
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'attendance') return n.eventType === 'ATTENDANCE_MARKED';
    if (activeTab === 'warning') return n.eventType === 'LOW_ATTENDANCE' || n.type === 'warning' || n.type === 'error';
    if (activeTab === 'announcements') return n.eventType === 'ANNOUNCEMENT';
    if (activeTab === 'leave') return n.eventType === 'LEAVE_STATUS';
    return true;
  });

  const getEventIcon = (notif) => {
    if (notif.eventType === 'CLASS_CANCELLED') return <FiCalendar className="w-5 h-5 text-amber-400" />;
    if (notif.eventType === 'LOW_ATTENDANCE') return <FiAlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />;
    if (notif.eventType === 'ANNOUNCEMENT') return <FiMegaphone className="w-5 h-5 text-cyan-400" />;
    if (notif.eventType === 'LEAVE_STATUS') return <FiFileText className="w-5 h-5 text-indigo-400" />;

    switch (notif.type) {
      case 'success':
        return <FiCheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'warning':
        return <FiAlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'error':
        return <FiAlertTriangle className="w-5 h-5 text-rose-400" />;
      default:
        return <FiInfo className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Controls */}
      <div className="glass-panel p-6 border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FiBell className="w-5 h-5 text-indigo-400" />
              Real-Time Notifications & System Alerts
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Live WebSocket updates for attendance, class cancellations, leave approvals, and announcements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="btn btn-primary py-2 px-3 text-xs flex items-center gap-1.5"
            >
              <FiPlus className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-medium"
              >
                Mark all as read ({unreadCount})
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800/60 no-scrollbar">
          {[
            { id: 'all', label: 'All Notifications', count: notifications.length },
            { id: 'attendance', label: 'Attendance Marked', count: notifications.filter(n => n.eventType === 'ATTENDANCE_MARKED').length },
            { id: 'warning', label: 'Low % & Warnings', count: notifications.filter(n => n.eventType === 'LOW_ATTENDANCE' || n.type === 'warning').length },
            { id: 'announcements', label: 'Announcements', count: notifications.filter(n => n.eventType === 'ANNOUNCEMENT').length },
            { id: 'leave', label: 'Leave Status', count: notifications.filter(n => n.eventType === 'LEAVE_STATUS').length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/40'
                  : 'bg-slate-950/40 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications Feed */}
        <div className="space-y-3 pt-2">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading notifications feed...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-12 text-center space-y-2 glass-panel border-dashed border-slate-800">
              <FiBell className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-300">No notifications found</h4>
              <p className="text-xs text-slate-500">New system updates and live alerts will appear here automatically.</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => notif.unread && markAsRead(notif._id)}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer group ${
                  notif.unread
                    ? 'bg-indigo-950/30 border-indigo-500/40 shadow-lg shadow-indigo-950/20'
                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="mt-0.5 p-2 bg-slate-900 rounded-xl border border-slate-800 shrink-0">
                  {getEventIcon(notif)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white">{notif.title}</h4>
                      {notif.unread && (
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-indigo-500 text-white rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : 'Recent'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{notif.message}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif._id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-900 transition-all shrink-0"
                  title="Delete notification"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Leave Application Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Apply for Absence / Medical Leave"
      >
        {leaveSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <FiCheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-white">Leave Request Submitted</h4>
            <p className="text-xs text-slate-400">
              Your application has been routed to your department head for verification. Real-time updates will be delivered here.
            </p>
          </div>
        ) : (
          <form onSubmit={handleLeaveSubmit} className="space-y-4">
            {leaveError && (
              <div className="p-3 bg-rose-950/40 border border-rose-800 text-xs text-rose-300 rounded-xl">
                {leaveError}
              </div>
            )}

            <div className="input-group mb-0">
              <label className="input-label">Leave Category</label>
              <select
                value={leaveForm.leaveType}
                onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                className="input-field text-xs bg-slate-900"
              >
                <option value="Medical">Medical Leave</option>
                <option value="Official Event">Official Campus Event</option>
                <option value="Personal Emergency">Personal Emergency</option>
                <option value="Duty Leave">Duty Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="input-group mb-0">
                <label className="input-label">Start Date</label>
                <input
                  type="date"
                  required
                  value={leaveForm.startDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                  className="input-field text-xs"
                />
              </div>

              <div className="input-group mb-0">
                <label className="input-label">End Date</label>
                <input
                  type="date"
                  required
                  value={leaveForm.endDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div className="input-group mb-0">
              <label className="input-label">Reason & Details</label>
              <textarea
                rows="3"
                required
                placeholder="Explain the reason for leave..."
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                className="input-field text-xs"
              />
            </div>

            <button type="submit" className="btn btn-primary w-full py-2.5 text-xs font-semibold">
              Submit Leave Request
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
