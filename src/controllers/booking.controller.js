const Booking = require('../models/booking.model');
const Room = require('../models/room.model');
const Customer = require('../models/customer.model');
const Billing = require('../models/billing.model');
const { Op } = require('sequelize');
const { createNotification } = require('./notification.controller');
const { addHotelFilter, addHotelId } = require('../middleware/hotel.middleware');

// GET /api/bookings
exports.getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;
    addHotelFilter(where, req);

    const bookings = await Booking.findAll({
      where,
      include: [
        { model: Customer, attributes: ['id', 'fullName', 'phone', 'email'] },
        { model: Room, attributes: ['id', 'roomNumber', 'type', 'price'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings.', error: error.message });
  }
};

// GET /api/bookings/:id
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: Customer },
        { model: Room },
      ],
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch booking.', error: error.message });
  }
};

// POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const { customerId, roomId, checkIn, checkOut, adults, children, specialRequests } = req.body;

    // Check room availability
    const conflicting = await Booking.findOne({
      where: {
        roomId,
        status: { [Op.notIn]: ['checked-out', 'cancelled'] },
        [Op.or]: [
          { checkIn: { [Op.between]: [checkIn, checkOut] } },
          { checkOut: { [Op.between]: [checkIn, checkOut] } },
          {
            [Op.and]: [
              { checkIn: { [Op.lte]: checkIn } },
              { checkOut: { [Op.gte]: checkOut } },
            ],
          },
        ],
      },
    });

    if (conflicting) {
      return res.status(400).json({ message: 'Room is not available for the selected dates.' });
    }

    const booking = await Booking.create(addHotelId({
      customerId, roomId, checkIn, checkOut, adults, children, specialRequests,
    }, req));

    // Update room status
    await Room.update({ status: 'occupied' }, { where: { id: roomId } });

    const fullBooking = await Booking.findByPk(booking.id, {
      include: [{ model: Customer }, { model: Room }],
    });

    res.status(201).json({ message: 'Booking created successfully.', booking: fullBooking });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create booking.', error: error.message });
  }
};

// PUT /api/bookings/:id
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    await booking.update(req.body);

    // If checked-out or cancelled, free the room
    if (['checked-out', 'cancelled'].includes(req.body.status)) {
      await Room.update({ status: 'available' }, { where: { id: booking.roomId } });
    }

    const updated = await Booking.findByPk(booking.id, {
      include: [{ model: Customer }, { model: Room }],
    });

    res.json({ message: 'Booking updated successfully.', booking: updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update booking.', error: error.message });
  }
};

// PUT /api/bookings/:id/extend - extend check-out date
exports.extendBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Customer }, { model: Room }],
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (booking.status !== 'checked-in') {
      return res.status(400).json({ message: 'Only checked-in bookings can be extended.' });
    }

    const { newCheckOut } = req.body;
    if (!newCheckOut || new Date(newCheckOut) <= new Date(booking.checkOut)) {
      return res.status(400).json({ message: 'New check-out date must be after current check-out.' });
    }

    // Check room availability for extended dates
    const conflicting = await Booking.findOne({
      where: {
        roomId: booking.roomId,
        id: { [Op.ne]: booking.id },
        status: { [Op.notIn]: ['checked-out', 'cancelled'] },
        checkIn: { [Op.lt]: newCheckOut },
        checkOut: { [Op.gt]: booking.checkOut },
      },
    });
    if (conflicting) {
      return res.status(400).json({ message: 'Room is not available for the extended dates.' });
    }

    const oldCheckOut = booking.checkOut;
    await booking.update({ checkOut: newCheckOut });

    // Update billing with additional charges
    const extraNights = Math.ceil((new Date(newCheckOut) - new Date(oldCheckOut)) / (1000 * 60 * 60 * 24));
    const extraAmount = extraNights * parseFloat(booking.Room.price);
    const billing = await Billing.findOne({ where: { bookingId: booking.id } });
    if (billing) {
      await billing.update({ totalAmount: parseFloat(billing.totalAmount) + extraAmount });
    }

    await createNotification('extension', 'Date Extension', `${booking.Customer.fullName} extended Room ${booking.Room.roomNumber} to ${newCheckOut} (+${extraNights} nights, +$${extraAmount})`, booking.id, 'Booking', booking.hotelId);

    res.json({ message: `Booking extended to ${newCheckOut}. Additional charge: $${extraAmount}`, booking, extraNights, extraAmount });
  } catch (error) {
    res.status(500).json({ message: 'Failed to extend booking.', error: error.message });
  }
};

