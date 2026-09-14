const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Worker = sequelize.define('Worker', {
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
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  hireDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'on-leave', 'terminated'),
    defaultValue: 'active',
  },
  idNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  emergencyContact: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Users', key: 'id' },
  },
  hotelId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = Worker;
