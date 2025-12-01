module.exports = (sequelize, DataTypes) => {
  const IngredientRequest = sequelize.define("IngredientRequest", {
    request_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    ingredient_name: { type: DataTypes.STRING, allowNull: false },
    reason: DataTypes.TEXT,
    status: { type: DataTypes.STRING, defaultValue: "pending" },
    admin_note: DataTypes.TEXT,
  }, {
    tableName: "ingredient_requests",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  });

  return IngredientRequest;
};
