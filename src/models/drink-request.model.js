const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DrinkRequest = sequelize.define('DrinkRequest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  roomId: { type: DataTypes.INTEGER, allowNull: false },
  guestName: { type: DataTypes.STRING, allowNull: false },
  items: { type: DataTypes.JSONB, allowNull: false },
  totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  status: { 
    type: DataTypes.ENUM('pending', 'preparing', 'delivered', 'cancelled'), 
    defaultValue: 'pending' 
  },
  requestedBy: { type: DataTypes.STRING, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  hotelId: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'drink_requests', timestamps: true });

module.exports = DrinkRequest;
