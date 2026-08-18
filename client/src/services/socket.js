import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : 'http://localhost:5000';

let socket = null;

export const initSocketClient = (userData) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to Socket.io server with ID:', socket.id);
      if (userData) {
        socket.emit('join_user_room', {
          userId: userData._id || userData.id,
          role: userData.role,
          department: userData.department
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from Socket.io server');
    });
  } else if (userData && socket.connected) {
    socket.emit('join_user_room', {
      userId: userData._id || userData.id,
      role: userData.role,
      department: userData.department
    });
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
