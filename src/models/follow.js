module.exports = (sequelize, DataTypes) => {
  const Follow = sequelize.define("Follow", {
    follower_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    following_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: "follow",
    timestamps: false,
  });

  return Follow;
};
