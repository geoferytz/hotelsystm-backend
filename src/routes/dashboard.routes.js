const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/stats', authenticate, dashboardController.getStats);
router.get('/recent-bookings', authenticate, dashboardController.getRecentBookings);

module.exports = router;
