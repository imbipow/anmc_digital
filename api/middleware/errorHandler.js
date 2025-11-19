/**
 * Error handling middleware
 */
const errorHandler = (err, _req, res, _next) => {
  console.error('Error:', err);

  // Default error status
  const status = err.statusCode || 500;

  // Format error response to match route handler format
  const errorResponse = {
    success: false,
    error: err.message || 'Internal server error'
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Send error response
  res.status(status).json(errorResponse);
};

module.exports = errorHandler;
