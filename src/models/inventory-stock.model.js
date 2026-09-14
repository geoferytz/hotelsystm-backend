const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const InventoryStock = sequelize.define('InventoryStock', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  itemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  movementType: {
    type: DataTypes.ENUM('in', 'out', 'adjustment', 'transfer'),
    allowNull: false,
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  notes: {
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

module.exports = InventoryStock;
