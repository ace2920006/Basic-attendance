import React, { useState, useRef, useEffect } from 'react';
import {
  FiSearch,
  FiBell,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiVolume2,
  FiVolumeX,
  FiSmartphone,
  FiRadio,
  FiX,
  FiArrowRight
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import CreateAnnouncementModal from '../common/CreateAnnouncementModal';

export default function Header({ title, subtitle, user: userProp }) {
  const { user: authUser } = useAuth();
  const activeUser = authUser || userProp;
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    soundEnabled,
    setSoundEnabled,
    enablePushNotifications
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [pushStatus, setPushStatus] = useState(null);
  const dropdownRef = useRef(null);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEnablePush = async () => {
    const res = await enablePushNotifications();
    if (res?.success) {
      setPushStatus('Push Notifications Active!');
    } else {
      setPushStatus(res?.message || 'Permission denied');
    }
    setTimeout(() => setPushStatus(null), 3000);
  };

  const getIconForType = (type, eventType) => {
    if (eventType === 'LOW_ATTENDANCE' || type === 'error') return <FiAlertTriangle className="w-4 h-4 text-rose-400" />;
    if (eventType === 'CLASS_CANCELLED' || type === 'warning') return <FiAlertTriangle className="w-4 h-4 text-amber-400" />;
    if (type === 'success') return <FiCheckCircle className="w-4 h-4 text-emerald-400" />;
    return <FiInfo className="w-4 h-4 text-indigo-400" />;
  };

  const getNotificationsPath = () => {
    if (activeUser?.role === 'student') return '/student/notifications';
    return '#';
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative hidden md:block w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search classes, logs, students..."
            className="input-field pl-9 py-1.5 text-xs bg-slate-950/60 border-slate-800 focus:border-indigo-500"
          />
        </div>

        {/* Date Display Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-950/50 border border-slate-800 rounded-xl text-xs text-slate-300">
          <FiCalendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>{currentDate}</span>
        </div>

        {/* Notifications Bell Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`relative p-2.5 rounded-xl border transition-all ${
              isOpen
                ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-950/50'
                : 'bg-slate-950/50 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
            }`}
            aria-label="Notifications"
          >
            <FiBell className="w-4 h-4" />
            {unreadCount > 0 && (
              <>
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-bold text-white ring-2 ring-slate-900 animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </>
            )}
          </button>

          {/* Interactive Glassmorphism Notification Drawer */}
          {isOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Header Controls */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <FiBell className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Sound Toggle */}
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg text-xs transition-colors"
                    title={soundEnabled ? 'Mute notification chime' : 'Unmute chime'}
                  >
                    {soundEnabled ? <FiVolume2 className="w-3.5 h-3.5 text-indigo-400" /> : <FiVolumeX className="w-3.5 h-3.5 text-slate-500" />}
                  </button>

                  {/* Mark All Read */}
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>

              {/* Push & Announcement Action Banner */}
              <div className="p-2.5 bg-indigo-950/20 border-b border-slate-800 flex items-center justify-between gap-2 text-xs">
                {(activeUser?.role === 'teacher' || activeUser?.role === 'admin') ? (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIsAnnouncementOpen(true);
                    }}
                    className="w-full py-1.5 px-3 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FiRadio className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Broadcast Announcement</span>
                  </button>
                ) : (
                  <button
                    onClick={handleEnablePush}
                    className="w-full py-1.5 px-3 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FiSmartphone className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{pushStatus || 'Enable FCM Web Push Alerts'}</span>
                  </button>
                )}
              </div>

              {/* Notification List Body */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center px-4 space-y-2">
                    <FiBell className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400">No notifications yet</p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => notif.unread && markAsRead(notif._id)}
                      className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                        notif.unread
                          ? 'bg-indigo-950/20 hover:bg-indigo-900/30'
                          : 'bg-transparent hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="mt-0.5 p-1.5 bg-slate-950/80 rounded-lg border border-slate-800 shrink-0">
                        {getIconForType(notif.type, notif.eventType)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-semibold text-white truncate">{notif.title}</h4>
                          {notif.unread && (
                            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        {notif.smartAdvice && (
                          <span className="mt-1 inline-block px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[9px] font-bold">
                            +{notif.smartAdvice.lecturesNeeded} lectures needed
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer View All Link */}
              <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-center">
                <Link
                  to={getNotificationsPath()}
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 hover:underline"
                >
                  <span>View All Notifications Page</span>
                  <FiArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Mini Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <img
            src={activeUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt={activeUser?.name || 'User'}
            className="w-8 h-8 rounded-lg object-cover border border-slate-700"
          />
          <div className="hidden sm:block text-left">
            <span className="block text-xs font-semibold text-white leading-tight">
              {activeUser?.name?.split(' ')[0] || 'User'}
            </span>
            <span className="block text-[10px] text-slate-400 capitalize">{activeUser?.role || 'User'}</span>
          </div>
        </div>
      </div>

      {/* Broadcast Announcement Modal */}
      <CreateAnnouncementModal
        isOpen={isAnnouncementOpen}
        onClose={() => setIsAnnouncementOpen(false)}
      />
    </header>
  );
}
