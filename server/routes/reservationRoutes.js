const express = require('express');
const {
  createReservation,
  getReservations,
  updateReservationStatus,
} = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { reservationSchema } = require('../validators');
const { ROLES } = require('../constants');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getReservations)
  .post(authorize(ROLES.ADMIN, ROLES.LIBRARIAN), validate(reservationSchema), createReservation);

router.put('/:id/status', authorize(ROLES.ADMIN, ROLES.LIBRARIAN), updateReservationStatus);

module.exports = router;
