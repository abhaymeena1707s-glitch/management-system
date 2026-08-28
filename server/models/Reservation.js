const mongoose = require('mongoose');
const { RESERVATION_STATUS } = require('../constants');

const reservationSchema = new mongoose.Schema(
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
    reservationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: Object.values(RESERVATION_STATUS),
      default: RESERVATION_STATUS.PENDING,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000), // Default 7 days expiry
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate pending/ready reservations by the same member for the same book
reservationSchema.index(
  { bookId: 1, memberId: 1, status: 1 },
  { unique: false }
);

module.exports = mongoose.model('Reservation', reservationSchema);
