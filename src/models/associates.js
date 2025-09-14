'use strict';

module.exports = (db) => {
  const {
    User,
    Category,
    Recipe,
    RecipeStep,
    RecipeImage,
    Ingredient,
    RecipeIngredient,
    Favorite,
    Rate,
    ShoppingList,
    ShoppingListItem,
  } = db;

  // User - Recipe (1-N)
  User.hasMany(Recipe, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  Recipe.belongsTo(User, { foreignKey: 'user_id' });

  // Category - Recipe (1-N)
  Category.hasMany(Recipe, { foreignKey: 'category_id', onDelete: 'SET NULL' });
  Recipe.belongsTo(Category, { foreignKey: 'category_id' });

  // Recipe - RecipeStep (1-N)
  Recipe.hasMany(RecipeStep, { foreignKey: 'recipe_id', onDelete: 'CASCADE' });
  RecipeStep.belongsTo(Recipe, { foreignKey: 'recipe_id' });

  // Recipe - RecipeImage (1-N)
  Recipe.hasMany(RecipeImage, { foreignKey: 'recipe_id', onDelete: 'CASCADE' });
  RecipeImage.belongsTo(Recipe, { foreignKey: 'recipe_id' });

  // RecipeStep - RecipeImage (1-N) (ảnh cho từng bước)
  RecipeStep.hasMany(RecipeImage, { foreignKey: 'step_id', onDelete: 'CASCADE' });
  RecipeImage.belongsTo(RecipeStep, { foreignKey: 'step_id' });

  // Recipe - Ingredient (N-N qua RecipeIngredient)
  Recipe.belongsToMany(Ingredient, {
    through: RecipeIngredient,
    foreignKey: 'recipe_id',
    otherKey: 'ingredient_id',
    onDelete: 'CASCADE',
  });
  Ingredient.belongsToMany(Recipe, {
    through: RecipeIngredient,
    foreignKey: 'ingredient_id',
    otherKey: 'recipe_id',
    onDelete: 'CASCADE',
  });

  // User - Favorite (N-N qua Favorite)
  User.belongsToMany(Recipe, {
    through: Favorite,
    foreignKey: 'user_id',
    otherKey: 'recipe_id',
    onDelete: 'CASCADE',
    as: 'Favorites',
  });
  Recipe.belongsToMany(User, {
    through: Favorite,
    foreignKey: 'recipe_id',
    otherKey: 'user_id',
    onDelete: 'CASCADE',
    as: 'LikedBy',
  });

  // User - Rate (N-N qua Rate)
  User.belongsToMany(Recipe, {
    through: Rate,
    foreignKey: 'user_id',
    otherKey: 'recipe_id',
    onDelete: 'CASCADE',
    as: 'Ratings',
  });
  Recipe.belongsToMany(User, {
    through: Rate,
    foreignKey: 'recipe_id',
    otherKey: 'user_id',
    onDelete: 'CASCADE',
    as: 'RatedBy',
  });

  // User - ShoppingList (1-N)
  User.hasMany(ShoppingList, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  ShoppingList.belongsTo(User, { foreignKey: 'user_id' });

  // ShoppingList - ShoppingListItem (1-N)
  ShoppingList.hasMany(ShoppingListItem, { foreignKey: 'list_id', onDelete: 'CASCADE' });
  ShoppingListItem.belongsTo(ShoppingList, { foreignKey: 'list_id' });

  // Ingredient - ShoppingListItem (1-N)
  Ingredient.hasMany(ShoppingListItem, { foreignKey: 'ingredient_id', onDelete: 'CASCADE' });
  ShoppingListItem.belongsTo(Ingredient, { foreignKey: 'ingredient_id' });
};
