const Reservation = require('../models/Reservation');
const Book = require('../models/Book');
const Member = require('../models/Member');
const Activity = require('../models/Activity');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { RESERVATION_STATUS, ACTIVITY_ACTIONS } = require('../constants');

// @desc    Create book reservation
// @route   POST /api/reservations
// @access  Private
const createReservation = asyncHandler(async (req, res, next) => {
  let { bookId, memberId } = req.body;
  if (req.user.role === require('../constants').ROLES.MEMBER) {
    memberId = req.user._id;
  }

  const book = await Book.findById(bookId);
  if (!book) return next(new AppError('Book not found', 404));

  const member = await Member.findById(memberId);
  if (!member) return next(new AppError('Member not found', 404));

  // Check duplicate active reservation
  const existing = await Reservation.findOne({
    bookId,
    memberId,
    status: { $in: [RESERVATION_STATUS.PENDING, RESERVATION_STATUS.READY] },
  });

  if (existing) {
    return next(new AppError('Member already has an active reservation for this book', 400));
  }

  const reservation = await Reservation.create({
    bookId,
    memberId,
    status: book.availableCopies > 0 ? RESERVATION_STATUS.READY : RESERVATION_STATUS.PENDING,
    expiresAt: new Date(+new Date() + 7 * 24 * 60 * 60 * 1000),
  });

  await Activity.create({
    userId: req.user._id,
    userName: req.user.name,
    action: ACTIVITY_ACTIONS.RESERVATION_CREATED,
    entity: 'Reservation',
    entityId: reservation._id.toString(),
    description: `Created reservation for "${book.title}" by ${member.name}`,
  });

  const populated = await Reservation.findById(reservation._id)
    .populate('bookId', 'title isbn coverImage availableCopies')
    .populate('memberId', 'name email membershipId phone');

  res.status(201).json({
    success: true,
    message: 'Book reservation created successfully',
    data: populated,
  });
});

// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Private
const getReservations = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const { status } = req.query;
  let query = {};
  if (status) query.status = status;
  if (req.user.role === require('../constants').ROLES.MEMBER) {
    query.memberId = req.user._id;
  }

  const total = await Reservation.countDocuments(query);
  const reservations = await Reservation.find(query)
    .populate('bookId', 'title isbn coverImage category availableCopies shelfNumber')
    .populate('memberId', 'name email membershipId phone profileImage')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: reservations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// @desc    Update reservation status
// @route   PUT /api/reservations/:id/status
// @access  Private
const updateReservationStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const reservation = await Reservation.findById(req.params.id)
    .populate('bookId', 'title')
    .populate('memberId', 'name');

  if (!reservation) return next(new AppError('Reservation not found', 404));

  reservation.status = status;
  await reservation.save();

  await Activity.create({
    userId: req.user._id,
    userName: req.user.name,
    action: ACTIVITY_ACTIONS.RESERVATION_UPDATED,
    entity: 'Reservation',
    entityId: reservation._id.toString(),
    description: `Reservation status for "${reservation.bookId ? reservation.bookId.title : 'Book'}" updated to ${status}`,
  });

  res.status(200).json({
    success: true,
    message: `Reservation status updated to ${status}`,
    data: reservation,
  });
});

module.exports = {
  createReservation,
  getReservations,
  updateReservationStatus,
};
