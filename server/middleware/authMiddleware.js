const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Extract token from Header or Cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new AppError('Authentication required. Please log in.', 401));
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'super_secret_access_token_key_library_2026'
    );

    // 3. Check if user still exists
    let user = await User.findById(decoded.id);
    let isMember = false;
    
    if (!user) {
      user = await require('../models/Member').findById(decoded.id);
      if (user) {
        user.role = require('../constants').ROLES.MEMBER;
        isMember = true;
      }
    }

    if (!user || (!isMember && !user.isActive) || (isMember && user.status !== require('../constants').MEMBER_STATUS.ACTIVE)) {
      return next(new AppError('User account not found or deactivated.', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired token. Please log in again.', 401));
  }
});

module.exports = { protect };
