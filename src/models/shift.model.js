const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user.model');

const Shift = sequelize.define('Shift', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
  shiftDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  shiftType: {
    type: DataTypes.ENUM('morning', 'afternoon', 'night'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'in-progress', 'completed', 'absent'),
    defaultValue: 'scheduled',
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

User.hasMany(Shift, { foreignKey: 'userId' });
Shift.belongsTo(User, { foreignKey: 'userId' });

module.exports = Shift;
