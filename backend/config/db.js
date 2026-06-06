const mongoose = require("mongoose");

/**
 * Connect to MongoDB database with proper error handling
 * Gracefully handles startup connection issues to ensure server uptime.
 */
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn("Warning: MONGO_URI is not set. Database operations will be unavailable.");
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Warning: Failed to connect to MongoDB: ${error.message}`);
    // Do not call process.exit(1) to keep the Express server running
  }
};

module.exports = connectDB;
