import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getSocket, initSocketClient } from '../services/socket';
import { useAuth } from './AuthContext';
import {
  getActiveClassroomSessionApi,
  startClassroomSessionApi,
  stopClassroomSessionApi,
  checkInClassroomSessionApi,
  simulateCheckInApi
} from '../services/api';

const RealtimeClassroomContext = createContext(null);

export function RealtimeClassroomProvider({ children }) {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState(null);
  const [livePresent, setLivePresent] = useState(0);
  const [liveTotal, setLiveTotal] = useState(55);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [latestStudent, setLatestStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [error, setError] = useState(null);

  // Audio chime for real-time classroom events
  const playClassroomChime = useCallback((type = 'session_start') => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'session_start') {
        // Welcoming major third chime (C5 -> E5)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'checkin') {
        // High check-in blip (G5 -> C6)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
        osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1); // C6
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      }
    } catch (e) {
      // Audio suppressed by browser policy
    }
  }, []);

  // Fetch active session from REST API
  const fetchActiveSession = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getActiveClassroomSessionApi();
      if (res?.success && res.active && res.data) {
        setActiveSession(res.data);
        setLivePresent(res.data.stats?.presentCount || 0);
        setLiveTotal(res.data.stats?.totalStudents || 55);
        setHasCheckedIn(!!res.hasCheckedIn);
        if (Array.isArray(res.data.recentCheckins)) {
          setRecentCheckins(res.data.recentCheckins);
        }
      } else {
        setActiveSession(null);
        setLivePresent(0);
        setLiveTotal(55);
        setHasCheckedIn(false);
      }
    } catch (err) {
      console.warn('[RealtimeClassroom] Failed to fetch active session:', err.message);
    }
  }, [user]);

  // Set up Socket.IO listeners
  useEffect(() => {
    if (!user) return;

    fetchActiveSession();

    let socket = getSocket();
    if (!socket) {
      socket = initSocketClient(user);
    }

    // Listener 1: Teacher starts attendance session
    const handleSessionStarted = (data) => {
      console.log('⚡ [Socket.IO] Real-Time Classroom Started:', data);
      setActiveSession({
        _id: data.sessionIdMongo || data._id,
        sessionId: data.sessionId,
        subject: data.subject || 'Database Systems',
        subjectCode: data.subjectCode || 'CS401',
        timeSlot: data.timeSlot || '10:00 - 11:00',
        division: data.division || 'Sec A',
        room: data.room || '302-B',
        teacherName: data.teacherName || 'Faculty',
        status: 'Active',
        stats: data.stats || { presentCount: 0, totalStudents: 55 },
        qrSecretToken: data.qrSecretToken
      });
      setLivePresent(data.stats?.presentCount || 0);
      setLiveTotal(data.stats?.totalStudents || 55);
      setHasCheckedIn(false);
      setRecentCheckins([]);
      setLatestStudent(null);
      playClassroomChime('session_start');
    };

    // Listener 2: Live Present Count Updates as students check in
    const handleAttendanceUpdated = (data) => {
      console.log('⚡ [Socket.IO] Classroom Attendance Updated:', data);
      if (data.stats) {
        setLivePresent(data.stats.presentCount);
        if (data.stats.totalStudents) setLiveTotal(data.stats.totalStudents);
      }
      if (data.latestStudent) {
        setLatestStudent(data.latestStudent);
        setRecentCheckins((prev) => [data.latestStudent, ...prev.slice(0, 19)]);
        // If current student was the one checking in, mark hasCheckedIn true
        if (user?._id && data.latestStudent.id && String(data.latestStudent.id) === String(user._id)) {
          setHasCheckedIn(true);
        }
        playClassroomChime('checkin');
      }
    };

    // Listener 3: Teacher ends attendance session
    const handleSessionEnded = (data) => {
      console.log('⚡ [Socket.IO] Real-Time Classroom Ended:', data);
      setActiveSession((prev) => (prev ? { ...prev, status: 'Completed', stats: data.stats || prev.stats } : null));
      setTimeout(() => {
        setActiveSession(null);
      }, 4000);
    };

    socket.on('classroom_session_started', handleSessionStarted);
    socket.on('classroom_attendance_updated', handleAttendanceUpdated);
    socket.on('classroom_session_ended', handleSessionEnded);

    return () => {
      socket.off('classroom_session_started', handleSessionStarted);
      socket.off('classroom_attendance_updated', handleAttendanceUpdated);
      socket.off('classroom_session_ended', handleSessionEnded);
    };
  }, [user, fetchActiveSession, playClassroomChime]);

  // Teacher Action: Start Real-Time Classroom Attendance
  const startSession = async (customOptions = {}) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        subject: customOptions.subject || 'Database Systems',
        subjectCode: customOptions.subjectCode || 'CS401',
        timeSlot: customOptions.timeSlot || '10:00 - 11:00',
        totalStudents: customOptions.totalStudents || 55,
        room: customOptions.room || '302-B',
        division: customOptions.division || 'Sec A',
        mode: customOptions.mode || 'QR',
        classId: customOptions.classId || undefined
      };

      const res = await startClassroomSessionApi(payload);
      if (res?.success && res.data) {
        setActiveSession(res.data);
        setLivePresent(res.data.stats?.presentCount || 0);
        setLiveTotal(res.data.stats?.totalStudents || 55);
        return res.data;
      }
      throw new Error(res?.message || 'Failed to start classroom session');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Teacher Action: Stop Attendance Session
  const stopSession = async () => {
    if (!activeSession?._id) return;
    setLoading(true);
    try {
      const res = await stopClassroomSessionApi(activeSession._id);
      setActiveSession(null);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Student Action: Check in to active session
  const checkIn = async () => {
    if (!activeSession?._id) return;
    setCheckingIn(true);
    setError(null);
    try {
      const res = await checkInClassroomSessionApi(activeSession._id);
      if (res?.success) {
        setHasCheckedIn(true);
        if (res.stats) {
          setLivePresent(res.stats.presentCount);
        }
        playClassroomChime('checkin');
        return res;
      }
      throw new Error(res?.message || 'Check-in failed');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCheckingIn(false);
    }
  };

  // Simulation Action: Simulate student check-in for testing & live demonstration
  const simulateCheckIn = async (studentName, rollNo) => {
    if (!activeSession?._id) return;
    try {
      const res = await simulateCheckInApi(activeSession._id, { studentName, rollNo });
      return res;
    } catch (err) {
      console.error('[SimulateCheckin] Error:', err);
    }
  };

  const isSessionActive = Boolean(activeSession && activeSession.status === 'Active');

  const value = {
    activeSession,
    isSessionActive,
    livePresent,
    liveTotal,
    hasCheckedIn,
    recentCheckins,
    latestStudent,
    loading,
    checkingIn,
    error,
    startSession,
    stopSession,
    checkIn,
    simulateCheckIn,
    refreshActiveSession: fetchActiveSession
  };

  return (
    <RealtimeClassroomContext.Provider value={value}>
      {children}
    </RealtimeClassroomContext.Provider>
  );
}

export function useRealtimeClassroom() {
  const context = useContext(RealtimeClassroomContext);
  if (!context) {
    throw new Error('useRealtimeClassroom must be used within a RealtimeClassroomProvider');
  }
  return context;
}

export default RealtimeClassroomContext;
