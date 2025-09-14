module.exports = (sequelize, DataTypes) => {
  const Recipe = sequelize.define("Recipe", {
    recipe_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true, 
        primaryKey: true 
    },
    user_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    category_id: { 
        type: DataTypes.INTEGER 
    },
    title: { 
        type: DataTypes.STRING(200), 
        allowNull: false 
    },
    description: { 
        type: DataTypes.TEXT 
    },
    cooking_time: { 
        type: DataTypes.INTEGER 
    },
    servings: { 
        type: DataTypes.INTEGER 
    },
    created_at: { 
        type: DataTypes.DATE, 
        defaultValue: DataTypes.NOW 
    },
    updated_at: { 
        type: DataTypes.DATE, 
        defaultValue: DataTypes.NOW 
    },
  }, {
    tableName: "recipe",
    timestamps: false,
  });

  return Recipe;
};
