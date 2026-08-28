const User = require('../models/User');
const Member = require('../models/Member');
const Activity = require('../models/Activity');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const sendEmail = require('../utils/sendEmail');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const { ACTIVITY_ACTIONS, MEMBER_STATUS, ROLES } = require('../constants');

// @desc    Register new user / member
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, role = ROLES.MEMBER, membershipType = 'Student', department, course } = req.body;

  if (!name || !email || !password || !phone) {
    return next(new AppError('Please provide name, email, password, and phone number', 400));
  }

  // Check if email already registered in User or Member
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  const existingMember = await Member.findOne({ email: email.toLowerCase() });

  if (existingUser || existingMember) {
    return next(new AppError('An account with this email address already exists.', 400));
  }

  let createdUser;
  let isMember = false;

  if (role === ROLES.ADMIN || role === ROLES.LIBRARIAN) {
    createdUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role,
    });
  } else {
    // Member Signup
    isMember = true;
    const count = await Member.countDocuments();
    const membershipId = `LIB-${String(count + 10001).padStart(5, '0')}`;

    createdUser = await Member.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      membershipId,
      membershipType,
      department: department || 'General',
      course: course || '',
      role: ROLES.MEMBER,
      status: MEMBER_STATUS.ACTIVE,
    });
  }

  const assignedRole = createdUser.role || ROLES.MEMBER;
  const accessToken = generateAccessToken(createdUser._id, assignedRole);
  const refreshToken = generateRefreshToken(createdUser._id);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  await Activity.create({
    userId: createdUser._id,
    userName: createdUser.name,
    action: ACTIVITY_ACTIONS.MEMBER_CREATED,
    entity: isMember ? 'Member' : 'User',
    entityId: createdUser._id.toString(),
    description: `New account registered: "${createdUser.name}" (${assignedRole})`,
  });

  res.status(201).json({
    success: true,
    message: 'Account registered successfully!',
    data: {
      user: {
        _id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: assignedRole,
        profileImage: createdUser.profileImage,
        phone: createdUser.phone,
        membershipId: isMember ? createdUser.membershipId : undefined,
      },
      accessToken,
    },
  });
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  let user = await User.findOne({ email }).select('+password');
  let isMember = false;

  if (!user) {
    // If not found in User, check Member using email or membershipId
    user = await Member.findOne({ 
      $or: [{ email: email.toLowerCase() }, { membershipId: email }] 
    }).select('+password');
    isMember = true;
  }
  
  console.log("Login Attempt:", { email, foundUser: !!user, hasPassword: !!(user && user.password) });
  if (user) console.log("Password Match result:", await user.matchPassword(password));

  if (!user || !(await user.matchPassword(password))) {
    return next(new AppError('Invalid credentials', 401));
  }

  if (!user.isActive && user.status !== MEMBER_STATUS.ACTIVE && !user.role) {
    // Basic check. User uses isActive, Member uses status
    return next(new AppError('Your account has been deactivated. Contact Admin.', 403));
  }

  // Generate tokens. user.role is either Admin/Librarian (from User) or Member (from Member)
  const role = user.role || ROLES.MEMBER;
  const accessToken = generateAccessToken(user._id, role);
  const refreshToken = generateRefreshToken(user._id);

  // Set HTTP-Only Cookie for Refresh Token
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Log Activity
  await Activity.create({
    userId: user._id,
    userName: user.name,
    action: ACTIVITY_ACTIONS.LOGIN,
    entity: isMember ? 'Member' : 'User',
    entityId: user._id.toString(),
    description: `${user.name} (${role}) logged in`,
    ipAddress: req.ip || '127.0.0.1',
    userAgent: req.get('User-Agent') || '',
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: role,
        profileImage: user.profileImage,
        phone: user.phone,
        membershipId: isMember ? user.membershipId : undefined,
      },
      accessToken,
    },
  });
});

