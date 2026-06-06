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
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
