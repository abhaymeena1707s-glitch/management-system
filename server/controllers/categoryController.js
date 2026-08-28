const Category = require('../models/Category');
const Book = require('../models/Book');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all categories with book count
// @route   GET /api/categories
// @access  Private
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });

  // Get book count per category
  const categoriesWithCount = await Promise.all(
    categories.map(async (cat) => {
      const bookCount = await Book.countDocuments({ category: cat._id });
      return {
        ...cat.toObject(),
        bookCount,
      };
    })
  );

  res.status(200).json({
    success: true,
    data: categoriesWithCount,
  });
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin / Librarian)
const createCategory = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;

  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

  const existing = await Category.findOne({ $or: [{ name }, { slug }] });
  if (existing) {
    return next(new AppError('Category with this name already exists', 400));
  }

  const category = await Category.create({
    name,
    slug,
    description,
  });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category,
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin / Librarian)
const updateCategory = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;

  let category = await Category.findById(req.params.id);
  if (!category) return next(new AppError('Category not found', 404));

  if (name) {
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const existing = await Category.findOne({ slug, _id: { $ne: req.params.id } });
    if (existing) return next(new AppError('Category name already taken', 400));

    category.name = name;
    category.slug = slug;
  }

  if (description !== undefined) category.description = description;

  await category.save();

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: category,
  });
});

// @desc    Delete category (Safe delete check)
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new AppError('Category not found', 404));

  // Check if books are using this category
  const booksCount = await Book.countDocuments({ category: category._id });
  if (booksCount > 0) {
    return next(
      new AppError(
        `Cannot delete category "${category.name}" because ${booksCount} book(s) are associated with it.`,
        400
      )
    );
  }

  await Category.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
  });
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
