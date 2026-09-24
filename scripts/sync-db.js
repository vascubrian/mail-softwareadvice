require('dotenv').config();
const { sequelize } = require('../app-apis/models');
sequelize.sync({ alter: process.argv.includes('--alter') }).then(() => { console.log('Database schema synchronized'); return sequelize.close(); }).catch((e) => { console.error(e.message); process.exit(1); });
