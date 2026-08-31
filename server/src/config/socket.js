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
  sendNotification
};
