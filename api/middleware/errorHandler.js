/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error status
  const status = err.statusCode || 500;

  // Format error response
  const errorResponse = {
    error: {
      message: err.message || 'Internal server error',
      status
    }
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  // Send error response
  res.status(status).json(errorResponse);
};

module.exports = errorHandler;
