import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { initSocketClient, getSocket } from '../services/socket';
import {
  getNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  deleteNotificationApi,
  sendAnnouncementApi
} from '../services/api';
import { requestPushPermission as requestFCMPush } from '../config/firebase';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  // Play subtle audio alert chime via Web Audio API
  const playChimeSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Audio playback suppressed by browser policy if un-interacted
    }
  }, [soundEnabled]);

  // Remove toast by ID
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Add toast alert popup
  const addToast = useCallback((notif) => {
    const toastId = `toast_${Date.now()}_${Math.random()}`;
    const newToast = {
      id: toastId,
      title: notif.title,
      message: notif.message,
      type: notif.type || 'info',
      eventType: notif.eventType || 'GENERAL',
      timestamp: new Date()
    };

    setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // max 5 toasts visible

    // Auto dismiss toast after 5 seconds
    setTimeout(() => {
      removeToast(toastId);
    }, 5000);
  }, [removeToast]);

  // Fetch initial notifications list
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await getNotificationsApi({ limit: 50 });
      if (res?.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initialize socket & setup real-time listeners
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const socket = initSocketClient(user);

    const handleRealtimeNotification = (incomingNotif) => {
      console.log('🔔 Real-time notification received:', incomingNotif);

      const formattedNotif = {
        _id: incomingNotif._id || `notif_${Date.now()}`,
        title: incomingNotif.title,
        message: incomingNotif.message,
        type: incomingNotif.type || 'info',
        eventType: incomingNotif.eventType || 'GENERAL',
        unread: true,
        createdAt: incomingNotif.createdAt || new Date().toISOString()
      };

      setNotifications((prev) => [formattedNotif, ...prev]);
      setUnreadCount((count) => count + 1);

      // Trigger floating toast and sound chime
      addToast(formattedNotif);
      playChimeSound();
    };

    socket.on('notification_received', handleRealtimeNotification);

    return () => {
      socket.off('notification_received', handleRealtimeNotification);
    };
  }, [user, fetchNotifications, addToast, playChimeSound]);

  // Mark single notification as read
  const markAsRead = async (id) => {
    try {
      await markNotificationReadApi(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, unread: false } : n))
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await markAllNotificationsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      await deleteNotificationApi(id);
      const target = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (target?.unread) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Broadcast announcement helper
  const sendAnnouncement = async (announcementData) => {
    const res = await sendAnnouncementApi(announcementData);
    return res;
  };

  // Enable Push Notifications helper
  const enablePushNotifications = async () => {
    return await requestFCMPush();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        soundEnabled,
        setSoundEnabled,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        sendAnnouncement,
        enablePushNotifications,
        removeToast
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
