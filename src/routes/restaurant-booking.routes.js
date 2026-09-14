const express = require('express');
const router = express.Router();
const restaurantBookingController = require('../controllers/restaurant-booking.controller');

// Public guest routes for restaurant bookings
router.post('/table-booking', restaurantBookingController.createTableBooking);
router.post('/menu-order', restaurantBookingController.createMenuOrder);

// Admin routes for restaurant bookings and orders
router.post('/bookings', restaurantBookingController.createTableBooking);
router.get('/bookings', restaurantBookingController.getAllTableBookings);
router.get('/bookings/:id', restaurantBookingController.getTableBookingById);
router.put('/bookings/:id/status', restaurantBookingController.updateTableBookingStatus);
router.post('/orders', restaurantBookingController.createMenuOrder);
router.get('/orders', restaurantBookingController.getAllMenuOrders);
router.get('/orders/:id', restaurantBookingController.getMenuOrderById);
router.put('/orders/:id/status', restaurantBookingController.updateMenuOrderStatus);

module.exports = router;
