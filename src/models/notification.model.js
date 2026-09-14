const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.ENUM('booking', 'cancellation', 'payment', 'extension', 'short-stay', 'check-in', 'check-out', 'restaurant_booking', 'restaurant_order', 'food', 'drink'),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  referenceId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  referenceType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  hotelId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = Notification;
