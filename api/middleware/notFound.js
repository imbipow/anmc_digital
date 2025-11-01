/**
 * 404 Not Found middleware
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    error: {
      message: `Route ${req.originalUrl} not found`,
      status: 404
    }
  });
};

module.exports = notFound;
