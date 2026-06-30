// Load variables from environment
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

// Read active port setting
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB().then(() => {
  // Start the HTTP express listener
  const server = app.listen(PORT, () => {
    console.log(`🚀 SK Cakes API Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    console.log(`📡 URL: http://localhost:${PORT}`);
  });

  // Handle Unhandled Promise Rejections (e.g. lost database during runtime)
  process.on('unhandledRejection', (err, promise) => {
    console.error(`💥 Unhandled Promise Rejection: ${err.message}`);
    // Close server and shutdown
    server.close(() => process.exit(1));
  });
});
