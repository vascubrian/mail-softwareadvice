require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { DataTypes } = require('sequelize');
const { sequelize } = require('../app-apis/models');

const migrationsDirectory = path.join(__dirname, '..', 'app-apis', 'migrations');

async function ensureMetaTable(queryInterface) {
  const tables = (await queryInterface.showAllTables()).map(table => String(table).toLowerCase());
  if (!tables.includes('sequelizemeta')) {
    await queryInterface.createTable('SequelizeMeta', {
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        primaryKey: true,
      },
    });
  }
}

async function run() {
  await sequelize.authenticate();
  const queryInterface = sequelize.getQueryInterface();
  await ensureMetaTable(queryInterface);

  const [completedRows] = await sequelize.query('SELECT name FROM SequelizeMeta');
  const completed = new Set(completedRows.map(row => row.name));
  const files = fs.readdirSync(migrationsDirectory)
    .filter(file => /^\d+.*\.js$/.test(file))
    .sort();

  for (const file of files) {
    if (completed.has(file)) continue;
    const migration = require(path.join(migrationsDirectory, file));
    if (typeof migration.up !== 'function') throw new Error(`${file} does not export up()`);
    console.log(`Migrating ${file}`);
    await migration.up({ context: queryInterface });
    await sequelize.query('INSERT INTO SequelizeMeta (name) VALUES (?)', { replacements: [file] });
    console.log(`Migrated ${file}`);
  }

  console.log('All Sequelize migrations are up to date');
}

run()
  .catch(error => {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
