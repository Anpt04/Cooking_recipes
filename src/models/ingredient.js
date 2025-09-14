module.exports = (sequelize, DataTypes) => {
  const Ingredient = sequelize.define("Ingredient", {
    ingredient_id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false, 
        unique: true 
    },
  }, {
    tableName: "ingredient",
    timestamps: false,
  });

  return Ingredient;
};
