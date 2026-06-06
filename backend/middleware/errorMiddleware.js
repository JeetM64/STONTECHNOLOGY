/**
 * Centralized error handler middleware
 * Catches 500 errors and formats API error responses consistently
 */
const errorHandler = (err, req, res, next) => {
  // Determine status code - default to 500 if not set
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Set response status and return formatted error JSON
  res.status(statusCode).json({
    message: err.message,
    // Include stack trace in development mode only
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = { errorHandler };
