const IssueTransaction = require('../models/IssueTransaction');
const Book = require('../models/Book');
const Member = require('../models/Member');
const Setting = require('../models/Setting');
const Fine = require('../models/Fine');
const Activity = require('../models/Activity');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ISSUE_STATUS, FINE_STATUS, ACTIVITY_ACTIONS } = require('../constants');

// @desc    Process book return
// @route   POST /api/returns
// @access  Private (Admin / Librarian)
const returnBook = asyncHandler(async (req, res, next) => {
  const { issueTransactionId } = req.body;

  const transaction = await IssueTransaction.findById(issueTransactionId);
  if (!transaction) return next(new AppError('Issue transaction not found', 404));

  if (transaction.status === ISSUE_STATUS.RETURNED) {
    return next(new AppError('This book has already been returned', 400));
  }

  // 1. Fetch system settings
  let setting = await Setting.findOne();
  if (!setting) setting = await Setting.create({});

  const returnDate = new Date();
  const dueDate = new Date(transaction.dueDate);

  // 2. Calculate overdue days
  let overdueDays = 0;
  if (returnDate > dueDate) {
    const diffTime = Math.abs(returnDate - dueDate);
    overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // 3. Calculate fine
  const fineAmount = overdueDays * setting.fineRatePerDay;

  // 4. Update transaction
  transaction.returnDate = returnDate;
  transaction.status = ISSUE_STATUS.RETURNED;
  transaction.fineAmount = fineAmount;
  await transaction.save();

  // 5. Increase book available copies
  const book = await Book.findById(transaction.bookId);
  if (book) {
    book.availableCopies += 1;
    if (book.availableCopies > 0) {
      book.status = 'Available';
    }
    await book.save();
  }

  // 6. Create Fine record if overdue
  let fineDoc = null;
  if (fineAmount > 0) {
    fineDoc = await Fine.create({
      memberId: transaction.memberId,
      issueTransactionId: transaction._id,
      amount: fineAmount,
      reason: `Overdue return by ${overdueDays} day(s) @ ${setting.currencySymbol}${setting.fineRatePerDay}/day`,
      status: FINE_STATUS.PENDING,
    });
  }

  // 7. Log Activity
  const member = await Member.findById(transaction.memberId);
  await Activity.create({
    userId: req.user._id,
    userName: req.user.name,
    action: ACTIVITY_ACTIONS.BOOK_RETURNED,
    entity: 'IssueTransaction',
    entityId: transaction._id.toString(),
    description: `Returned "${book ? book.title : 'Book'}" by ${member ? member.name : 'Member'}${fineAmount > 0 ? ` (Fine generated: ${setting.currencySymbol}${fineAmount})` : ''}`,
  });

  const populated = await IssueTransaction.findById(transaction._id)
    .populate('bookId', 'title isbn coverImage')
    .populate('memberId', 'name email membershipId');

  res.status(200).json({
    success: true,
    message: fineAmount > 0 ? `Book returned. Overdue fine generated: ${setting.currencySymbol}${fineAmount}` : 'Book returned successfully',
    data: {
      transaction: populated,
      overdueDays,
      fineAmount,
      fine: fineDoc,
    },
  });
});

module.exports = {
  returnBook,
};
