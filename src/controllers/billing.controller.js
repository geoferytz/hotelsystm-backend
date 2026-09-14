const Billing = require('../models/billing.model');
const Booking = require('../models/booking.model');
const Customer = require('../models/customer.model');
const Room = require('../models/room.model');
const { addHotelFilter, addHotelId } = require('../middleware/hotel.middleware');

// GET /api/billing
exports.getAllBillings = async (req, res) => {
  try {
    const { paymentStatus } = req.query;
    const where = {};
    if (paymentStatus) where.paymentStatus = paymentStatus;
    addHotelFilter(where, req);

    const billings = await Billing.findAll({
      where,
      include: [
        {
          model: Booking,
          include: [{ model: Room, attributes: ['roomNumber', 'type', 'price'] }],
        },
        { model: Customer, attributes: ['id', 'fullName', 'phone', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(billings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch billings.', error: error.message });
  }
};

// GET /api/billing/:id
exports.getBillingById = async (req, res) => {
  try {
    const billing = await Billing.findByPk(req.params.id, {
      include: [
        { model: Booking, include: [{ model: Room }] },
        { model: Customer },
      ],
    });
    if (!billing) return res.status(404).json({ message: 'Billing record not found.' });
    res.json(billing);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch billing.', error: error.message });
  }
};

// POST /api/billing
exports.createBilling = async (req, res) => {
  try {
    const { bookingId, customerId, totalAmount, paidAmount, paymentMethod, notes } = req.body;

    let paymentStatus = 'pending';
    if (paidAmount >= totalAmount) paymentStatus = 'paid';
    else if (paidAmount > 0) paymentStatus = 'partial';

    const billing = await Billing.create(addHotelId({
      bookingId, customerId, totalAmount, paidAmount, paymentMethod, paymentStatus, notes,
    }, req));

    res.status(201).json({ message: 'Billing created successfully.', billing });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create billing.', error: error.message });
  }
};

// PUT /api/billing/:id
exports.updateBilling = async (req, res) => {
  try {
    const billing = await Billing.findByPk(req.params.id);
    if (!billing) return res.status(404).json({ message: 'Billing record not found.' });

    const { paidAmount, totalAmount } = { ...billing.toJSON(), ...req.body };
    
    // Always calculate paymentStatus based on paidAmount vs totalAmount
    let paymentStatus;
    if (paidAmount >= totalAmount) paymentStatus = 'paid';
    else if (paidAmount > 0) paymentStatus = 'partial';
    else paymentStatus = 'pending';

    await billing.update({ ...req.body, paymentStatus });
    res.json({ message: 'Billing updated successfully.', billing });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update billing.', error: error.message });
  }
};

// DELETE /api/billing/:id
exports.deleteBilling = async (req, res) => {
  try {
    const billing = await Billing.findByPk(req.params.id);
    if (!billing) return res.status(404).json({ message: 'Billing record not found.' });

    await billing.destroy();
    res.json({ message: 'Billing deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete billing.', error: error.message });
  }
};
