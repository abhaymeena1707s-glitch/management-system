const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      index: true,
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Author',
      required: [true, 'Author is required'],
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    publisher: {
      type: String,
      default: 'Unknown Publisher',
    },
    publicationYear: {
      type: Number,
      default: new Date().getFullYear(),
    },
    language: {
      type: String,
      default: 'English',
    },
    totalCopies: {
      type: Number,
      required: [true, 'Total copies count is required'],
      min: [0, 'Total copies cannot be negative'],
      default: 1,
    },
    availableCopies: {
      type: Number,
      required: true,
      min: [0, 'Available copies cannot be negative'],
      default: 1,
    },
    coverImage: {
      type: mongoose.Schema.Types.Mixed,
      default: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
    },
    shelfNumber: {
      type: String,
      default: 'A-1',
    },
    status: {
      type: String,
      enum: ['Available', 'Out of Stock', 'Discontinued'],
      default: 'Available',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

bookSchema.index({ title: 'text', isbn: 'text', description: 'text' });

module.exports = mongoose.model('Book', bookSchema);
