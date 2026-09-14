const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserHotel = sequelize.define('UserHotel', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  hotelId: { type: DataTypes.INTEGER, allowNull: false },
  role: { type: DataTypes.ENUM('owner', 'manager', 'staff'), defaultValue: 'staff' },
}, { tableName: 'user_hotels', timestamps: true });

module.exports = UserHotel;
