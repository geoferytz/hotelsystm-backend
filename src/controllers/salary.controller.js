const { Salary, Worker } = require('../models');
const { Op } = require('sequelize');
const { addHotelFilter, addHotelId } = require('../middleware/hotel.middleware');

exports.getAllSalaries = async (req, res) => {
  try {
    const { status, payPeriod, startDate, endDate } = req.query;
    const where = {};
    addHotelFilter(where, req);
    
    if (status) where.status = status;
    if (payPeriod) where.payPeriod = payPeriod;
    if (startDate && endDate) {
      where.payDate = { [Op.between]: [new Date(startDate), new Date(endDate + 'T23:59:59')] };
    }

    const salaries = await Salary.findAll({
      where,
      include: [
        {
          model: Worker,
          as: 'Employee',
          attributes: ['id', 'fullName', 'position', 'department'],
        },
      ],
      order: [['payDate', 'DESC']],
    });

    res.json(salaries);
  } catch (error) {
    console.error('Error fetching salaries:', error);
    res.status(500).json({ message: 'Failed to fetch salaries' });
  }
};

exports.getSalaryById = async (req, res) => {
  try {
    const { id } = req.params;

    const salary = await Salary.findByPk(id, {
      include: [
        {
          model: Worker,
          as: 'Employee',
          attributes: ['id', 'fullName', 'position', 'department', 'email'],
        },
      ],
    });

    if (!salary) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    res.json(salary);
  } catch (error) {
    console.error('Error fetching salary:', error);
    res.status(500).json({ message: 'Failed to fetch salary' });
  }
};

exports.createSalary = async (req, res) => {
  try {
    const { workerId, baseSalary, bonus, deductions, overtime, overtimeHours, payPeriod, payDate, paymentMethod, notes } = req.body;

    if (!workerId || !baseSalary || !payDate) {
      return res.status(400).json({ message: 'workerId, baseSalary, and payDate are required' });
    }

    const grossSalary = parseFloat(baseSalary) + parseFloat(bonus || 0) + parseFloat(overtime || 0);
    const netSalary = grossSalary - parseFloat(deductions || 0);

    const salary = await Salary.create(addHotelId({
      workerId,
      baseSalary,
      bonus: bonus || 0,
      deductions: deductions || 0,
      overtime: overtime || 0,
      overtimeHours: overtimeHours || 0,
      grossSalary,
      netSalary,
      payPeriod: payPeriod || 'monthly',
      payDate,
      paymentMethod,
      notes,
      status: 'pending',
    }, req));

    const createdSalary = await Salary.findByPk(salary.id, {
      include: [
        {
          model: Worker,
          as: 'Employee',
          attributes: ['id', 'fullName', 'position', 'department'],
        },
      ],
    });

    res.status(201).json(createdSalary);
  } catch (error) {
    console.error('Error creating salary:', error);
    res.status(500).json({ message: 'Failed to create salary' });
  }
};

exports.updateSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const { workerId, baseSalary, bonus, deductions, overtime, overtimeHours, payPeriod, payDate, status, paymentMethod, notes } = req.body;

    const salary = await Salary.findByPk(id);
    if (!salary) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    const updateData = {};
    if (workerId !== undefined) updateData.workerId = workerId;
    if (baseSalary !== undefined) updateData.baseSalary = baseSalary;
    if (bonus !== undefined) updateData.bonus = bonus;
    if (deductions !== undefined) updateData.deductions = deductions;
    if (overtime !== undefined) updateData.overtime = overtime;
    if (overtimeHours !== undefined) updateData.overtimeHours = overtimeHours;
    if (payPeriod !== undefined) updateData.payPeriod = payPeriod;
    if (payDate !== undefined) updateData.payDate = payDate;
    if (status !== undefined) updateData.status = status;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (notes !== undefined) updateData.notes = notes;

    if (baseSalary !== undefined || bonus !== undefined || overtime !== undefined || deductions !== undefined) {
      const newBaseSalary = baseSalary !== undefined ? baseSalary : salary.baseSalary;
      const newBonus = bonus !== undefined ? bonus : salary.bonus;
      const newOvertime = overtime !== undefined ? overtime : salary.overtime;
      const newDeductions = deductions !== undefined ? deductions : salary.deductions;
      updateData.grossSalary = parseFloat(newBaseSalary) + parseFloat(newBonus) + parseFloat(newOvertime);
      updateData.netSalary = updateData.grossSalary - parseFloat(newDeductions);
    }

    await salary.update(updateData);

    const updatedSalary = await Salary.findByPk(id, {
      include: [
        {
          model: Worker,
          as: 'Employee',
          attributes: ['id', 'fullName', 'position', 'department'],
        },
      ],
    });

    res.json(updatedSalary);
  } catch (error) {
    console.error('Error updating salary:', error);
    res.status(500).json({ message: 'Failed to update salary' });
  }
};

exports.deleteSalary = async (req, res) => {
  try {
    const { id } = req.params;

    const salary = await Salary.findByPk(id);
    if (!salary) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    if (salary.status === 'paid') {
      return res.status(400).json({ message: 'Cannot delete a paid salary record' });
    }

    await salary.destroy();

    res.json({ message: 'Salary record deleted successfully' });
  } catch (error) {
    console.error('Error deleting salary:', error);
    res.status(500).json({ message: 'Failed to delete salary' });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;

    const salary = await Salary.findByPk(id);
    if (!salary) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    if (salary.status === 'paid') {
      return res.status(400).json({ message: 'Salary is already marked as paid' });
    }

    await salary.update({
      status: 'paid',
      paymentMethod: paymentMethod || salary.paymentMethod,
    });

    const updatedSalary = await Salary.findByPk(id, {
      include: [
        {
          model: Worker,
          as: 'Employee',
          attributes: ['id', 'fullName', 'position', 'department'],
        },
      ],
    });

    res.json(updatedSalary);
  } catch (error) {
    console.error('Error marking salary as paid:', error);
    res.status(500).json({ message: 'Failed to mark salary as paid' });
  }
};
