const AppError = require('../utils/AppError');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role '${req.user.role}' is not authorized to perform this action. Required role: ${roles.join(' or ')}`,
          403
        )
      );
    }

    next();
  };
};

module.exports = { authorize };
