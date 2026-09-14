const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const HotelService = sequelize.define('HotelService', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.ENUM('amenity', 'transport', 'spa', 'laundry', 'event', 'other'), defaultValue: 'amenity' },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  icon: { type: DataTypes.STRING, defaultValue: 'bi-star' },
  imageUrl: { type: DataTypes.STRING, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  hotelId: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'hotel_services', timestamps: true });

module.exports = HotelService;
