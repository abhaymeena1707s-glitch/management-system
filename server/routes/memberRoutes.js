const express = require('express');
const {
  getMemberStats,
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
} = require('../controllers/memberController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { memberSchema } = require('../validators');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(protect);

router.get('/stats', getMemberStats);

router.route('/')
  .get(getMembers)
  .post(authorize(ROLES.ADMIN, ROLES.LIBRARIAN), validate(memberSchema), createMember);

router.route('/:id')
  .get(getMemberById)
  .put(authorize(ROLES.ADMIN, ROLES.LIBRARIAN), updateMember)
  .delete(authorize(ROLES.ADMIN, ROLES.LIBRARIAN), deleteMember);


module.exports = router;
