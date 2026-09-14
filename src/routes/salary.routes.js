const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salary.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, salaryController.getAllSalaries);
router.get('/:id', authenticate, salaryController.getSalaryById);
router.post('/', authenticate, salaryController.createSalary);
router.put('/:id', authenticate, salaryController.updateSalary);
router.delete('/:id', authenticate, salaryController.deleteSalary);
router.patch('/:id/mark-paid', authenticate, salaryController.markAsPaid);

module.exports = router;
