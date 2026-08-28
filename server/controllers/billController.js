const Bill = require('../models/Bill');
const Item = require('../models/Item');

// @desc    Get all bills
// @route   GET /api/inventory/bills
// @access  Private
exports.getBills = async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate('items.item', 'name sku')
      .populate('issuedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not fetch bills',
      error: error.message,
    });
  }
};

// @desc    Get single bill
// @route   GET /api/inventory/bills/:id
// @access  Private
exports.getBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('items.item', 'name sku')
      .populate('issuedBy', 'name email');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      });
    }

    res.status(200).json({
      success: true,
      data: bill,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not fetch bill',
      error: error.message,
    });
  }
};

// @desc    Create new bill
// @route   POST /api/inventory/bills
// @access  Private
exports.createBill = async (req, res) => {
  try {
    const { items, ...billData } = req.body;
    
    // Validate items and calculate totals, checking stock
    let subtotal = 0;
    const processedItems = [];

    for (let i = 0; i < items.length; i++) {
      const billItem = items[i];
      const dbItem = await Item.findById(billItem.item);
      
      if (!dbItem) {
        return res.status(404).json({
          success: false,
          message: `Item not found for ID: ${billItem.item}`,
        });
      }

      if (dbItem.quantity < billItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${dbItem.name}. Available: ${dbItem.quantity}`,
        });
      }

      const itemTotal = billItem.quantity * billItem.unitPrice;
      subtotal += itemTotal;

      processedItems.push({
        item: dbItem._id,
        quantity: billItem.quantity,
        unitPrice: billItem.unitPrice,
        totalPrice: itemTotal
      });

      // Update inventory stock
      dbItem.quantity -= billItem.quantity;
      await dbItem.save();
    }

    const discount = billData.discount || 0;
    const tax = billData.tax || 0;
    const totalAmount = subtotal + tax - discount;

    const bill = await Bill.create({
      ...billData,
      items: processedItems,
      subtotal,
      tax,
      discount,
      totalAmount,
      issuedBy: req.user._id // Assuming auth middleware sets req.user
    });

    res.status(201).json({
      success: true,
      data: bill,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate Bill Number entered',
      });
    }
    res.status(400).json({
      success: false,
      message: 'Failed to create bill',
      error: error.message,
    });
  }
};

// @desc    Update bill status
// @route   PUT /api/inventory/bills/:id/status
// @access  Private (Admin)
exports.updateBillStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true, runValidators: true }
    );

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      });
    }

    res.status(200).json({
      success: true,
      data: bill,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update bill status',
      error: error.message,
    });
  }
};
