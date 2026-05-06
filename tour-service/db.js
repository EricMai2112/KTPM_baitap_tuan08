const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'bookings';

/**
 * Connect to MongoDB
 */
async function connectDatabase() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    console.log('[Tour Service] Connecting to MongoDB...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: MONGODB_DB_NAME,
      maxPoolSize: 10
    });

    console.log(`[Tour Service] ✅ Connected to MongoDB successfully (db: ${MONGODB_DB_NAME})`);
    return true;
  } catch (error) {
    console.error('[Tour Service] ❌ MongoDB Connection Error:', error.message);
    return false;
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    console.log('[Tour Service] Disconnected from MongoDB');
  } catch (error) {
    console.error('[Tour Service] Error disconnecting from MongoDB:', error.message);
  }
}

/**
 * Get MongoDB connection status
 */
function getConnectionStatus() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
  getConnectionStatus
};
