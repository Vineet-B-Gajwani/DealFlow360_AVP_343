'use strict';

const { Server } = require('socket.io');

let io;

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: '*', // Adjust this for production
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      // Clients should emit 'join' with their user ID (or customer ID) to get personal notifications
      socket.on('join', (userId) => {
        socket.join(userId);
      });
    });

    return io;
  },
  
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};
