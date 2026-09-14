const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const InventoryCategory = sequelize.define('InventoryCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  hotelId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = InventoryCategory;
