const express = require('express');
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { bookSchema } = require('../validators');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getBooks)
  .post(authorize(ROLES.ADMIN, ROLES.LIBRARIAN), validate(bookSchema), createBook);

router.route('/:id')
  .get(getBookById)
  .put(authorize(ROLES.ADMIN, ROLES.LIBRARIAN), updateBook)
  .delete(authorize(ROLES.ADMIN), deleteBook);

module.exports = router;
