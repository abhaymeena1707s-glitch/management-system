const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      index: true,
    },
    bio: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: 'International',
    },
    birthDate: {
      type: Date,
    },
    photo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256',
    },
  },
  {
    timestamps: true,
  }
);

authorSchema.index({ name: 'text' });

module.exports = mongoose.model('Author', authorSchema);
