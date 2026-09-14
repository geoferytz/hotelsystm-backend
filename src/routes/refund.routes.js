const express = require('express');
const router = express.Router();
const refundController = require('../controllers/refund.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, refundController.getAllRefunds);
router.get('/:id', authenticate, refundController.getRefundById);
router.post('/', authenticate, refundController.createRefund);
router.put('/:id', authenticate, refundController.updateRefund);
router.delete('/:id', authenticate, refundController.deleteRefund);

module.exports = router;
