const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RoomType = sequelize.define('RoomType', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  basePrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  maxOccupancy: { type: DataTypes.INTEGER, defaultValue: 2 },
  amenities: { type: DataTypes.TEXT, defaultValue: '' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  hotelId: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'room_types', timestamps: true });

module.exports = RoomType;
