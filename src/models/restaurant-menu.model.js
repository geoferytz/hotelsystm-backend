const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RestaurantMenu = sequelize.define('RestaurantMenu', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  restaurantId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.ENUM('breakfast', 'lunch', 'dinner', 'drink', 'dessert', 'snack', 'other'), defaultValue: 'other' },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  imageUrl: { type: DataTypes.STRING, allowNull: true },
  isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
  hotelId: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'restaurant_menus', timestamps: true });

module.exports = RestaurantMenu;
