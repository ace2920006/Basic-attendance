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
 * Saves notification to MongoDB and emits WS event + FCM push notification
 */
const sendNotification = async ({
  recipientId = null,
  role = null,
  department = null,
  title,
  message,
  type = 'info',
  eventType = 'GENERAL',
  data = {}
}) => {
  try {
    let savedNotifications = [];

    // Case 1: Targeted to specific user
    if (recipientId) {
      const notif = await Notification.create({
        recipient: recipientId,
        title,
        message,
        type,
        eventType,
        data,
        unread: true
      });
      savedNotifications.push(notif);

      if (io) {
        io.to(`user_${recipientId}`).emit('notification_received', notif);
      }

      // Trigger FCM Push notification asynchronously
      sendFCMPushNotification({ recipientId, title, message, data });
    }
    // Case 2: Broadcast to role (e.g. 'student', 'teacher')
    else if (role) {
      const User = require('../models/User');
      const targetUsers = await User.find({ role }).select('_id');
      const docs = targetUsers.map((u) => ({
        recipient: u._id,
        title,
        message,
        type,
        eventType,
        data,
        unread: true
      }));

      if (docs.length > 0) {
        savedNotifications = await Notification.insertMany(docs);
      }

      if (io) {
        io.to(`role_${role}`).emit('notification_received', {
          title,
          message,
          type,
          eventType,
          data,
          createdAt: new Date()
        });
      }
    }
    // Case 3: Department broadcast
    else if (department) {
      const User = require('../models/User');
      const targetUsers = await User.find({ department }).select('_id');
      const docs = targetUsers.map((u) => ({
        recipient: u._id,
        title,
        message,
        type,
        eventType,
        data,
        unread: true
      }));

      if (docs.length > 0) {
        savedNotifications = await Notification.insertMany(docs);
      }

      if (io) {
        const deptRoom = `dept_${department.toLowerCase().replace(/\s+/g, '_')}`;
        io.to(deptRoom).emit('notification_received', {
          title,
          message,
          type,
          eventType,
          data,
          createdAt: new Date()
        });
      }
    }
    // Case 4: System-wide broadcast to all
    else {
      const User = require('../models/User');
      const allUsers = await User.find().select('_id');
      const docs = allUsers.map((u) => ({
        recipient: u._id,
        title,
        message,
        type,
        eventType,
        data,
        unread: true
      }));

      if (docs.length > 0) {
        savedNotifications = await Notification.insertMany(docs);
      }

      if (io) {
        io.emit('notification_received', {
          title,
          message,
          type,
          eventType,
          data,
          createdAt: new Date()
        });
      }
    }

    return savedNotifications;
  } catch (error) {
    console.error('Error dispatching real-time notification:', error);
  }
};

module.exports = {
  initSocket,
  getIO,
  sendNotification
};
