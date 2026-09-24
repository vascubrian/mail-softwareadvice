const { DataTypes } = require('sequelize');
const common = require('./common');
module.exports = (sequelize) => sequelize.define('users', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }, ...common,
  name: { type: DataTypes.STRING(150), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.STRING(30), defaultValue: 'ADMIN' },
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { indexes: [{ fields: ['email'], unique: true }] });
