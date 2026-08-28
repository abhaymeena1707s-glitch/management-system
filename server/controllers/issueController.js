const IssueTransaction = require('../models/IssueTransaction');
const Book = require('../models/Book');
const Member = require('../models/Member');
const Setting = require('../models/Setting');
const Fine = require('../models/Fine');
const Activity = require('../models/Activity');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ISSUE_STATUS, MEMBER_STATUS, ACTIVITY_ACTIONS } = require('../constants');

// @desc    Issue a book to member
// @route   POST /api/issues
// @access  Private (Admin / Librarian)
const issueBook = asyncHandler(async (req, res, next) => {
  const { bookId, memberId, dueDate: customDueDate } = req.body;

  // 1. Fetch system settings
  let setting = await Setting.findOne();
  if (!setting) {
    setting = await Setting.create({});
  }

  // 2. Validate Book
  const book = await Book.findById(bookId);
  if (!book) return next(new AppError('Book not found', 404));
  if (book.availableCopies <= 0) {
    return next(new AppError(`Book "${book.title}" is currently out of stock`, 400));
  }

  // 3. Validate Member
  const member = await Member.findById(memberId);
  if (!member) return next(new AppError('Member not found', 404));
  if (member.status !== MEMBER_STATUS.ACTIVE) {
    return next(new AppError(`Member account is ${member.status}. Cannot issue books.`, 400));
  }

  if (new Date(member.membershipExpiryDate) < new Date()) {
    return next(new AppError('Member membership has expired. Please renew membership.', 400));
  }

  // 4. Check Member active borrowing limit
  const activeBorrowCount = await IssueTransaction.countDocuments({
    memberId: member._id,
    status: { $in: [ISSUE_STATUS.ISSUED, ISSUE_STATUS.OVERDUE] },
  });

  if (activeBorrowCount >= setting.maxBorrowLimit) {
    return next(
      new AppError(
        `Member has reached maximum borrow limit of ${setting.maxBorrowLimit} books.`,
        400
      )
    );
  }

  // 5. Check pending fines threshold
  const pendingFines = await Fine.find({
    memberId: member._id,
    status: 'Pending',
  });
  const totalPendingFine = pendingFines.reduce((sum, f) => sum + f.amount, 0);
  if (totalPendingFine > setting.fineBlockingThreshold) {
    return next(
      new AppError(
        `Member has pending fine of ${setting.currencySymbol}${totalPendingFine}, exceeding threshold of ${setting.currencySymbol}${setting.fineBlockingThreshold}. Clear fine before borrowing.`,
        400
      )
    );
  }

  // 6. Calculate Due Date
  const issueDate = new Date();
  let dueDate;
  if (customDueDate) {
    dueDate = new Date(customDueDate);
  } else {
    dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + setting.defaultBorrowDays);
  }

  // 7. Create Issue Transaction
  const issueTransaction = await IssueTransaction.create({
    bookId: book._id,
    memberId: member._id,
    issuedBy: req.user._id,
    issueDate,
    dueDate,
    status: ISSUE_STATUS.ISSUED,
  });

  // 8. Decrement available copies & update status
  book.availableCopies -= 1;
  if (book.availableCopies === 0) {
    book.status = 'Out of Stock';
  }
  await book.save();

  // 9. Log Activity
  await Activity.create({
    userId: req.user._id,
    userName: req.user.name,
    action: ACTIVITY_ACTIONS.BOOK_ISSUED,
    entity: 'IssueTransaction',
    entityId: issueTransaction._id.toString(),
    description: `Issued "${book.title}" to member ${member.name} (${member.membershipId})`,
  });

  const populated = await IssueTransaction.findById(issueTransaction._id)
    .populate('bookId', 'title isbn coverImage shelfNumber')
    .populate('memberId', 'name email membershipId phone profileImage')
    .populate('issuedBy', 'name role');

  res.status(201).json({
    success: true,
    message: 'Book issued successfully',
    data: populated,
  });
});

// @desc    Get issued books with search, filters & pagination
// @route   GET /api/issues
// @access  Private
const getIssuedBooks = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const { status, search } = req.query;

  let query = {};
  if (status) {
    query.status = status;
  }
  if (req.user.role === require('../constants').ROLES.MEMBER) {
    query.memberId = req.user._id;
  }

  const issues = await IssueTransaction.find(query)
    .populate('bookId', 'title isbn coverImage category author shelfNumber')
    .populate('memberId', 'name email membershipId phone profileImage')
    .populate('issuedBy', 'name role')
    .sort({ issueDate: -1 })
    .skip(skip)
    .limit(limit);

  const total = await IssueTransaction.countDocuments(query);

  res.status(200).json({
    success: true,
    data: issues,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

module.exports = {
  issueBook,
  getIssuedBooks,
};
