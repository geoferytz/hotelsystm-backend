const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const InventoryItem = sequelize.define('InventoryItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  unit: {
    type: DataTypes.ENUM('piece', 'kg', 'liter', 'box', 'pack', 'meter', 'roll', 'bottle', 'set'),
    allowNull: false,
    defaultValue: 'piece',
  },
  minStockLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
  },
  maxStockLevel: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  reorderPoint: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  hotelId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = InventoryItem;
