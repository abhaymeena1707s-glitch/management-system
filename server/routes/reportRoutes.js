const express = require('express');
const { getDashboardStats, getReportsData } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getReportsData);

module.exports = router;
