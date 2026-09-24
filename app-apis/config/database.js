const { Sequelize } = require('sequelize');
module.exports = new Sequelize(process.env.DB_NAME || 'lead_outreach', process.env.DB_USER || 'root', process.env.DB_PASSWORD || '', {
  host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306), dialect: 'mysql', logging: false,
  define: { freezeTableName: true, timestamps: false }
});
