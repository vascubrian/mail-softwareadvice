const { DataTypes } = require('sequelize');
const common = require('./common');
module.exports = (sequelize) => sequelize.define('leads', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }, ...common,
  name: DataTypes.STRING(200), first_name: DataTypes.STRING(100), last_name: DataTypes.STRING(100),
  job_title: DataTypes.STRING(180), company: DataTypes.STRING(200),
  email: { type: DataTypes.STRING(255), allowNull: false }, phone: DataTypes.STRING(60),
  linkedin_url: DataTypes.STRING(500), company_website: DataTypes.STRING(500), country: DataTypes.STRING(100),
  company_size: DataTypes.STRING(60), industry: DataTypes.STRING(150),
  source: { type: DataTypes.ENUM('MANUAL','CSV','EXCEL','APOLLO','API'), defaultValue: 'MANUAL' },
  apollo_id: DataTypes.STRING(100),
  status: { type: DataTypes.ENUM('SUBSCRIBED','UNSUBSCRIBED'), defaultValue: 'SUBSCRIBED' },
  qualification_status: { type: DataTypes.STRING(50), defaultValue: 'PENDING' }, qualification_score: DataTypes.INTEGER,
  qualification_reason: DataTypes.TEXT, qualification_time: DataTypes.DATE, ai_research: DataTypes.TEXT('long'), ai_summary: DataTypes.TEXT,
  buying_signals: DataTypes.TEXT, notes: DataTypes.TEXT, last_contact_time: DataTypes.DATE
}, { indexes: [{ fields: ['email'], unique: true }, { fields: ['public_key'], unique: true }, { fields: ['status'] }] });
