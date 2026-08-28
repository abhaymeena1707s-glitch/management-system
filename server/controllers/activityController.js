const Activity = require('../models/Activity');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get system audit activity logs
// @route   GET /api/activities
// @access  Private
const getActivities = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  let query = {};
  if (req.user.role === require('../constants').ROLES.MEMBER) {
    query.userId = req.user._id;
  }

  const total = await Activity.countDocuments(query);
  const activities = await Activity.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: activities,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

module.exports = {
  getActivities,
};
