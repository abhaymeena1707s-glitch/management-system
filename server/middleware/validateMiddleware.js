const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (error) {
    const formattedErrors = error.errors
      ? error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))
      : [{ message: error.message }];

    return next(new AppError('Validation failed', 400, formattedErrors));
  }
};

module.exports = { validate };
