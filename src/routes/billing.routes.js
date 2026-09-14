const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, billingController.getAllBillings);
router.get('/:id', authenticate, billingController.getBillingById);
router.post('/', authenticate, billingController.createBilling);
router.put('/:id', authenticate, billingController.updateBilling);
router.delete('/:id', authenticate, billingController.deleteBilling);

module.exports = router;
