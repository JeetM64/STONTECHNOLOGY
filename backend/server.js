/**
 * Main server entry point for Campus Interview Tracking System
 * Wires up Express middleware, routes, and error handling
 */

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// Import database connection
const connectDB = require("./config/db");

// Import middleware and routes
const { errorHandler } = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const companyRoutes = require("./routes/companyRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

// Load environment variables from .env file
dotenv.config();

// Establish MongoDB connection
connectDB();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Root route for health check
app.get("/", function(req, res) {
  res.json({ message: "Campus Interview Tracking API is running" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/applications", applicationRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  const path = require("path");
  // Set static folder
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  
  // Any route that is not API should render React SPA
  app.get("/*splat", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
  });
}

// Custom error handler middleware (must be after routes)
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, function() {
  console.log("Server running on port " + PORT);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", function(err) {
  console.error("Unhandled Rejection Error: " + err.message);
  server.close(function() { process.exit(1); });
});

module.exports = app;
