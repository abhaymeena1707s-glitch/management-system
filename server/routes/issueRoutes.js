const express = require('express');
const { issueBook, getIssuedBooks } = require('../controllers/issueController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { issueBookSchema } = require('../validators');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getIssuedBooks)
  .post(authorize(ROLES.ADMIN, ROLES.LIBRARIAN), validate(issueBookSchema), issueBook);

module.exports = router;
