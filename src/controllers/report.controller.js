const Room = require('../models/room.model');
const Booking = require('../models/booking.model');
const Customer = require('../models/customer.model');
const Billing = require('../models/billing.model');
const Shift = require('../models/shift.model');
const User = require('../models/user.model');
const Expense = require('../models/expense.model');
const Refund = require('../models/refund.model');
const { Op, fn, col, literal } = require('sequelize');
const { addHotelFilter } = require('../middleware/hotel.middleware');

// GET /api/reports/revenue
exports.getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = { paymentStatus: { [Op.in]: ['paid', 'partial'] } };
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate + 'T23:59:59')] };
    }

    const billings = await Billing.findAll({
      where,
      include: [
        { model: Booking, include: [{ model: Room, attributes: ['roomNumber', 'type'] }] },
        { model: Customer, attributes: ['fullName'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const totalRevenue = billings.reduce((sum, b) => sum + parseFloat(b.paidAmount || 0), 0);
    const totalOutstanding = billings.reduce((sum, b) => sum + (parseFloat(b.totalAmount || 0) - parseFloat(b.paidAmount || 0)), 0);

    res.json({ billings, totalRevenue, totalOutstanding, count: billings.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate revenue report.', error: error.message });
  }
};

// GET /api/reports/occupancy
exports.getOccupancyReport = async (req, res) => {
  try {
    const totalRooms = await Room.count();
    const available = await Room.count({ where: { status: 'available' } });
    const occupied = await Room.count({ where: { status: 'occupied' } });
    const maintenance = await Room.count({ where: { status: 'maintenance' } });
    const dirty = await Room.count({ where: { status: 'dirty' } });

    const roomsByType = await Room.findAll({
      attributes: ['type', [fn('COUNT', col('id')), 'count']],
      group: ['type'],
    });

    const occupancyRate = totalRooms > 0 ? ((occupied / totalRooms) * 100).toFixed(1) : 0;

    res.json({
      totalRooms, available, occupied, maintenance, dirty,
      occupancyRate: parseFloat(occupancyRate),
      roomsByType,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate occupancy report.', error: error.message });
  }
};

// GET /api/reports/bookings
exports.getBookingsReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate + 'T23:59:59')] };
    }

    const totalBookings = await Booking.count({ where });
    const confirmed = await Booking.count({ where: { ...where, status: 'confirmed' } });
    const checkedIn = await Booking.count({ where: { ...where, status: 'checked-in' } });
    const checkedOut = await Booking.count({ where: { ...where, status: 'checked-out' } });
    const cancelled = await Booking.count({ where: { ...where, status: 'cancelled' } });

    const bookings = await Booking.findAll({
      where,
      include: [
        { model: Customer, attributes: ['fullName', 'phone'] },
        { model: Room, attributes: ['roomNumber', 'type', 'price'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    res.json({ totalBookings, confirmed, checkedIn, checkedOut, cancelled, bookings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate bookings report.', error: error.message });
  }
};

// GET /api/reports/staff
exports.getStaffReport = async (req, res) => {
  try {
    const totalStaff = await User.count();
    const activeStaff = await User.count({ where: { isActive: true } });

    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });

    const shifts = await Shift.findAll({
      include: [{ model: User, attributes: ['fullName', 'role'] }],
      order: [['shiftDate', 'DESC']],
      limit: 50,
    });

    res.json({ totalStaff, activeStaff, users, shifts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate staff report.', error: error.message });
  }
};

// GET /api/reports/expenses
exports.getExpenseReport = async (req, res) => {
  try {
    const { startDate, endDate, category, status } = req.query;
    const where = {};
    addHotelFilter(where, req);
    
    if (startDate && endDate) {
      where.expenseDate = { [Op.between]: [new Date(startDate), new Date(endDate + 'T23:59:59')] };
    }
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

    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    
    const expensesByCategory = await Expense.findAll({
      where,
      attributes: ['category', [fn('SUM', col('amount')), 'total']],
      group: ['category'],
    });

    const expensesByStatus = await Expense.findAll({
      where,
      attributes: ['status', [fn('COUNT', col('id')), 'count'], [fn('SUM', col('amount')), 'total']],
      group: ['status'],
    });

    res.json({ expenses, totalExpenses, expensesByCategory, expensesByStatus, count: expenses.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate expense report.', error: error.message });
  }
};

// GET /api/reports/refunds
exports.getRefundReport = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const where = {};
    addHotelFilter(where, req);
    
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate + 'T23:59:59')] };
    }
    if (status) where.status = status;

    const refunds = await Refund.findAll({
      where,
      include: [
        {
          model: Billing,
          as: 'Billing',
          include: [
            { model: Customer, as: 'Customer' },
            { model: Booking, as: 'Booking' },
          ],
        },
        {
          model: User,
          as: 'Processor',
          attributes: ['id', 'username', 'fullName'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const totalRefunds = refunds.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
    
    const refundsByStatus = await Refund.findAll({
      where,
      attributes: ['status', [fn('COUNT', col('id')), 'count'], [fn('SUM', col('amount')), 'total']],
      group: ['status'],
    });

    res.json({ refunds, totalRefunds, refundsByStatus, count: refunds.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate refund report.', error: error.message });
  }
};

// GET /api/reports/profit-loss
exports.getProfitLossReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const billingWhere = { paymentStatus: { [Op.in]: ['paid', 'partial'] } };
    const expenseWhere = { status: 'approved' };
    const refundWhere = { status: 'processed' };
    
    addHotelFilter(billingWhere, req);
    addHotelFilter(expenseWhere, req);
    addHotelFilter(refundWhere, req);

    if (startDate && endDate) {
      billingWhere.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate + 'T23:59:59')] };
      expenseWhere.expenseDate = { [Op.between]: [new Date(startDate), new Date(endDate + 'T23:59:59')] };
      refundWhere.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate + 'T23:59:59')] };
    }

    const totalRevenue = await Billing.sum('paidAmount', { where: billingWhere }) || 0;
    const totalExpenses = await Expense.sum('amount', { where: expenseWhere }) || 0;
    const totalRefunds = await Refund.sum('amount', { where: refundWhere }) || 0;
    
    const netRevenue = totalRevenue - totalRefunds;
    const profit = netRevenue - totalExpenses;
    const profitMargin = netRevenue > 0 ? ((profit / netRevenue) * 100).toFixed(2) : 0;

    const revenueByMonth = await Billing.findAll({
      where: billingWhere,
      attributes: [
        [fn('DATE_TRUNC', literal("'month'"), col('createdAt')), 'month'],
        [fn('SUM', col('paidAmount')), 'total'],
      ],
      group: [fn('DATE_TRUNC', literal("'month'"), col('createdAt'))],
      order: [[fn('DATE_TRUNC', literal("'month'"), col('createdAt')), 'ASC']],
    });

    const expensesByMonth = await Expense.findAll({
      where: expenseWhere,
      attributes: [
        [fn('DATE_TRUNC', literal("'month'"), col('expenseDate')), 'month'],
        [fn('SUM', col('amount')), 'total'],
      ],
      group: [fn('DATE_TRUNC', literal("'month'"), col('expenseDate'))],
      order: [[fn('DATE_TRUNC', literal("'month'"), col('expenseDate')), 'ASC']],
    });

    const expensesByCategory = await Expense.findAll({
      where: expenseWhere,
      attributes: ['category', [fn('SUM', col('amount')), 'total']],
      group: ['category'],
    });

    res.json({
      totalRevenue,
      totalExpenses,
      totalRefunds,
      netRevenue,
      profit,
      profitMargin: parseFloat(profitMargin),
      revenueByMonth,
      expensesByMonth,
      expensesByCategory,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate profit/loss report.', error: error.message });
  }
};

// GET /api/reports/financial-summary
exports.getFinancialSummary = async (req, res) => {
  try {
    const where = {};
    addHotelFilter(where, req);

    const totalRevenue = await Billing.sum('paidAmount', { 
      where: { ...where, paymentStatus: { [Op.in]: ['paid', 'partial'] } } 
    }) || 0;
    
    const totalOutstanding = await Billing.sum('totalAmount', { where }) - 
      await Billing.sum('paidAmount', { where }) || 0;
    
    const totalExpenses = await Expense.sum('amount', { 
      where: { ...where, status: 'approved' } 
    }) || 0;
    
    const totalRefunds = await Refund.sum('amount', { 
      where: { ...where, status: 'processed' } 
    }) || 0;

    const pendingExpenses = await Expense.count({ where: { ...where, status: 'pending' } });
    const pendingRefunds = await Refund.count({ where: { ...where, status: 'pending' } });

    const totalBookings = await Booking.count({ where });
    const activeBookings = await Booking.count({ where: { ...where, status: 'checked-in' } });

    res.json({
      totalRevenue,
      totalOutstanding,
      totalExpenses,
      totalRefunds,
      netRevenue: totalRevenue - totalRefunds,
      profit: totalRevenue - totalRefunds - totalExpenses,
      pendingExpenses,
      pendingRefunds,
      totalBookings,
      activeBookings,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate financial summary.', error: error.message });
  }
};
