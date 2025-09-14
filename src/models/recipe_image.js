module.exports = (sequelize, DataTypes) => {
  const RecipeImage = sequelize.define("RecipeImage", {
    image_id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    recipe_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    step_id: { 
        type: DataTypes.INTEGER 
    },
    image_url: { 
        type: DataTypes.TEXT, 
        allowNull: false 
    },
    is_main: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: false 
    },
  }, {
    tableName: "recipe_image",
    timestamps: false,
  });

  return RecipeImage;
};
