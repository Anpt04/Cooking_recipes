'use strict';

module.exports = (sequelize, DataTypes) => {
  const RecipeCategory = sequelize.define('RecipeCategory', {
    recipe_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'recipes',
        key: 'recipe_id'
      }
    },
    category_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'categories',
        key: 'category_id'
      }
    }
  }, {
    tableName: 'recipe_category',
    timestamps: false
  });

  return RecipeCategory;
};
