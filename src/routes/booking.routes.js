const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, bookingController.getAllBookings);
router.get('/:id', authenticate, bookingController.getBookingById);
router.post('/', authenticate, bookingController.createBooking);
router.put('/:id', authenticate, bookingController.updateBooking);
router.put('/:id/extend', authenticate, bookingController.extendBooking);
router.put('/:id/cancel', authenticate, bookingController.cancelBooking);
router.put('/:id/change-room', authenticate, bookingController.changeRoom);
router.delete('/:id', authenticate, bookingController.deleteBooking);

module.exports = router;
