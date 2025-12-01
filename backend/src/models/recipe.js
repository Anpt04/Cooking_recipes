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
    image_url: { 
        type: DataTypes.TEXT 
    },
    image_public_id: { 
        type: DataTypes.TEXT 
    },
    difficulty:{
        type: DataTypes.STRING(20), 
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
    },
    reject_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
  }, {
    tableName: "recipe",
    timestamps: false,
  });

  return Recipe;
};
