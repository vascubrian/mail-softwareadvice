module.exports = {
  async up({ context: queryInterface }) {
    const sequelize = queryInterface.sequelize;
    const tables = (await queryInterface.showAllTables()).map(table => String(table).toLowerCase());
    if (!tables.includes('integrations')) return;

    const [rows] = await sequelize.query("SELECT id, config FROM integrations WHERE provider = 'RESEND'");
    for (const row of rows) {
      let config = row.config || {};
      if (typeof config === 'string') {
        try { config = JSON.parse(config); } catch { config = {}; }
      }

      for (const key of ['from_name', 'reply_to', 'email_from', 'from_email']) delete config[key];
      await sequelize.query('UPDATE integrations SET config = ? WHERE id = ?', {
        replacements: [JSON.stringify(config), row.id],
      });
    }
  },

  async down() {
    // Removed delivery metadata is owned by Resend templates and is not restored.
  },
};
