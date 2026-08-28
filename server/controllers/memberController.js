const Member = require('../models/Member');
const IssueTransaction = require('../models/IssueTransaction');
const Fine = require('../models/Fine');
const Activity = require('../models/Activity');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ACTIVITY_ACTIONS, ISSUE_STATUS } = require('../constants');

// @desc    Get member statistics summary
// @route   GET /api/members/stats
// @access  Private
const getMemberStats = asyncHandler(async (req, res) => {
  const total = await Member.countDocuments();
  const active = await Member.countDocuments({ status: 'Active' });
  const students = await Member.countDocuments({ membershipType: 'Student' });
  const faculty = await Member.countDocuments({ membershipType: 'Faculty' });
  const staff = await Member.countDocuments({ membershipType: 'Staff' });
  const expired = await Member.countDocuments({ status: { $in: ['Expired', 'Suspended'] } });

  res.status(200).json({
    success: true,
    data: {
      total,
      active,
      students,
      faculty,
      staff,
      expired,
    },
  });
});

// @desc    Get all members with pagination, search & status filter
// @route   GET /api/members
// @access  Private
const getMembers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const { search, status, membershipType } = req.query;

  let query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { membershipId: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  if (status) query.status = status;
  if (membershipType) query.membershipType = membershipType;

  const total = await Member.countDocuments(query);
  const members = await Member.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Global counts for cards
  const globalTotal = await Member.countDocuments();
  const globalActive = await Member.countDocuments({ status: 'Active' });
  const globalStudents = await Member.countDocuments({ membershipType: 'Student' });
  const globalFaculty = await Member.countDocuments({ membershipType: 'Faculty' });
  const globalStaff = await Member.countDocuments({ membershipType: 'Staff' });
  const globalExpired = await Member.countDocuments({ status: { $in: ['Expired', 'Suspended'] } });

  res.status(200).json({
    success: true,
    data: members,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    stats: {
      total: globalTotal,
      active: globalActive,
      students: globalStudents,
      faculty: globalFaculty,
      staff: globalStaff,
      expired: globalExpired,
    },
  });
});

// @desc    Get single member details with active issues & fine stats
// @route   GET /api/members/:id
// @access  Private
const getMemberById = asyncHandler(async (req, res, next) => {
  const member = await Member.findById(req.params.id);
  if (!member) return next(new AppError('Member not found', 404));

  const activeIssues = await IssueTransaction.find({
    memberId: member._id,
    status: { $in: [ISSUE_STATUS.ISSUED, ISSUE_STATUS.OVERDUE] },
  }).populate('bookId', 'title isbn coverImage');

  const pendingFines = await Fine.find({
    memberId: member._id,
    status: 'Pending',
  });

  const totalPendingFine = pendingFines.reduce((acc, curr) => acc + curr.amount, 0);

  res.status(200).json({
    success: true,
    data: {
      ...member.toObject(),
      activeIssues,
      totalPendingFine,
      activeBorrowCount: activeIssues.length,
    },
  });
});

// @desc    Create new member
// @route   POST /api/members
// @access  Private (Admin / Librarian)
const createMember = asyncHandler(async (req, res, next) => {
  const { name, email, phone } = req.body;

  const existingEmail = await Member.findOne({ email });
  if (existingEmail) {
    return next(new AppError('Member with this email already exists', 400));
  }

  // Auto-generate membershipId if not provided (e.g. LIB-STU-1001, LIB-FAC-1001, LIB-STF-1001)
  let membershipId = req.body.membershipId;
  if (!membershipId || !membershipId.trim()) {
    const count = await Member.countDocuments();
    const type = req.body.membershipType || 'Student';
    let prefix = 'STU';
    if (type === 'Faculty') prefix = 'FAC';
    else if (type === 'Staff') prefix = 'STF';
    else if (type === 'Premium') prefix = 'PRM';
    else if (type === 'Standard') prefix = 'STD';

    membershipId = `LIB-${prefix}-${1001 + count}`;
  }

  const member = await Member.create({
    ...req.body,
    membershipId,
  });

  await Activity.create({
    userId: req.user._id,
    userName: req.user.name,
    action: ACTIVITY_ACTIONS.MEMBER_CREATED,
    entity: 'Member',
    entityId: member._id.toString(),
    description: `Registered new member "${member.name}" (${member.membershipId})`,
  });

  // Emit Real-Time Socket Event
  const io = req.app.get('io');
  if (io) {
    io.emit('member_updated', { action: 'created', member });
    io.emit('stats_updated');
  }

  res.status(201).json({
    success: true,
    message: 'Member registered successfully',
    data: member,
  });
});

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Private (Admin / Librarian)
const updateMember = asyncHandler(async (req, res, next) => {
  let member = await Member.findById(req.params.id);
  if (!member) return next(new AppError('Member not found', 404));

  if (req.body.email && req.body.email !== member.email) {
    const existing = await Member.findOne({ email: req.body.email });
    if (existing) return next(new AppError('Email address already in use', 400));
  }

  if (req.body.membershipId && req.body.membershipId !== member.membershipId) {
    const existingId = await Member.findOne({ membershipId: req.body.membershipId });
    if (existingId) {
      return next(
        new AppError(`Membership ID "${req.body.membershipId}" is already in use by another member`, 400)
      );
    }
  }

  member = await Member.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  await Activity.create({
    userId: req.user._id,
    userName: req.user.name,
    action: ACTIVITY_ACTIONS.MEMBER_UPDATED,
    entity: 'Member',
    entityId: member._id.toString(),
    description: `Updated member profile "${member.name}"`,
  });

  // Emit Real-Time Socket Event
  const io = req.app.get('io');
  if (io) {
    io.emit('member_updated', { action: 'updated', member });
    io.emit('stats_updated');
  }

  res.status(200).json({
    success: true,
    message: 'Member updated successfully',
    data: member,
  });
});

// @desc    Deactivate / Delete member
// @route   DELETE /api/members/:id
// @access  Private (Admin)
const deleteMember = asyncHandler(async (req, res, next) => {
  const member = await Member.findById(req.params.id);
  if (!member) return next(new AppError('Member not found', 404));

  // Check active borrowings
  const activeIssues = await IssueTransaction.countDocuments({
    memberId: member._id,
    status: { $in: [ISSUE_STATUS.ISSUED, ISSUE_STATUS.OVERDUE] },
  });

  if (activeIssues > 0) {
    return next(
      new AppError(
        `Cannot delete member "${member.name}" because they have ${activeIssues} active unreturned books.`,
        400
      )
    );
  }

  await Member.findByIdAndDelete(req.params.id);

  await Activity.create({
    userId: req.user._id,
    userName: req.user.name,
    action: ACTIVITY_ACTIONS.MEMBER_DELETED,
    entity: 'Member',
    entityId: req.params.id,
    description: `Deleted member "${member.name}"`,
  });

  // Emit Real-Time Socket Event
  const io = req.app.get('io');
  if (io) {
    io.emit('member_updated', { action: 'deleted', id: req.params.id });
    io.emit('stats_updated');
  }

  res.status(200).json({
    success: true,
    message: 'Member deleted successfully',
  });
});

module.exports = {
  getMemberStats,
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
};

