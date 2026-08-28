const Item = require('../models/Item');

// @desc    Get all inventory items
// @route   GET /api/inventory/items
// @access  Private
exports.getItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not fetch items',
      error: error.message,
    });
  }
};

// @desc    Get single item
// @route   GET /api/inventory/items/:id
// @access  Private
exports.getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not fetch item',
      error: error.message,
    });
  }
};

// @desc    Create new item
// @route   POST /api/inventory/items
// @access  Private (Admin)
exports.createItem = async (req, res) => {
  try {
    const item = await Item.create(req.body);

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate SKU entered',
      });
    }
    res.status(400).json({
      success: false,
      message: 'Failed to create item',
      error: error.message,
    });
  }
};

// @desc    Update item
// @route   PUT /api/inventory/items/:id
// @access  Private (Admin)
exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update item',
      error: error.message,
    });
  }
};

// @desc    Delete item
// @route   DELETE /api/inventory/items/:id
// @access  Private (Admin)
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete item',
      error: error.message,
    });
  }
};
