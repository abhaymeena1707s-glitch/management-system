const Author = require('../models/Author');
const Book = require('../models/Book');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all authors with book count
// @route   GET /api/authors
// @access  Private
const getAuthors = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const { search } = req.query;
  let query = {};
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const total = await Author.countDocuments(query);
  const authors = await Author.find(query)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);

  const authorsWithCount = await Promise.all(
    authors.map(async (author) => {
      const bookCount = await Book.countDocuments({ author: author._id });
      return {
        ...author.toObject(),
        bookCount,
      };
    })
  );

  res.status(200).json({
    success: true,
    data: authorsWithCount,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// @desc    Create author
// @route   POST /api/authors
// @access  Private (Admin / Librarian)
const createAuthor = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  const existing = await Author.findOne({ name });
  if (existing) {
    return next(new AppError('Author with this name already exists', 400));
  }

  const author = await Author.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Author created successfully',
    data: author,
  });
});

// @desc    Update author
// @route   PUT /api/authors/:id
// @access  Private (Admin / Librarian)
const updateAuthor = asyncHandler(async (req, res, next) => {
  const author = await Author.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!author) return next(new AppError('Author not found', 404));

  res.status(200).json({
    success: true,
    message: 'Author updated successfully',
    data: author,
  });
});

// @desc    Delete author (Safe deletion check)
// @route   DELETE /api/authors/:id
// @access  Private (Admin)
const deleteAuthor = asyncHandler(async (req, res, next) => {
  const author = await Author.findById(req.params.id);
  if (!author) return next(new AppError('Author not found', 404));

  const bookCount = await Book.countDocuments({ author: author._id });
  if (bookCount > 0) {
    return next(
      new AppError(
        `Cannot delete author "${author.name}" because ${bookCount} book(s) are linked to this author.`,
        400
      )
    );
  }

  await Author.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Author deleted successfully',
  });
});

module.exports = {
  getAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
};
