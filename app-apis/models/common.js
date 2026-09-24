const { DataTypes } = require('sequelize');
module.exports = {
  public_key: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, unique: true },
  created_time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  created_by: { type: DataTypes.INTEGER, allowNull: true },
  edited_time: { type: DataTypes.DATE, allowNull: true },
  edited_by: { type: DataTypes.INTEGER, allowNull: true },
  deleted: { type: DataTypes.TINYINT, defaultValue: 0, allowNull: false }
};
