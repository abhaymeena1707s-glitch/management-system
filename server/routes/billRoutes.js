const express = require('express');
const {
  getBills,
  getBill,
  createBill,
  updateBillStatus
} = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('Admin', 'Librarian'), getBills)
  .post(protect, authorize('Admin', 'Librarian'), createBill);

router
  .route('/:id')
  .get(protect, authorize('Admin', 'Librarian'), getBill);

router
  .route('/:id/status')
  .put(protect, authorize('Admin'), updateBillStatus);

module.exports = router;
