const { DataTypes } = require('sequelize');
const common = require('./common');
module.exports = (sequelize) => sequelize.define('activities', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }, ...common,
  lead_id: { type: DataTypes.INTEGER, allowNull: true }, type: { type: DataTypes.STRING(80), allowNull: false },
  description: DataTypes.STRING(500), metadata: DataTypes.JSON
});
