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
  FiRadio,
  FiFileText,
  FiSettings,
  FiMail,
  FiSmartphone,
  FiLayers,
  FiZap,
  FiPlay,
  FiTrendingUp,
  FiShield,
  FiX
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
    loading,
    preferences,
    preferencesLoading,
    updatePreferences,
    smartSummary,
    testDispatchNotification
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'attendance' | 'warning' | 'announcements' | 'leave' | 'schedule'
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);

  // Leave Form State
  const [leaveForm, setLeaveForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    leaveType: 'Medical'
  });
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);
  const [leaveError, setLeaveError] = useState(null);

  // Preferences Form State
  const [prefForm, setPrefForm] = useState(preferences);
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefSavedMsg, setPrefSavedMsg] = useState(null);

  // Simulator Form State
  const [simForm, setSimForm] = useState({
    eventType: 'LOW_ATTENDANCE',
    subject: 'Database Systems',
    currentPercentage: 72,
    minPercentage: 75,
    channels: ['in_app', 'email', 'push'],
    customTitle: '',
    customMessage: ''
  });
  const [simLoading, setSimLoading] = useState(false);
  const [simResultMsg, setSimResultMsg] = useState(null);

  // Sync preference state when modal opens
  const openPreferencesModal = () => {
    setPrefForm(preferences);
    setPrefSavedMsg(null);
    setIsPreferencesModalOpen(true);
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setPrefSaving(true);
    const res = await updatePreferences(prefForm);
    setPrefSaving(false);
    if (res.success) {
      setPrefSavedMsg('Notification preferences updated successfully!');
      setTimeout(() => {
        setPrefSavedMsg(null);
        setIsPreferencesModalOpen(false);
      }, 1500);
    }
  };

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

  const handleTestSimulatorSubmit = async (e) => {
    e.preventDefault();
    setSimLoading(true);
    setSimResultMsg(null);
    try {
      const res = await testDispatchNotification(simForm);
      setSimResultMsg(res.message || 'Test notification dispatched across active channels!');
      setTimeout(() => {
        setSimResultMsg(null);
        setIsSimulatorModalOpen(false);
      }, 1800);
    } catch (error) {
      setSimResultMsg(`Error: ${error.message}`);
    } finally {
      setSimLoading(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'attendance') return n.eventType === 'ATTENDANCE_MARKED';
    if (activeTab === 'warning') return n.eventType === 'LOW_ATTENDANCE' || n.type === 'warning' || n.type === 'error';
    if (activeTab === 'announcements') return n.eventType === 'ANNOUNCEMENT';
    if (activeTab === 'leave') return n.eventType === 'LEAVE_STATUS' || n.eventType === 'LEAVE_APPROVED' || n.eventType === 'LEAVE_REJECTED';
    if (activeTab === 'schedule') return n.eventType === 'CLASS_CANCELLED' || n.eventType === 'TIMETABLE_CHANGED';
    return true;
  });

  const getEventIcon = (notif) => {
    if (notif.eventType === 'CLASS_CANCELLED') return <FiCalendar className="w-5 h-5 text-amber-400" />;
    if (notif.eventType === 'TIMETABLE_CHANGED') return <FiCalendar className="w-5 h-5 text-indigo-400" />;
    if (notif.eventType === 'LOW_ATTENDANCE') return <FiAlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />;
    if (notif.eventType === 'ANNOUNCEMENT') return <FiRadio className="w-5 h-5 text-cyan-400" />;
    if (notif.eventType === 'LEAVE_APPROVED') return <FiCheckCircle className="w-5 h-5 text-emerald-400" />;
    if (notif.eventType === 'LEAVE_REJECTED') return <FiAlertTriangle className="w-5 h-5 text-rose-400" />;
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

  // Find any active low attendance alert with smart advice for showcase banner
  const latestSmartAlert = notifications.find(
    (n) => n.eventType === 'LOW_ATTENDANCE' && n.smartAdvice?.actionableText
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="glass-panel p-6 border-slate-800 space-y-4 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <FiBell className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Advanced Notification Engine 🔔
                </h3>
                <p className="text-xs text-slate-400">
                  Multi-channel delivery (In-App • Email • Push) & Smart Attendance Recovery Advisor.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsSimulatorModalOpen(true)}
              className="px-3 py-2 bg-slate-950/80 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Test Notification Engine across Channels"
            >
              <FiZap className="w-3.5 h-3.5 text-amber-400" />
              <span>Test Simulator</span>
            </button>

            <button
              onClick={openPreferencesModal}
              className="px-3 py-2 bg-slate-950/80 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Configure Delivery Channels & Event Alerts"
            >
              <FiSettings className="w-3.5 h-3.5 text-cyan-400" />
              <span>Preferences</span>
            </button>

            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="btn btn-primary py-2 px-3 text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-950/40"
            >
              <FiPlus className="w-4 h-4" />
              <span>Apply Leave</span>
            </button>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-medium ml-1"
              >
                Mark all read ({unreadCount})
              </button>
            )}
          </div>
        </div>

        {/* Smart Attendance Recovery Recommendation Callout Banner */}
        {latestSmartAlert ? (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-slate-900 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 shrink-0 mt-0.5">
                <FiZap className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    ⚡ Smart Attendance Recovery
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                    Defaulter Alert
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-100">
                  {latestSmartAlert.smartAdvice.actionableText}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span>
                    Current: <strong className="text-rose-400">{latestSmartAlert.smartAdvice.currentPercentage}%</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Target Threshold: <strong className="text-slate-200">{latestSmartAlert.smartAdvice.targetPercentage}%</strong>
                  </span>
                  <span>•</span>
                  <span className="text-amber-300 font-semibold">
                    +{latestSmartAlert.smartAdvice.lecturesNeeded} consecutive lectures needed
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold">
                <FiTrendingUp className="w-4 h-4" />
                <span>Immediate Action</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <FiShield className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">
                <strong>Smart Notification Engine Active:</strong> You will be instantly alerted across In-App, Email, and Push with consecutive lecture recovery targets if attendance drops below 75%.
              </span>
            </div>
            <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-full">
              System Protected
            </span>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800/60 no-scrollbar">
          {[
            { id: 'all', label: 'All Notifications', count: notifications.length },
            {
              id: 'attendance',
              label: 'Attendance Marked',
              count: notifications.filter((n) => n.eventType === 'ATTENDANCE_MARKED').length
            },
            {
              id: 'warning',
              label: 'Smart Alerts & Low %',
              count: notifications.filter(
                (n) => n.eventType === 'LOW_ATTENDANCE' || n.type === 'warning' || n.type === 'error'
              ).length
            },
            {
              id: 'leave',
              label: 'Leave Status',
              count: notifications.filter(
                (n) =>
                  n.eventType === 'LEAVE_STATUS' ||
                  n.eventType === 'LEAVE_APPROVED' ||
                  n.eventType === 'LEAVE_REJECTED'
              ).length
            },
            {
              id: 'announcements',
              label: 'Announcements',
              count: notifications.filter((n) => n.eventType === 'ANNOUNCEMENT').length
            },
            {
              id: 'schedule',
              label: 'Schedule & Timetable',
              count: notifications.filter(
                (n) => n.eventType === 'CLASS_CANCELLED' || n.eventType === 'TIMETABLE_CHANGED'
              ).length
            }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/40'
                  : 'bg-slate-950/40 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab.id
                      ? 'bg-indigo-700 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications Feed */}
        <div className="space-y-3 pt-2">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Loading notifications feed...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-12 text-center space-y-2 glass-panel border-dashed border-slate-800">
              <FiBell className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-300">No notifications found</h4>
              <p className="text-xs text-slate-500">
                New system updates and live alerts will appear here automatically.
              </p>
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
                <div className="mt-0.5 p-2.5 bg-slate-900 rounded-xl border border-slate-800 shrink-0">
                  {getEventIcon(notif)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{notif.title}</h4>
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

                  {/* Smart Advice Chip if attached */}
                  {notif.smartAdvice && (
                    <div className="mt-2.5 p-2 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between gap-2 text-xs">
                      <span className="text-amber-300 font-medium">
                        💡 {notif.smartAdvice.actionableText}
                      </span>
                      {notif.smartAdvice.lecturesNeeded > 0 && (
                        <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full font-bold text-[10px] shrink-0">
                          +{notif.smartAdvice.lecturesNeeded} lectures needed
                        </span>
                      )}
                    </div>
                  )}

                  {/* Delivery Channels Badges */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      Channels:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          (notif.channelsSent || ['in_app']).includes('in_app')
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-slate-900 text-slate-500 border border-slate-800'
                        }`}
                      >
                        <FiLayers className="w-3 h-3" />
                        <span>In-App</span>
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          (notif.channelsSent || []).includes('email')
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-slate-900 text-slate-500 border border-slate-800'
                        }`}
                      >
                        <FiMail className="w-3 h-3" />
                        <span>Email</span>
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          (notif.channelsSent || []).includes('push')
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-slate-900 text-slate-500 border border-slate-800'
                        }`}
                      >
                        <FiSmartphone className="w-3 h-3" />
                        <span>Push</span>
                      </span>
                    </div>
                  </div>
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

      {/* Notification Preferences Modal */}
      <Modal
        isOpen={isPreferencesModalOpen}
        onClose={() => setIsPreferencesModalOpen(false)}
        title="Notification Delivery Preferences"
      >
        <form onSubmit={handleSavePreferences} className="space-y-5">
          {prefSavedMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 rounded-xl flex items-center gap-2">
              <FiCheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{prefSavedMsg}</span>
            </div>
          )}

          {/* Channel Toggles */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Delivery Channels
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-2">
                  <FiLayers className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-200">In-App</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefForm?.channels?.inApp !== false}
                  onChange={(e) =>
                    setPrefForm({
                      ...prefForm,
                      channels: { ...prefForm.channels, inApp: e.target.checked }
                    })
                  }
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-2">
                  <FiMail className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-slate-200">Email</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefForm?.channels?.email !== false}
                  onChange={(e) =>
                    setPrefForm({
                      ...prefForm,
                      channels: { ...prefForm.channels, email: e.target.checked }
                    })
                  }
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-2">
                  <FiSmartphone className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-semibold text-slate-200">Push</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefForm?.channels?.push !== false}
                  onChange={(e) =>
                    setPrefForm({
                      ...prefForm,
                      channels: { ...prefForm.channels, push: e.target.checked }
                    })
                  }
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>

          {/* Event Subscriptions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Event Subscriptions
            </h4>
            <div className="space-y-2">
              {[
                { key: 'attendanceMarked', label: 'Attendance Marked Alerts', icon: FiCheckCircle },
                { key: 'lowAttendance', label: 'Low Attendance & Smart Recovery Alerts', icon: FiAlertTriangle },
                { key: 'leaveStatus', label: 'Leave Approval & Rejection Updates', icon: FiFileText },
                { key: 'announcements', label: 'Campus Announcements & Notices', icon: FiRadio },
                { key: 'timetableChanged', label: 'Timetable & Schedule Changes', icon: FiCalendar },
                { key: 'classCancelled', label: 'Class Cancellation Alerts', icon: FiCalendar }
              ].map((ev) => {
                const IconComponent = ev.icon;
                return (
                  <label
                    key={ev.key}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:bg-slate-900 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComponent className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs text-slate-300 font-medium">{ev.label}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefForm?.events?.[ev.key] !== false}
                      onChange={(e) =>
                        setPrefForm({
                          ...prefForm,
                          events: { ...prefForm.events, [ev.key]: e.target.checked }
                        })
                      }
                      className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={prefSaving}
            className="btn btn-primary w-full py-2.5 text-xs font-semibold"
          >
            {prefSaving ? 'Saving Preferences...' : 'Save Notification Preferences'}
          </button>
        </form>
      </Modal>

      {/* Test Notification Engine Simulator Modal */}
      <Modal
        isOpen={isSimulatorModalOpen}
        onClose={() => setIsSimulatorModalOpen(false)}
        title="Interactive Notification Engine Simulator"
      >
        <form onSubmit={handleTestSimulatorSubmit} className="space-y-4">
          <p className="text-xs text-slate-400">
            Dispatch a test event to verify multi-channel delivery (In-App live toast/chime, Email, and Push notifications).
          </p>

          {simResultMsg && (
            <div className="p-3 bg-indigo-950/40 border border-indigo-800 text-xs text-indigo-300 rounded-xl flex items-center gap-2">
              <FiZap className="w-4 h-4 text-amber-400" />
              <span>{simResultMsg}</span>
            </div>
          )}

          <div className="input-group mb-0">
            <label className="input-label">Select Event Type</label>
            <select
              value={simForm.eventType}
              onChange={(e) => setSimForm({ ...simForm, eventType: e.target.value })}
              className="input-field text-xs bg-slate-900"
            >
              <option value="LOW_ATTENDANCE">Low Attendance Warning (Smart Math Advice)</option>
              <option value="ATTENDANCE_MARKED">Attendance Marked (Present/Late)</option>
              <option value="LEAVE_APPROVED">Leave Approved</option>
              <option value="LEAVE_REJECTED">Leave Rejected</option>
              <option value="ANNOUNCEMENT">Campus Announcement</option>
              <option value="CLASS_CANCELLED">Class Cancelled</option>
              <option value="TIMETABLE_CHANGED">Timetable Changed</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="input-group mb-0">
              <label className="input-label">Subject Name</label>
              <input
                type="text"
                value={simForm.subject}
                onChange={(e) => setSimForm({ ...simForm, subject: e.target.value })}
                className="input-field text-xs"
              />
            </div>

            {simForm.eventType === 'LOW_ATTENDANCE' && (
              <div className="input-group mb-0">
                <label className="input-label">Current % (e.g. 72)</label>
                <input
                  type="number"
                  value={simForm.currentPercentage}
                  onChange={(e) =>
                    setSimForm({ ...simForm, currentPercentage: Number(e.target.value) })
                  }
                  className="input-field text-xs"
                />
              </div>
            )}
          </div>

          {/* Multi-Channel Selection */}
          <div className="space-y-2">
            <label className="input-label">Active Delivery Channels</label>
            <div className="flex items-center gap-3">
              {['in_app', 'email', 'push'].map((ch) => (
                <label key={ch} className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simForm.channels.includes(ch)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSimForm({ ...simForm, channels: [...simForm.channels, ch] });
                      } else {
                        setSimForm({ ...simForm, channels: simForm.channels.filter((c) => c !== ch) });
                      }
                    }}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="capitalize">{ch.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={simLoading}
            className="btn btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-600"
          >
            <FiPlay className="w-3.5 h-3.5" />
            <span>{simLoading ? 'Dispatching Test...' : 'Dispatch Live Test Notification'}</span>
          </button>
        </form>
      </Modal>

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
