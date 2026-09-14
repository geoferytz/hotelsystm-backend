const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guest.controller');
const restaurantBookingController = require('../controllers/restaurant-booking.controller');

// All guest routes are PUBLIC (no auth required)
router.get('/rooms', guestController.getAvailableRooms);
router.get('/room-summary', guestController.getRoomSummary);
router.get('/menu', guestController.getMenu);
router.get('/restaurants', guestController.getRestaurants);
router.get('/restaurants/:id', guestController.getRestaurantById);
router.get('/restaurants/:id/menus', guestController.getRestaurantMenus);
router.post('/restaurant/table-booking', restaurantBookingController.createTableBooking);
router.post('/restaurant/menu-order', restaurantBookingController.createMenuOrder);
router.post('/book', guestController.createGuestBooking);
router.post('/pay', guestController.guestPayment);
router.get('/invoice/:billingId', guestController.getInvoice);

module.exports = router;
