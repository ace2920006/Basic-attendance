const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const { initSocket } = require('./config/socket');

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io Server
initSocket(server);

// Connect Database and Start Server
const startServer = async () => {
  try {
    await connectDB();
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running with Socket.io in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;

