const express = require('express');
const {
  getAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} = require('../controllers/authorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAuthors)
  .post(authorize(ROLES.ADMIN, ROLES.LIBRARIAN), createAuthor);

router.route('/:id')
  .put(authorize(ROLES.ADMIN, ROLES.LIBRARIAN), updateAuthor)
  .delete(authorize(ROLES.ADMIN), deleteAuthor);

module.exports = router;
