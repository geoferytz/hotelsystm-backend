const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Worker = require('./worker.model');

const Salary = sequelize.define('Salary', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  workerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Worker, key: 'id' },
  },
  baseSalary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  bonus: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  deductions: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  overtime: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  overtimeHours: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  grossSalary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  netSalary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  payPeriod: {
    type: DataTypes.ENUM('weekly', 'bi-weekly', 'monthly'),
    allowNull: false,
    defaultValue: 'monthly',
  },
  payDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'cancelled'),
    defaultValue: 'pending',
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'bank_transfer', 'mobile', 'check'),
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

module.exports = Salary;
