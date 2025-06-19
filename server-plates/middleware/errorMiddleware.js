const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  console.log('Error handler middleware triggered:', err.name, err.message);

  // Handle Sequelize errors
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = err.errors.map(e => e.message).join(', ');
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'Resource already exists';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Not authorized';
  }

  // Handle connection errors
  if (err.name === 'SequelizeConnectionError' || err.name === 'ConnectionError') {
    statusCode = 503;
    message = 'Database connection error, using fallback data';
    
    // For these errors, we don't want to stop the app, so we'll just log and continue
    console.error('Database connection error in error handler:', err);
    return res.status(statusCode).json({
      success: false,
      message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  }

  if (!res.headersSent) {
    res.status(statusCode).json({
      success: false,
      message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  }
};

const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };