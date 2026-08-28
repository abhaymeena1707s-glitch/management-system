const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    libraryName: {
      type: String,
      default: 'Library Management System',
    },
    maxBorrowLimit: {
      type: Number,
      default: 5,
      min: 1,
    },
    defaultBorrowDays: {
      type: Number,
      default: 7,
      min: 1,
    },
    fineRatePerDay: {
      type: Number,
      default: 5,
      min: 0,
    },
    currencySymbol: {
      type: String,
      default: '₹',
    },
    fineBlockingThreshold: {
      type: Number,
      default: 500,
    },
    contactEmail: {
      type: String,
      default: 'support@library.com',
    },
    contactPhone: {
      type: String,
      default: '+91 98765 43210',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Setting', settingSchema);
