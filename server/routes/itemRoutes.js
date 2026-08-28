const express = require('express');
const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

const router = express.Router();

router
  .route('/')
  .get(protect, getItems)
  .post(protect, authorize('Admin', 'Librarian'), createItem);

router
  .route('/:id')
  .get(protect, getItem)
  .put(protect, authorize('Admin', 'Librarian'), updateItem)
  .delete(protect, authorize('Admin'), deleteItem);

module.exports = router;
