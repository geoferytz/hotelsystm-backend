const { RestaurantMenu, RestaurantMenuOrder, RestaurantTableBooking } = require('../models');
const Notification = require('../models/notification.model');

// POST /api/guest/restaurant/table-booking - Create table booking
exports.createTableBooking = async (req, res) => {
  try {
    const {
      restaurantId,
      guestName,
      guestEmail,
      guestPhone,
      numberOfGuests,
      bookingDate,
      bookingTime,
      specialRequests
    } = req.body;

    const booking = await RestaurantTableBooking.create({
      restaurantId,
      guestName,
      guestEmail,
      guestPhone,
      numberOfGuests,
      bookingDate,
      bookingTime,
      specialRequests
    });

    // Create notification for admin
    await Notification.create({
      title: 'New Table Booking',
      message: `${guestName} has booked a table for ${numberOfGuests} guests on ${bookingDate} at ${bookingTime}`,
      type: 'restaurant_booking',
      relatedId: booking.id
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create table booking.', error: error.message });
  }
};

// POST /api/guest/restaurant/menu-order - Create menu order
exports.createMenuOrder = async (req, res) => {
  try {
    const {
      restaurantId,
      guestName,
      guestEmail,
      guestPhone,
      orderDate,
      orderTime,
      orderType,
      items,
      specialRequests
    } = req.body;

    console.log('Menu order request body:', JSON.stringify({ restaurantId, guestName, guestPhone, orderType, items }));

    // Validate required fields
    if (!restaurantId || !guestName || !guestPhone || !orderDate || !orderTime || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Missing required fields: restaurantId, guestName, guestPhone, orderDate, orderTime, and items are required.' });
    }

    // Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      if (!item.id || !item.quantity) {
        return res.status(400).json({ message: 'Each item must have id and quantity.' });
      }
      const menu = await RestaurantMenu.findByPk(item.id);
      if (!menu) {
        return res.status(404).json({ message: `Menu item with id ${item.id} not found.` });
      }
      if (!menu.isAvailable) {
        return res.status(400).json({ message: `Menu item ${menu.name} is not available.` });
      }
      totalAmount += parseFloat(menu.price) * parseInt(item.quantity);
    }

    const order = await RestaurantMenuOrder.create({
      restaurantId,
      guestName,
      guestEmail: guestEmail || null,
      guestPhone,
      orderDate,
      orderTime,
      orderType: orderType || 'dine_in',
      items,
      totalAmount,
      specialRequests: specialRequests || null,
      status: 'pending'
    });

    // Create notification for admin
    await Notification.create({
      title: 'New Menu Order',
      message: `${guestName} has placed a ${orderType || 'dine-in'} order for ${totalAmount} Tsh on ${orderDate} at ${orderTime}`,
      type: 'restaurant_order',
      relatedId: order.id
    });

    res.status(201).json({
      message: 'Menu order created successfully!',
      order: {
        id: order.id,
        guestName: order.guestName,
        totalAmount: order.totalAmount,
        status: order.status,
      },
    });
  } catch (error) {
    console.error('Menu order error:', error);
    res.status(500).json({ message: 'Failed to create menu order.', error: error.message });
  }
};

// GET /api/restaurants/bookings - Get all table bookings
exports.getAllTableBookings = async (req, res) => {
  try {
    const bookings = await RestaurantTableBooking.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch table bookings.', error: error.message });
  }
};

// GET /api/restaurants/bookings/:id - Get table booking by ID
exports.getTableBookingById = async (req, res) => {
  try {
    const booking = await RestaurantTableBooking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Table booking not found.' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch table booking.', error: error.message });
  }
};

// PUT /api/restaurants/bookings/:id/status - Update table booking status
exports.updateTableBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await RestaurantTableBooking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Table booking not found.' });
    }
    await booking.update({ status });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update table booking status.', error: error.message });
  }
};

// GET /api/restaurants/orders - Get all menu orders
exports.getAllMenuOrders = async (req, res) => {
  try {
    const orders = await RestaurantMenuOrder.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch menu orders.', error: error.message });
  }
};

// GET /api/restaurants/orders/:id - Get menu order by ID
exports.getMenuOrderById = async (req, res) => {
  try {
    const order = await RestaurantMenuOrder.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Menu order not found.' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch menu order.', error: error.message });
  }
};

// PUT /api/restaurants/orders/:id/status - Update menu order status
exports.updateMenuOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await RestaurantMenuOrder.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Menu order not found.' });
    }
    await order.update({ status });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update menu order status.', error: error.message });
  }
};
