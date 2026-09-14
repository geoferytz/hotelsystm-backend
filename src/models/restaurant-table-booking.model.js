const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RestaurantTableBooking = sequelize.define('RestaurantTableBooking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  restaurantId: { type: DataTypes.INTEGER, allowNull: false },
  guestName: { type: DataTypes.STRING, allowNull: false },
  guestEmail: { type: DataTypes.STRING, allowNull: true },
  guestPhone: { type: DataTypes.STRING, allowNull: false },
  numberOfGuests: { type: DataTypes.INTEGER, allowNull: false },
  bookingDate: { type: DataTypes.DATEONLY, allowNull: false },
  bookingTime: { type: DataTypes.STRING, allowNull: false },
  specialRequests: { type: DataTypes.TEXT, allowNull: true },
  status: { 
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
    defaultValue: 'pending'
  },
}, { tableName: 'restaurant_table_bookings', timestamps: true });

module.exports = RestaurantTableBooking;
