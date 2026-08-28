const Setting = require('../models/Setting');
const Activity = require('../models/Activity');
const asyncHandler = require('../utils/asyncHandler');
const { ACTIVITY_ACTIONS } = require('../constants');

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private
const getSettings = asyncHandler(async (req, res) => {
  let setting = await Setting.findOne();
  if (!setting) {
    setting = await Setting.create({});
  }

  res.status(200).json({
    success: true,
    data: setting,
  });
});

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private (Admin only)
const updateSettings = asyncHandler(async (req, res) => {
  let setting = await Setting.findOne();
  if (!setting) {
    setting = await Setting.create(req.body);
  } else {
    setting = await Setting.findByIdAndUpdate(setting._id, req.body, {
      new: true,
      runValidators: true,
    });
  }

  await Activity.create({
    userId: req.user._id,
    userName: req.user.name,
    action: ACTIVITY_ACTIONS.SETTINGS_CHANGED,
    entity: 'Setting',
    entityId: setting._id.toString(),
    description: `Updated system configuration settings`,
  });

  res.status(200).json({
    success: true,
    message: 'System settings updated successfully',
    data: setting,
  });
});

module.exports = {
  getSettings,
  updateSettings,
};
