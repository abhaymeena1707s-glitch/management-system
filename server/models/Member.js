const mongoose = require('mongoose');
const { MEMBER_STATUS, MEMBER_TYPES, ROLES } = require('../constants');
const bcrypt = require('bcryptjs');

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Member email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    address: {
      type: String,
      default: '',
    },
    membershipId: {
      type: String,
      required: [true, 'Membership ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    membershipType: {
      type: String,
      enum: Object.values(MEMBER_TYPES),
      default: MEMBER_TYPES.STUDENT,
    },
    role: {
      type: String,
      default: ROLES.MEMBER,
    },
    password: {
      type: String,
      select: false,
    },
    department: {
      type: String,
      default: 'General',
    },
    // Student specific fields
    course: {
      type: String,
      default: '',
    },
    academicYear: {
      type: String,
      default: '',
    },
    currentYear: {
      type: String,
      default: '',
    },
    semester: {
      type: String,
      default: '',
    },
    rollNumber: {
      type: String,
      default: '',
    },
    enrollmentNumber: {
      type: String,
      default: '',
    },
    batch: {
      type: String,
      default: '',
    },
    graduationYear: {
      type: String,
      default: '',
    },
    // Faculty / Staff specific fields
    employeeId: {
      type: String,
      default: '',
    },
    designation: {
      type: String,
      default: '',
    },
    joiningYear: {
      type: String,
      default: '',
    },
    employmentType: {
      type: String,
      default: 'Full Time',
    },
    officeNumber: {
      type: String,
      default: '',
    },
    staffCategory: {
      type: String,
      default: '',
    },
    rfidVerified: {
      type: Boolean,
      default: true,
    },
    membershipStartDate: {
      type: Date,
      default: Date.now,
    },
    membershipExpiryDate: {
      type: Date,
      default: () => new Date(+new Date() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    },
    status: {
      type: String,
      enum: Object.values(MEMBER_STATUS),
      default: MEMBER_STATUS.ACTIVE,
      index: true,
    },
    loginOtp: {
      type: String,
      select: false,
    },
    loginOtpExpire: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

memberSchema.index({ name: 'text', email: 'text', membershipId: 'text', rollNumber: 'text', employeeId: 'text' });

memberSchema.pre('save', async function (next) {
  if (!this.password) {
    this.password = this.membershipId; // Default password is their membershipId
  }
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

memberSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Member', memberSchema);
