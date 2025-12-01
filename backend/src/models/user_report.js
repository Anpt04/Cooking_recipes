module.exports = (sequelize, DataTypes) => {
  const UserReport = sequelize.define("UserReport", {
    report_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    reporter_id: { type: DataTypes.INTEGER, allowNull: false },
    reported_user_id: { type: DataTypes.INTEGER, allowNull: false },
    reason: { type: DataTypes.TEXT, allowNull: false },
    admin_note: { type: DataTypes.TEXT },
    status: { type: DataTypes.STRING, defaultValue: "pending" },
  }, {
    tableName: "user_report",
    timestamps: false,
  });
  return UserReport;
};
