const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Meal = sequelize.define('Meal', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.ENUM('breakfast', 'lunch', 'dinner', 'snack', 'beverage', 'dessert'), defaultValue: 'lunch' },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
  imageUrl: { type: DataTypes.STRING, allowNull: true },
  portionSize: { type: DataTypes.STRING, allowNull: true },
  preparationTime: { type: DataTypes.INTEGER, allowNull: true },
  calories: { type: DataTypes.INTEGER, allowNull: true },
  dietaryTags: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
  hotelId: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'meals', timestamps: true });

module.exports = Meal;
