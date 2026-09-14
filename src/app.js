const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const roomRoutes = require('./routes/room.routes');
const bookingRoutes = require('./routes/booking.routes');
const customerRoutes = require('./routes/customer.routes');
const billingRoutes = require('./routes/billing.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const shiftRoutes = require('./routes/shift.routes');
const reportRoutes = require('./routes/report.routes');
const workerRoutes = require('./routes/worker.routes');
const roleRoutes = require('./routes/role.routes');
const userRoutes = require('./routes/user.routes');
const guestRoutes = require('./routes/guest.routes');
const notificationRoutes = require('./routes/notification.routes');
const roomTypeRoutes = require('./routes/room-type.routes');
const mealRoutes = require('./routes/meal.routes');
const hotelServiceRoutes = require('./routes/hotel-service.routes');
const hotelRoutes = require('./routes/hotel.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const restaurantRoutes = require('./routes/restaurant.routes');
const restaurantBookingRoutes = require('./routes/restaurant-booking.routes');
const foodDrinkRoutes = require('./routes/food-drink.routes');
const refundRoutes = require('./routes/refund.routes');
const expenseRoutes = require('./routes/expense.routes');
const salaryRoutes = require('./routes/salary.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Hotel scoping middleware (applied globally, active when X-Hotel-Id header present)
const { scopeByHotel } = require('./middleware/hotel.middleware');
app.use(scopeByHotel);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/guest', guestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/room-types', roomTypeRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/hotel-services', hotelServiceRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/restaurant-bookings', restaurantBookingRoutes);
app.use('/api/guest/restaurant', restaurantBookingRoutes);
app.use('/api/food-drink', foodDrinkRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/salaries', salaryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HMS API is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

module.exports = app;
