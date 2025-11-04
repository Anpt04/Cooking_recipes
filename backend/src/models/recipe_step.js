module.exports = (sequelize, DataTypes) => {
  const RecipeStep = sequelize.define("RecipeStep", {
    step_id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    recipe_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    step_number: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    instruction: { 
        type: DataTypes.TEXT, 
        allowNull: false 
    },
  }, {
    tableName: "recipe_step",
    timestamps: false,
  });

  return RecipeStep;
};
