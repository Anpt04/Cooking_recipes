module.exports = (sequelize, DataTypes) => {
  const RecipeIngredient = sequelize.define("RecipeIngredient", {
    recipe_id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true 
    },
    ingredient_id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true 
    },
    quantity: { 
        type: DataTypes.STRING(50) 
    },
  }, {
    tableName: "recipe_ingredient",
    timestamps: false,
  });

  return RecipeIngredient;
};
