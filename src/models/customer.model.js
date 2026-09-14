const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: { isEmail: true },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  idNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  nationality: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  belongings: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = Customer;
