const mongoose = require('mongoose');
const { FINE_STATUS } = require('../constants');

const fineSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member ID is required'],
      index: true,
    },
    issueTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IssueTransaction',
      required: [true, 'Issue transaction ID is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Fine amount is required'],
      min: [0, 'Fine amount cannot be negative'],
    },
    reason: {
      type: String,
      default: 'Overdue book return',
    },
    status: {
      type: String,
      enum: Object.values(FINE_STATUS),
      default: FINE_STATUS.PENDING,
      index: true,
    },
    paidAt: {
      type: Date,
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    waivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    paymentMethod: {
      type: String,
      default: 'Cash',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Fine', fineSchema);
