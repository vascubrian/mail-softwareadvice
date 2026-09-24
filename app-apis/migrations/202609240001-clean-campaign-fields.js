module.exports = {
  async up({ context: queryInterface }) {
    const sequelize = queryInterface.sequelize;
    const tables = (await queryInterface.showAllTables()).map(table => String(table).toLowerCase());

    if (tables.includes('campaigns')) {
      const campaigns = await queryInterface.describeTable('campaigns');
      for (const column of ['name', 'description', 'from_email']) {
        if (campaigns[column]) await queryInterface.removeColumn('campaigns', column);
      }
    }

    if (tables.includes('emails')) {
      const emails = await queryInterface.describeTable('emails');
      if (emails.from_email) await queryInterface.removeColumn('emails', 'from_email');
    }

    if (tables.includes('integrations')) {
      const [rows] = await sequelize.query("SELECT id, config FROM integrations WHERE provider = 'RESEND'");
      for (const row of rows) {
        let config = row.config || {};
        if (typeof config === 'string') {
          try { config = JSON.parse(config); } catch { config = {}; }
        }
        if ('email_from' in config || 'from_email' in config) {
          delete config.email_from;
          delete config.from_email;
          await sequelize.query('UPDATE integrations SET config = ? WHERE id = ?', {
            replacements: [JSON.stringify(config), row.id],
          });
        }
      }
    }
  },

  async down() {
    // Removed legacy fields contained no application-owned data worth restoring.
  },
};
