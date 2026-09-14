const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Booking = require('./booking.model');
const Customer = require('./customer.model');

const Billing = sequelize.define('Billing', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Booking, key: 'id' },
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Customer, key: 'id' },
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'card', 'transfer', 'mobile'),
    allowNull: true,
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'partial', 'refunded'),
    defaultValue: 'pending',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  extraCharges: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  hotelId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: true,
});

// Associations
Booking.hasOne(Billing, { foreignKey: 'bookingId' });
Billing.belongsTo(Booking, { foreignKey: 'bookingId' });

Customer.hasMany(Billing, { foreignKey: 'customerId' });
Billing.belongsTo(Customer, { foreignKey: 'customerId' });

module.exports = Billing;
