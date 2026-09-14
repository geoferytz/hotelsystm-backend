const Customer = require('../models/customer.model');
const Booking = require('../models/booking.model');
const Billing = require('../models/billing.model');
const Room = require('../models/room.model');

// GET /api/customers
exports.getAllCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    const where = {};
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const customers = await Customer.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch customers.', error: error.message });
  }
};

// GET /api/customers/:id
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found.' });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch customer.', error: error.message });
  }
};

// POST /api/customers
exports.createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ message: 'Customer created successfully.', customer });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create customer.', error: error.message });
  }
};

// PUT /api/customers/:id
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found.' });

    await customer.update(req.body);
    res.json({ message: 'Customer updated successfully.', customer });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update customer.', error: error.message });
  }
};

// GET /api/customers/:id/details - full customer details with bookings, billing
exports.getCustomerDetails = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found.' });

    const bookings = await Booking.findAll({
      where: { customerId: customer.id },
      include: [{ model: Room, attributes: ['roomNumber', 'type', 'price'] }],
      order: [['checkIn', 'DESC']],
    });

    const billings = await Billing.findAll({
      where: { customerId: customer.id },
      include: [{ model: Booking, include: [{ model: Room, attributes: ['roomNumber'] }] }],
      order: [['createdAt', 'DESC']],
    });

    res.json({ customer, bookings, billings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get customer details.', error: error.message });
  }
};

// DELETE /api/customers/:id
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found.' });

    await customer.destroy();
    res.json({ message: 'Customer deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete customer.', error: error.message });
  }
};
