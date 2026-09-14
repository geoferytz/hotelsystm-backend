const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  roomNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.ENUM('single', 'double', 'suite', 'vip'),
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('available', 'occupied', 'maintenance', 'dirty'),
    defaultValue: 'available',
  },
  floor: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  images: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const raw = this.getDataValue('images');
      if (!raw) return [];
      try { return JSON.parse(raw); } catch { return []; }
    },
    set(val) {
      this.setDataValue('images', Array.isArray(val) ? JSON.stringify(val) : val);
    },
  },
  hotelId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = Room;
