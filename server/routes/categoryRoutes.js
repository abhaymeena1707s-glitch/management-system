const express = require('express');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCategories)
  .post(authorize(ROLES.ADMIN, ROLES.LIBRARIAN), createCategory);

router.route('/:id')
  .put(authorize(ROLES.ADMIN, ROLES.LIBRARIAN), updateCategory)
  .delete(authorize(ROLES.ADMIN), deleteCategory);

module.exports = router;
