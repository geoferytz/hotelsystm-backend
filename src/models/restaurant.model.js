const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Restaurant = sequelize.define('Restaurant', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  imageUrl: { type: DataTypes.STRING, allowNull: true },
  openingTime: { type: DataTypes.STRING, allowNull: true },
  closingTime: { type: DataTypes.STRING, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  hotelId: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'restaurants', timestamps: true });

module.exports = Restaurant;
