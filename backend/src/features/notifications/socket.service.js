'use strict';

let io = null;

function initSocket(server) {
  try {
    const { Server } = require('socket.io');
    io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
        credentials: true,
      },
    });

    io.on('connection', (socket) => {
      console.log(`[Socket.IO] Client connected: ${socket.id}`);

      socket.on('join_user', (userId) => {
        socket.join(`user:${userId}`);
      });

      socket.on('join_role', (role) => {
        socket.join(`role:${role}`);
      });

      socket.on('disconnect', () => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
      });
    });
  } catch (err) {
    console.warn('[Socket.IO] Socket.io not attached or module unavailable');
  }
}

function getIO() {
  return io;
}

function emitNotification(notification) {
  if (!io) return;
  if (notification.userId) {
    io.to(`user:${notification.userId}`).emit('notification', notification);
  }
  if (notification.recipientRole) {
    io.to(`role:${notification.recipientRole}`).emit('notification', notification);
  }
}

module.exports = {
  initSocket,
  getIO,
  emitNotification,
};
