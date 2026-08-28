const express = require('express');
const { getFines, payFine, waiveFine } = require('../controllers/fineController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { payFineSchema, waiveFineSchema } = require('../validators');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(protect);

router.get('/', getFines);
router.put('/:id/pay', authorize(ROLES.ADMIN, ROLES.LIBRARIAN), validate(payFineSchema), payFine);
router.put('/:id/waive', authorize(ROLES.ADMIN, ROLES.LIBRARIAN), validate(waiveFineSchema), waiveFine);

module.exports = router;
