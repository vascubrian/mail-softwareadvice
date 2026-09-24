const { DataTypes } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    const tables = (await queryInterface.showAllTables()).map(table => String(table).toLowerCase());
    if (!tables.includes('leads')) return;

    await queryInterface.changeColumn('leads', 'status', {
      type: DataTypes.ENUM(
        'NEW', 'RESEARCHED', 'QUALIFIED', 'UNQUALIFIED', 'CONTACTED',
        'REPLIED', 'INTERESTED', 'DEMO_BOOKED', 'NOT_INTERESTED',
        'SUBSCRIBED', 'UNSUBSCRIBED',
      ),
      allowNull: true,
    });
    await queryInterface.sequelize.query(
      "UPDATE leads SET status = 'SUBSCRIBED' WHERE status IS NULL OR status <> 'UNSUBSCRIBED'",
    );
    await queryInterface.changeColumn('leads', 'status', {
      type: DataTypes.ENUM('SUBSCRIBED', 'UNSUBSCRIBED'),
      allowNull: false,
      defaultValue: 'SUBSCRIBED',
    });
  },

  async down() {
    // Subscription choices should not be converted back to obsolete sales stages.
  },
};
