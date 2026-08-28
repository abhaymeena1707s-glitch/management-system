const Book = require('../models/Book');
const Category = require('../models/Category');
const Author = require('../models/Author');
const IssueTransaction = require('../models/IssueTransaction');
const Activity = require('../models/Activity');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ISSUE_STATUS, ACTIVITY_ACTIONS } = require('../constants');

// @desc    Get all books with pagination, search & filters
// @route   GET /api/books
// @access  Private
const getBooks = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const { search, category, author, availability, sortBy } = req.query;

  let query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { isbn: { $regex: search, $options: 'i' } },
      { publisher: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) {
    query.category = category;
  }

  if (author) {
    query.author = author;
  }

  if (availability) {
    if (availability === 'available') {
      query.availableCopies = { $gt: 0 };
    } else if (availability === 'out_of_stock') {
      query.availableCopies = 0;
    }
  }

  let sortOption = { createdAt: -1 };
  if (sortBy === 'title') sortOption = { title: 1 };
  if (sortBy === 'author') sortOption = { author: 1 };
  if (sortBy === 'availableCopies') sortOption = { availableCopies: -1 };

  const total = await Book.countDocuments(query);
  const books = await Book.find(query)
    .populate('author', 'name photo country')
    .populate('category', 'name slug')
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: books,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Private
const getBookById = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id)
    .populate('author')
    .populate('category');

  if (!book) {
    return next(new AppError('Book not found', 404));
  }

  res.status(200).json({
    success: true,
    data: book,
  });
});

// @desc    Create new book
// @route   POST /api/books
// @access  Private (Admin / Librarian)
const createBook = asyncHandler(async (req, res, next) => {
  const { title, isbn, author, category, totalCopies, availableCopies } = req.body;

  // Check duplicate ISBN
  const existingIsbn = await Book.findOne({ isbn });
  if (existingIsbn) {
    return next(new AppError(`Book with ISBN '${isbn}' already exists`, 400));
  }

  // Validate Author & Category exist
  const authorObj = await Author.findById(author);
  if (!authorObj) return next(new AppError('Specified Author not found', 404));

  const categoryObj = await Category.findById(category);
  if (!categoryObj) return next(new AppError('Specified Category not found', 404));

  const initialAvailable = availableCopies !== undefined ? Number(availableCopies) : Number(totalCopies);

  const book = await Book.create({
    ...req.body,
    availableCopies: initialAvailable,
    status: initialAvailable > 0 ? 'Available' : 'Out of Stock',
  });

  // Log activity
  await Activity.create({
    userId: req.user._id,
    userName: req.user.name,
    action: ACTIVITY_ACTIONS.BOOK_CREATED,
    entity: 'Book',
    entityId: book._id.toString(),
    description: `Added new book "${book.title}" (ISBN: ${book.isbn})`,
  });

  res.status(201).json({
    success: true,
    message: 'Book created successfully',
    data: book,
  });
});

// @desc    Update book details
// @route   PUT /api/books/:id
// @access  Private (Admin / Librarian)
const updateBook = asyncHandler(async (req, res, next) => {
  let book = await Book.findById(req.params.id);
  if (!book) return next(new AppError('Book not found', 404));

  // If ISBN changed, verify uniqueness
  if (req.body.isbn && req.body.isbn !== book.isbn) {
    const existing = await Book.findOne({ isbn: req.body.isbn });
    if (existing) return next(new AppError('ISBN already in use', 400));
  }

  // Handle total copies adjustment safely
  if (req.body.totalCopies !== undefined) {
    const newTotal = Number(req.body.totalCopies);
    const issuedCopies = book.totalCopies - book.availableCopies;
    if (newTotal < issuedCopies) {
      return next(
        new AppError(
          `Cannot reduce total copies below currently issued count (${issuedCopies})`,
          400
        )
      );
    }
    req.body.availableCopies = newTotal - issuedCopies;
    req.body.status = req.body.availableCopies > 0 ? 'Available' : 'Out of Stock';
  }

  book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('author category');

  await Activity.create({
    userId: req.user._id,
    userName: req.user.name,
    action: ACTIVITY_ACTIONS.BOOK_UPDATED,
    entity: 'Book',
    entityId: book._id.toString(),
    description: `Updated book "${book.title}"`,
  });

  res.status(200).json({
    success: true,
    message: 'Book updated successfully',
    data: book,
  });
});

// @desc    Delete book (with safety check for active issues)
// @route   DELETE /api/books/:id
// @access  Private (Admin)
const deleteBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);
  if (!book) return next(new AppError('Book not found', 404));

  // Safe deletion check: check active issued copies
  const activeIssues = await IssueTransaction.countDocuments({
    bookId: book._id,
    status: { $in: [ISSUE_STATUS.ISSUED, ISSUE_STATUS.OVERDUE] },
  });

  if (activeIssues > 0) {
    return next(
      new AppError(
        `Cannot delete book "${book.title}" because it currently has ${activeIssues} active issued copies.`,
        400
      )
    );
  }

  await Book.findByIdAndDelete(req.params.id);

  await Activity.create({
    userId: req.user._id,
    userName: req.user.name,
    action: ACTIVITY_ACTIONS.BOOK_DELETED,
    entity: 'Book',
    entityId: req.params.id,
    description: `Deleted book "${book.title}"`,
  });

  res.status(200).json({
    success: true,
    message: 'Book deleted successfully',
  });
});

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
