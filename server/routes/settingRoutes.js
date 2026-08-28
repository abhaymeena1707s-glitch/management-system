const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSettings)
  .put(authorize(ROLES.ADMIN), updateSettings);

module.exports = router;
