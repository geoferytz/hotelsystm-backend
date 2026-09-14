const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Hotel = sequelize.define('Hotel', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING },
  city: { type: DataTypes.STRING },
  country: { type: DataTypes.STRING, defaultValue: 'Tanzania' },
  phone: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  logo: { type: DataTypes.STRING },
  imageUrl: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  starRating: { type: DataTypes.INTEGER, defaultValue: 3 },
  checkInTime: { type: DataTypes.STRING, defaultValue: '14:00' },
  checkOutTime: { type: DataTypes.STRING, defaultValue: '11:00' },
  latitude: { type: DataTypes.DECIMAL(10, 8), allowNull: true },
  longitude: { type: DataTypes.DECIMAL(11, 8), allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'hotels', timestamps: true });

module.exports = Hotel;
