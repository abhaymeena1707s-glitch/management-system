const mongoose = require('mongoose');
const { ISSUE_STATUS } = require('../constants');

const issueTransactionSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book ID is required'],
      index: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member ID is required'],
      index: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Librarian/User ID is required'],
    },
    issueDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    returnDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(ISSUE_STATUS),
      default: ISSUE_STATUS.ISSUED,
      index: true,
    },
    fineAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('IssueTransaction', issueTransactionSchema);
