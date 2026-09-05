'use strict';

require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');
const socketConfig = require('./src/features/notifications/socket');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    // Create HTTP server instead of using app.listen directly
    const server = require('http').createServer(app);
    
    // Initialize socket.io
    socketConfig.init(server);
    
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
