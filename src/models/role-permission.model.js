const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RolePermission = sequelize.define('RolePermission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Roles', key: 'id' },
  },
  permissionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Permissions', key: 'id' },
  },
}, {
  timestamps: true,
});

module.exports = RolePermission;
