const Fine = require('../models/Fine');
const Activity = require('../models/Activity');
const Setting = require('../models/Setting');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { FINE_STATUS, ACTIVITY_ACTIONS } = require('../constants');

// @desc    Get all fines with status tabs & pagination
// @route   GET /api/fines
// @access  Private
const getFines = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const { status, memberId } = req.query;

  let query = {};
  if (status) query.status = status;
  if (memberId) query.memberId = memberId;
  
  if (req.user.role === require('../constants').ROLES.MEMBER) {
    query.memberId = req.user._id;
  }

  const total = await Fine.countDocuments(query);
  const fines = await Fine.find(query)
    .populate('memberId', 'name email membershipId phone profileImage')
    .populate({
      path: 'issueTransactionId',
      populate: { path: 'bookId', select: 'title isbn coverImage' },
    })
    .populate('collectedBy', 'name role')
    .populate('waivedBy', 'name role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const matchMember = req.user.role === require('../constants').ROLES.MEMBER ? { memberId: req.user._id } : {};

  // Stats calculation
  const pendingTotal = await Fine.aggregate([
    { $match: { status: FINE_STATUS.PENDING, ...matchMember } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const paidTotal = await Fine.aggregate([
    { $match: { status: FINE_STATUS.PAID, ...matchMember } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const waivedTotal = await Fine.aggregate([
    { $match: { status: FINE_STATUS.WAIVED, ...matchMember } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  let setting = await Setting.findOne();
  if (!setting) setting = { currencySymbol: '₹' };

  res.status(200).json({
    success: true,
    data: fines,
    summary: {
      pendingAmount: pendingTotal[0] ? pendingTotal[0].total : 0,
      paidAmount: paidTotal[0] ? paidTotal[0].total : 0,
      waivedAmount: waivedTotal[0] ? waivedTotal[0].total : 0,
      currencySymbol: setting.currencySymbol,
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// @desc    Collect / Pay Fine
// @route   PUT /api/fines/:id/pay
// @access  Private (Admin / Librarian)
const payFine = asyncHandler(async (req, res, next) => {
  const { paymentMethod } = req.body;

  const fine = await Fine.findById(req.params.id).populate('memberId', 'name membershipId');
  if (!fine) return next(new AppError('Fine record not found', 404));

  if (fine.status === FINE_STATUS.PAID) {
    return next(new AppError('Fine is already paid', 400));
  }

  fine.status = FINE_STATUS.PAID;
  fine.paidAt = new Date();
  fine.collectedBy = req.user._id;
  fine.paymentMethod = paymentMethod || 'Cash';
  await fine.save();

  let setting = await Setting.findOne();
  const symbol = setting ? setting.currencySymbol : '₹';

  await Activity.create({
    userId: req.user._id,
    userName: req.user.name,
    action: ACTIVITY_ACTIONS.FINE_PAID,
    entity: 'Fine',
    entityId: fine._id.toString(),
    description: `Collected fine of ${symbol}${fine.amount} from ${fine.memberId ? fine.memberId.name : 'Member'}`,
  });

  res.status(200).json({
    success: true,
    message: 'Fine collected successfully',
    data: fine,
  });
});

// @desc    Waive Fine
// @route   PUT /api/fines/:id/waive
// @access  Private (Admin / Librarian)
const waiveFine = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;

  const fine = await Fine.findById(req.params.id).populate('memberId', 'name membershipId');
  if (!fine) return next(new AppError('Fine record not found', 404));

  if (fine.status !== FINE_STATUS.PENDING) {
    return next(new AppError(`Cannot waive fine with status '${fine.status}'`, 400));
  }

  fine.status = FINE_STATUS.WAIVED;
  fine.waivedBy = req.user._id;
  fine.reason = reason ? `Waived: ${reason}` : fine.reason;
  await fine.save();

  let setting = await Setting.findOne();
  const symbol = setting ? setting.currencySymbol : '₹';

  await Activity.create({
    userId: req.user._id,
    userName: req.user.name,
    action: ACTIVITY_ACTIONS.FINE_WAIVED,
    entity: 'Fine',
    entityId: fine._id.toString(),
    description: `Waived fine of ${symbol}${fine.amount} for ${fine.memberId ? fine.memberId.name : 'Member'}. Reason: ${reason}`,
  });

  res.status(200).json({
    success: true,
    message: 'Fine waived successfully',
    data: fine,
  });
});

module.exports = {
  getFines,
  payFine,
  waiveFine,
};