// PUT /api/bookings/:id/cancel - cancel booking with notification
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Customer }, { model: Room }],
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (['checked-out', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ message: 'Booking is already ' + booking.status });
    }

    const { reason } = req.body || {};
    await booking.update({ status: 'cancelled', specialRequests: (booking.specialRequests || '') + (reason ? `\n[CANCELLED: ${reason}]` : '') });
    await Room.update({ status: 'available' }, { where: { id: booking.roomId } });

    // Refund billing if exists
    const billing = await Billing.findOne({ where: { bookingId: booking.id } });
    if (billing && billing.paymentStatus !== 'refunded') {
      await billing.update({ paymentStatus: 'refunded' });
    }

    await createNotification('cancellation', 'Booking Cancelled', `${booking.Customer.fullName} — Room ${booking.Room.roomNumber} (${booking.checkIn} to ${booking.checkOut})${reason ? '. Reason: ' + reason : ''}`, booking.id, 'Booking', booking.hotelId);

    res.json({ message: 'Booking cancelled successfully.', booking });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel booking.', error: error.message });
  }
};

// PUT /api/bookings/:id/change-room
exports.changeRoom = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Customer }, { model: Room }],
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (['checked-out', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot change room for a ' + booking.status + ' booking.' });
    }

    const { newRoomId } = req.body;
    if (!newRoomId) return res.status(400).json({ message: 'New room ID is required.' });
    if (newRoomId === booking.roomId) return res.status(400).json({ message: 'New room is the same as the current room.' });

    const newRoom = await Room.findByPk(newRoomId);
    if (!newRoom) return res.status(404).json({ message: 'New room not found.' });
    if (newRoom.status !== 'available') return res.status(400).json({ message: `Room ${newRoom.roomNumber} is not available.` });

    // Check for conflicting bookings on the new room
    const conflicting = await Booking.findOne({
      where: {
        roomId: newRoomId,
        id: { [Op.ne]: booking.id },
        status: { [Op.notIn]: ['checked-out', 'cancelled'] },
        [Op.or]: [
          { checkIn: { [Op.between]: [booking.checkIn, booking.checkOut] } },
          { checkOut: { [Op.between]: [booking.checkIn, booking.checkOut] } },
          { [Op.and]: [{ checkIn: { [Op.lte]: booking.checkIn } }, { checkOut: { [Op.gte]: booking.checkOut } }] },
        ],
      },
    });
    if (conflicting) return res.status(400).json({ message: `Room ${newRoom.roomNumber} has a conflicting booking for these dates.` });

    const oldRoomId = booking.roomId;

    // Release old room, occupy new room, update booking
    await Room.update({ status: 'available' }, { where: { id: oldRoomId } });
    await Room.update({ status: 'occupied' }, { where: { id: newRoomId } });
    await booking.update({ roomId: newRoomId });

    await createNotification('room_change', 'Room Changed', `${booking.Customer.fullName} moved from Room ${booking.Room.roomNumber} to Room ${newRoom.roomNumber}`, booking.id, 'Booking', booking.hotelId);

    const updated = await Booking.findByPk(booking.id, {
      include: [{ model: Customer }, { model: Room }],
    });
    res.json({ message: `Room changed to ${newRoom.roomNumber} successfully.`, booking: updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to change room.', error: error.message });
  }
};

// DELETE /api/bookings/:id
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    await Room.update({ status: 'available' }, { where: { id: booking.roomId } });
    await booking.destroy();
    res.json({ message: 'Booking deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete booking.', error: error.message });
  }
};
