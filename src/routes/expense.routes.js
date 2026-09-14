const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, expenseController.getAllExpenses);
router.get('/:id', authenticate, expenseController.getExpenseById);
router.post('/', authenticate, expenseController.createExpense);
router.put('/:id', authenticate, expenseController.updateExpense);
router.delete('/:id', authenticate, expenseController.deleteExpense);

module.exports = router;
