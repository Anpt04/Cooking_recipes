module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define("Category", {
    category_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: "category",
    timestamps: false,
  });

  return Category;
};
