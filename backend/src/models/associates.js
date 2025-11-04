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
    RecipeCategory, 
    Follow
  } = db;

  // User - Recipe (1-N)
  User.hasMany(Recipe, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  Recipe.belongsTo(User, { foreignKey: 'user_id' });

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
    as: 'ingredients',
    onDelete: 'CASCADE',
  });
  Ingredient.belongsToMany(Recipe, {
    through: RecipeIngredient,
    foreignKey: 'ingredient_id',
    otherKey: 'recipe_id',
    as: 'recipes',
    onDelete: 'CASCADE',
  });

  // User - Favorite (N-N qua Favorite)
User.hasMany(Favorite, { foreignKey: "user_id", as: "favorites" });
Favorite.belongsTo(User, { foreignKey: "user_id", as: "user" });

Recipe.hasMany(Favorite, { foreignKey: "recipe_id", as: "favorites" });
Favorite.belongsTo(Recipe, { foreignKey: "recipe_id", as: "recipe" });

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


  // Recipe <-> Category (N-N)
  Recipe.belongsToMany(Category, {
    through: RecipeCategory,
    foreignKey: 'recipe_id',
    otherKey: 'category_id',
    as: "categories"
  });
    Category.belongsToMany(Recipe, {
    through: RecipeCategory,
    foreignKey: 'category_id',
    otherKey: 'recipe_id'
  });

  User.hasMany(Follow, { foreignKey: "follower_id", as: "Following" });
  User.hasMany(Follow, { foreignKey: "following_id", as: "Followers" });

  Follow.belongsTo(User, { foreignKey: "follower_id", as: "FollowerUser" });
  Follow.belongsTo(User, { foreignKey: "following_id", as: "FollowingUser" });

  User.hasMany(Rate, { foreignKey: 'user_id', as: 'rates' });
  Rate.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Recipe – Rate (nếu có)
  Recipe.hasMany(Rate, { foreignKey: 'recipe_id', as: 'rates' });
  Rate.belongsTo(Recipe, { foreignKey: 'recipe_id', as: 'recipe' });

};
