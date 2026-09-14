const { Expense, User } = require('../models');
const { addHotelFilter, addHotelId } = require('../middleware/hotel.middleware');

exports.getAllExpenses = async (req, res) => {
  try {
    const { category, status } = req.query;
    const where = {};
    addHotelFilter(where, req);
    if (category) where.category = category;
    if (status) where.status = status;

    const expenses = await Expense.findAll({
      where,
      include: [
        {
          model: User,
          as: 'Approver',
          attributes: ['id', 'username', 'fullName'],
        },
      ],
      order: [['expenseDate', 'DESC']],
    });

    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
};

exports.getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findByPk(id, {
      include: [
        {
          model: User,
          as: 'Approver',
          attributes: ['id', 'username', 'fullName'],
        },
      ],
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ message: 'Failed to fetch expense' });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const { category, amount, description, expenseDate, paymentMethod, vendor, receiptNumber, notes } = req.body;

    if (!category || !amount || !description) {
      return res.status(400).json({ message: 'category, amount, and description are required' });
    }

    const expense = await Expense.create(addHotelId({
      category,
      amount,
      description,
      expenseDate: expenseDate || new Date(),
      paymentMethod,
      vendor,
      receiptNumber,
      notes,
      status: 'pending',
    }, req));

    const createdExpense = await Expense.findByPk(expense.id, {
      include: [
        {
          model: User,
          as: 'Approver',
          attributes: ['id', 'username', 'fullName'],
        },
      ],
    });

    res.status(201).json(createdExpense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ message: 'Failed to create expense' });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, amount, description, expenseDate, paymentMethod, vendor, receiptNumber, status, approvedBy, notes } = req.body;

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const updateData = {};
    if (category !== undefined) updateData.category = category;
    if (amount !== undefined) updateData.amount = amount;
    if (description !== undefined) updateData.description = description;
    if (expenseDate !== undefined) updateData.expenseDate = expenseDate;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (vendor !== undefined) updateData.vendor = vendor;
    if (receiptNumber !== undefined) updateData.receiptNumber = receiptNumber;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'approved') {
        updateData.approvedAt = new Date();
        if (approvedBy) updateData.approvedBy = approvedBy;
      }
    }
    if (approvedBy !== undefined) updateData.approvedBy = approvedBy;
    if (notes !== undefined) updateData.notes = notes;

    await expense.update(updateData);

    const updatedExpense = await Expense.findByPk(id, {
      include: [
        {
          model: User,
          as: 'Approver',
          attributes: ['id', 'username', 'fullName'],
        },
      ],
    });

    res.json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Failed to update expense' });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.status === 'approved') {
      return res.status(400).json({ message: 'Cannot delete an approved expense' });
    }

    await expense.destroy();

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Failed to delete expense' });
  }
};
