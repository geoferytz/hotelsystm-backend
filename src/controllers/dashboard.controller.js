const Room = require('../models/room.model');
const Booking = require('../models/booking.model');
const Customer = require('../models/customer.model');
const Billing = require('../models/billing.model');
const { Op } = require('sequelize');
const sequelize = require('../config/db');
const { addHotelFilter } = require('../middleware/hotel.middleware');

// GET /api/dashboard/stats
exports.getStats = async (req, res) => {
  try {
    const roomWhere = {};
    addHotelFilter(roomWhere, req);
    const bookingWhere = {};
    addHotelFilter(bookingWhere, req);
    const billingWhere = {};
    addHotelFilter(billingWhere, req);
    const customerWhere = {};
    addHotelFilter(customerWhere, req);

    const totalRooms = await Room.count({ where: roomWhere });
    const availableRooms = await Room.count({ where: { ...roomWhere, status: 'available' } });
    const occupiedRooms = await Room.count({ where: { ...roomWhere, status: 'occupied' } });
    const totalCustomers = await Customer.count({ where: customerWhere });
    const activeBookings = await Booking.count({
      where: { ...bookingWhere, status: { [Op.in]: ['confirmed', 'checked-in'] } },
    });

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const monthlyRevenue = await Billing.sum('paidAmount', {
      where: {
        ...billingWhere,
        paymentStatus: { [Op.in]: ['paid', 'partial'] },
        createdAt: { [Op.gte]: startOfMonth },
      },
    });

    const totalRevenue = await Billing.sum('paidAmount', {
      where: { ...billingWhere, paymentStatus: { [Op.in]: ['paid', 'partial'] } },
    });

    const occupancyRate = totalRooms > 0
      ? ((occupiedRooms / totalRooms) * 100).toFixed(1)
      : 0;

    res.json({
      totalRooms,
      availableRooms,
      occupiedRooms,
      totalCustomers,
      activeBookings,
      monthlyRevenue: monthlyRevenue || 0,
      totalRevenue: totalRevenue || 0,
      occupancyRate: parseFloat(occupancyRate),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats.', error: error.message });
  }
};

// GET /api/dashboard/recent-bookings
exports.getRecentBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: Customer, attributes: ['fullName', 'phone'] },
        { model: Room, attributes: ['roomNumber', 'type'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 10,
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recent bookings.', error: error.message });
  }
};
