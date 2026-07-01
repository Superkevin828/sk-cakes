// Load variables from environment
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

// Read active port setting
const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || '0.0.0.0';

// Connect to MongoDB Database
connectDB().then(() => {
  // Start the HTTP express listener
  const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 SK Cakes API Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📡 LAN URL: http://${HOST === '0.0.0.0' ? 'YOUR_LOCAL_IP' : HOST}:${PORT}`);
  });

  // Handle Unhandled Promise Rejections (e.g. lost database during runtime)
  process.on('unhandledRejection', (err, promise) => {
    console.error(`💥 Unhandled Promise Rejection: ${err.message}`);
    // Close server and shutdown
    server.close(() => process.exit(1));
  });
});
