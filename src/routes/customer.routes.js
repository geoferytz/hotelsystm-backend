const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, customerController.getAllCustomers);
router.get('/:id', authenticate, customerController.getCustomerById);
router.get('/:id/details', authenticate, customerController.getCustomerDetails);
router.post('/', authenticate, customerController.createCustomer);
router.put('/:id', authenticate, customerController.updateCustomer);
router.delete('/:id', authenticate, customerController.deleteCustomer);

module.exports = router;
