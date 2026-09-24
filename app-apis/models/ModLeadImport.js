const { DataTypes } = require('sequelize');
const common = require('./common');
module.exports = (sequelize) => sequelize.define('lead_imports', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }, ...common,
  filename: { type: DataTypes.STRING(255), allowNull: false }, source: { type: DataTypes.ENUM('CSV','EXCEL'), allowNull: false },
  total_rows: { type: DataTypes.INTEGER, defaultValue: 0 }, imported: { type: DataTypes.INTEGER, defaultValue: 0 },
  skipped: { type: DataTypes.INTEGER, defaultValue: 0 }, duplicates: { type: DataTypes.INTEGER, defaultValue: 0 },
  invalid_emails: { type: DataTypes.INTEGER, defaultValue: 0 }, missing_emails: { type: DataTypes.INTEGER, defaultValue: 0 },
  failed: { type: DataTypes.INTEGER, defaultValue: 0 }, status: { type: DataTypes.STRING(30), defaultValue: 'COMPLETED' }
});
