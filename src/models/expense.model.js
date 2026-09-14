const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user.model');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  category: {
    type: DataTypes.ENUM('supplies', 'maintenance', 'utilities', 'salaries', 'marketing', 'other'),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  expenseDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'card', 'transfer', 'mobile'),
    allowNull: true,
  },
  vendor: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  receiptNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  approvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: User, key: 'id' },
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
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

module.exports = Expense;
