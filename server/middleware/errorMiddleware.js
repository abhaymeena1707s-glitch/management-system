const AppError = require('../utils/AppError');

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    console.error('[Error Details]', err);
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    err = new AppError(`Invalid format for field: ${err.path}`, 400);
  }

  // Handle Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    err = new AppError(`Duplicate field value: ${field} = "${value}". Please use another value!`, 400);
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => ({
      field: el.path,
      message: el.message,
    }));
    err = new AppError('Database validation failed', 400, errors);
  }

  // Handle JWT error
  if (err.name === 'JsonWebTokenError') {
    err = new AppError('Invalid authentication token. Please log in again.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    err = new AppError('Authentication token has expired. Please log in again.', 401);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = globalErrorHandler;