// @desc    Send Email OTP to user/member
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide Email or Member ID', 400));
  }

  let user = await User.findOne({ email: email.toLowerCase() });
  let isMember = false;

  if (!user) {
    user = await Member.findOne({
      $or: [{ email: email.toLowerCase() }, { membershipId: email }],
    });
    isMember = true;
  }

  if (!user) {
    return next(new AppError('No registered account found with this Email or Member ID', 404));
  }

  if (isMember && user.status !== MEMBER_STATUS.ACTIVE) {
    return next(new AppError('Your member account is inactive. Please contact Admin.', 403));
  }

  if (!isMember && user.isActive === false) {
    return next(new AppError('Your account has been deactivated. Please contact Admin.', 403));
  }

  // Generate 6-digit OTP code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.loginOtp = otp;
  user.loginOtpExpire = otpExpire;
  await user.save({ validateBeforeSave: false });

  // Email template
  const subject = '🔐 Your Login OTP - Library Management System';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #FF6B00; font-size: 22px; margin: 0; font-weight: 800;">Library Management System</h2>
        <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Email Verification Code for Login</p>
      </div>

      <div style="background-color: #FFF4ED; border: 1.5px dashed #FF6B00; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; font-weight: 700;">YOUR ONE-TIME PASSWORD</span>
        <h1 style="font-size: 38px; color: #FF6B00; letter-spacing: 8px; margin: 8px 0; font-family: 'Courier New', Courier, monospace; font-weight: 800;">${otp}</h1>
        <p style="font-size: 12px; color: #64748b; margin: 0;">⏱️ Valid for <strong>10 minutes</strong> only</p>
      </div>

      <p style="font-size: 14px; color: #334155; line-height: 1.6;">Hello <strong>${user.name}</strong>,</p>
      <p style="font-size: 13px; color: #475569; line-height: 1.6;">You requested a one-time password to log in to your Library Management Portal. Enter this OTP to complete your sign in.</p>
      
      <div style="background-color: #f8fafc; border-radius: 10px; p-3; padding: 12px; margin-top: 16px; font-size: 12px; color: #64748b;">
        🔒 <strong>Security Warning:</strong> Never share your OTP with anyone. Our support team will never ask for your password or OTP.
      </div>

      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 16px 0;" />
      <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">If you did not request this OTP code, please secure your account immediately.</p>
    </div>
  `;

  await sendEmail({ to: user.email, subject, html });

  res.status(200).json({
    success: true,
    message: `OTP sent successfully to ${user.email}`,
    devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
  });
});

// @desc    Verify Email OTP & Login
// @route   POST /api/auth/login-otp
// @access  Public
const loginWithOtp = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new AppError('Please provide Email/Member ID and OTP code', 400));
  }

  let user = await User.findOne({ email: email.toLowerCase() }).select('+loginOtp +loginOtpExpire');
  let isMember = false;

  if (!user) {
    user = await Member.findOne({
      $or: [{ email: email.toLowerCase() }, { membershipId: email }],
    }).select('+loginOtp +loginOtpExpire');
    isMember = true;
  }

  if (!user) {
    return next(new AppError('Invalid Email/Member ID or OTP code', 401));
  }

  if (!user.loginOtp || !user.loginOtpExpire) {
    return next(new AppError('OTP has not been requested or has expired. Please click "Send OTP".', 400));
  }

  if (user.loginOtp !== otp.toString().trim()) {
    return next(new AppError('Incorrect OTP code. Please check and try again.', 400));
  }

  if (new Date() > user.loginOtpExpire) {
    return next(new AppError('OTP code has expired. Please request a new OTP.', 400));
  }

  // Clear OTP
  user.loginOtp = undefined;
  user.loginOtpExpire = undefined;
  await user.save({ validateBeforeSave: false });

  // Generate tokens
  const role = user.role || ROLES.MEMBER;
  const accessToken = generateAccessToken(user._id, role);
  const refreshToken = generateRefreshToken(user._id);

  // Set HTTP-Only Cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // Log Activity
  await Activity.create({
    userId: user._id,
    userName: user.name,
    action: ACTIVITY_ACTIONS.LOGIN,
    entity: isMember ? 'Member' : 'User',
    entityId: user._id.toString(),
    description: `${user.name} (${role}) logged in via Email OTP`,
    ipAddress: req.ip || '127.0.0.1',
    userAgent: req.get('User-Agent') || '',
  });

  res.status(200).json({
    success: true,
    message: 'OTP verification successful. Welcome!',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: role,
        profileImage: user.profileImage,
        phone: user.phone,
        membershipId: isMember ? user.membershipId : undefined,
      },
      accessToken,
    },
  });
});

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    await Activity.create({
      userId: req.user._id,
      userName: req.user.name,
      action: ACTIVITY_ACTIONS.LOGOUT,
      entity: 'User',
      entityId: req.user._id.toString(),
      description: `${req.user.name} logged out`,
    });
  }

  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  let user;
  if (req.user.role === ROLES.MEMBER) {
    user = await Member.findById(req.user._id);
    if (user) user = { ...user.toObject(), role: ROLES.MEMBER };
  } else {
    user = await User.findById(req.user._id);
  }
  
  res.status(200).json({
    success: true,
    data: user,
  });
});

module.exports = {
  login,
  register,
  sendOtp,
  loginWithOtp,
  logout,
  getMe,
};
