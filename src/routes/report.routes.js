const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

router.get('/revenue', authenticate, authorizeRoles('admin'), reportController.getRevenueReport);
router.get('/occupancy', authenticate, reportController.getOccupancyReport);
router.get('/bookings', authenticate, reportController.getBookingsReport);
router.get('/staff', authenticate, authorizeRoles('admin'), reportController.getStaffReport);
router.get('/expenses', authenticate, reportController.getExpenseReport);
router.get('/refunds', authenticate, reportController.getRefundReport);
router.get('/profit-loss', authenticate, authorizeRoles('admin'), reportController.getProfitLossReport);
router.get('/financial-summary', authenticate, reportController.getFinancialSummary);

module.exports = router;
