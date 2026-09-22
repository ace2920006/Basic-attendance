const { Server } = require('socket.io');
const Notification = require('../models/Notification');
const { sendFCMPushNotification } = require('./firebase');

let io = null;

/**
 * Initialize Socket.io Server
 * @param {object} httpServer - Node HTTP server instance
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected to Socket.io: ${socket.id}`);

    // Join user-specific room upon authentication/registration
    socket.on('join_user_room', (data) => {
      if (!data) return;
      const { userId, role, department } = data;
      
      if (userId) {
        const userRoom = `user_${userId}`;
        socket.join(userRoom);
        console.log(`👤 Socket ${socket.id} joined room: ${userRoom}`);
      }

      if (role) {
        const roleRoom = `role_${role}`;
        socket.join(roleRoom);
        console.log(`👥 Socket ${socket.id} joined room: ${roleRoom}`);
      }

      if (department) {
        const deptRoom = `dept_${department.toLowerCase().replace(/\s+/g, '_')}`;
        socket.join(deptRoom);
        console.log(`🏢 Socket ${socket.id} joined room: ${deptRoom}`);
      }
    });

    socket.on('leave_user_room', (data) => {
      if (data?.userId) socket.leave(`user_${data.userId}`);
    });

    // Join / Leave real-time classroom mode room
    socket.on('join_classroom', (data) => {
      if (!data) return;
      const { sessionId, classId } = data;
      if (sessionId) {
        socket.join(`classroom_${sessionId}`);
        console.log(`🏫 Socket ${socket.id} joined classroom: classroom_${sessionId}`);
      }
      if (classId) {
        socket.join(`class_${classId}`);
      }
    });

    socket.on('leave_classroom', (data) => {
      if (data?.sessionId) socket.leave(`classroom_${data.sessionId}`);
      if (data?.classId) socket.leave(`class_${data.classId}`);
    });

    socket.on('disconnect', () => {
      console.log(`⚡ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Get active Socket.io instance
 */
const getIO = () => {
  if (!io) {
    console.warn('Socket.io has not been initialized yet!');
  }
  return io;
};

/**
 * Broadcast real-time classroom events to all connected clients and classroom rooms
 * @param {string} event - Event name (e.g. 'classroom_session_started', 'classroom_attendance_updated', 'classroom_session_ended')
 * @param {object} payload - Event data
 */
const broadcastClassroomEvent = (event, payload) => {
  try {
    if (!io) {
      console.warn(`[Socket] Cannot emit ${event}: Socket.io not initialized`);
      return false;
    }
    // Broadcast to all clients for instant student dashboard banner
    io.emit(event, payload);

    if (payload?.sessionId) {
      io.to(`classroom_${payload.sessionId}`).emit(event, payload);
    }
    if (payload?.classId) {
      io.to(`class_${payload.classId}`).emit(event, payload);
    }
    console.log(`⚡ [Socket] Broadcast ${event}:`, {
      sessionId: payload?.sessionId,
      subject: payload?.subject,
      presentCount: payload?.stats?.presentCount || payload?.presentCount
    });
    return true;
  } catch (err) {
    console.error(`[Socket] Error emitting ${event}:`, err.message);
    return false;
  }
};

/**
 * Dispatch real-time notification to user, role, department, or broadcast
 * Delegates to centralized notificationService for multi-channel delivery (In-App, Email, Push)
 */
const sendNotification = async (options) => {
  try {
    const { dispatchNotification } = require('../services/notificationService');
    return await dispatchNotification(options);
  } catch (error) {
    console.error('Error dispatching real-time notification:', error);
    return [];
  }
};

module.exports = {
  initSocket,
  getIO,
  broadcastClassroomEvent,
  sendNotification
};
