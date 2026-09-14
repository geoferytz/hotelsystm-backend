const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Billing = require('./billing.model');
const User = require('./user.model');

const Refund = sequelize.define('Refund', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  billingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Billing, key: 'id' },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'processed'),
    defaultValue: 'pending',
  },
  refundMethod: {
    type: DataTypes.ENUM('cash', 'card', 'transfer', 'mobile'),
    allowNull: true,
  },
  processedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: User, key: 'id' },
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
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

module.exports = Refund;
