const mongoose = require('mongoose');

/**
 * Connects to MongoDB database using Mongoose client.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sk_cakes');
    
    console.log(`🍀 MongoDB Connected: ${conn.connection.host}`);
    
    // Connection monitors
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB connection lost. Attempting to reconnect...');
    });
    
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    // Exit process with failure in production, retry in development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
