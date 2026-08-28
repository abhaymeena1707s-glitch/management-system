const express = require('express');
const { returnBook } = require('../controllers/returnController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { returnBookSchema } = require('../validators');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(protect);

router.post('/', authorize(ROLES.ADMIN, ROLES.LIBRARIAN), validate(returnBookSchema), returnBook);

module.exports = router;
