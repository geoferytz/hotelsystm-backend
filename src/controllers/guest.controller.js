const Room = require('../models/room.model');
const Booking = require('../models/booking.model');
const Customer = require('../models/customer.model');
const Billing = require('../models/billing.model');
const Meal = require('../models/meal.model');
const { Restaurant, RestaurantMenu } = require('../models');
const { Op } = require('sequelize');
const { createNotification } = require('./notification.controller');

// GET /api/guest/rooms - public available rooms
exports.getAvailableRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      where: { status: 'available' },
      order: [['price', 'ASC']],
    });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch rooms.', error: error.message });
  }
};

// GET /api/guest/room-summary - room stats for guest dashboard
exports.getRoomSummary = async (req, res) => {
  try {
    const total = await Room.count();
    const available = await Room.count({ where: { status: 'available' } });
    const types = await Room.findAll({
      attributes: ['type', [require('sequelize').fn('MIN', require('sequelize').col('price')), 'minPrice']],
      where: { status: 'available' },
      group: ['type'],
      raw: true,
    });
    res.json({ total, available, types });
  } catch (error) {
    res.status(500).json({ message: 'Failed.', error: error.message });
  }
};

// GET /api/guest/menu - public hotel menu
exports.getMenu = async (req, res) => {
  try {
    const where = { isAvailable: true };
    if (req.query.hotelId) where.hotelId = req.query.hotelId;
    if (req.query.category) where.category = req.query.category;

    const meals = await Meal.findAll({ where, order: [['category', 'ASC'], ['name', 'ASC']] });
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch menu.', error: error.message });
  }
};

// POST /api/guest/book - guest creates booking (no auth)
exports.createGuestBooking = async (req, res) => {
  try {
    const { fullName, email, phone, idNumber, nationality, hotelId, roomId, checkIn, checkOut, adults, children, specialRequests } = req.body;

    console.log('Guest booking request body:', JSON.stringify({ fullName, email, phone, hotelId, roomId, checkIn, checkOut, adults, children }));

    // Validate required fields
    if (!fullName || !phone || !roomId || !checkIn || !checkOut) {
      console.log('Validation failed - missing:', { fullName: !!fullName, phone: !!phone, roomId: !!roomId, checkIn: !!checkIn, checkOut: !!checkOut });
      return res.status(400).json({ message: 'Missing required fields: fullName, phone, roomId, checkIn, checkOut are required.' });
    }

    // Create or find customer
    let customer = await Customer.findOne({ where: { phone } });
    if (!customer) {
      customer = await Customer.create({ fullName, email, phone, idNumber, nationality });
    }

    // Check room status - only block if in maintenance
    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }
    if (room.status === 'maintenance') {
      return res.status(400).json({ message: 'Room is under maintenance.' });
    }

    // Check availability for conflicting bookings
    // Standard interval overlap: dates overlap if newCheckIn < existingCheckOut AND newCheckOut > existingCheckIn
    const conflicting = await Booking.findOne({
      where: {
        roomId,
        status: { [Op.notIn]: ['checked-out', 'cancelled'] },
        [Op.and]: [
          { checkIn: { [Op.lt]: checkOut } },  // existing check-in is before new check-out
          { checkOut: { [Op.gt]: checkIn } },  // existing check-out is after new check-in
        ],
      },
    });
    if (conflicting) {
      return res.status(400).json({ message: 'Room is not available for the selected dates due to an existing booking.' });
    }

    const booking = await Booking.create({
      customerId: customer.id, hotelId, roomId, checkIn, checkOut, adults: adults || 1, children: children || 0, specialRequests,
    });

    await Room.update({ status: 'occupied' }, { where: { id: roomId } });

    const nights = Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)));
    const totalAmount = nights * parseFloat(room.price);

    // Auto-create billing
    const billing = await Billing.create({
      bookingId: booking.id, customerId: customer.id, totalAmount, paidAmount: 0, paymentStatus: 'pending',
    });

    await createNotification('booking', 'New Guest Booking', `${fullName} booked Room ${room.roomNumber} (${checkIn} to ${checkOut})`, booking.id, 'Booking', hotelId);

    res.status(201).json({
      message: 'Booking created successfully!',
      booking: { id: booking.id, checkIn, checkOut, roomNumber: room.roomNumber, roomType: room.type },
      billing: { id: billing.id, totalAmount },
      customer: { id: customer.id, fullName: customer.fullName },
    });
  } catch (error) {
    console.error('Guest booking error:', error);
    res.status(500).json({ message: 'Booking failed.', error: error.message });
  }
};

// POST /api/guest/pay - guest makes payment
exports.guestPayment = async (req, res) => {
  try {
    const { billingId, amount, paymentMethod } = req.body;

    const billing = await Billing.findByPk(billingId);
    if (!billing) return res.status(404).json({ message: 'Invoice not found.' });

    const newPaid = parseFloat(billing.paidAmount) + parseFloat(amount);
    let paymentStatus = 'partial';
    if (newPaid >= parseFloat(billing.totalAmount)) paymentStatus = 'paid';

    await billing.update({ paidAmount: newPaid, paymentMethod, paymentStatus });

    const customer = await Customer.findByPk(billing.customerId);
    const booking = await Booking.findByPk(billing.bookingId);
    await createNotification('payment', 'Guest Payment', `${customer?.fullName} paid $${amount} (${paymentMethod})`, billing.id, 'Billing', booking?.hotelId);

    res.json({ message: 'Payment recorded successfully.', billing });
  } catch (error) {
    res.status(500).json({ message: 'Payment failed.', error: error.message });
  }
};

// GET /api/guest/invoice/:billingId - get invoice details for sharing
exports.getInvoice = async (req, res) => {
  try {
    const billing = await Billing.findByPk(req.params.billingId, {
      include: [
        { model: Booking, include: [{ model: Room }] },
        { model: Customer },
      ],
    });
    if (!billing) return res.status(404).json({ message: 'Invoice not found.' });
    res.json(billing);
  } catch (error) {
    res.status(500).json({ message: 'Failed.', error: error.message });
  }
};

// GET /api/guest/restaurants - public restaurants
exports.getRestaurants = async (req, res) => {
  try {
    const where = {};
    if (req.query.hotelId) where.hotelId = req.query.hotelId;
    const restaurants = await Restaurant.findAll({ where, order: [['name', 'ASC']] });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch restaurants.', error: error.message });
  }
};

// GET /api/guest/restaurants/:id - public restaurant by id
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found.' });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch restaurant.', error: error.message });
  }
};

// GET /api/guest/restaurants/:id/menus - public restaurant menus
exports.getRestaurantMenus = async (req, res) => {
  try {
    const where = { restaurantId: req.params.id, isAvailable: true };
    const menus = await RestaurantMenu.findAll({ where, order: [['category', 'ASC'], ['name', 'ASC']] });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch restaurant menus.', error: error.message });
  }
};
