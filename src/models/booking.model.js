const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Customer = require('./customer.model');
const Room = require('./room.model');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Customer, key: 'id' },
  },
  roomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Room, key: 'id' },
  },
  checkIn: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  checkOut: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('confirmed', 'checked-in', 'checked-out', 'cancelled'),
    defaultValue: 'confirmed',
  },
  adults: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  children: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  specialRequests: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  hotelId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: true,
});

// Associations
Customer.hasMany(Booking, { foreignKey: 'customerId' });
Booking.belongsTo(Customer, { foreignKey: 'customerId' });

Room.hasMany(Booking, { foreignKey: 'roomId' });
Booking.belongsTo(Room, { foreignKey: 'roomId' });

module.exports = Booking;
