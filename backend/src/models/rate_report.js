module.exports = (sequelize, DataTypes) => {
  const RateReport = sequelize.define("RateReport", {
    report_id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true,
        primaryKey: true, 
    },
    rate_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    reporter_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    reason: { 
        type: DataTypes.TEXT, 
        allowNull: false 
    },
    status: { 
        type: DataTypes.STRING, 
        defaultValue: "pending" 
    },
    admin_note: { 
        type: DataTypes.TEXT 
    },
    created_at: { 
        type: DataTypes.DATE, 
        defaultValue: DataTypes.NOW 
    },
  },
    {
      tableName: "comment_reports",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false, 
    }
  );
    return RateReport;
};