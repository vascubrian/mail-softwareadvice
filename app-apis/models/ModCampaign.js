const { DataTypes } = require('sequelize');
const common = require('./common');
module.exports = sequelize => sequelize.define('campaigns', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }, ...common,
  source: { type: DataTypes.STRING(30), defaultValue: 'DATABASE' }, template_key: DataTypes.UUID,
  template_name: DataTypes.STRING(200), provider_template_id: DataTypes.STRING(200), subject: DataTypes.STRING(255),
  status: { type: DataTypes.ENUM('DRAFT','SCHEDULED','SENDING','COMPLETED','PAUSED','CANCELLED'), defaultValue: 'DRAFT' },
  lead_keys: DataTypes.JSON, total_leads: { type: DataTypes.INTEGER, defaultValue: 0 }, emails_sent: { type: DataTypes.INTEGER, defaultValue: 0 },
  started_time: DataTypes.DATE, completed_time: DataTypes.DATE,
}, { indexes: [{ fields: ['public_key'], unique: true }, { fields: ['status'] }] });
