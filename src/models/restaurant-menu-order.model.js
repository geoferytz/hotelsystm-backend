const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RestaurantMenuOrder = sequelize.define('RestaurantMenuOrder', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  restaurantId: { type: DataTypes.INTEGER, allowNull: false },
  guestName: { type: DataTypes.STRING, allowNull: false },
  guestEmail: { type: DataTypes.STRING, allowNull: true },
  guestPhone: { type: DataTypes.STRING, allowNull: false },
  orderDate: { type: DataTypes.DATEONLY, allowNull: false },
  orderTime: { type: DataTypes.STRING, allowNull: false },
  orderType: { 
    type: DataTypes.ENUM('dine_in', 'takeaway', 'delivery'),
    defaultValue: 'dine_in'
  },
  items: { type: DataTypes.JSON, allowNull: false },
  totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  specialRequests: { type: DataTypes.TEXT, allowNull: true },
  status: { 
    type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
}, { tableName: 'restaurant_menu_orders', timestamps: true });

module.exports = RestaurantMenuOrder;
