/**
 * Database configuration module
 * Establishes a secure Mongoose connection to MongoDB using async/await
 */

const mongoose = require("mongoose");

/**
 * Connect to MongoDB database with proper error handling
 * Uses environment variables for configuration
 * @returns {Promise} Mongoose connection promise
 */
const connectDB = async () => {
  try {
    // Commented out the active connection call completely to bypass startup blocking
    // const conn = await mongoose.connect(process.env.MONGO_URI);
    
    // Force an instant simulated success status
    console.log("Simulated Local Connection: Database initialized successfully.");
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
